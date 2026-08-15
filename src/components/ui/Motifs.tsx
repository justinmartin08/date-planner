'use client';

import React from 'react';
import type { UserTheme } from '@/lib/types';

type ClassName = { className?: string; style?: React.CSSProperties };

/* ===========================================================================
   CIELO — Pokémon ✧ strawberry icons  (light & airy)
   =========================================================================== */

/** Classic red & white Pokéball with a soft sun-sheen */
export function PokeballEmblem({ className = 'w-6 h-6', style }: ClassName) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pb-top" x1="20" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5A76" />
          <stop offset="1" stopColor="#EC2451" />
        </linearGradient>
        <linearGradient id="pb-bottom" x1="20" y1="38" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4ECF7" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="#20272F" />
      <path d="M2 20a18 18 0 0 1 36 0Z" fill="url(#pb-top)" />
      <path d="M2 20a18 18 0 0 0 36 0Z" fill="url(#pb-bottom)" />
      <rect x="4" y="18.2" width="32" height="2.6" rx="1.3" fill="#20272F" />
      <circle cx="20" cy="20" r="6" fill="#20272F" />
      <circle cx="20" cy="20" r="5" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="2.2" fill="#CFD8E3" />
      <path d="M9 11a17 17 0 0 1 8-6.5" stroke="#FFD6DE" strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

/** Custom cartoon Pokémon-styled Strawberry Berry with electric sky-blue leaf crown and anime gloss */
export function StrawberryEmblem({ className = 'w-6 h-6', style }: ClassName) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Berry body gradient */}
        <linearGradient id="poke-berry-body" x1="12" y1="12" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5C8A" />
          <stop offset="0.45" stopColor="#F4225A" />
          <stop offset="1" stopColor="#B80C38" />
        </linearGradient>

        {/* Electric sky-blue leaf crown */}
        <linearGradient id="poke-leaf-blue" x1="14" y1="2" x2="34" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" />
          <stop offset="0.5" stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>

        {/* Center leaf highlight */}
        <linearGradient id="poke-leaf-center" x1="24" y1="1" x2="24" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BAE6FD" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>

        {/* Specular gloss */}
        <linearGradient id="poke-berry-gloss" x1="14" y1="14" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Outer shadow / cartoon contour */}
      <path
        d="M24 45.5C14.5 39 8 30.5 8 20.5 8 13.8 13.2 11 18.8 13.5c2 .9 3.8 2.3 5.2 3.8 1.4-1.5 3.2-2.9 5.2-3.8C34.8 11 40 13.8 40 20.5c0 10-6.5 18.5-16 25Z"
        fill="#7A0422"
        opacity="0.3"
      />

      {/* Main Berry Heart Body */}
      <path
        d="M24 44C15.2 37.8 9 29.8 9 20.2 9 13.8 14 11.2 19.2 13.5c1.8.8 3.4 2.1 4.8 3.5 1.4-1.4 3-2.7 4.8-3.5C34 11.2 39 13.8 39 20.2c0 9.6-6.2 17.6-15 23.8Z"
        fill="url(#poke-berry-body)"
      />

      {/* Anime Gloss Reflection Curve (Left side) */}
      <path
        d="M13.5 18c0-3.5 3-5.5 6-4.5 1.2.4 2.2 1.3 3.2 2.4-2.8.2-5.5 1.8-7 4.5-.8 1.5-1.2 3.2-1.2 5 0-2.8-.4-5.4-1-7.4Z"
        fill="url(#poke-berry-gloss)"
      />
      <ellipse cx="14.5" cy="27" rx="1.8" ry="3.5" transform="rotate(-15 14.5 27)" fill="#FFFFFF" opacity="0.6" />

      {/* Cute Anime Blush Dots */}
      <ellipse cx="15" cy="23" rx="3.2" ry="1.8" fill="#FFAEC2" opacity="0.75" />
      <ellipse cx="33" cy="23" rx="3.2" ry="1.8" fill="#FFAEC2" opacity="0.75" />

      {/* Golden Star / Seed Pips */}
      {/* Top row */}
      <circle cx="20" cy="21" r="1.3" fill="#FEF08A" />
      <circle cx="28" cy="21" r="1.3" fill="#FEF08A" />
      {/* Middle row */}
      <circle cx="16.5" cy="29" r="1.2" fill="#FDE047" />
      <circle cx="24" cy="28" r="1.4" fill="#FEF08A" />
      <circle cx="31.5" cy="29" r="1.2" fill="#FDE047" />
      {/* Bottom tip */}
      <circle cx="20.5" cy="35.5" r="1.1" fill="#FACC15" />
      <circle cx="27.5" cy="35.5" r="1.1" fill="#FACC15" />
      <circle cx="24" cy="39" r="0.9" fill="#FACC15" />

      {/* Electric Sky-Blue Leaf Crown (Left, Center, Right, and Spark Tips) */}
      {/* Left Leaf */}
      <path
        d="M21 14.5C15 14 8 10 9 4c4 1 9.5 5 12 10.5Z"
        fill="url(#poke-leaf-blue)"
      />
      {/* Right Leaf */}
      <path
        d="M27 14.5C33 14 40 10 39 4c-4 1-9.5 5-12 10.5Z"
        fill="url(#poke-leaf-blue)"
      />
      {/* Center Crown Leaf (Tuft) */}
      <path
        d="M24 16c-3-4.5-3.5-10 0-14 3.5 4 3 9.5 0 14Z"
        fill="url(#poke-leaf-center)"
      />
      {/* Left Small Leaflet */}
      <path
        d="M17 14.5c-4-1-6.5-3.5-6-6 2.5.5 5 2.5 6 6Z"
        fill="#38BDF8"
      />
      {/* Right Small Leaflet */}
      <path
        d="M31 14.5c4-1 6.5-3.5 6-6-2.5.5-5 2.5-6 6Z"
        fill="#38BDF8"
      />

      {/* Stem Cap Spark */}
      <circle cx="24" cy="14" r="2" fill="#BAE6FD" />
      <path d="M24 2.5l.8 2.2 2.4.4-1.8 1.6.5 2.4-1.9-1.2-1.9 1.2.5-2.4-1.8-1.6 2.4-.4.8-2.2Z" fill="#FDE047" opacity="0.85" />
    </svg>
  );
}

