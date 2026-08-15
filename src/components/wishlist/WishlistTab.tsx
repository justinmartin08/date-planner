'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { WishlistItem, UserSession } from '@/lib/types';
import { WishlistCard } from './WishlistCard';
import { WishlistModal } from './WishlistModal';
import { WishlistCelebration } from './WishlistCelebration';
import {
  Plus,
  Search,
  Gift,
  CheckCircle2,
  ArrowUpDown,
  User,
  Sparkles,
  Info,
} from 'lucide-react';
import { StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORIES = [
  'All',
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

export function WishlistTab({ currentUser }: { currentUser: UserSession }) {
  // Determine partner details
  const isCielo = currentUser.username === 'cielo';
  const partnerUsername = isCielo ? 'yani' : 'cielo';
  const partnerDisplayName = isCielo ? 'Yani' : 'Cielo';

  // Sub-view: 'partner' (default) or 'my'
  const [viewMode, setViewMode] = useState<'partner' | 'my'>('partner');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'GRANTED'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'priceAsc' | 'priceDesc' | 'newest'>('priority');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<WishlistItem | null>(null);
  const [celebratingWish, setCelebratingWish] = useState<WishlistItem | null>(null);

  // Fetch all wishes with SWR
  const { data, mutate } = useSWR<{ wishes: WishlistItem[] }>(
    '/api/wishlist',
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const allWishes = data?.wishes || [];

  // Filter wishes by viewMode
  const activeOwnerUsername = viewMode === 'partner' ? partnerUsername : currentUser.username;

  const currentViewWishes = useMemo(() => {
    return allWishes.filter((w) => w.owner.username === activeOwnerUsername);
  }, [allWishes, activeOwnerUsername]);

  // Apply search, category, status, and sort filters
  const filteredWishes = useMemo(() => {
    return currentViewWishes
      .filter((item) => {
        // Status filter
        if (statusFilter === 'ACTIVE' && item.status === 'GRANTED') return false;
        if (statusFilter === 'GRANTED' && item.status !== 'GRANTED') return false;

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchCat;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.status === 'GRANTED' && b.status !== 'GRANTED') return 1;
        if (a.status !== 'GRANTED' && b.status === 'GRANTED') return -1;

        if (sortBy === 'priority') {
          return b.priority - a.priority;
        }
        if (sortBy === 'priceAsc') {
          const pA = a.price ?? Infinity;
          const pB = b.price ?? Infinity;
          return pA - pB;
        }
        if (sortBy === 'priceDesc') {
          const pA = a.price ?? -Infinity;
          const pB = b.price ?? -Infinity;
          return pB - pA;
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [currentViewWishes, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Counts
  const activeCount = currentViewWishes.filter((w) => w.status !== 'GRANTED').length;
  const grantedCount = currentViewWishes.filter((w) => w.status === 'GRANTED').length;

  // Find partner's user ID if available
  const partnerUser = allWishes.find((w) => w.owner.username === partnerUsername)?.owner;
  const defaultTargetOwnerId = viewMode === 'partner' ? partnerUser?.id || partnerUsername : currentUser.id;

  const handleSaveWish = async (formData: {
    title: string;
    description?: string;
    url?: string;
    price?: number | null;
    currency: string;
    category: string;
    priority: number;
    imageUrl?: string;
    ownerId: string;
  }) => {
    if (editingWish) {
      await fetch(`/api/wishlist/${editingWish.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    mutate();
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Remove this item from the wishlist?')) return;

    mutate(
      (curr) => (curr ? { wishes: curr.wishes.filter((w) => w.id !== id) } : curr),
      false
    );

    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      mutate();
    } catch (err) {
      console.error('Delete error:', err);
      mutate();
    }
  };

  const handleToggleClaim = async (id: string) => {
    try {
      const res = await fetch(`/api/wishlist/${id}/claim`, { method: 'POST' });
      if (res.ok) {
        mutate();
      }
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const handleToggleGrant = async (item: WishlistItem) => {
    try {
      const res = await fetch(`/api/wishlist/${item.id}/grant`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.granted) {
          setCelebratingWish(item);
        }
        mutate();
      }
    } catch (err) {
      console.error('Grant error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className="rise-in relative overflow-hidden p-6 sm:p-7 rounded-3xl border transition-all"
        style={{
          background: 'var(--accent-soft)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[var(--badge-bg)] text-[var(--accent)]">
                <Gift className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-widest font-bold text-[var(--accent)]">
                Wishlist Sanctuary
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {viewMode === 'partner'
                ? `${partnerDisplayName}'s Wishlist`
                : 'My Wishes'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg leading-relaxed">
              {viewMode === 'partner'
                ? `Gift ideas, dreams, and surprises saved for ${partnerDisplayName}.`
                : `Things you desire that ${partnerDisplayName} can see and fulfill for you.`}
            </p>
          </div>

          {/* Add Wish Action Button */}
          <button
            onClick={() => {
              setEditingWish(null);
              setIsModalOpen(true);
            }}
            className="sheen relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              boxShadow: '0 10px 24px -6px var(--accent-glow)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{viewMode === 'my' ? 'Add to My Wishes' : `Add for ${partnerDisplayName}`}</span>
          </button>
        </div>

        {/* View Switcher Tabs: Partner's List vs My Wishes */}
        <div className="mt-6 pt-5 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-color)]">
            {/* Partner's Wishlist Button */}
            <button
              onClick={() => setViewMode('partner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                viewMode === 'partner'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isCielo ? (
                <TigerPawEmblem className="w-4 h-4" />
              ) : (
                <StrawberryEmblem className="w-4 h-4" />
              )}
              <span>{partnerDisplayName}&apos;s Wishlist</span>
            </button>

            {/* My Wishes Button */}
            <button
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                viewMode === 'my'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isCielo ? (
                <StrawberryEmblem className="w-4 h-4" />
              ) : (
                <TigerPawEmblem className="w-4 h-4" />
              )}
              <span>My Wishes</span>
            </button>
          </div>

          {/* Quick Statistics */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{activeCount} Active</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium text-emerald-600 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{grantedCount} Fulfilled</span>
            </span>
          </div>
        </div>
      </div>

      {/* "My Wishes" Mode Informational Banner */}
      {viewMode === 'my' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/30 text-xs text-[var(--text-primary)] flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[var(--accent)]">Personal Wishlist: </span>
            <span className="text-[var(--text-muted)]">
              These are your wishes. {partnerDisplayName} sees this list on their account to plan surprises and gifts for you!
            </span>
          </div>
        </div>
      )}

      {/* Filter, Search & Sorting Controls */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search wishlist items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]/60"
            />
          </div>

          {/* Status and Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--bg-chip)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
              {(['ALL', 'ACTIVE', 'GRANTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Fulfilled'}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer appearance-none"
              >
                <option value="priority">Sort: Priority</option>
                <option value="priceAsc">Sort: Price (Low to High)</option>
                <option value="priceDesc">Sort: Price (High to Low)</option>
                <option value="newest">Sort: Newest</option>
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-chip)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip-hover)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wishlist Grid */}
      {filteredWishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWishes.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onEdit={(wish) => {
                setEditingWish(wish);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteWish}
              onToggleClaim={handleToggleClaim}
              onToggleGrant={handleToggleGrant}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            {activeOwnerUsername === 'cielo' ? (
              <StrawberryEmblem className="w-9 h-9" />
            ) : (
              <TigerPawEmblem className="w-9 h-9" />
            )}
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            {searchQuery || selectedCategory !== 'All' || statusFilter !== 'ALL'
              ? 'No matching wishlist items found'
              : viewMode === 'partner'
              ? `No wishes listed for ${partnerDisplayName} yet!`
              : 'Your personal wishlist is currently empty!'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
            {searchQuery || selectedCategory !== 'All' || statusFilter !== 'ALL'
              ? 'Try clearing your search or selecting a different category filter.'
              : viewMode === 'partner'
              ? `Add a gift idea or surprise for ${partnerDisplayName} so you never forget.`
              : `Add things you love so ${partnerDisplayName} knows what to surprise you with.`}
          </p>
          <button
            onClick={() => {
              setEditingWish(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{viewMode === 'my' ? 'Add Your First Wish' : `Add a Wish for ${partnerDisplayName}`}</span>
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWish(null);
        }}
        onSave={handleSaveWish}
        editingWish={editingWish}
        currentUser={currentUser}
        defaultOwnerId={defaultTargetOwnerId}
      />

      {/* Celebration Modal */}
      <WishlistCelebration
        item={celebratingWish}
        onClose={() => setCelebratingWish(null)}
      />
    </div>
  );
}
