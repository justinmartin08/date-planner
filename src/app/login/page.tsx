'use client';

import React, { useState } from 'react';
import { CoupleMark } from '@/components/ui/Motifs';
import { Lock, User } from 'lucide-react';

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
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid username or password.');
      }

      // Hard redirect to dashboard to clear SWR cache & enforce fresh session load
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0E14]">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-[#E8720C]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-[#2B7FD6]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#EDEFF3_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-sm bg-[#12161F]/90 border border-[#232936] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-[#232936] mb-4 shadow-sm">
            <CoupleMark className="w-6 h-6 text-[#EDEFF3]" />
          </div>
          <h1 className="text-xl font-semibold text-[#EDEFF3] tracking-tight">
            Our Space
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8A93A6] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5A6376] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0E14] border border-[#232936] text-[#EDEFF3] focus:outline-none focus:border-[#2B7FD6] focus:ring-1 focus:ring-[#2B7FD6] text-sm transition-colors placeholder:text-[#5A6376]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8A93A6] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5A6376] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0E14] border border-[#232936] text-[#EDEFF3] focus:outline-none focus:border-[#2B7FD6] focus:ring-1 focus:ring-[#2B7FD6] text-sm transition-colors placeholder:text-[#5A6376]"
              />
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#8A93A6] hover:text-[#EDEFF3] transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0B0E14] border-[#232936] text-[#2B7FD6] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2B7FD6]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-2 shadow-lg shadow-black/40"
            style={{ background: 'linear-gradient(90deg, #E8720C 0%, #2B7FD6 100%)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
