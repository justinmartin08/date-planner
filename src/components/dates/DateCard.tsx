'use client';

import React from 'react';
import { DateProposalItem, UserSession } from '@/lib/types';
import { TigerIcon, ElectricSparkIcon } from '../ui/Motifs';
import { MapPin, Calendar, Clock, CheckCircle2, XCircle, Sparkles, Trash2, Edit3, ExternalLink } from 'lucide-react';

interface DateCardProps {
  dateItem: DateProposalItem;
  currentUser: UserSession;
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  onEdit: (dateItem: DateProposalItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export function DateCard({
  dateItem,
  currentUser,
  onUpdateStatus,
  onEdit,
  onDelete,
}: DateCardProps) {
  const isCreator = dateItem.creatorId === currentUser.id;
  const isCreatorTiger = dateItem.creator.theme === 'tiger';
  const formattedDate = new Date(dateItem.dateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(dateItem.dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasMapPin = dateItem.locationLat != null && dateItem.locationLng != null;
  const mapUrl = hasMapPin
    ? `https://www.openstreetmap.org/?mlat=${dateItem.locationLat}&mlon=${dateItem.locationLng}#map=16/${dateItem.locationLat}/${dateItem.locationLng}`
    : null;

  const getStatusBadge = () => {
    switch (dateItem.status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <Sparkles className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-color)]">
            <Clock className="w-3.5 h-3.5" /> Proposed
          </span>
        );
    }
  };

  return (
    <div className="theme-card-glow group relative bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          {getStatusBadge()}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded-md">
            {isCreatorTiger ? <TigerIcon className="w-3.5 h-3.5 text-[#E8720C]" /> : <ElectricSparkIcon className="w-3.5 h-3.5 text-[#2B7FD6]" />}
            <span>{dateItem.creator.displayName}</span>
          </div>
        </div>

        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
          {dateItem.title}
        </h3>

        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 whitespace-pre-wrap">
          {dateItem.description}
        </p>

        <div className="space-y-1.5 mb-5 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>{formattedDate}</span>
            <span className="opacity-30">·</span>
            <Clock className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>{formattedTime}</span>
          </div>
          {dateItem.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
              <span className="font-medium text-[var(--text-primary)] leading-snug flex-1">{dateItem.location}</span>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] shrink-0"
                  title="Open in map"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2">
        {!isCreator && dateItem.status === 'PROPOSED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(dateItem.id, 'CONFIRMED')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
            </button>
            <button
              onClick={() => onUpdateStatus(dateItem.id, 'DECLINED')}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium transition-colors border border-rose-500/25"
            >
              Decline
            </button>
          </div>
        )}

        {dateItem.status === 'CONFIRMED' && (
          <button
            onClick={() => onUpdateStatus(dateItem.id, 'COMPLETED')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Mark completed
          </button>
        )}

        {dateItem.status === 'DECLINED' && !isCreator && (
          <button
            onClick={() => onUpdateStatus(dateItem.id, 'CONFIRMED')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors"
          >
            Re-confirm
          </button>
        )}

        {isCreator && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onEdit(dateItem)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Edit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(dateItem.id)}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
