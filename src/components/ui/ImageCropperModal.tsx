'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset controls on new image
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        setImageLoaded(true);
      };
    }
  }, [imageSrc]);

  // Draw crop preview on canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    // Center point
    ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate scale to cover canvas size
    const scale = Math.max(size / img.width, size / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }, [imageLoaded, pan.x, pan.y, rotation, zoom]);

  useEffect(() => {
    if (isOpen && imageLoaded) {
      drawPreview();
    }
  }, [isOpen, imageLoaded, drawPreview]);

  if (!isOpen || !imageSrc) return null;

  // Mouse & touch handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // Generate 512x512 output cropped base64
  const handleSaveCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const outputCanvas = document.createElement('canvas');
    const outSize = 512;
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    // High quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const previewSize = 300;
    const ratio = outSize / previewSize;

    ctx.translate(outSize / 2 + pan.x * ratio, outSize / 2 + pan.y * ratio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(outSize / img.width, outSize / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    const croppedBase64 = outputCanvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedBase64);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-modalEnter">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Crop &amp; Position Avatar
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Drag to position, use slider to zoom
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Crop Viewport */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="relative w-[300px] h-[300px] mx-auto rounded-full overflow-hidden border-2 border-[var(--accent)] shadow-2xl cursor-move bg-black/40 flex items-center justify-center select-none group"
        >
          <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

          {/* Guide Overlay */}
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none group-hover:border-white/40 transition-colors flex items-center justify-center">
            <Move className="w-6 h-6 text-white/30 group-hover:text-white/60 transition-opacity" />
          </div>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <ZoomIn className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span className="text-xs font-mono text-[var(--text-muted)] w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-[var(--accent)]/20"
              >
                <Check className="w-3.5 h-3.5" /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
