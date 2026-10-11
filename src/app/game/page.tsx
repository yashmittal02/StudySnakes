"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Heart, ArrowRight, Zap, Star, ShieldAlert, Flame } from "lucide-react";

interface Flashcard {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function GamePage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [timerDuration, setTimerDuration] = useState(15);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game specific state
  const [position, setPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  
  // Competitive System State
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [lastPointsEarned, setLastPointsEarned] = useState<{ total: number, base: number, speed: number, dist: number, mult: number } | null>(null);

  // Flashcard Modal State
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [cardOutcome, setCardOutcome] = useState<{ jump: number; exact: boolean; message: string } | null>(null);
  const [mistakes, setMistakes] = useState<{ question: string; correct: string }[]>([]);

  // Parse Flashcards on mount
  useEffect(() => {
    try {
      const rawCards = sessionStorage.getItem("studysnakes_flashcards");
      const rawTimer = sessionStorage.getItem("studysnakes_timer");

      if (!rawCards) {
        router.replace("/upload");
        return;
      }
      setFlashcards(JSON.parse(rawCards));
      const t = rawTimer ? parseInt(rawTimer) : 15;
      setTimerDuration(t);
      setTimeLeft(t);
      setIsLoaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, [router]);

  const processAnswerResult = useCallback((isCorrect: boolean) => {
    let jump = 0;
    let message = "";

    if (isCorrect) {
      jump = diceValue;
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      let newMultiplier = 1.0;
      if (newStreak >= 4) newMultiplier = 2.0;
      else if (newStreak === 3) newMultiplier = 1.5;
      else if (newStreak === 2) newMultiplier = 1.2;
      
      setMultiplier(newMultiplier);

      const basePoints = 50;
      const distPoints = diceValue * 10;
      const speedBonus = Math.floor((timeLeft / timerDuration) * 50);
      
      const roundPoints = Math.floor((basePoints + distPoints + speedBonus) * newMultiplier);
      
      setScore((s) => s + roundPoints);
      setLastPointsEarned({ total: roundPoints, base: basePoints, speed: speedBonus, dist: distPoints, mult: newMultiplier });

      message = `Correct! +${diceValue} Tiles (Ladder)`;
    } else {
      jump = -diceValue;
      message = `Wrong! -${diceValue} Tiles (Snake)`;
      
      setStreak(0);
      setMultiplier(1.0);
      setLastPointsEarned(null);

      setLives((l) => Math.max(0, l - 1));
      setMistakes((prev) => [
        ...prev,
        { 
          question: flashcards[qIndex].question, 
          correct: flashcards[qIndex].options[flashcards[qIndex].correctIndex] 
        }
      ]);
    }

    setCardOutcome({ jump, exact: false, message });
  }, [diceValue, flashcards, qIndex, streak, timeLeft, timerDuration]);

  // Stable timer logic
  useEffect(() => {
    let int: NodeJS.Timeout;
    if (showFlashcard && timeLeft > 0 && !cardOutcome) {
      int = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    }
    return () => {
      if (int) clearInterval(int);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFlashcard, cardOutcome]);

  useEffect(() => {
    if (timeLeft === 0 && !cardOutcome && showFlashcard) {
      processAnswerResult(false);
    }
  }, [timeLeft, cardOutcome, showFlashcard, processAnswerResult]);

  const submitAnswer = (idx: number) => {
    const isCorrect = idx === flashcards[qIndex].correctIndex;
    processAnswerResult(isCorrect);
  };

  const continueAfterFlashcard = () => {
    if (cardOutcome) {
      const newPos = Math.max(0, Math.min(100, position + cardOutcome.jump));
      setShowFlashcard(false);
      
      // Milestone Bonuses
      if (position < 50 && newPos >= 50) setScore(s => s + 500);
      if (position < 75 && newPos >= 75) setScore(s => s + 750);
      if (position < 90 && newPos >= 90) setScore(s => s + 1000);

      if (position !== newPos) {
        let currentStep = position;
        const stepInterval = setInterval(() => {
          if (currentStep < newPos) currentStep++;
          else if (currentStep > newPos) currentStep--;
          
          setPosition(currentStep);

          if (currentStep === newPos) {
            clearInterval(stepInterval);
            setTimeout(finishQuestionFlow, 300);
          }
        }, 150);
      } else {
        finishQuestionFlow();
      }
    } else {
      setShowFlashcard(false);
      finishQuestionFlow();
    }
  };

  const finishQuestionFlow = () => {
    setCardOutcome(null);
    setQIndex((p) => p + 1);
    setTimeLeft(timerDuration);

    // Check game over
    if (qIndex + 1 >= flashcards.length || lives <= 0 || position >= 100) {
      saveGameResults();
    }
  };

  const saveGameResults = async () => {
    const finalAccuracy = Math.round(((flashcards.length - mistakes.length) / flashcards.length) * 100);
    const notesContent = sessionStorage.getItem("studysnakes_notes_raw") || "";

    const results = {
      score,
      accuracy: finalAccuracy,
      timeSpent: (qIndex + 1) * timerDuration, 
      notesContent,
      mistakes,
      title: notesContent.slice(0, 30) + (notesContent.length > 30 ? "..." : "")
    };

    sessionStorage.setItem("studysnakes_mistakes", JSON.stringify(mistakes));

    try {
      await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results)
      });
    } catch (e) {
      console.error("Failed to save to DB", e);
    }

    router.push("/dashboard");
  };

  const rollDice = () => {
    if (isRolling || showFlashcard || qIndex >= flashcards.length || lives <= 0) return;
    setIsRolling(true);

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 8) { // faster rolls
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        finishRoll();
      }
    }, 80);
  };

  const finishRoll = () => {
    setIsRolling(false);
    setTimeout(() => setShowFlashcard(true), 600);
  };

  // Board Calculation
  const boardCells = Array.from({ length: 100 }).map((_, i) => {
    const r = Math.floor(i / 10);
    const c = i % 10;
    const virtualRow = 9 - r;
    const num = virtualRow % 2 === 0 ? virtualRow * 10 + c + 1 : virtualRow * 10 + (9 - c) + 1;
    let bgColor = "bg-black/[0.03]";
    if (num % 2 === 0) bgColor = "bg-black/[0.07] dark:bg-white/[0.07]";
    return { num, bgColor, r, c };
  });

  const getPawnPos = (pos: number) => {
    if (pos === 0) return { left: "0%", top: "100%", opacity: 1 };
    const num = Math.min(100, Math.max(1, pos));
    const virtualRow = Math.floor((num - 1) / 10);
    const c = virtualRow % 2 === 0 ? (num - 1) % 10 : 9 - ((num - 1) % 10);
    const r = 9 - virtualRow;
    return { left: `${c * 10}%`, top: `${r * 10}%`, opacity: 1 };
  };

  if (error) return <div className="p-10 text-center text-error font-bold">Error: {error}</div>;
  if (!isLoaded) return <div className="p-10 text-center text-gray-500 font-bold">Loading StudySnakes Engine...</div>;

  const currentQ = flashcards[qIndex];

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-8 p-6 max-w-[1400px] mx-auto w-full relative font-bold">

      {/* 1. Board Section */}
      <div className="flex-1 max-w-[850px] aspect-square relative rounded-[40px] glass-panel border-4 border-teal-500/20 shadow-[0_0_60px_rgba(20,184,166,0.1)] flex-shrink-0">
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 rounded-[40px] overflow-hidden">
          {boardCells.map((cell) => (
            <div key={cell.num} className={`flex items-center justify-center border border-black/5 dark:border-white/5 ${cell.bgColor} relative`}>
              <span className="text-black/5 dark:text-white/10 font-black text-xl">{cell.num}</span>
            </div>
          ))}
        </div>

        {/* Start Pad */}
        <div className="absolute w-[10%] h-[10%] flex items-center justify-center bg-teal-600/30 backdrop-blur-xl rounded-b-3xl border-x-4 border-b-4 border-teal-500/20" style={{ left: "0%", top: "100%" }}>
          <span className="text-teal-500 dark:text-teal-400 font-black text-[10px] tracking-widest uppercase">Start</span>
        </div>

        {/* Pawn */}
        <motion.div
          className="absolute w-[10%] h-[10%] p-3 z-20 flex items-center justify-center"
          animate={getPawnPos(position)}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
        >
          <div className="w-full h-full bg-teal-500 rounded-full shadow-[0_0_25px_#14b8a6] border-2 border-white flex items-center justify-center overflow-hidden">
            <div className="w-1/2 h-1/2 bg-white rounded-full opacity-40 blur-[1px]" />
          </div>
        </motion.div>
      </div>

      {/* 2. Controls & Stats Sidebar */}
      <div className="w-full xl:w-96 flex flex-col gap-6">
        <div className="glass-panel p-8 rounded-[40px] flex flex-col gap-8 shadow-2xl font-black">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Points</span>
              <span className="text-4xl text-foreground flex items-center gap-2">
                <Trophy className="text-teal-500 dark:text-teal-400 w-7 h-7" /> {score}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Streak</span>
              <span className={`text-3xl flex items-center gap-1 font-black ${streak >= 3 ? 'text-amber-500 animate-pulse' : 'text-teal-500'}`}>
                <Flame className={`w-6 h-6 ${streak >= 3 ? 'fill-current' : ''}`} /> 
                {multiplier}x
              </span>
            </div>

            <div className="flex flex-col text-right gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Lives Remaining</span>
              <span className="text-3xl text-error flex items-center justify-end gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart key={i} fill={i < lives ? "currentColor" : "none"} className={`w-6 h-6 ${i >= lives ? 'text-gray-300 dark:text-gray-700' : ''}`} />
                ))}
              </span>
            </div>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col items-center">
            <div className="text-center mb-8 w-full">
              <span className="text-gray-500 text-xs uppercase tracking-[0.2em] block mb-3">Topic Progression</span>
              <div className="w-full h-3 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                <div
                  className="h-full bg-teal-500 transition-all duration-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                  style={{ width: `${(Math.min(qIndex, flashcards.length) / flashcards.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 block">{qIndex} / {flashcards.length} Questions</span>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <button
                onClick={rollDice}
                disabled={isRolling || showFlashcard || lives <= 0}
                className={`relative w-36 h-36 rounded-[40px] ${isRolling ? 'bg-teal-700' : 'bg-teal-600 hover:bg-teal-500'} flex items-center justify-center text-6xl font-black text-white shadow-2xl transition-all disabled:opacity-30 disabled:grayscale`}
              >
                {diceValue}
              </button>
            </div>
            <p className="mt-6 text-teal-600 dark:text-teal-400 text-sm tracking-widest animate-pulse">ROLL TO MOVE</p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="glass-panel p-6 rounded-3xl border-teal-500/10 flex items-center gap-4">
          <Zap className="text-teal-500 dark:text-teal-400 w-8 h-8" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">Answer questions correctly to move forward via ladders. Wrong answers will drag you down via snakes!</p>
        </div>
      </div>

      {/* 3. Flashcard Modal Overlay */}
      <AnimatePresence>
        {showFlashcard && currentQ && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0a1a1a] border border-black/10 dark:border-teal-500/20 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.2)] dark:shadow-[0_0_100px_rgba(20,184,166,0.15)] relative"
            >
              {/* Timer Bar */}
              {!cardOutcome && (
                <div className="h-2 w-full bg-black/5 dark:bg-white/5 absolute top-0 left-0">
                  <motion.div
                    className={`h-full ${timeLeft > 5 ? 'bg-teal-500' : 'bg-error'} shadow-[0_0_10px_currentColor]`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              )}

              <div className="p-10 md:p-14">
                {!cardOutcome ? (
                  <>
                    <h3 className="text-2xl md:text-4xl font-black text-foreground mb-12 leading-tight">{currentQ.question}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {currentQ.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => submitAnswer(idx)}
                          className="w-full group bg-black/5 dark:bg-white/[0.03] hover:bg-teal-500/10 border border-black/5 dark:border-white/5 hover:border-teal-500/50 p-6 rounded-3xl text-left text-lg text-foreground dark:text-gray-300 transition-all flex items-center gap-4"
                        >
                          <span className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-white/5 flex items-center justify-center font-black text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">{["A", "B", "C", "D"][idx]}</span>
                          <span className="font-bold">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-8 text-center">
                    <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center border-4 ${cardOutcome.jump > 0 ? 'bg-teal-500/20 text-teal-500 dark:text-teal-400 border-teal-500/30' : 'bg-error/20 text-error border-error/30'}`}>
                      {cardOutcome.jump > 0 ? (
                        <Star className="w-16 h-16 animate-spin-slow fill-current" />
                      ) : (
                        <ShieldAlert className="w-16 h-16 animate-pulse" />
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black text-foreground">{cardOutcome.message}</h3>
                      {cardOutcome.jump < 0 && (
                          <p className="text-gray-500 font-bold uppercase tracking-widest">Watch out for the snake!</p>
                      )}
                      {lastPointsEarned && cardOutcome.jump > 0 && (
                        <div className="flex flex-col items-center gap-2 mt-4 text-sm font-bold text-gray-500">
                          <div className="flex gap-4">
                            <span className="text-teal-500">Base: +{lastPointsEarned.base}</span>
                            <span className="text-amber-500">Speed: +{lastPointsEarned.speed}</span>
                            <span className="text-blue-500">Dist: +{lastPointsEarned.dist}</span>
                          </div>
                          <div className="text-lg text-amber-500 animate-bounce">
                            Multiplier: x{lastPointsEarned.mult}
                          </div>
                          <div className="text-2xl text-teal-400 font-black">
                            +{lastPointsEarned.total} Points!
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={continueAfterFlashcard}
                      className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-black py-5 px-12 rounded-[30px] transition-all flex items-center gap-3 text-xl shadow-2xl shadow-teal-900/40"
                    >
                      Continue Path <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
