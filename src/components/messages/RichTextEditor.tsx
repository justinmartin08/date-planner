'use client';

import React, { useRef, useEffect } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link2 } from 'lucide-react';

interface RichTextEditorProps {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-chip-hover)] transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Minimal contentEditable-based rich text editor: bold, italic, alignment,
 * and link insertion via document.execCommand. Intentionally lightweight —
 * no external editor dependency for a two-person private site.
 */
export function RichTextEditor({ html, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Only sync external `html` into the DOM when it changes from outside
  // (e.g. reset after send) — never on every keystroke, or the cursor jumps.
  const lastEmittedRef = useRef<string>(html);
  useEffect(() => {
    if (editorRef.current && html !== lastEmittedRef.current) {
      editorRef.current.innerHTML = html;
      lastEmittedRef.current = html;
    }
  }, [html]);

  const emit = () => {
    if (editorRef.current) {
      const next = editorRef.current.innerHTML;
      lastEmittedRef.current = next;
      onChange(next);
    }
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    emit();
  };

  const handleLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border-color)] bg-white/[0.02]">
        <ToolbarButton onClick={() => exec('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Align left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Align center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyRight')} title="Align right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
        <ToolbarButton onClick={handleLink} title="Insert link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="min-h-[140px] px-3.5 py-3 text-sm text-[var(--text-primary)] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--text-muted)]/50"
      />
    </div>
  );
}
