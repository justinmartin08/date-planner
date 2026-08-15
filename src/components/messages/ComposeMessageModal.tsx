'use client';

import React, { useState } from 'react';
import { X, Send, Paperclip, Loader2, Sparkles, Mail } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { VoiceRecorder } from './VoiceRecorder';
import { AttachmentItem } from '@/lib/types';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: {
    title?: string;
    content: string;
    contentHtml?: string;
    attachments?: Omit<AttachmentItem, 'id'>[];
  }) => Promise<void>;
  partnerName: string;
}

export function ComposeMessageModal({
  isOpen,
  onClose,
  onSend,
  partnerName,
}: ComposeMessageModalProps) {
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [pendingFiles, setPendingFiles] = useState<Omit<AttachmentItem, 'id'>[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const plainText = (h: string) => {
    if (typeof document === 'undefined') return h;
    const div = document.createElement('div');
    div.innerHTML = h;
    return div.textContent || div.innerText || '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'file');
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setPendingFiles((prev) => [
        ...prev,
        { kind: 'file', url: data.url, fileName: data.fileName, mimeType: data.mimeType, size: data.size },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (url: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.url !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = plainText(html).trim();
    if (!text && pendingFiles.length === 0 && !voiceBlob) {
      setError('Write something, or attach a file or voice message.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const attachments = [...pendingFiles];

      if (voiceBlob) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', voiceBlob, 'voice-message.webm');
        formData.append('kind', 'voice');
        const res = await fetch('/api/uploads', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Voice upload failed.');
        attachments.push({
          kind: 'voice',
          url: data.url,
          fileName: data.fileName,
          mimeType: data.mimeType,
          size: data.size,
          duration: voiceDuration,
        });
        setUploading(false);
      }

      await onSend({
        title: title.trim() || undefined,
        content: text || '(sent an attachment)',
        contentHtml: html || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setTitle('');
      setHtml('');
      setPendingFiles([]);
      setVoiceBlob(null);
      setVoiceDuration(0);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send letter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop-anim bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-[var(--bg-card)] border-t sm:border border-[var(--border-color)] w-full sm:max-w-xl rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl mobile-sheet-anim overflow-hidden">
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[var(--border-color)] opacity-70" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Write a letter to {partnerName}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Private words, audio notes, and love letters
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

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Subject (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Thinking of you today, Random thoughts..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Your Letter
            </label>
            <RichTextEditor html={html} onChange={setHtml} placeholder={`Write to ${partnerName}…`} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer border border-[var(--border-color)]">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
              <span>Attach a file</span>
              <input type="file" onChange={handleFileSelect} className="hidden" disabled={uploading} />
            </label>

            <VoiceRecorder
              recordedBlob={voiceBlob}
              onRecorded={(blob, duration) => {
                setVoiceBlob(blob);
                setVoiceDuration(duration);
              }}
              onClear={() => {
                setVoiceBlob(null);
                setVoiceDuration(0);
              }}
            />
          </div>

          {pendingFiles.length > 0 && (
            <div className="space-y-1.5">
              {pendingFiles.map((f) => (
                <div
                  key={f.url}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-color)] text-xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="flex-1 text-[var(--text-primary)] truncate font-medium">{f.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.url)}
                    className="text-[var(--text-muted)] hover:text-rose-500 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 8px 20px -6px var(--accent-glow)',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending…' : `Send to ${partnerName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
