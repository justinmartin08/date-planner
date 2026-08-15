'use client';

import React, { useState, useRef } from 'react';
import { UserSession } from '@/lib/types';
import { TigerIcon, StrawberryEmblem } from '../ui/Motifs';
import { ImageCropperModal } from '../ui/ImageCropperModal';
import { X, User, Lock, Check, Loader2, Camera, Settings } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession;
  onUserUpdate: (updatedUser: UserSession) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile state
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Avatar cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isTiger = user.theme === 'tiger';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rawData = reader.result as string;
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1200;
            let width = img.width || 800;
            let height = img.height || 800;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              setCropperImageSrc(canvas.toDataURL('image/jpeg', 0.9));
            } else {
              setCropperImageSrc(rawData);
            }
          } catch {
            setCropperImageSrc(rawData);
          }
          setCropperOpen(true);
        };
        img.onerror = () => {
          setCropperImageSrc(rawData);
          setCropperOpen(true);
        };
        img.src = rawData;
      } catch {
        setProfileError('Failed to read image file.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCroppedAvatarUpload = async (croppedBase64: string) => {
    setUploading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarBase64: croppedBase64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload avatar.');
      }

      setAvatarUrl(data.avatarUrl);
      onUserUpdate(data.user);
      setProfileSuccess('Avatar cropped & updated successfully!');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      onUserUpdate(data.user);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop-anim bg-black/70 backdrop-blur-sm sm:p-4">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-[var(--bg-card)] border-t sm:border border-[var(--border-color)] w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl mobile-sheet-anim overflow-hidden">
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[var(--border-color)] opacity-70" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[var(--badge-bg)] border border-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : isTiger ? (
                <TigerIcon className="w-6 h-6 text-[var(--accent)]" />
              ) : (
                <StrawberryEmblem className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Profile &amp; Settings
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {user.displayName} (@{user.username})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] px-6 pt-3 bg-[var(--bg-card)] shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile &amp; Avatar
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Security &amp; Password
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'profile' ? (
            <div className="space-y-5">
              {/* Avatar Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
                  Custom Avatar
                </label>
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--bg-chip)] border border-[var(--border-color)] flex items-center justify-center shrink-0 relative shadow-sm">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : isTiger ? (
                      <TigerIcon className="w-7 h-7 text-[var(--accent)]" />
                    ) : (
                      <StrawberryEmblem className="w-7 h-7" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" /> Choose Photo
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                      JPG, PNG, GIF, or WEBP up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {profileError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 pb-safe">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all transform active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 pb-safe">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all transform active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {passwordSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Avatar Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCroppedAvatarUpload}
      />
    </div>
  );
}
