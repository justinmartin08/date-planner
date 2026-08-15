'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { StrawberryEmblem, TigerPawEmblem } from '@/components/ui/Motifs';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UX states
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Detect Caps Lock on keydown / keyup
  const handleKeyActivity = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !displayName.trim()) {
      setError('Please enter your display name.');
      triggerShake();
      return;
    }

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password,
            rememberMe,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid username or password.');
        }
      } else {
        // Register mode
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: displayName.trim(),
            username: username.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed. Please try again.');
        }
      }

      // Smooth redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check credentials.');
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Dual-Tone Drifting Aurora Glow Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft radial background mesh */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(110% 90% at 85% 0%, rgba(37,99,235,0.22) 0%, transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(251,61,109,0.18) 0%, transparent 55%), radial-gradient(70% 60% at 50% 50%, rgba(255,122,0,0.12) 0%, transparent 50%), #070b14',
          }}
        />

        {/* Drifting Sky-Blue Aurora Orb (Cielo) */}
        <div
          className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full opacity-35 [filter:blur(110px)] animate-pulse"
          style={{ background: '#38bdf8', animationDuration: '8s' }}
        />

        {/* Drifting Ember / Berry Aurora Orb (Yani) */}
        <div
          className="absolute -bottom-32 -right-20 w-[30rem] h-[30rem] rounded-full opacity-30 [filter:blur(120px)] animate-pulse"
          style={{ background: '#ff7a00', animationDuration: '10s' }}
        />

        {/* Fine Dot Grid */}
        <div
          className="absolute inset-0 bg-dotgrid opacity-25"
          style={{
            WebkitMaskImage: 'radial-gradient(75% 65% at 50% 50%, black 35%, transparent 80%)',
          }}
        />
      </div>

      {/* Minimalist Floating Glass Capsule */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-300 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <div
          className="rounded-[32px] p-7 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.55)] border transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(56, 189, 248, 0.15)',
          }}
        >
          {/* Top subtle rim glow */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), rgba(251, 61, 109, 0.4), rgba(255, 122, 0, 0.4), transparent)',
            }}
          />

          {/* Dual Motif Crest & Header */}
          <div className="text-center mb-6">
            {/* Crest Emblem */}
            <div className="inline-flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-white/5 border border-white/10 mb-3 shadow-inner">
              <StrawberryEmblem className="w-6 h-6" />
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <TigerPawEmblem className="w-5 h-5 text-amber-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {mode === 'login'
                ? 'Sign in to access your dates, wishlist, and letters'
                : 'Join our private couple sanctuary'}
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="relative flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <span
              className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: mode === 'login' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
                background:
                  mode === 'login'
                    ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                    : 'linear-gradient(135deg, #e11d48, #f43f5e)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors z-10 cursor-pointer ${
                mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors z-10 cursor-pointer ${
                mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Only in Register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-300">
                  Display Name
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cielo, Yani"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="cielo or yani"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {capsLockActive && (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    Caps Lock is ON
                  </span>
                )}
              </div>

              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyActivity}
                  onKeyUp={handleKeyActivity}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle (Login mode only) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            )}

            {/* Submit Aurora Gradient Button */}
            <button
              type="submit"
              disabled={loading}
              className="sheen relative w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2 overflow-hidden cursor-pointer transition-transform active:scale-[0.98]"
              style={{
                background:
                  'linear-gradient(135deg, #2563eb 0%, #d946ef 50%, #ff7a00 100%)',
                boxShadow: '0 12px 30px -8px rgba(37, 99, 235, 0.45)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Our Space</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}