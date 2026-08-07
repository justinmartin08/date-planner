'use client';

import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import {
  PokeballEmblem,
  StrawberryEmblem,
  EmberIcon,
  TigerClawMark,
  Sparkle,
} from '@/components/ui/Motifs';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <main className="login-combined min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Shared ambient backdrop — Cielo's sky + berry, Yani's ember + tiger */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 85% -10%, rgba(125,172,255,0.30) 0%, transparent 55%), radial-gradient(90% 70% at 0% 110%, rgba(251,61,109,0.10) 0%, transparent 50%), linear-gradient(160deg, #eef4ff 0%, #e9f1ff 45%, #fff3e4 100%)',
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40 [filter:blur(100px)]" style={{ background: 'rgba(125,172,255,0.35)' }} />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-35 [filter:blur(100px)]" style={{ background: 'rgba(255,140,60,0.28)' }} />
        <div className="absolute inset-0 bg-dotgrid opacity-[0.5]" style={{ WebkitMaskImage: 'radial-gradient(80% 60% at 50% 0%, black 30%, transparent 75%)' }} />
        {/* Cielo motifs */}
        <StrawberryEmblem className="absolute top-[16%] right-[9%] w-8 h-8 opacity-90 ambient-float" />
        <PokeballEmblem className="absolute top-[26%] left-[6%] w-9 h-9 opacity-50 ambient-drift" />
        <Sparkle className="absolute top-[38%] right-[22%] w-3 h-3 text-[#ffc53d] ambient-float" />
        <Sparkle className="absolute bottom-[20%] left-[18%] w-2.5 h-2.5 text-[#fb3d6d] ambient-drift" />
        {/* Yani motifs */}
        <EmberIcon className="absolute top-[18%] left-[26%] w-6 h-6 text-[#ff7a00]/80 ambient-float" />
        <EmberIcon className="absolute bottom-[26%] right-[16%] w-7 h-7 text-[#e76a00]/70 ambient-drift" />
        <TigerClawMark className="absolute bottom-[14%] left-[8%] w-10 h-10 text-[#ff7a00]/15 ambient-drift" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login card */}
        <div className="glass rounded-3xl p-7 sm:p-8 animate-scaleUp">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Welcome{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--accent), var(--berry-solid))' }}
              >
                back
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1.5">Sign in to see your dates and letters.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[var(--berry-soft)] border border-[var(--accent-soft)] text-[var(--text)] text-xs font-medium text-center animate-shake">
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
                className="field w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text)] focus:outline-none text-sm placeholder:text-[var(--text-muted)]/60"
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
                className="field w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text)] focus:outline-none text-sm placeholder:text-[var(--text-muted)]/60"
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
                <span className="group-hover:text-[var(--text)] transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sheen btn-aurora btn-press relative w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl disabled:opacity-60 mt-3 flex items-center justify-center gap-2 overflow-hidden"
              style={{
                background: 'linear-gradient(120deg, #2563eb 0%, #d946ef 55%, #fb3d6d 100%)',
                boxShadow: '0 12px 28px -8px rgba(99, 102, 241, 0.4)',
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