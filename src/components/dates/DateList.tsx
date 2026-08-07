'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DateProposalItem, UserSession } from '@/lib/types';
import { DateCard } from './DateCard';
import { DateModal } from './DateModal';
import { Plus, Filter } from 'lucide-react';
import { PokeballEmblem, StrawberryEmblem, TigerPawEmblem, TigerClawMark } from '@/components/ui/Motifs';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DateList({ currentUser }: { currentUser: UserSession }) {
  const [filter, setFilter] = useState<'ALL' | 'PROPOSED' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<DateProposalItem | null>(null);

  const { data, mutate } = useSWR<{ dates: DateProposalItem[] }>('/api/dates', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const dates = data?.dates || [];

  const filteredDates = dates.filter((d) => {
    if (filter === 'ALL') return true;
    return d.status === filter;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    mutate(
      (current) =>
        current
          ? {
              dates: current.dates.map((d) => (d.id === id ? { ...d, status: status as DateProposalItem['status'] } : d)),
            }
          : current,
      false
    );

    try {
      await fetch(`/api/dates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      mutate();
    } catch (err) {
      console.error('Failed to update date status:', err);
      mutate();
    }
  };

  const handleSaveDate = async (formData: {
    title: string;
    description: string;
    dateTime: string;
    location?: string;
    locationLat?: number;
    locationLng?: number;
  }) => {
    if (editingDate) {
      await fetch(`/api/dates/${editingDate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    mutate();
  };

  const handleDeleteDate = async (id: string) => {
    if (!confirm('Delete this plan?')) return;

    mutate((current) => (current ? { dates: current.dates.filter((d) => d.id !== id) } : current), false);

    try {
      await fetch(`/api/dates/${id}`, { method: 'DELETE' });
      mutate();
    } catch (err) {
      console.error('Failed to delete date:', err);
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme-aware hero banner */}
      <div className="rise-in theme-card-glow relative overflow-hidden p-6 sm:p-7 rounded-3xl border transition-all"
        style={{
          background: 'var(--accent-soft)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
        }}>
        {/* frosting wash */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: currentUser.theme === 'tiger'
              ? 'linear-gradient(115deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, color-mix(in srgb, var(--sun) 8%, transparent) 45%, transparent 75%)'
              : 'linear-gradient(115deg, color-mix(in srgb, var(--accent) 10%, transparent) 0%, color-mix(in srgb, var(--berry) 7%, transparent) 45%, transparent 75%)',
          }}
        />
        {/* hero emblem */}
        {currentUser.theme === 'tiger' ? (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-90 pointer-events-none flex items-center gap-3">
            <TigerPawEmblem className="w-20 h-20 text-[var(--accent)]/30 ambient-float" />
            <TigerClawMark className="w-12 h-12 -rotate-12 text-[var(--accent)]/20 ambient-drift" />
          </div>
        ) : (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-90 pointer-events-none flex items-center gap-3">
            <PokeballEmblem className="w-20 h-20 animate-spin-slow" />
            <StrawberryEmblem className="-ml-8 -mt-10 w-9 h-9 ambient-float" />
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${
              currentUser.theme === 'tiger'
                ? 'bg-[var(--accent)]/15 border-[var(--accent)]/30 text-[var(--accent)]'
                : 'bg-[var(--card-chip)] border-[var(--border-color)]'
            }`} style={currentUser.theme !== 'tiger' ? { color: 'var(--berry)', background: 'var(--bg-chip)' } : undefined}>
              {currentUser.theme === 'tiger' ? (
                <TigerPawEmblem className="w-6 h-6 text-[var(--accent)]" />
              ) : (
                <StrawberryEmblem className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Date Planner
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                {currentUser.theme === 'tiger'
                  ? <><TigerPawEmblem className="w-3.5 h-3.5 text-[var(--accent)]" /> upcoming adventures for Yani</>
                  : <><StrawberryEmblem className="w-3.5 h-3.5" /> sweet little plans for Cielo</>}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingDate(null);
              setIsModalOpen(true);
            }}
            className="sheen relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
            style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-hover))', boxShadow: '0 10px 22px -8px var(--accent-glow)' }}
          >
            <Plus className="w-4 h-4" />
            Plan a Date
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
        </span>
        {(['ALL', 'PROPOSED', 'CONFIRMED', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              filter === tab
                ? 'bg-[var(--accent)] text-white shadow-[0_4px_12px_-2px_var(--accent-glow)]'
                : 'bg-[var(--bg-chip)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip-hover)]'
            }`}
          >
            {tab === 'ALL' && 'All'}
            {tab === 'PROPOSED' && 'Proposed'}
            {tab === 'CONFIRMED' && 'Confirmed'}
            {tab === 'COMPLETED' && 'Completed'}
          </button>
        ))}
      </div>

      {filteredDates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDates.map((d, di) => (
            <div
              key={d.id}
              className="rise-in"
              style={{ ['--d' as string]: `${Math.min(di, 6) * 70}ms` }}
            >
              <DateCard
                dateItem={d}
                currentUser={currentUser}
                onUpdateStatus={handleUpdateStatus}
                onEdit={(item) => {
                  setEditingDate(item);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteDate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-3xl">
          <div className="p-3 rounded-full bg-[var(--badge-bg)] text-[var(--accent)] mb-3 animate-breathe">
            {currentUser.theme === 'tiger' ? (
              <TigerPawEmblem className="w-6 h-6" />
            ) : (
              <StrawberryEmblem className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            No plans yet
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">
            {filter === 'ALL'
              ? 'Add your first date idea to get started.'
              : `No plans with status "${filter.toLowerCase()}".`}
          </p>
          <button
            onClick={() => {
              setEditingDate(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors"
          >
            Plan a Date
          </button>
        </div>
      )}

      <DateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDate}
        initialData={editingDate}
      />
    </div>
  );
}
