'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { TigerIcon, ElectricSparkIcon } from '../ui/Motifs';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { LogOut, Calendar, Mail, User, Bell } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface NavigationProps {
  activeTab: 'dates' | 'letters';
  setActiveTab: (tab: 'dates' | 'letters') => void;
  unreadCount?: number;
  onUserUpdate?: (user: UserSession) => void;
}

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
      window.location.href = '/login';
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

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-main)]/85 border-b border-[var(--border-color)] px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* User Identity & Avatar Profile Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 min-w-0 group hover:opacity-90 transition-opacity text-left"
            title="Manage profile & settings"
          >
            <div className="relative w-9.5 h-9.5 rounded-full overflow-hidden bg-[var(--badge-bg)] border-2 border-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover rounded-full" />
              ) : isTiger ? (
                <TigerIcon className="w-5 h-5 text-[#FF5500]" />
              ) : (
                <ElectricSparkIcon className="w-5 h-5 text-[#2563EB]" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                {user.displayName}
              </h1>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('dates')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dates'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Date Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('letters')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'letters'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Letters</span>
              {unreadCount > 0 && (
                <span className="ml-0.5 min-w-[1.1rem] px-1 py-0.5 text-[10px] leading-none font-bold bg-rose-500 text-white rounded-full text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                      new Notification('Notifications Active 🔔', {
                        body: 'You will receive alerts for new letters and date plans!',
                      });
                    }
                  });
                }
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title="Enable Device Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Profile & Settings"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-rose-400 px-2.5 py-2 rounded-lg hover:bg-rose-500/10 transition-colors"
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
