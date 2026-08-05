'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DateProposalItem, UserSession } from '@/lib/types';
import { DateCard } from './DateCard';
import { DateModal } from './DateModal';
import { Plus, Calendar, Filter } from 'lucide-react';
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
      {/* Sleek Theme Hero Banner */}
      <div className={`relative overflow-hidden p-6 sm:p-7 rounded-2xl border transition-all shadow-xl ${
        currentUser.theme === 'tiger'
          ? 'bg-gradient-to-r from-[#141210] via-[#1E1A16] to-[#141210] border-[#FF5500]/30 shadow-[0_8px_25px_rgba(255,85,0,0.12)]'
          : 'bg-gradient-to-r from-[#0F1C2E] via-[#172840] to-[#0F1C2E] border-[#2563EB]/30 shadow-[0_8px_25px_rgba(37,99,235,0.12)]'
      }`}>
        {/* Background Visual Accents */}
        {currentUser.theme === 'tiger' ? (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-[#FF5500] pointer-events-none flex items-center gap-3">
            <TigerClawMark className="w-16 h-16 transform rotate-12" />
          </div>
        ) : (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-25 text-[#2563EB] pointer-events-none flex items-center gap-3">
            <PokeballEmblem className="w-14 h-14 animate-pulse" />
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${
              currentUser.theme === 'tiger'
                ? 'bg-[#FF5500]/15 border-[#FF5500]/30 text-[#FF5500]'
                : 'bg-[#2563EB]/15 border-[#2563EB]/30 text-[#2563EB]'
            }`}>
              {currentUser.theme === 'tiger' ? (
                <TigerPawEmblem className="w-6 h-6 animate-pulse" />
              ) : (
                <PokeballEmblem className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Date Planner
                {currentUser.theme === 'pokemon' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/25">
                    <StrawberryEmblem className="w-3.5 h-3.5" />
                  </span>
                )}
                {currentUser.theme === 'tiger' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/25">
                    <TigerClawMark className="w-3.5 h-3.5" />
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingDate(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-all shadow-md shadow-[var(--accent)]/25 hover:scale-[1.02] active:scale-[0.98] shrink-0"
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
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10'
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
          {filteredDates.map((d) => (
            <DateCard
              key={d.id}
              dateItem={d}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus}
              onEdit={(item) => {
                setEditingDate(item);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteDate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)]/50 border border-dashed border-[var(--border-color)] rounded-2xl">
          <div className="p-3 rounded-full bg-[var(--badge-bg)] text-[var(--accent)] mb-3">
            {currentUser.theme === 'tiger' ? (
              <TigerPawEmblem className="w-6 h-6 text-[#FF5500]" />
            ) : (
              <PokeballEmblem className="w-6 h-6 text-[#2563EB]" />
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
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium"
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
