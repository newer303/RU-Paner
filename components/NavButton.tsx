'use client';
import React from 'react';

type NavButtonProps = { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; };

export const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 w-full p-2 md:p-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-blue-600 text-white shadow-md font-medium'
      : 'text-gray-600 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
  >
    <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);
