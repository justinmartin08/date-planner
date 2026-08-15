'use client';

import React, { useEffect, useState } from 'react';
import { WishlistItem } from '@/lib/types';
import { Sparkles, Heart, Gift, Check, X } from 'lucide-react';
import { CoupleMark, StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';

interface WishlistCelebrationProps {
  item: WishlistItem | null;
  onClose: () => void;
}

export function WishlistCelebration({ item, onClose }: WishlistCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string; size: number; emoji?: string }>>([]);

  useEffect(() => {
    if (!item) return;

    // Generate 45 celebratory confetti particles
    const colors = ['#fb3d6d', '#2563eb', '#ff7a00', '#ffc53d', '#10b981', '#8b5cf6', '#ec4899'];
    const emojis = ['✨', '💖', '🎁', '🍓', '🐯', '⭐', '🎉'];
    
    const newParticles = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 1.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 10 + Math.random() * 14,
      emoji: Math.random() > 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
    }));

    setParticles(newParticles);
  }, [item]);

  if (!item) return null;

  const isOwnerCielo = item.owner.username === 'cielo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-anim bg-black/60 backdrop-blur-md">
      {/* Confetti pieces */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            color: p.color,
          }}
        >
          {p.emoji ? (
            <span>{p.emoji}</span>
          ) : (
            <div
              style={{
                width: `${p.size * 0.7}px`,
                height: `${p.size * 1.2}px`,
                backgroundColor: p.color,
                borderRadius: '3px',
              }}
            />
          )}
        </div>
      ))}

      {/* Celebration Modal Card */}
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-2 border-[var(--accent)] rounded-3xl p-6 sm:p-8 text-center shadow-2xl mobile-sheet-anim overflow-hidden z-10">
        {/* Glow backdrop */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: 'var(--accent-glow)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: 'var(--berry)' }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--berry)] text-white flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <Gift className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Wish Fulfilled!
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
          Yay! Granted with Love!
        </h3>

        <p className="text-sm text-[var(--text-muted)] mb-5">
          {item.owner.displayName}&apos;s wish has come true! ✨
        </p>

        {/* Item Preview Card */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-4 mb-6 flex items-center gap-3 text-left">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-16 h-16 rounded-xl object-cover border border-[var(--border-color)] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0 text-[var(--accent)]">
              {isOwnerCielo ? <StrawberryEmblem className="w-8 h-8" /> : <TigerPawEmblem className="w-8 h-8" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-[var(--accent)]">
                {item.price ? `${item.currency === 'PHP' ? '₱' : item.currency === 'USD' ? '$' : item.currency} ${item.price.toLocaleString()}` : item.category}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <CoupleMark className="w-3 h-3" /> {item.owner.displayName}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--berry))',
            boxShadow: '0 8px 24px -6px var(--accent-glow)',
          }}
        >
          <Heart className="w-4 h-4 fill-current" /> Keep Celebrating
        </button>
      </div>
    </div>
  );
}
