'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navigation } from '@/components/layout/Navigation';
import { DateList } from '@/components/dates/DateList';
import { LetterThread } from '@/components/messages/MessageThread';
import { ThemeMascotAnimation } from '@/components/ui/ThemeMascotAnimation';
import { ThemePatternBg } from '@/components/ui/Motifs';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dates' | 'letters'>('dates');

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
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#8A93A6] animate-spin" />
          <p className="text-sm font-medium text-[#8A93A6]">Loading…</p>
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
          ) : (
            <LetterThread currentUser={user} />
          )}
        </main>

        <ThemeMascotAnimation theme={user.theme} />
      </div>
    </ThemeProvider>
  );
}
