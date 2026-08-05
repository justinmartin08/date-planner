'use client';

import React, { useState, useRef } from 'react';
import { UserSession } from '@/lib/types';
import { TigerIcon, ElectricSparkIcon } from '../ui/Motifs';
import { ImageCropperModal } from '../ui/ImageCropperModal';
import { X, Upload, User, Lock, Check, Loader2, Camera } from 'lucide-react';

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isTiger = user.theme === 'tiger';

  // Avatar cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

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
          setCropperImageSrc(reader.result as string);
        }
        setCropperOpen(true);
      };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[var(--badge-bg)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : isTiger ? (
              <TigerIcon className="w-6 h-6 text-[#E8720C]" />
            ) : (
              <ElectricSparkIcon className="w-6 h-6 text-[#2B7FD6]" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Profile &amp; Settings
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Manage your account and credentials
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] mb-5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile &amp; Avatar
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Security &amp; Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-5">
            {/* Avatar Upload Section */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                Custom Avatar
              </label>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 border border-[var(--border-color)] flex items-center justify-center shrink-0 relative group">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : isTiger ? (
                    <TigerIcon className="w-7 h-7 text-[#E8720C]" />
                  ) : (
                    <ElectricSparkIcon className="w-7 h-7 text-[#2B7FD6]" />
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
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" /> Upload Image
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
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-xs font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {passwordSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
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
