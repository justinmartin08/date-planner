'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DateProposalItem, UserSession } from '@/lib/types';
import { DateCard } from './DateCard';
import { DateModal } from './DateModal';
import { Plus, Calendar, Filter } from 'lucide-react';
import { TigerIcon, ElectricSparkIcon } from '@/components/ui/Motifs';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--accent)]" />
            Date Planner
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Plan and confirm what&apos;s next, together.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDate(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Plan a Date
        </button>
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
              <TigerIcon className="w-6 h-6 text-[#E8720C]" />
            ) : (
              <ElectricSparkIcon className="w-6 h-6 text-[#2B7FD6]" />
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
