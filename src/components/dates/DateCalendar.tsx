'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DateProposalItem } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  XCircle,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const STATUS_STYLE: Record<DateProposalItem['status'], { dot: string; label: string; badge: string }> = {
  PROPOSED: {
    dot: 'bg-[var(--accent)]',
    label: 'Proposed',
    badge: 'bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-color)]',
  },
  CONFIRMED: {
    dot: 'bg-emerald-500',
    label: 'Confirmed',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  },
  DECLINED: {
    dot: 'bg-rose-500',
    label: 'Declined',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
  },
  COMPLETED: {
    dot: 'bg-indigo-500',
    label: 'Completed',
    badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
  },
};

function sortByDate(a: DateProposalItem, b: DateProposalItem) {
  return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
}

export function DateCalendar() {
  const { data } = useSWR<{ dates: DateProposalItem[] }>('/api/dates', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const dates = data?.dates || [];
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string>(dateKey(today));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // Group plans by local date key
  const byDay = dates.reduce((acc, d) => {
    const k = dateKey(new Date(d.dateTime));
    if (!acc[k]) acc[k] = [];
    acc[k].push(d);
    return acc;
  }, {} as Record<string, DateProposalItem[]>);

  // Build the 6-week grid (42 cells), including adjacent-month days
  const gridStart = new Date(year, month, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }

  const goMonth = (delta: number) => {
    setViewMonth(new Date(year, month + delta, 1));
  };

  const jumpToday = () => {
    const t = new Date();
    setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedKey(dateKey(t));
  };

  const selectedPlans = (byDay[selectedKey] || []).slice().sort(sortByDate);
  const selectedDate = selectedKey ? new Date(`${selectedKey}T00:00:00`) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Calendar</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToday}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => goMonth(-1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[8.5rem] text-center text-sm font-semibold text-[var(--text-primary)]">
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => goMonth(1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map(({ date, inMonth }) => {
            const k = dateKey(date);
            const plans = byDay[k] || [];
            const isToday = dateKey(today) === k;
            const isSelected = k === selectedKey;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <button
                key={k}
                onClick={() => setSelectedKey(k)}
                className={`relative min-h-[3.4rem] sm:min-h-[5.2rem] border-b border-r border-[var(--border-color)] last:border-r-0 p-1.5 sm:p-2 text-left transition-colors hover:bg-[var(--bg-main)] ${
                  inMonth ? 'cursor-pointer' : 'opacity-45'
                } ${isSelected ? 'bg-[var(--accent)]/15' : ''}`}
              >
                <div className="relative flex flex-col h-full">
                  <div
                    className={`inline-flex h-6 items-center justify-center rounded-full text-xs font-medium shrink-0 ${
                      isToday
                        ? 'bg-[var(--accent)] text-white px-2'
                        : isWeekend
                        ? 'text-rose-300 w-6'
                        : 'text-[var(--text-primary)] w-6'
                    } ${isSelected && !isToday ? 'text-[var(--accent)]' : ''}`}
                  >
                    {isToday ? 'Today' : date.getDate()}
                  </div>
                  {plans.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                      {plans.slice(0, 3).map((p, i) => (
                        <span
                          key={i}
                          title={p.title}
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_STYLE[p.status].dot}`}
                        />
                      ))}
                      {plans.length > 3 && (
                        <span className="text-[9px] leading-none text-[var(--text-muted)]">
                          +{plans.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 border-t border-[var(--border-color)]">
          {(['PROPOSED', 'CONFIRMED', 'COMPLETED', 'DECLINED'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[s].dot}`} />
              {STATUS_STYLE[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          {selectedDate
            ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Select a date'}
        </h3>

        {selectedPlans.length > 0 ? (
          <ul className="space-y-2">
            {selectedPlans.map((p) => {
              const time = new Date(p.dateTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <li
                  key={p.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]"
                >
                  <div className="p-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.title}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[p.status].badge}`}
                      >
                        {p.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                        {p.status === 'COMPLETED' && <Sparkles className="w-3 h-3" />}
                        {p.status === 'DECLINED' && <XCircle className="w-3 h-3" />}
                        {STATUS_STYLE[p.status].label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {time}
                      </span>
                      {p.location && (
                        <span className="flex items-center gap-1 min-w-0 truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {p.location}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">Nothing planned on this day yet.</p>
        )}
      </div>
    </div>
  );
}