import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Sliders } from 'lucide-react';

interface CanvasRendererProps {
  activeAppMode: 'particle-morph' | 'obama-mosaic';
  onWebGlCanvasReady: (canvas: HTMLCanvasElement) => void;
  on2DCanvasReady: (canvas: HTMLCanvasElement) => void;
  width?: number;
  height?: number;
  hasParticles: boolean;
  isProcessing: boolean;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  activeAppMode,
  onWebGlCanvasReady,
  on2DCanvasReady,
  width = 760,
  height = 760,
  hasParticles,
  isProcessing
}) => {
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    if (webglCanvasRef.current) {
      webglCanvasRef.current.width = width * dpr;
      webglCanvasRef.current.height = height * dpr;
      onWebGlCanvasReady(webglCanvasRef.current);
    }
    if (canvas2dRef.current) {
      canvas2dRef.current.width = width * dpr;
      canvas2dRef.current.height = height * dpr;
      on2DCanvasReady(canvas2dRef.current);
    }
  }, [width, height, onWebGlCanvasReady, on2DCanvasReady]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="canvas-wrapper relative w-full h-full flex flex-col items-center justify-center bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden min-h-[520px]">
      {/* Top Canvas Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-zinc-900/80 backdrop-blur p-1 rounded-lg border border-zinc-800">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors text-xs flex items-center gap-1"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Empty State Overlay */}
      {!hasParticles && !isProcessing && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2 pointer-events-none">
          <Sliders className="w-10 h-10 stroke-1 text-zinc-600 mb-1" />
          <h4 className="text-sm font-semibold text-zinc-400">No Transformation Generated Yet</h4>
          <p className="text-xs max-w-sm text-zinc-500">
            {activeAppMode === 'obama-mosaic'
              ? 'Upload a Source image and click Generate to construct the Obama face mosaic.'
              : 'Upload Source and Target images, then click Generate to process particle matching.'}
          </p>
        </div>
      )}

      {/* WebGL Canvas for Particle Engine */}
      <canvas
        ref={webglCanvasRef}
        className="transformation-canvas object-contain max-w-full max-h-full"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: activeAppMode === 'particle-morph' ? 'block' : 'none'
        }}
      />

      {/* 2D Canvas for Obama Mosaic Engine */}
      <canvas
        ref={canvas2dRef}
        className="transformation-canvas object-contain max-w-full max-h-full"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: activeAppMode === 'obama-mosaic' ? 'block' : 'none'
        }}
      />
    </div>
  );
};
