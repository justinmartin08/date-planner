'use client';

import React from 'react';
import { MessageItem, UserSession } from '@/lib/types';
import { TigerIcon, ElectricSparkIcon } from '../ui/Motifs';
import { CheckCheck, Check, Clock, Paperclip, Mic, Download } from 'lucide-react';

interface MessageCardProps {
  message: MessageItem;
  currentUser: UserSession;
  onMarkRead?: (id: string) => Promise<void>;
}

// Very small allow-list sanitizer for the rich-text HTML we generate
// ourselves via execCommand (bold/italic/alignment/links only).
function sanitize(html: string): string {
  if (typeof window === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'DIV', 'BR', 'A', 'SPAN']);
  const walk = (node: Element) => {
    [...node.children].forEach((child) => {
      if (!allowedTags.has(child.tagName)) {
        const text = document.createTextNode(child.textContent || '');
        child.replaceWith(text);
        return;
      }
      [...child.attributes].forEach((attr) => {
        if (child.tagName === 'A' && attr.name === 'href') return;
        if (attr.name === 'style' && (child.tagName === 'DIV' || child.tagName === 'SPAN')) {
          // only allow text-align from execCommand's justify* output
          const align = /text-align:\s*(left|center|right)/.exec(attr.value);
          if (align) {
            child.setAttribute('style', `text-align:${align[1]}`);
            return;
          }
        }
        child.removeAttribute(attr.name);
      });
      walk(child);
    });
  };
  walk(div);
  return div.innerHTML;
}

export function MessageCard({ message, currentUser, onMarkRead }: MessageCardProps) {
  const isSender = message.senderId === currentUser.id;
  const senderIsTiger = message.sender.theme === 'tiger';

  const dateObj = new Date(message.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const readDateObj = message.readAt ? new Date(message.readAt) : null;
  const formattedReadTime = readDateObj
    ? readDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  const safeHtml = message.contentHtml && typeof window !== 'undefined'
    ? sanitize(message.contentHtml)
    : null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`relative w-full max-w-2xl rounded-2xl p-5 sm:p-6 border transition-colors duration-200 ${
        isSender
          ? 'ml-auto bg-[var(--bg-card)] border-[var(--border-color)]'
          : 'mr-auto bg-[var(--bg-card-hover)] border-[var(--border-glow)]/40'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center border ${
              senderIsTiger ? 'bg-[#E8720C]/15 border-[#E8720C]/30 text-[#E8720C]' : 'bg-[#2B7FD6]/15 border-[#2B7FD6]/30 text-[#2B7FD6]'
            }`}
          >
            {senderIsTiger ? <TigerIcon className="w-3.5 h-3.5" /> : <ElectricSparkIcon className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
              {message.sender.displayName}
              {isSender && <span className="text-xs font-normal text-[var(--text-muted)]">(You)</span>}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formattedDate} at {formattedTime}
            </div>
          </div>
        </div>
      </div>

      {message.title && (
        <h4 className="text-base font-semibold text-[var(--accent)] mb-2.5">
          {message.title}
        </h4>
      )}

      {safeHtml ? (
        <div
          className="text-sm leading-relaxed text-[var(--text-primary)]/90 [&_a]:text-[var(--accent)] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]/90">
          {message.content}
        </div>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {message.attachments.map((a) =>
            a.kind === 'voice' ? (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-full bg-[var(--accent)] text-white shrink-0">
                  <Mic className="w-3 h-3" />
                </div>
                <audio controls src={a.url} className="flex-1 h-8" />
                {a.duration != null && (
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                    {Math.floor(a.duration / 60)}:{String(a.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            ) : (
              <a
                key={a.id}
                href={a.url}
                download={a.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{a.fileName}</span>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0">{formatSize(a.size)}</span>
                <Download className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              </a>
            )
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end text-xs text-[var(--text-muted)] gap-1.5">
        {isSender ? (
          message.isRead ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCheck className="w-4 h-4" /> Read {formattedReadTime ? `at ${formattedReadTime}` : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-70">
              <Check className="w-4 h-4" /> Sent
            </span>
          )
        ) : (
          !message.isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(message.id)}
              className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white font-medium text-[11px] hover:opacity-90 transition-opacity"
            >
              Mark as read
            </button>
          )
        )}
      </div>
    </div>
  );
}
