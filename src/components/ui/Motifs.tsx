import React from 'react';

/**
 * Custom emblem for Tiger theme (Yani - Orange & Tiger 🐅)
 */
export function TigerIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 9.5c1.8-1 3-1 5.5-1s3.7 0 5.5 1M6.5 12.5c1.8-1 3-1 5.5-1s3.7 0 5.5 1M7.5 15.5c1.4-.7 2.4-.7 4.5-.7s3.1 0 4.5.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
