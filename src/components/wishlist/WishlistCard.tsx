'use client';

import React, { useState } from 'react';
import { WishlistItem, UserSession } from '@/lib/types';
import {
  ExternalLink,
  Star,
  Gift,
  CheckCircle2,
  Lock,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  Sparkles,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';

interface WishlistCardProps {
  item: WishlistItem;
  currentUser: UserSession;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onToggleClaim: (id: string) => void;
  onToggleGrant: (item: WishlistItem) => void;
}

export function WishlistCard({
  item,
  currentUser,
  onEdit,
  onDelete,
  onToggleClaim,
  onToggleGrant,
}: WishlistCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOwner = item.ownerId === currentUser.id;
  const isOwnerCielo = item.owner.username === 'cielo';
  const isClaimedByMe = item.claimedById === currentUser.id;
  const isClaimedByPartner = Boolean(item.claimedById && !isClaimedByMe);
  const isGranted = item.status === 'GRANTED';

  const currencySymbol =
    item.currency === 'PHP'
      ? '₱'
      : item.currency === 'USD'
      ? '$'
      : item.currency === 'EUR'
      ? '€'
      : item.currency === 'JPY'
      ? '¥'
      : item.currency;

  let domain = '';
  if (item.url) {
    try {
      const parsed = new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      domain = 'Visit link';
    }
  }

  return (
    <div
      className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden bg-[var(--bg-card)] ${
        isGranted
          ? 'opacity-85 border-emerald-500/30'
          : !isOwner && isClaimedByMe
          ? 'border-[var(--berry)] ring-1 ring-[var(--berry-soft)] shadow-md'
          : 'border-[var(--border-color)] hover:border-[var(--accent)] hover:shadow-lg'
      }`}
      style={{ boxShadow: isGranted ? 'none' : 'var(--shadow-soft)' }}
    >
      {/* Top Banner / Image area */}
      <div className="relative w-full h-44 sm:h-48 bg-[var(--bg-chip)] overflow-hidden flex items-center justify-center">
        {item.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] p-4 text-center">
            {isOwnerCielo ? (
              <StrawberryEmblem className="w-12 h-12 text-[var(--accent)]/60" />
            ) : (
              <TigerPawEmblem className="w-12 h-12 text-[var(--accent)]/60" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider opacity-60">
              {item.category}
            </span>
          </div>
        )}

        {/* Priority Stars floating on top left */}
        <div className="absolute top-3 left-3 flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-amber-300 text-xs font-semibold shadow-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < item.priority ? 'fill-amber-400 text-amber-400' : 'text-white/30'
              }`}
            />
          ))}
        </div>

        {/* Category Pill floating on top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-medium shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Status overlay badge if granted */}
        {isGranted && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4" /> Granted &amp; Fulfilled
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Price & Title header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
              {item.title}
            </h3>

            {/* Menu button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-xl py-1 z-30 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(item);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-chip)] flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[var(--accent)]" /> Edit Item
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(item.id);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Price Display */}
          {item.price !== null && item.price !== undefined && (
            <div className="inline-block">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-sm">
                {currencySymbol} {item.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Description / Notes */}
          {item.description && (
            <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          )}

          {/* Link pill if present */}
          {item.url && (
            <div className="pt-1">
              <a
                href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-medium break-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[220px]">{domain}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Action Controls & Secret Claim / Grant */}
        <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
          {/* Secret Claim Indicator for Partner */}
          {!isOwner && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleClaim(item.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isClaimedByMe
                    ? 'bg-[var(--berry)] text-white shadow-sm hover:opacity-90'
                    : 'bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
                title={isClaimedByMe ? 'Click to unclaim' : 'Secretly reserve this gift'}
              >
                <Lock className="w-3.5 h-3.5" />
                {isClaimedByMe ? "I'm buying this! 🤫" : 'Secretly Claim'}
              </button>

              <button
                onClick={() => onToggleGrant(item)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isGranted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[var(--badge-bg)] text-[var(--badge-text)] hover:bg-[var(--accent)] hover:text-white'
                }`}
                title="Mark as Granted / Gifted"
              >
                <Gift className="w-3.5 h-3.5" />
                {isGranted ? 'Fulfilled' : 'Grant 🎉'}
              </button>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleGrant(item)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isGranted
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isGranted ? 'Fulfilled (Click to uncheck)' : 'Mark as Received 🎉'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
