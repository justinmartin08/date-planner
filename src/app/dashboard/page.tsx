'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navigation } from '@/components/layout/Navigation';
import { DateList } from '@/components/dates/DateList';
import { DateCalendar } from '@/components/dates/DateCalendar';
import { LetterThread } from '@/components/messages/MessageThread';
import { ThemePatternBg } from '@/components/ui/Motifs';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dates' | 'letters' | 'calendar'>('dates');

  const { data: userData, error: userError, isLoading, mutate: mutateUser } = useSWR<{ user: UserSession | null }>(
    '/api/auth/me',
    fetcher
  );

  const { data: msgData } = useSWR<{ unreadCount: number }>(
    '/api/messages',
    fetcher,
    { refreshInterval: 3000 }
  );

  const user = userData?.user || null;
  const unreadCount = msgData?.unreadCount || 0;

  useEffect(() => {
    if (!isLoading && (!user || userError)) {
      router.push('/login');
    }
  }, [user, userError, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] theme-swap">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center">
            <span className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </span>
          <p className="text-sm font-medium text-[var(--text-muted)]">Cielo &amp; Yani…</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider initialUser={user}>
      <div className="min-h-screen relative flex flex-col">
        <ThemePatternBg theme={user.theme} />

        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          onUserUpdate={() => mutateUser()}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 relative z-10">
          {activeTab === 'dates' ? (
            <DateList currentUser={user} />
          ) : activeTab === 'calendar' ? (
            <DateCalendar />
          ) : (
            <LetterThread currentUser={user} />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
