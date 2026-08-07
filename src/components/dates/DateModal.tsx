'use client';

import React, { useState, useEffect } from 'react';
import { DateProposalItem } from '@/lib/types';
import { X, Calendar, AlignLeft, MapPin } from 'lucide-react';
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
      // Reset form fields when a different plan (or draft) is opened.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-24 pb-12 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-lg my-auto rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative z-10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {initialData ? 'Edit Plan' : 'Plan a Date'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {initialData ? 'Update the details below' : 'Add the details for your next date'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="Dinner at the pier"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date &amp; time
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
                  // Fallback for older browsers
                }
              }}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" /> Details
            </label>
            <textarea
              rows={3}
              required
              placeholder="What's the plan?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors placeholder:text-[var(--text-muted)]/50 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : initialData ? 'Save changes' : 'Add plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
