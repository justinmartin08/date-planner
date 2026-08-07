'use client';

import React, { useState, useEffect } from 'react';
import { UserTheme } from '@/lib/types';

interface ThemeMascotAnimationProps {
  theme: UserTheme;
}

export function ThemeMascotAnimation({ theme }: ThemeMascotAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFire, setShowFire] = useState(false);

  useEffect(() => {
    // Hydration-safe: animate only after mount so SSR/CSR markup matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (theme === 'pokemon') {
      const timer1 = setTimeout(() => setIsOpen(true), 400);
      const timer2 = setTimeout(() => setShowFire(true), 900);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [theme]);

  if (!mounted) return null;

  if (theme === 'tiger') {
    return (
      <div className="fixed bottom-4 right-4 z-40 pointer-events-none select-none">
        {/* Animated Tiger Mascot */}
        <div className="relative group pointer-events-auto cursor-pointer">
          {/* Ambient Tiger Embers */}
          <div className="absolute -inset-3 bg-gradient-to-tr from-[#FF6B00]/20 via-[#FF9E00]/20 to-transparent rounded-full blur-xl animate-pulse" />
          
          <div className="relative bg-[#171412]/90 border border-[#FF6B00]/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
            {/* Animated Tiger Badge */}
            <div className="relative w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center overflow-hidden shrink-0">
              <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 text-[#FF6B00] animate-bounce" xmlns="http://www.w3.org/2000/svg">
                {/* Tiger Head */}
                <path d="M18 6C10.5 6 6 11.5 6 18C6 24.5 11 29 18 29C25 29 30 24.5 30 18C30 11.5 25.5 6 18 6Z" fill="#FF6B00" />
                {/* Tiger Stripes */}
                <path d="M18 7V13M12 9L15 13M24 9L21 13M8 17H13M28 17H23M11 22L14 20M25 22L22 20" stroke="#120D0A" strokeWidth="2" strokeLinecap="round" />
                {/* Eyes */}
                <circle cx="13" cy="16" r="2" fill="#FFF" />
                <circle cx="23" cy="16" r="2" fill="#FFF" />
                <circle cx="13.5" cy="16" r="1" fill="#120D0A" />
                <circle cx="22.5" cy="16" r="1" fill="#120D0A" />
                {/* Nose & Snout */}
                <ellipse cx="18" cy="21" rx="3" ry="2" fill="#FFF" />
                <path d="M17 20.5L18 22L19 20.5" stroke="#120D0A" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-[#FF9E00] flex items-center gap-1">
                🐅 Yani&apos;s Tiger Realm
              </div>
              <p className="text-[10px] text-[#A89385]">Fierce &amp; Warm</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pokémon - Mega Charizard X Theme
  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setShowFire(!isOpen);
        }}
        className="relative group cursor-pointer"
      >
        {/* Blue Fire Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#00E5FF]/25 via-[#00B0FF]/20 to-[#1E88E5]/25 rounded-full blur-xl animate-pulse" />

        {/* Pokéball / Charizard X Container */}
        <div className="relative bg-[#0A121E]/90 border border-[#00B0FF]/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          {/* Animated Pokéball Opening */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* Top Half of Pokéball */}
            <div
              className={`absolute top-0 w-10 h-5 bg-gradient-to-b from-[#00B0FF] to-[#0088CC] rounded-t-full border-t border-x border-[#00E5FF]/60 transition-transform duration-500 ease-out origin-bottom ${
                isOpen ? '-translate-y-3.5 -rotate-12' : ''
              }`}
            />
            {/* Bottom Half of Pokéball */}
            <div
              className={`absolute bottom-0 w-10 h-5 bg-slate-800 rounded-b-full border-b border-x border-slate-600 transition-transform duration-500 ease-out origin-top ${
                isOpen ? 'translate-y-3.5 rotate-12' : ''
              }`}
            />
            {/* Pokéball Center Button */}
            <div
              className={`absolute z-10 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transition-all duration-300 ${
                isOpen ? 'scale-125 bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]' : ''
              }`}
            />

            {/* Mega Charizard X Spawning Graphic */}
            {isOpen && (
              <div className="absolute -top-12 z-20 transition-all duration-500 animate-scaleUp">
                <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 filter drop-shadow-[0_0_10px_#00B0FF]" xmlns="http://www.w3.org/2000/svg">
                  {/* Wings */}
                  <path d="M12 28C4 18 2 8 8 6C14 4 22 14 26 22M52 28C60 18 62 8 56 6C50 4 42 14 38 22" stroke="#00B0FF" strokeWidth="3" strokeLinecap="round" />
                  {/* Dragon Body */}
                  <path d="M26 44C26 32 30 20 32 16C34 20 38 32 38 44C38 52 34 58 32 58C30 58 26 52 26 44Z" fill="#1E293B" stroke="#00E5FF" strokeWidth="2" />
                  {/* Blue Fire Mouth Aura */}
                  {showFire && (
                    <path d="M30 14C24 8 20 4 26 2C32 0 34 6 32 12Z" fill="#00E5FF" className="animate-bounce" />
                  )}
                  {/* Dragon Eyes */}
                  <circle cx="29" cy="22" r="1.5" fill="#00E5FF" />
                  <circle cx="35" cy="22" r="1.5" fill="#00E5FF" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-bold text-[#00E5FF] flex items-center gap-1">
              ⚡ Mega Charizard X
            </div>
            <p className="text-[10px] text-[#7DD3FC]">
              {isOpen ? 'Blue Fire Active 🔥' : 'Tap Pokéball to Summon'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
