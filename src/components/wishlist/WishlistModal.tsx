'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WishlistItem, UserSession } from '@/lib/types';
import {
  X,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Star,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wishData: {
    title: string;
    description?: string;
    url?: string;
    price?: number | null;
    currency: string;
    category: string;
    priority: number;
    imageUrl?: string;
    ownerId: string;
  }) => Promise<void>;
  editingWish?: WishlistItem | null;
  currentUser: UserSession;
  defaultOwnerId?: string;
}

const CATEGORIES = [
  'Gifts',
  'Fashion & Clothes',
  'Tech & Gadgets',
  'Food & Dining',
  'Travel & Trips',
  'Activities & Dates',
  'Books & Hobby',
  'Home & Living',
  'Other',
];

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'PHP (₱)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export function WishlistModal({
  isOpen,
  onClose,
  onSave,
  editingWish,
  currentUser,
  defaultOwnerId,
}: WishlistModalProps) {
  const isCielo = currentUser.username === 'cielo';
  const partnerName = isCielo ? 'Yani' : 'Cielo';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [category, setCategory] = useState('Gifts');
  const [priority, setPriority] = useState(2);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [targetOwner, setTargetOwner] = useState<'cielo' | 'yani'>(
    defaultOwnerId === 'cielo' || (isCielo && defaultOwnerId === currentUser.id)
      ? 'cielo'
      : 'yani'
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingWish) {
      setTitle(editingWish.title || '');
      setDescription(editingWish.description || '');
      setUrl(editingWish.url || '');
      setPrice(editingWish.price !== null && editingWish.price !== undefined ? String(editingWish.price) : '');
      setCurrency(editingWish.currency || 'PHP');
      setCategory(editingWish.category || 'Gifts');
      setPriority(editingWish.priority || 2);
      setImageUrl(editingWish.imageUrl || '');
      setTargetOwner(editingWish.owner.username === 'cielo' ? 'cielo' : 'yani');
      setImageMode(editingWish.imageUrl?.startsWith('/api/uploads') ? 'upload' : 'url');
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setPrice('');
      setCurrency('PHP');
      setCategory('Gifts');
      setPriority(2);
      setImageUrl('');
      setTargetOwner(
        defaultOwnerId === 'cielo' || (isCielo && defaultOwnerId === currentUser.id)
          ? 'cielo'
          : defaultOwnerId === 'yani' || (!isCielo && defaultOwnerId === currentUser.id)
          ? 'yani'
          : isCielo
          ? 'yani'
          : 'cielo'
      );
      setImageMode('upload');
    }
    setError(null);
  }, [editingWish, isOpen, currentUser.id, defaultOwnerId, isCielo]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'file');

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a wish title');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Find appropriate owner ID
      const resolvedOwnerId =
        targetOwner === currentUser.username
          ? currentUser.id
          : defaultOwnerId && defaultOwnerId !== currentUser.id
          ? defaultOwnerId
          : targetOwner;

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        price: price ? parseFloat(price) : null,
        currency,
        category,
        priority,
        imageUrl: imageUrl.trim() || undefined,
        ownerId: resolvedOwnerId,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save wish item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop-anim bg-black/60 backdrop-blur-sm sm:p-4">
      {/* Mobile Backdrop tap to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Container */}
      <div className="w-full sm:max-w-lg bg-[var(--bg-card)] border-t sm:border border-[var(--border-color)] rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl mobile-sheet-anim overflow-hidden">
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
                {editingWish ? 'Edit Wish Item' : 'Add to Wishlist'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {editingWish ? 'Update wish details or price' : 'Add a desired item or gift idea'}
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Owner Selector: Cielo vs Yani */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Whose Wishlist is this for?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetOwner('cielo')}
                className={`py-2.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  targetOwner === 'cielo'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-600 shadow-sm'
                    : 'border-[var(--border-color)] bg-[var(--bg-chip)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <StrawberryEmblem className="w-4 h-4" />
                <span>Cielo&apos;s Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetOwner('yani')}
                className={`py-2.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  targetOwner === 'yani'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-600 shadow-sm'
                    : 'border-[var(--border-color)] bg-[var(--bg-chip)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TigerPawEmblem className="w-4 h-4" />
                <span>Yani&apos;s Wishlist</span>
              </button>
            </div>
          </div>

          {/* Wish Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">
              Wish Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Headphones, Matchbox car, Japan trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Estimated Price (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Rating with vector stars */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Priority
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)] justify-around">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPriority(star)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      priority === star
                        ? 'bg-amber-400/20 text-amber-600 border border-amber-400/30 shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        star <= priority ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'
                      }`}
                    />
                    <span>{star === 3 ? 'High' : star === 2 ? 'Medium' : 'Low'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product / Online Store Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">
              Store / Product Link (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://shopee.ph/..., https://amazon.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          </div>

          {/* Image Upload / URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Item Photo (Optional)
              </label>
              <div className="flex items-center gap-1 bg-[var(--bg-chip)] p-0.5 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] flex flex-col items-center justify-center gap-1.5 transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-xs font-semibold">
                    {isUploading ? 'Uploading image...' : imageUrl ? 'Replace photo' : 'Take photo or choose from gallery'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            )}

            {/* Thumbnail Preview */}
            {imageUrl && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[var(--border-color)] group mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Wish Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Description & Specifications */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">
              Notes &amp; Specs (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Size M, Color Pale Pink, or special details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
            />
          </div>

          {/* Modal Actions */}
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
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 8px 20px -6px var(--accent-glow)',
              }}
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Saving...' : editingWish ? 'Save Changes' : 'Add Wish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
