'use client';
import React from 'react';

type NavButtonProps = { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; };

export const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full p-3 md:p-4 rounded-2xl md:rounded-[1.25rem] transition-all duration-300 relative overflow-hidden group ${active
      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 font-black'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
    )}
    <div className={`${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'} transition-all duration-300 relative z-10`}>
      {icon}
    </div>
    <span className="text-[9px] md:text-sm font-black uppercase tracking-wider relative z-10">{label}</span>
    {active && (
      <div className="hidden md:block absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
    )}
  </button>
);
