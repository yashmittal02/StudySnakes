"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, School, GraduationCap, 
  Calendar, Moon, Sun, Send, 
  ArrowLeft, CheckCircle, AlertTriangle, 
  Loader2, Zap, Star, Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    college: "",
    course: "",
    image: ""
  });

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
      const savedTheme = localStorage.getItem("studysnakes_theme") as "light" | "dark";
      if (savedTheme) setTheme(savedTheme);
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.user.name || "",
          age: data.user.age?.toString() || "",
          college: data.user.college || "",
          course: data.user.course || "",
          image: data.user.image || ""
        });
      }
    } catch (e) {
      console.error("Fetch profile error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("studysnakes_theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setFeedbackLoading(true);
    setError(""); // Reset profile error for feedback context
    
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedback })
      });
      const data = await res.json();
      
      if (res.ok) {
        setFeedback("");
        setFeedbackSent(true);
      } else {
        console.error("Feedback submission failed:", data.error, data.details);
        alert(`Failed to save feedback: ${data.error}`);
      }
    } catch (e) {
      console.error("Feedback network error:", e);
      alert("A network error occurred while submitting feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
       const res = await fetch("/api/profile/delete", { method: "DELETE" });
       if (res.ok) {
         signOut({ callbackUrl: "/" });
       }
    } catch {
      alert("Failed to delete account");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <Zap className="w-12 h-12 text-teal-500 animate-pulse mb-4" />
        <span className="text-gray-500 font-medium">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-6 py-12 space-y-8">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden glass-panel flex items-center justify-center border-2 border-teal-500/30">
                {formData.image ? (
                  <Image 
                    src={formData.image} 
                    alt="Profile" 
                    fill 
                    className="object-cover" 
                    unoptimized={formData.image.startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                    <User className="w-14 h-14 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-teal-600 rounded-xl shadow-lg shadow-teal-900/20 text-white animate-bounce-slow">
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-4xl font-black text-foreground tracking-tight">
                {formData.name || session?.user?.email?.split('@')[0]}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="text-gray-500 font-medium flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-teal-500" /> {session?.user?.email}
                </span>
                <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full border border-teal-500/20 flex items-center gap-1">
                  Mastery Level 1
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Edit Section */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleUpdateProfile} className="glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Personal Profile</h3>
                {success && (
                  <div className="flex items-center gap-2 text-success font-bold text-sm animate-bounce-in">
                    <CheckCircle className="w-5 h-5" /> {success}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Profile Image URL</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="url"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Age</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="number"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                      placeholder="21"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">University / Organization</label>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                      placeholder="University Name"
                      value={formData.college}
                      onChange={(e) => setFormData({...formData, college: e.target.value})}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Current Course / Major</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                      placeholder="B.Tech Computer Science"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-error text-sm font-bold ml-1">⚠️ {error}</p>}

              <button 
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-3 text-lg"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Save All Changes</>
                )}
              </button>
            </form>

            {/* Feedback Section */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Send className="w-6 h-6 text-teal-400" /> Share your Thoughts
              </h3>
              
              {!feedbackSent ? (
                <div className="space-y-4">
                  <p className="text-gray-500 font-semibold">Have a suggestion or found a bug? We&apos;d love to hear from you!</p>
                  <textarea 
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 rounded-3xl p-6 text-foreground focus:outline-none focus:border-teal-500/50 transition-all min-h-[150px] font-medium placeholder:text-gray-500"
                    placeholder="Tell us how we can make StudySnakes better..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <button 
                    onClick={handleSubmitFeedback}
                    disabled={feedbackLoading || !feedback.trim()}
                    className="px-10 py-4 bg-teal-600/10 dark:bg-white/5 hover:bg-teal-600/20 dark:hover:bg-white/10 text-teal-600 dark:text-white font-black rounded-2xl border border-teal-600/20 dark:border-white/10 transition-all flex items-center gap-2 group"
                  >
                    {feedbackLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Send Feedback
                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-6 bg-teal-500/5 rounded-3xl border border-teal-500/20 animate-fade-in">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-teal-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-foreground">Feedback received! 🎉</h4>
                    <p className="text-gray-500 font-medium">Your message has been sent to our team. We appreciate your support!</p>
                  </div>
                  <button 
                    onClick={() => setFeedbackSent(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Send another feedback
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* Theme Toggle */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-foreground">Display Theme</h3>
              <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-5 h-5 text-teal-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <span className="font-bold text-foreground capitalize">{theme} Mode</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="w-14 h-7 bg-teal-500/20 rounded-full relative p-1 transition-all"
                >
                  <div className={`w-5 h-5 bg-teal-500 rounded-full transition-transform duration-300 ${theme === "light" ? "translate-x-7" : ""}`} />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-panel p-8 rounded-3xl border-error/20 space-y-6">
              <h3 className="text-xl font-bold text-error flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" /> Danger Zone
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-semibold">
                Deleting your account is permanent. This will erase all your XP, game history, and study notes forever.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-4 bg-error/10 hover:bg-error/20 text-error font-black rounded-2xl transition-all"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-error/5 rounded-2xl border border-error/20">
                  <p className="text-foreground text-sm font-bold text-center">Are you ABSOLUTELY sure?</p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleDeleteAccount}
                      className="w-full py-3 bg-error text-white font-black rounded-xl hover:bg-red-700 transition-all"
                    >
                      Yes, Permanent Delete
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="w-full py-3 bg-black/5 dark:bg-white/5 text-foreground dark:text-white font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
