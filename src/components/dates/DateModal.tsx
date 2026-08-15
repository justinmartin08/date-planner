'use client';

import React, { useState, useEffect } from 'react';
import { DateProposalItem } from '@/lib/types';
import { X, Calendar, AlignLeft, MapPin, Sparkles } from 'lucide-react';
import { LocationPicker, PickedLocation } from './LocationPicker';

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    dateTime: string;
    location?: string;
    locationLat?: number;
    locationLng?: number;
  }) => Promise<void>;
  initialData?: DateProposalItem | null;
}

export function DateModal({ isOpen, onClose, onSave, initialData }: DateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      const dt = new Date(initialData.dateTime);
      const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(isoLocal);
      if (initialData.location && initialData.locationLat != null && initialData.locationLng != null) {
        setLocation({
          address: initialData.location,
          lat: initialData.locationLat,
          lng: initialData.locationLng,
        });
      } else {
        setLocation(null);
      }
    } else {
      setTitle('');
      setDescription('');
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(19, 0, 0, 0);
      const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(isoLocal);
      setLocation(null);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dateTime) {
      setError('Please fill in title, details, and date/time.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dateTime: new Date(dateTime).toISOString(),
        location: location?.address,
        locationLat: location?.lat,
        locationLng: location?.lng,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center modal-backdrop-anim bg-black/70 backdrop-blur-sm sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-[var(--bg-card)] border-t sm:border border-[var(--border-color)] w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl mobile-sheet-anim overflow-hidden">
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[var(--border-color)] opacity-70" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {initialData ? 'Edit Plan' : 'Plan a Date'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {initialData ? 'Update your special rendezvous' : 'Add the details for your next adventure together'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunset Dinner at the Pier, Arcade Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> Date &amp; time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onClick={(e) => {
                try {
                  if ('showPicker' in e.currentTarget) {
                    e.currentTarget.showPicker();
                  }
                } catch {
                  /* fallback */
                }
              }}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" /> Location
            </label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[var(--accent)]" /> Details &amp; Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="What are we doing? Where should we meet? Dress code?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all placeholder:text-[var(--text-muted)]/50 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 8px 20px -6px var(--accent-glow)',
              }}
            >
              {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Plan Date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
