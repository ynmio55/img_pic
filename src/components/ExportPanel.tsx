import React, { useState } from 'react';
import { Film, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import type { EngineConfig } from '../engine/types';
import { exportToGif, recordToWebM, triggerDownload } from '../utils/export';

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: EngineConfig;
  onRenderFrameAtProgress: (progress: number) => void;
  onStartPlayback: () => void;
  onStopPlayback: () => void;
  disabled: boolean;
  onExportStateChange?: (isExporting: boolean) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  canvasRef,
  config,
  onRenderFrameAtProgress,
  onStartPlayback,
  onStopPlayback,
  disabled,
  onExportStateChange
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [sizeMode, setSizeMode] = useState<'compact' | 'hd'>('compact');

  const setExportStateSafe = (exporting: boolean) => {
    setIsExporting(exporting);
    if (onExportStateChange) onExportStateChange(exporting);
  };

  const handleExportGif = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExportStateSafe(true);
    setExportProgress(0);
    setExportStatus('Encoding GIF animation…');

    const isCompact = sizeMode === 'compact';
    const exportFps = isCompact ? 12 : 18;
    const dimension = isCompact ? 300 : 420;

    try {
      const dataUrl = await exportToGif(
        onRenderFrameAtProgress,
        canvas,
        {
          fps: exportFps,
          quality: isCompact ? 5 : 8,
          width: dimension,
          height: dimension,
          compactMode: isCompact
        },
        config,
        onStopPlayback,
        (percent) => setExportProgress(percent)
      );
      triggerDownload(dataUrl, `pixelmorph-${config.algorithm}-${Date.now()}.gif`);
      setExportStatus('GIF downloaded successfully!');
    } catch (err: any) {
      console.error('GIF export failed:', err);
      setExportStatus(`Error: ${err.message || err}`);
    } finally {
      setExportStateSafe(false);
    }
  };

  const handleExportWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExportStateSafe(true);
    setExportProgress(0);
    setExportStatus('Recording WebM video…');

    const isCompact = sizeMode === 'compact';
    const exportFps = isCompact ? 24 : 30;

    try {
      const blob = await recordToWebM(
        canvas,
        onStartPlayback,
        onStopPlayback,
        onRenderFrameAtProgress,
        config.duration,
        exportFps,
        isCompact,
        (percent) => setExportProgress(percent)
      );
      triggerDownload(blob, `pixelmorph-${config.algorithm}-${Date.now()}.webm`);
      setExportStatus('WebM video downloaded successfully!');
    } catch (err: any) {
      console.error('WebM export failed:', err);
      setExportStatus(`Error: ${err.message || err}`);
    } finally {
      setExportStateSafe(false);
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onRenderFrameAtProgress(1.0);
    const dataUrl = canvas.toDataURL('image/png');
    triggerDownload(dataUrl, `pixelmorph-target-${Date.now()}.png`);
    setExportStatus('PNG snapshot downloaded.');
  };

  return (
    <div className="export-toolbar-container bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2 text-xs">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export
          </span>

          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setSizeMode('compact')}
              disabled={isExporting}
              className={`px-2 py-0.5 rounded transition-colors ${
                sizeMode === 'compact'
                  ? 'bg-zinc-800 text-cyan-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setSizeMode('hd')}
              disabled={isExporting}
              className={`px-2 py-0.5 rounded transition-colors ${
                sizeMode === 'hd'
                  ? 'bg-zinc-800 text-cyan-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              HD
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportGif}
            disabled={disabled || isExporting}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 font-medium transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5 text-cyan-400" />}
            <span>GIF</span>
          </button>

          <button
            type="button"
            onClick={handleExportWebM}
            disabled={disabled || isExporting}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 font-medium transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5 text-amber-400" />}
            <span>WebM</span>
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={disabled || isExporting}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 font-medium transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>{exportStatus}</span>
            <span className="font-mono text-cyan-400">{exportProgress}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-cyan-400 h-full transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
