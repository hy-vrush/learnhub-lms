'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, GraduationCap, Sparkles } from 'lucide-react';

export const Navbar = ({ isLoggedIn, onLogin, onLogout, isAdmin, setView }: any) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050811] border-b border-white/5 h-16 flex items-center justify-between px-6">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black text-sm">
        LH
      </div>
      <span className="font-bold text-lg tracking-tight text-white">LearnHub<span className="text-blue-500">LMS</span></span>
    </div>
    
    <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
      <button onClick={() => setView('dashboard')} className="hover:text-white transition-colors">Dashboard</button>
      {isAdmin && (
        <button onClick={() => setView('admin')} className="hover:text-white transition-colors">Admin Panel</button>
      )}
    </div>

    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 font-bold text-xs">
            {isAdmin ? 'A' : 'S'}
          </div>
          <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Logout</button>
        </div>
      ) : (
        <button 
          onClick={() => onLogin(false)} 
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
        >
          Login
        </button>
      )}
    </div>
  </nav>
);
