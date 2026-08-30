import React from 'react';
import { Images, RotateCcw, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeAppMode: 'particle-morph' | 'obama-mosaic';
  onSwitchMode: (mode: 'particle-morph' | 'obama-mosaic') => void;
  onOpenGallery: () => void;
  onReset: () => void;
  isProcessing: boolean;
  activeRenderMode: 'webgl' | 'canvas2d';
  fps: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeAppMode,
  onSwitchMode,
  onOpenGallery,
  onReset,
  isProcessing,
  activeRenderMode,
  fps
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="brand-title">PixelMorph</span>
          <span className="engine-badge uppercase">{activeRenderMode}</span>
          <span className="fps-badge font-mono">{fps} FPS</span>
        </div>

        {/* Dedicated Mode Switcher Tabs */}
        <div className="app-mode-selector">
          <button
            type="button"
            onClick={() => onSwitchMode('particle-morph')}
            className={`mode-tab-btn ${activeAppMode === 'particle-morph' ? 'active-particle' : ''}`}
            aria-label="Particle Morphing Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Particle Morph</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('obama-mosaic')}
            className={`mode-tab-btn ${activeAppMode === 'obama-mosaic' ? 'active-obama' : ''}`}
            aria-label="Obama Face Mosaic Mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Obama Mosaic</span>
          </button>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          onClick={onOpenGallery}
          disabled={isProcessing}
          className="btn btn-secondary text-xs flex items-center gap-1.5"
          aria-label="Preset Library"
        >
          <Images className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isProcessing}
          className="btn btn-secondary text-xs flex items-center gap-1.5"
          aria-label="Reset Workspace"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