/** Geometric electric spark — the Cielo "bolt" signature */
export function ElectricSparkIcon({ className = 'w-6 h-6' }: ClassName) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.2 2.2 11 9.4 18.6 7.6 13.2 16.4M10.8 21.8 13 14.6l-7.6 1.8 4 3.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.4 3.8 8.6 7.2 5.2 6 7.4 3.8Z" fill="var(--sun)" />
      <path d="M18 14.2 18.9 16.9 21.6 16l-3.6-1.8Z" fill="var(--sun)" />
    </svg>
  );
}

/** Tiny 4-point twinkle */
export function Sparkle({ className = 'w-4 h-4' }: ClassName) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0c.9 5.6 4.4 9.1 10 10-5.6.9-9.1 4.4-10 10-.9-5.6-4.4-9.1-10-10 5.6-.9 9.1-4.4 10-10Z" />
    </svg>
  );
}

/* ===========================================================================
   YANI — tiger & ember (dark, warm)
   =========================================================================== */

/** Tiger look-front head with bold stripes — the Yani signature */
export function TigerFaceEmblem({ className = 'w-6 h-6' }: ClassName) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tig-fur" x1="14" y1="6" x2="34" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB060" />
          <stop offset="0.5" stopColor="#FF8A1F" />
          <stop offset="1" stopColor="#F05A00" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <path d="M12 14 7 5l9 6c-1.6 1.4-3 1.8-4 3Z" fill="url(#tig-fur)" />
      <path d="M36 14l5-9-9 6c1.6 1.4 3 1.8 4 3Z" fill="url(#tig-fur)" />
      {/* Head */}
      <path d="M24 46C13.5 39.5 4 29 4 17 4 8.5 10.5 4 18.5 6.4c1.8-2.2 3.6-2.6 5.5-2.6s3.7.4 5.5 2.6C37.5 4 44 8.5 44 17c0 12-9.5 22.5-20 29Z" fill="url(#tig-fur)" />
      {/* Forehead stripes */}
      <path d="M24 3v5M19 5.4l2.2 4.6M29 5.4 26.8 10M15 9l4 3.4M33 9l-4 3.4" stroke="#B33700" strokeWidth="2" strokeLinecap="round" />
      {/* Cheek stripes */}
      <path d="M8 17c3-1.5 6-1.5 9 0M40 17c-3-1.5-6-1.5-9 0" stroke="#B33700" strokeWidth="2.2" strokeLinecap="round" />
      {/* Muzzle / cheeks */}
      <path d="M24 32c-4.6 0-7-2.4-7-7 0-4.2 3.2-6 7-6s7 1.8 7 6c0 4.6-2.4 7-7 7Z" fill="#FFF6E8" />
      <path d="M24 34c-3.6 0-6 .8-6.6 1.4-1 .8-.6 2.2 1.2 2.6 2.4 4 8.4 4 10.8 0 1.8-.4 2.2-1.8 1.2-2.6C30 34.8 27.6 34 24 34Z" fill="#FFF6E8" />
      {/* Eyes */}
      <path d="M17.5 23c1.4 1.3 2.8 1.3 4.2 0M26 23c1.4 1.3 2.9 1.3 4.3 0" stroke="#4A1D0A" strokeWidth="1.9" strokeLinecap="round" />
      {/* Nose */}
      <path d="M23.4 27.4 24 28.2l.6-.8a.9.9 0 0 0-.6-1.5.9.9 0 0 0-.6 1.5Z" fill="#4A1D0A" />
      {/* Mouth + chin whiskers */}
      <path d="M21.4 29.4c.9.8 1.7.8 2.6 0" stroke="#E8A24C" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M27 29.6c.9-.7 1.6-.5 2.4 0" stroke="#E8A24C" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.5 27.5c-1.6-.4-2.8-.2-3.7.5M33 28c1.5-.3 2.7 0 3.6.7M17 31.5c-1.7.4-3 1-3.9 1.9M32 31.5c1.6.3 2.9.9 3.9 1.9" stroke="#B33700" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

