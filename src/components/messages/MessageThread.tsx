'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { MessageItem, UserSession, AttachmentItem } from '@/lib/types';
import { MessageCard } from './MessageCard';
import { ComposeMessageModal } from './ComposeMessageModal';
import { Mail, Plus, MailOpen } from 'lucide-react';
import { TigerIcon, ElectricSparkIcon } from '@/components/ui/Motifs';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LetterThread({ currentUser }: { currentUser: UserSession }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const partnerName = currentUser.username === 'cielo' ? 'Yani' : 'Cielo';

  const { data, mutate } = useSWR<{ messages: MessageItem[]; unreadCount: number }>(
    '/api/messages',
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  const messages = data?.messages || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    if (messages.length > 0) {
      const unreadReceived = messages.filter(
        (m) => m.recipientId === currentUser.id && !m.isRead
      );
      if (unreadReceived.length > 0) {
        unreadReceived.forEach(async (m) => {
          try {
            await fetch(`/api/messages/${m.id}/read`, { method: 'POST' });
          } catch (err) {
            console.error('Failed to mark read:', err);
          }
        });
        mutate();
      }
    }
  }, [messages, currentUser.id, mutate]);

  const handleSendMessage = async (msgData: {
    title?: string;
    content: string;
    contentHtml?: string;
    attachments?: Omit<AttachmentItem, 'id'>[];
  }) => {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    });
    mutate();
  };

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/messages/${id}/read`, { method: 'POST' });
    mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--accent)]" />
            Letters
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Private letters between {currentUser.displayName} and {partnerName}.
          </p>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Write a Letter
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="p-3.5 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm flex items-center gap-3">
          <MailOpen className="w-4 h-4 text-[var(--accent)]" />
          <span>{unreadCount} new letter{unreadCount > 1 ? 's' : ''} from {partnerName}</span>
        </div>
      )}

      {messages.length > 0 ? (
        <div className="space-y-5 pt-1">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)]/50 border border-dashed border-[var(--border-color)] rounded-2xl">
          <div className="p-3 rounded-full bg-[var(--badge-bg)] text-[var(--accent)] mb-3">
            {currentUser.theme === 'tiger' ? (
              <TigerIcon className="w-6 h-6 text-[#E8720C]" />
            ) : (
              <ElectricSparkIcon className="w-6 h-6 text-[#2B7FD6]" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            No letters yet
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">
            Write your first letter to {partnerName}.
          </p>
          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium"
          >
            Write a Letter
          </button>
        </div>
      )}

      <ComposeMessageModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendMessage}
        partnerName={partnerName}
      />
    </div>
  );
}
