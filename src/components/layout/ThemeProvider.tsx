'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSession } from '@/lib/types';

interface ThemeContextType {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  user: null,
  setUser: () => {},
});

export function ThemeProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: UserSession | null;
}) {
  const [user, setUser] = useState<UserSession | null>(initialUser);

  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute('data-theme', user.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ user, setUser }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
