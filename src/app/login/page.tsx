'use client';

import React, { useState, useEffect } from 'react';
import { User, LogIn } from 'lucide-react';
import { ThemePatternBg, CoupleMark, StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';
import type { UserTheme } from '@/lib/types';

function prefersDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

export default function LoginPage() {
  const [dark, setDark] = useState(prefersDark);
  const active: UserTheme = dark ? 'tiger' : 'pokemon';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Follow the OS color scheme (no data-theme yet on the login page).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Wear the ambient theme while signing in.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', active);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [active]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid username or password.');
      }

      // Hard redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)]">
      <ThemePatternBg theme={active} />

      <div className="relative z-10 w-full max-w-md theme-swap" key={active}>
        {/* Crown + name */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shadow-[var(--shadow-soft)]">
              <CoupleMark className="w-6 h-6" />
            </span>
            <div className="text-left leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                Cielo <span className="text-[var(--text-muted)] font-medium">&amp;</span> Yani
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">welcome back, you two</div>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="glass rounded-3xl p-7 sm:p-8 animate-scaleUp">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              {active === 'tiger' ? <TigerPawEmblem className="w-6 h-6" /> : <StrawberryEmblem className="w-6 h-6" />}
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Welcome<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--accent), var(--berry))' }}> back</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Sign in to see your dates and letters.</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[var(--berry-soft)] border border-[var(--accent-soft)] text-[var(--text-primary)] text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="group relative">
              <span className="field-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="cielo or yani"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="field w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none text-sm placeholder:text-[var(--text-muted)]/60"
              />
            </div>

            <div className="group relative">
              <span className="field-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none text-sm placeholder:text-[var(--text-muted)]/60"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-muted)] group transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[var(--bg-elevated)] border-[var(--border-color)] focus:ring-0 cursor-pointer transition-transform active:scale-90"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="group-hover:text-[var(--text-primary)] transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sheen btn-aurora btn-press relative w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl disabled:opacity-60 mt-3 flex items-center justify-center gap-2 overflow-hidden"
              style={{
                background: 'linear-gradient(120deg, var(--accent) 0%, var(--accent-hover) 55%, var(--berry) 130%)',
                boxShadow: '0 12px 28px -8px var(--accent-glow)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Let&apos;s go
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}