/** Anatomical 4-toe tiger paw */
export function TigerPawEmblem({ className = 'w-6 h-6', style }: ClassName) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="14" rx="2.8" ry="4" transform="rotate(-25 8 14)" fill="currentColor" />
      <ellipse cx="15.5" cy="9" rx="3" ry="4.5" transform="rotate(-8 15.5 9)" fill="currentColor" />
      <ellipse cx="24.5" cy="9" rx="3" ry="4.5" transform="rotate(8 24.5 9)" fill="currentColor" />
      <ellipse cx="32" cy="14" rx="2.8" ry="4" transform="rotate(25 32 14)" fill="currentColor" />
      <path d="M12 25c0-4 4-6 8-6s8 2 8 6c0 6-4 9-8 9s-8-3-8-9Z" fill="currentColor" />
    </svg>
  );
}

export function TigerIcon(props: ClassName) {
  return <TigerFaceEmblem {...props} />;
}

/** Four-slash claw marks */
export function TigerClawMark({ className = 'w-6 h-6' }: ClassName) {
  return (
    <svg viewBox="0 0 50 50" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M 8 5 Q 16 22 22 45 Q 15 28 8 5 Z" fill="currentColor" />
      <path d="M 18 3 Q 27 23 32 47 Q 25 29 18 3 Z" fill="currentColor" />
      <path d="M 29 4 Q 37 24 41 46 Q 35 28 29 4 Z" fill="currentColor" />
      <path d="M 39 8 Q 44 24 47 42 Q 43 27 39 8 Z" fill="currentColor" />
    </svg>
  );
}

