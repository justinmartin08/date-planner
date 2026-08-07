'use client';

import React, { useState, useEffect } from 'react';
import { User, LogIn, Heart } from 'lucide-react';
import { ThemePatternBg, StrawberryEmblem, TigerPawEmblem, CoupleMark } from '@/components/ui/Motifs';
import type { UserTheme } from '@/lib/types';

type Identity = { handle: string; theme: UserTheme };

const IDENTITIES: Identity[] = [
  { handle: 'cielo', theme: 'pokemon' },
  { handle: 'yani', theme: 'tiger' },
];

export default function LoginPage() {
  const [identity, setIdentity] = useState<Identity>(IDENTITIES[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const active = identity;
  const isTiger = active.theme === 'tiger';

  // The login is pre-auth, so we let the user "wear" their theme while signing in.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', active.theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [active.theme]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username.trim() || identity.handle;
    if (!finalUsername || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: finalUsername, password, rememberMe }),
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

  const pick = (id: Identity) => {
    setIdentity(id);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)]">
      <ThemePatternBg theme={active.theme} />

      {/* Foreground motil glow with theme swap */}
      <div className="relative z-10 w-full max-w-md theme-swap" key={active.theme}>
        <div className="text-center mb-7">
          {/* Crown + name */}
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shadow-[var(--shadow-soft)]">
              <CoupleMark className="w-6 h-6" />
            </span>
            <div className="text-left leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                Cielo <span className="text-[var(--text-muted)] font-medium">&amp;</span> Yani
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">who&apos;s asking?</div>
            </div>
          </div>

          {/* Identity selection */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {IDENTITIES.map((id) => {
              const selected = active.handle === id.handle;
              const activeMode = selected;
              return (
                <button
                  key={id.handle}
                  type="button"
                  onClick={() => pick(id)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                    activeMode
                      ? 'border-[var(--accent)] shadow-[var(--shadow-soft)]'
                      : 'border-[var(--border-color)] hover:border-[var(--accent-soft)]'
                  }`}
                  style={{
                    background: activeMode ? 'var(--accent-soft)' : 'var(--bg-card)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        activeMode ? 'text-white' : 'text-[var(--accent)] bg-[var(--badge-bg)]'
                      }`}
                      style={{ background: activeMode ? 'var(--accent)' : undefined }}
                    >
                      {id.handle === 'cielo' ? (
                        <StrawberryEmblem className="w-5.5 h-5.5" />
                      ) : (
                        <TigerPawEmblem className="w-5 h-5" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">{id.handle}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {id.handle === 'cielo' ? '⚡ hopes & berries' : '🌅 ember & stripes'}
                      </div>
                    </div>
                  </div>
                  {activeMode && (
                    <div
                      className="absolute inset-x-0 bottom-0 h-[3px] animate-fadeIn"
                      style={{ background: 'linear-gradient(90deg, var(--accent), var(--berry))' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login card */}
        <div className="glass rounded-3xl p-7 sm:p-8 animate-scaleUp">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Welcome<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--accent), var(--berry))' }}> back</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-6">
            Your dates and letters missed you, {identity.handle}.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[var(--berry-soft)] border border-[var(--accent-soft)] text-[var(--text-primary)] text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder={identity.handle}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-sm transition-all placeholder:text-[var(--text-muted)]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
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
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-sm transition-all placeholder:text-[var(--text-muted)]/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-muted)] group transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[var(--bg-elevated)] border-[var(--border-color)] focus:ring-0 cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="group-hover:text-[var(--text-primary)] transition-colors">Remember me</span>
              </label>
              <span className="text-[11px] text-[var(--text-muted)] italic">only for us two</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sheen relative w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mt-3 flex items-center justify-center gap-2 overflow-hidden"
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
                  {isTiger ? 'Roar before you enter' : 'Let&apos;s go'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--text-muted)] mt-6 flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5" />
          a private place for two — nothing is public here
        </p>
      </div>
    </main>
  );
}