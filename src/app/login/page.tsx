'use client';

import React, { useState } from 'react';
import { PokeballEmblem, StrawberryEmblem, TigerPawEmblem, TigerClawMark } from '@/components/ui/Motifs';
import { Lock, User, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<'cielo' | 'yani' | null>(null);

  const handleSelectUser = (name: 'cielo' | 'yani') => {
    setSelectedUser(name);
    setUsername(name);
    setError('');
  };

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
        body: JSON.stringify({ username, password, rememberMe }),
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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#06080F]">
      {/* Background Dual Aura Battle Arena */}
      {/* Left Aura: Cielo (Electric Blue + Strawberry Glow) */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#2563EB]/15 rounded-full blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute top-10 left-10 opacity-15 text-[#2563EB]">
        <PokeballEmblem className="w-48 h-48 animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-20 opacity-20">
        <StrawberryEmblem className="w-24 h-24" />
      </div>

      {/* Right Aura: Yani (Tiger Orange + Claw Mark Glow) */}
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#FF5500]/15 rounded-full blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-10 right-10 opacity-15 text-[#FF5500]">
        <TigerPawEmblem className="w-44 h-44" />
      </div>
      <div className="pointer-events-none absolute top-20 right-20 opacity-20 text-[#FF5500]">
        <TigerClawMark className="w-32 h-32 transform rotate-45" />
      </div>

      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Central Unified Glassmorphic Card */}
      <div className="w-full max-w-md bg-[#0F1420]/90 border border-white/15 rounded-3xl p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative z-10">
        {/* Top Header Badges */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectUser('cielo')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedUser === 'cielo' || username.toLowerCase() === 'cielo'
                  ? 'bg-[#2563EB]/25 border-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-[#2563EB]/50'
              }`}
            >
              <PokeballEmblem className="w-4 h-4 text-[#2563EB]" />
              <span>Cielo</span>
              <StrawberryEmblem className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectUser('yani')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedUser === 'yani' || username.toLowerCase() === 'yani'
                  ? 'bg-[#FF5500]/25 border-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)] scale-105'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-[#FF5500]/50'
              }`}
            >
              <TigerPawEmblem className="w-4 h-4 text-[#FF5500]" />
              <span>Yani</span>
              <TigerClawMark className="w-3.5 h-3.5 text-[#FF5500]" />
            </button>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-amber-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your dates and letters
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="cielo or yani"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setSelectedUser(null);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#06080F]/90 border border-white/15 text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#06080F]/90 border border-white/15 text-white focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] text-sm transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#06080F] border-white/20 text-[#2563EB] focus:ring-0 cursor-pointer accent-[#2563EB]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-3"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #FF5500 100%)',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
