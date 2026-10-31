"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CanvasSegment {
  id: string;
  sourceText: string;
  targetText: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  confidence?: number;
  coordinateNotice?: string;
}

export interface DocumentInspectionCanvasProps {
  specimenImagePath?: string;
  segments: CanvasSegment[];
  activeSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  documentName?: string;
}

export function DocumentInspectionCanvas({
  specimenImagePath = "/images/docs/birth-certificate.jpg",
  segments,
  activeSegmentIndex,
  onSelectSegment,
  documentName = "Source Instrument",
}: DocumentInspectionCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState<boolean>(false);
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeSegment = segments[activeSegmentIndex];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsPanning(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs flex flex-col h-full min-h-[520px]">
      <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 flex flex-col h-full overflow-hidden relative">
        {/* Top Canvas Bar */}
        <div className="px-4 py-3 bg-surface border-b border-border flex items-center justify-between gap-3 text-xs font-mono text-text-subtle">
          <div className="flex items-center gap-2 min-w-0">
            <Crosshair className="w-4 h-4 text-signal-accent shrink-0" />
            <span className="font-semibold text-brand-ink truncate">{documentName}</span>
            <span className="text-[10px] text-text-subtle bg-surface-raised px-2 py-0.5 rounded border border-border">
              300 DPI Spatial OCR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-ink">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Viewport Stage */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`flex-1 relative overflow-hidden bg-canvas-subtle/50 select-none ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ touchAction: "none" }}
        >
          {/* Centered Transform Layer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isPanning ? "none" : "transform 150ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* Document Specimen Sheet */}
            <div className="relative w-[480px] h-[640px] bg-white rounded-lg shadow-xl border border-border/80 overflow-hidden pointer-events-auto">
              {/* Raster / Specimen Background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={specimenImagePath}
                alt="Source Instrument"
                className="w-full h-full object-cover select-none pointer-events-none opacity-90"
                draggable={false}
              />

              {/* OCR Bounding Boxes */}
              {segments.map((seg, idx) => {
                if (!seg.boundingBox) return null;
                const isSelected = activeSegmentIndex === idx;
                const { x, y, width, height } = seg.boundingBox;

                return (
                  <div
                    key={seg.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSegment(idx);
                    }}
                    className={cn(
                      "absolute rounded-xs cursor-pointer transition-all pointer-events-auto",
                      isSelected
                        ? "border-2 border-signal-accent bg-signal-accent/20 ring-2 ring-signal-accent/30 shadow-xs z-30"
                        : "border border-amber-statutory/60 bg-amber-statutory/10 hover:border-amber-statutory hover:bg-amber-statutory/20 z-10"
                    )}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                    title={`Segment 0${idx + 1}: ${seg.sourceText}`}
                  >
                    <span
                      className={cn(
                        "absolute -top-3.5 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold leading-none select-none",
                        isSelected
                          ? "bg-brand-ink text-white"
                          : "bg-surface-raised border border-border text-text-subtle"
                      )}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coordinate Readout HUD */}
          {activeSegment?.coordinateNotice && (
            <div className="absolute top-3 left-3 z-30 bg-surface-raised/95 backdrop-blur px-3 py-1.5 rounded-xl border border-border text-[11px] font-mono text-text-subtle shadow-xs flex items-center gap-1.5 pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-signal-accent" />
              <span>{activeSegment.coordinateNotice}</span>
            </div>
          )}

          {/* Floating Zoom Toolbar */}
          <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-surface-raised/95 backdrop-blur p-1 rounded-xl border border-border shadow-md">
            <button
              onClick={handleZoomOut}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface text-brand-ink transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface text-brand-ink font-mono text-xs font-semibold transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
              title="Reset 100%"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface text-brand-ink transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
