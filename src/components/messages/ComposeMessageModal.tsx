'use client';

import React, { useState } from 'react';
import { X, Send, Paperclip, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-xl my-8 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip-hover)] transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Write a letter to {partnerName}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            It stays saved in your private thread.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Subject (optional)
            </label>
            <input
              type="text"
              placeholder="Thinking of you today"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Your letter
            </label>
            <RichTextEditor html={html} onChange={setHtml} placeholder={`Write to ${partnerName}…`} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-chip)] hover:bg-[var(--bg-chip-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
              Attach a file
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-soft)] border border-[var(--border-color)] text-xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="flex-1 text-[var(--text-primary)] truncate">{f.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.url)}
                    className="text-[var(--text-muted)] hover:text-rose-400 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip-hover)] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
