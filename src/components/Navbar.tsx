"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Gamepad2, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Gamepad2 className="w-6 h-6 text-teal-500 group-hover:text-teal-400 group-hover:rotate-12 transition-all" />
          <span className="font-black text-2xl tracking-tighter text-white group-hover:text-gray-200 transition-colors">StudySnakes</span>
        </Link>
        
        <nav className="flex items-center gap-8">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-black text-gray-400 hover:text-teal-400 transition-all flex items-center gap-2 uppercase tracking-widest">
                <UserIcon className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/upload" className="text-sm font-black text-gray-400 hover:text-teal-400 transition-all uppercase tracking-widest">New Game</Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-black text-error/70 hover:text-error transition-all flex items-center gap-2 uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/upload" className="text-sm font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Play as Guest</Link>
              <Link href="/login" className="text-sm font-black text-teal-500 hover:text-teal-400 transition-all uppercase tracking-widest border border-teal-500/30 px-4 py-2 rounded-xl hover:bg-teal-500/5">Login / Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
