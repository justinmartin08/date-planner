'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { StrawberryEmblem, TigerPawEmblem, CoupleMark } from '../ui/Motifs';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { LogOut, Calendar, CalendarDays, Mail, Bell, User } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface NavigationProps {
  activeTab: 'dates' | 'letters' | 'calendar';
  setActiveTab: (tab: 'dates' | 'letters' | 'calendar') => void;
  unreadCount?: number;
  onUserUpdate?: (user: UserSession) => void;
}

const TABS: { key: 'dates' | 'letters' | 'calendar'; label: string; icon: typeof Calendar }[] = [
  { key: 'dates', label: 'Dates', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'letters', label: 'Letters', icon: Mail },
];

export function Navigation({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onUserUpdate,
}: NavigationProps) {
  const { user, setUser } = useTheme();
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
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg-main)]/75 border-b border-[var(--border-color)] px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Identity + crown */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 min-w-0 group hover:opacity-95 transition-opacity text-left"
            title="Manage profile & settings"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--badge-bg)] border border-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
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
            <div className="min-w-0 hidden sm:block">
              <h1 className="font-semibold text-sm leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                {user.displayName}
              </h1>
              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <CoupleMark className="w-3 h-3" /> Cielo &amp; Yani
              </div>
            </div>
          </button>

          {/* Sliding pill tabs */}
          <nav className="relative flex items-center bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-color)]">
            <span
              className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: `calc(${activeIndex} * (100% / 3))`,
                width: 'calc(100% / 3)',
                background: 'var(--accent)',
                boxShadow: '0 6px 18px -4px var(--accent-glow)',
              }}
            />
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 z-10 ${
                  activeTab === key ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {key === 'letters' && unreadCount > 0 && (
                  <span className="ml-0.5 min-w-[1.05rem] px-1 py-0.5 text-[10px] leading-none font-bold bg-white text-[var(--accent)] rounded-full text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
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
              className="p-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title="Enable Device Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Profile & Settings"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--berry)] px-2.5 py-2 rounded-xl hover:bg-[var(--berry-soft)] transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
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