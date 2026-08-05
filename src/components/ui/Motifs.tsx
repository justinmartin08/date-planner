/** Classic Red & White Pokémon Pokéball Emblem */
export function PokeballEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer Circle Ring */}
      <circle cx="20" cy="20" r="18" stroke="#1E293B" strokeWidth="2.5" />
      {/* Top Red Half */}
      <path d="M 2 20 A 18 18 0 0 1 38 20 Z" fill="#EF4444" />
      {/* Bottom White Half */}
      <path d="M 2 20 A 18 18 0 0 0 38 20 Z" fill="#FFFFFF" />
      {/* Center Black Line */}
      <line x1="2" y1="20" x2="38" y2="20" stroke="#1E293B" strokeWidth="2.5" />
      {/* Outer Button Ring */}
      <circle cx="20" cy="20" r="5.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
      {/* Inner Button */}
      <circle cx="20" cy="20" r="2.5" fill="#1E293B" />
    </svg>
  );
}

/** Bespoke Strawberry Emblem */
export function StrawberryEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 36C27 30 33 22 33 14C33 8.5 28.5 6 23.5 7C22 7.3 20.9 8.2 20 9C19.1 8.2 18 7.3 16.5 7C11.5 6 7 8.5 7 14C7 22 13 30 20 36Z"
        fill="#FF2D55"
        stroke="#E00034"
        strokeWidth="2"
      />
      <path d="M20 7C18 3 14 3 13 5C15 6.5 17 7.5 20 7Z" fill="#34C759" />
      <path d="M20 7C22 3 26 3 27 5C25 6.5 23 7.5 20 7Z" fill="#34C759" />
      <path d="M20 7C20 2 20 1 20 1" stroke="#34C759" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="14" r="1" fill="#FFCC00" />
      <circle cx="20" cy="16" r="1" fill="#FFCC00" />
      <circle cx="26" cy="14" r="1" fill="#FFCC00" />
      <circle cx="16" cy="22" r="1" fill="#FFCC00" />
      <circle cx="24" cy="22" r="1" fill="#FFCC00" />
      <circle cx="20" cy="28" r="1" fill="#FFCC00" />
    </svg>
  );
}

/** Anatomical Tiger Paw Print (4 Distinct Oval Toe Pads + Main Pad) */
export function TigerPawEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 4 Distinct Oval Toe Pads */}
      <ellipse cx="8" cy="14" rx="2.8" ry="4" transform="rotate(-25 8 14)" fill="currentColor" />
      <ellipse cx="15.5" cy="9" rx="3" ry="4.5" transform="rotate(-8 15.5 9)" fill="currentColor" />
      <ellipse cx="24.5" cy="9" rx="3" ry="4.5" transform="rotate(8 24.5 9)" fill="currentColor" />
      <ellipse cx="32" cy="14" rx="2.8" ry="4" transform="rotate(25 32 14)" fill="currentColor" />
      {/* Main Bottom Heel Pad */}
      <path
        d="M 12 25 C 12 21 16 19 20 19 C 24 19 28 21 28 25 C 28 31 24 34 20 34 C 16 34 12 31 12 25 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TigerIcon(props: { className?: string }) {
  return <TigerPawEmblem {...props} />;
}

/** Sharp Diagonal 4-Slash Tiger Scratch Marks (Real Scratch) */
export function TigerClawMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Slash 1 */}
      <path d="M 8 5 Q 16 22 22 45 Q 15 28 8 5 Z" fill="currentColor" />
      {/* Slash 2 */}
      <path d="M 18 3 Q 27 23 32 47 Q 25 29 18 3 Z" fill="currentColor" />
      {/* Slash 3 */}
      <path d="M 29 4 Q 37 24 41 46 Q 35 28 29 4 Z" fill="currentColor" />
      {/* Slash 4 */}
      <path d="M 39 8 Q 44 24 47 42 Q 43 27 39 8 Z" fill="currentColor" />
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
