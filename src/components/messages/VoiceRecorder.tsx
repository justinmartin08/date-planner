'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react';

interface VoiceRecorderProps {
  onRecorded: (blob: Blob, durationSec: number) => void;
  recordedBlob: Blob | null;
  onClear: () => void;
}

export function VoiceRecorder({ onRecorded, recordedBlob, onClear }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecorded(blob, durationSec);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError('Microphone access was denied or is unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  if (recordedBlob) {
    const audioUrl = URL.createObjectURL(recordedBlob);
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--accent-soft)] border border-[var(--border-color)]">
        <button
          type="button"
          onClick={togglePlay}
          className="p-1.5 rounded-full bg-[var(--accent)] text-white shrink-0"
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
        <span className="text-xs text-[var(--text-primary)] flex-1">Voice message recorded</span>
        <button
          type="button"
          onClick={onClear}
          className="text-[var(--text-muted)] hover:text-rose-400 shrink-0"
          title="Discard recording"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors"
          >
            <Mic className="w-3.5 h-3.5" /> Record voice message
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
          >
            <Square className="w-3 h-3 fill-white" /> Stop · {formatTime(seconds)}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-400 mt-1.5">{error}</p>}
    </div>
  );
}