/** Rising ember droplet */
export function EmberIcon({ className = 'w-6 h-6' }: ClassName) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2c2.5 4.3 6 7.6 6 12a6 6 0 0 1-12 0c0-4.4 3.5-7.7 6-12Z" fill="currentColor" opacity="0.55" />
      <path d="M12 6c1.4 3 3 3.4 3 7a3 3 0 0 1-6 0c0-3.4 1.7-4.1 3-7Z" fill="currentColor" />
      <circle cx="12" cy="15" r="1.2" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

/* ===========================================================================
   Shared crown — the "Cielo & Yani" mark
   =========================================================================== */
export function CoupleMark({ className = 'w-6 h-6' }: ClassName) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <circle cx="15.5" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <path d="M12 9.5 13.4 12 12 14.5 10.6 12Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/* ===========================================================================
   Theme-aware ambient backdrop
   =========================================================================== */
export function ThemePatternBg({ theme }: { theme: UserTheme }) {
  const isTiger = theme === 'tiger';
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background: isTiger
            ? 'radial-gradient(120% 90% at 85% -10%, rgba(255,140,40,0.16) 0%, transparent 55%), radial-gradient(90% 70% at 0% 110%, rgba(255,120,0,0.10) 0%, transparent 50%), var(--bg-main)'
            : 'radial-gradient(120% 90% at 85% -10%, rgba(125,172,255,0.30) 0%, transparent 55%), radial-gradient(90% 70% at 0% 110%, rgba(251,61,109,0.10) 0%, transparent 50%), var(--bg-main)',
        }}
      />

      {isTiger ? (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 [filter:blur(90px)]" style={{ background: 'var(--accent-glow)' }} />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-20 [filter:blur(90px)]" style={{ background: 'var(--sun-soft)' }} />
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 22px)', color: 'var(--text-primary)' }}
          />
          <EmberIcon className="absolute top-1/4 right-[12%] w-5 h-5 text-[var(--accent)] ambient-float" />
          <EmberIcon className="absolute top-[62%] right-[22%] w-3.5 h-3.5 text-[var(--sun)] ambient-drift" />
          <EmberIcon className="absolute top-1/4 left-3/4 w-5 h-5 -rotate-12 text-[var(--accent)]/70 ambient-float" />
          <TigerClawMark className="absolute bottom-[14%] left-[6%] w-10 h-10 text-[var(--accent)]/15 ambient-drift" />
        </>
      ) : (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40 [filter:blur(100px)]" style={{ background: 'color-mix(in srgb, var(--accent) 22%, transparent)' }} />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-30 [filter:blur(100px)]" style={{ background: 'color-mix(in srgb, var(--berry) 14%, transparent)' }} />
          <div className="absolute inset-0 bg-dotgrid opacity-[0.5]" style={{ WebkitMaskImage: 'radial-gradient(80% 60% at 50% 0%, black 30%, transparent 75%)' }} />
          <StrawberryEmblem className="absolute top-[16%] right-[9%] w-8 h-8 opacity-90 ambient-float" />
          <PokeballEmblem className="absolute top-[26%] left-[6%] w-9 h-9 opacity-50 ambient-drift" />
          <Sparkle className="absolute top-[38%] right-[22%] w-3 h-3 text-[var(--sun)] ambient-float" />
          <Sparkle className="absolute bottom-[20%] left-[18%] w-2.5 h-2.5 text-[var(--berry)] ambient-drift" />
          <StrawberryEmblem className="absolute bottom-[12%] right-[16%] w-6 h-6 opacity-60 ambient-drift" />
        </>
      )}
    </div>
  );
}