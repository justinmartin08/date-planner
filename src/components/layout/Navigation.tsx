'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { StrawberryEmblem, TigerPawEmblem, CoupleMark } from '../ui/Motifs';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { LogOut, Calendar, CalendarDays, Gift, Mail, Bell, User, Sun, Moon } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { MainTabKey } from './MobileBottomNav';

interface NavigationProps {
  activeTab: MainTabKey;
  setActiveTab: (tab: MainTabKey) => void;
  unreadCount?: number;
  onUserUpdate?: (user: UserSession) => void;
}

const TABS: { key: MainTabKey; label: string; icon: typeof Calendar }[] = [
  { key: 'dates', label: 'Dates', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'wishlist', label: 'Wishlist', icon: Gift },
  { key: 'letters', label: 'Letters', icon: Mail },
];

export function Navigation({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onUserUpdate,
}: NavigationProps) {
  const { user, setUser, mode, toggleMode } = useTheme();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleUserUpdate = (updatedUser: UserSession) => {
    setUser(updatedUser);
    if (onUserUpdate) onUserUpdate(updatedUser);
  };

  if (!user) return null;

  const isTiger = user.theme === 'tiger';
  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg-main)]/80 border-b border-[var(--border-color)] px-4 py-2.5 sm:px-8 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Identity + couple mark */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 group hover:opacity-95 transition-opacity text-left cursor-pointer"
            title="Manage profile & settings"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[var(--badge-bg)] border border-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover rounded-full" />
              ) : isTiger ? (
                <TigerPawEmblem className="w-5 h-5 text-[var(--accent)]" />
              ) : (
                <StrawberryEmblem className="w-5 h-5" />
              )}
              {/* unread dot */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--berry)] border-2 border-[var(--bg-main)] animate-breathe" />
              )}
            </div>
            <div className="min-w-0 flex items-center">
              <h1 className="font-bold text-sm sm:text-base leading-none tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                {user.displayName}
              </h1>
            </div>
          </button>

          {/* Desktop / Tablet Sliding pill tabs */}
          <nav className="hidden md:flex relative items-center bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <span
              className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: `calc(${activeIndex} * (100% / ${TABS.length}))`,
                width: `calc(100% / ${TABS.length})`,
                background: 'var(--accent)',
                boxShadow: '0 6px 18px -4px var(--accent-glow)',
              }}
            />
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 z-10 cursor-pointer ${
                  activeTab === key ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {key === 'letters' && unreadCount > 0 && (
                  <span className="ml-1 min-w-[1.1rem] px-1 py-0.5 text-[10px] leading-none font-bold bg-white text-[var(--accent)] rounded-full text-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={toggleMode}
              className="p-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                      new Notification('Notifications Active', {
                        body: 'You will receive alerts for new letters and date plans!',
                      });
                    }
                  });
                }
              }}
              className="p-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer hidden sm:flex"
              title="Enable Device Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Profile & Settings"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-rose-500 p-2 sm:px-2.5 sm:py-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
}