'use client';

import React from 'react';
import { Calendar, CalendarDays, Gift, Mail } from 'lucide-react';

export type MainTabKey = 'dates' | 'calendar' | 'wishlist' | 'letters';

interface MobileBottomNavProps {
  activeTab: MainTabKey;
  setActiveTab: (tab: MainTabKey) => void;
  unreadCount?: number;
  wishlistCount?: number;
}

const NAV_ITEMS: { key: MainTabKey; label: string; icon: typeof Calendar }[] = [
  { key: 'dates', label: 'Dates', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'wishlist', label: 'Wishlist', icon: Gift },
  { key: 'letters', label: 'Letters', icon: Mail },
];

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  unreadCount = 0,
}: MobileBottomNavProps) {
  const handleTabClick = (key: MainTabKey) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        /* ignore */
      }
    }
    setActiveTab(key);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-2xl border-t border-[var(--border-color)] pb-safe transition-all shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
      style={{
        paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[var(--accent)] font-semibold scale-105'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[var(--accent-soft)]' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />

                {/* Badge for Letters */}
                {key === 'letters' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold bg-[var(--berry)] text-white rounded-full flex items-center justify-center shadow-sm animate-breathe">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-0.5 leading-none">
                {label}
              </span>

              {/* Active Indicator dot */}
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full bg-[var(--accent)] mt-1 animate-pulse"
                  style={{ boxShadow: '0 0 6px var(--accent-glow)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
