import React from 'react';

/** Bespoke Pokémon Pokéball Emblem (Cielo Theme) */
export function PokeballEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shell */}
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" />
      {/* Top Half Fill */}
      <path d="M 2 20 A 18 18 0 0 1 38 20 Z" fill="currentColor" opacity="0.2" />
      {/* Center Line */}
      <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="3" />
      {/* Outer Button Ring */}
      <circle cx="20" cy="20" r="6" fill="var(--bg-card, #0F1C2E)" stroke="currentColor" strokeWidth="3" />
      {/* Inner Glowing Button */}
      <circle cx="20" cy="20" r="2.5" fill="currentColor" className="animate-pulse" />
    </svg>
  );
}

/** Bespoke Strawberry Emblem (Cielo Theme - Loves Strawberries) */
export function StrawberryEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Strawberry Body */}
      <path
        d="M20 36C27 30 33 22 33 14C33 8.5 28.5 6 23.5 7C22 7.3 20.9 8.2 20 9C19.1 8.2 18 7.3 16.5 7C11.5 6 7 8.5 7 14C7 22 13 30 20 36Z"
        fill="#FF2D55"
        stroke="#E00034"
        strokeWidth="2"
      />
      {/* Green Stem Leaf */}
      <path
        d="M20 7C18 3 14 3 13 5C15 6.5 17 7.5 20 7Z"
        fill="#34C759"
      />
      <path
        d="M20 7C22 3 26 3 27 5C25 6.5 23 7.5 20 7Z"
        fill="#34C759"
      />
      <path
        d="M20 7C20 2 20 1 20 1"
        stroke="#34C759"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Strawberry Seeds */}
      <circle cx="14" cy="14" r="1" fill="#FFCC00" />
      <circle cx="20" cy="16" r="1" fill="#FFCC00" />
      <circle cx="26" cy="14" r="1" fill="#FFCC00" />
      <circle cx="16" cy="22" r="1" fill="#FFCC00" />
      <circle cx="24" cy="22" r="1" fill="#FFCC00" />
      <circle cx="20" cy="28" r="1" fill="#FFCC00" />
    </svg>
  );
}

/** Bespoke Tiger Paw Emblem (Yani Theme) */
export function TigerPawEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Main Pad */}
      <path
        d="M20 35C26 35 30 30 30 24C30 20 26 18 20 20C14 18 10 20 10 24C10 30 14 35 20 35Z"
        fill="currentColor"
      />
      {/* Toe Pads */}
      <circle cx="10" cy="13" r="3.5" fill="currentColor" />
      <circle cx="17" cy="8" r="3.8" fill="currentColor" />
      <circle cx="23" cy="8" r="3.8" fill="currentColor" />
      <circle cx="30" cy="13" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function TigerIcon(props: { className?: string }) {
  return <TigerPawEmblem {...props} />;
}

/** Tiger Claw Mark slash accent */
export function TigerClawMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6C13 14 11 26 7 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 4C23 14 21 28 16 36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M29 7C32 16 30 27 25 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M37 10C39 18 37 26 33 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/**
 * Custom emblem for Pokémon theme (Cielo - Blue & Pokémon ⚡)
 * A geometric electric spark star emblem replacing the Pokéball icon.
 */
export function ElectricSparkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/** Shared wordmark mark — interlocking rings */
export function CoupleMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="12" r="6" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
      <circle cx="15" cy="12" r="6" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
    </svg>
  );
}

export function ThemePatternBg({ theme }: { theme: 'tiger' | 'pokemon' }) {
  const color = theme === 'tiger' ? '#E8720C' : '#2B7FD6';
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="42" height="42" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}
