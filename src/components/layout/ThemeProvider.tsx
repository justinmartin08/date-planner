'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSession } from '@/lib/types';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const MODE_KEY = 'date-planner-mode';

const ThemeContext = createContext<ThemeContextType>({
  user: null,
  setUser: () => {},
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

function initialMode(user: UserSession | null): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(MODE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  if (user?.theme === 'tiger') return 'dark';
  if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark';
  return 'light';
}

export function ThemeProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: UserSession | null;
}) {
  const [user, setUser] = useState<UserSession | null>(initialUser);
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute('data-theme', user.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user]);

  useEffect(() => {
    // One-time sync from the external system (localStorage / OS preference)
    // after hydration, so SSR output stays stable and the icon matches.
    setModeState(initialMode(user)); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* private mode — ignore */
    }
  }, [mode]);

  const setMode = (next: ThemeMode) => setModeState(next);
  const toggleMode = () => setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ user, setUser, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
