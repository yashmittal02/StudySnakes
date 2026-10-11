"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Settings, FileText, Upload as UploadIcon, AlertCircle, Zap } from "lucide-react";

export default function UploadPage() {
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(10);
  const [timer, setTimer] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const savedNotes = sessionStorage.getItem("studysnakes_notes_raw");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      setError("Please upload a raw .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNotes((prev) => prev + "\n" + (event.target?.result as string));
      setError("");
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!notes.trim()) {
      setError("Please paste some notes or upload a file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, count, timer })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Store flashcards in sessionStorage for the game engine
      sessionStorage.setItem("studysnakes_flashcards", JSON.stringify(data.flashcards));
      sessionStorage.setItem("studysnakes_timer", timer.toString());
      sessionStorage.setItem("studysnakes_notes_raw", notes);
      
      router.push("/game");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 py-12 flex flex-col lg:flex-row gap-10">
      {/* Left Column: Input */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <FileText className="text-teal-500 w-8 h-8" />
              Intelligence Input
            </h2>
            <p className="text-gray-500 text-sm font-bold ml-11 uppercase tracking-widest">Feed the AI your study materials</p>
          </div>
          <label className="cursor-pointer group relative overflow-hidden px-6 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-black rounded-2xl border border-teal-500/20 transition-all flex items-center gap-2">
            <UploadIcon className="w-5 h-5 group-hover:bounce" />
            <span>Upload .txt</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-teal-500/5 blur-2xl rounded-[40px] group-focus-within:bg-teal-500/10 transition-colors" />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your syllabus, textbook excerpts, or lecture notes here. Our AI will analyze the semantic structure and generate a custom Snake & Ladders path for you..."
            className="relative w-full h-[550px] resize-none bg-black/40 backdrop-blur-md border border-white/5 rounded-[40px] p-8 text-white focus:outline-none focus:border-teal-500/50 transition-all shadow-inner text-xl leading-relaxed placeholder:text-gray-700 font-medium"
          />
        </div>
      </div>

      {/* Right Column: Settings & CTA */}
      <div className="w-full lg:w-96 flex flex-col gap-8">
        <div className="glass-panel p-8 rounded-[40px] flex flex-col gap-10 shadow-2xl">
          <h3 className="text-xl font-black text-white flex items-center gap-3 border-b border-white/5 pb-6 uppercase tracking-widest">
            <Settings className="text-teal-500 w-6 h-6" />
            Game Engine
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Flashcard Count</label>
              <span className="text-2xl font-black text-teal-400">{count}</span>
            </div>
            <input 
              type="range" min="5" max="30" step="1" 
              value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-teal-500 h-2 bg-white/5 rounded-full appearance-none cursor-pointer border border-white/5"
            />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">More questions mean a longer, harder session</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Time Constraint</label>
              <span className="text-2xl font-black text-teal-400">{timer}s</span>
            </div>
            <input 
              type="range" min="5" max="60" step="5" 
              value={timer} onChange={(e) => setTimer(Number(e.target.value))}
              className="w-full accent-teal-500 h-2 bg-white/5 rounded-full appearance-none cursor-pointer border border-white/5"
            />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Faster timers provide more XP bonuses</p>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-sm font-bold px-6 py-4 rounded-3xl flex items-start gap-3 animate-shake">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full group relative py-6 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-800 text-white font-black rounded-[30px] transition-all shadow-[0_20px_40px_rgba(20,184,166,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 text-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7 fill-white" />}
            {loading ? "Neural Analysis..." : "Initialize Session"}
          </button>
          
          <div className="flex items-center justify-center gap-4 py-4 glass-panel rounded-2xl border-teal-500/10">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-teal-500/20 border-2 border-background flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-teal-400" />
                </div>
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">1,200+ Students online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
