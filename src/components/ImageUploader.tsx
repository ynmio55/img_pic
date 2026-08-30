import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  activeAppMode?: 'particle-morph' | 'obama-mosaic';
  sourcePreviewUrl: string | null;
  targetPreviewUrl: string | null;
  sourceFileName?: string;
  targetFileName?: string;
  onSourceSelect: (file: File) => void;
  onTargetSelect: (file: File) => void;
  onClearSource: () => void;
  onClearTarget: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  activeAppMode = 'particle-morph',
  sourcePreviewUrl,
  targetPreviewUrl,
  sourceFileName,
  targetFileName,
  onSourceSelect,
  onTargetSelect,
  onClearSource,
  onClearTarget
}) => {
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'source' | 'target') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (type === 'source') onSourceSelect(file);
      else onTargetSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="upload-workflow-container flex flex-col md:flex-row items-stretch gap-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
      {/* Source Image Box */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            Source Image
          </span>
          {sourcePreviewUrl && <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 font-mono">Loaded</span>}
        </div>

        <div
          className={`relative flex-1 min-h-[140px] rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-950 hover:border-zinc-500 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-3 text-center ${
            sourcePreviewUrl ? 'border-solid border-zinc-800 bg-zinc-950' : ''
          }`}
          onDrop={(e) => handleDrop(e, 'source')}
          onDragOver={handleDragOver}
          onClick={() => sourceInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Upload Source Image"
        >
          <input
            ref={sourceInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onSourceSelect(e.target.files[0])}
          />

          {sourcePreviewUrl ? (
            <div className="relative w-full h-full group flex flex-col items-center justify-center">
              <img src={sourcePreviewUrl} alt="Source Preview" className="max-h-[110px] w-auto object-contain rounded" />
              {sourceFileName && (
                <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px] mt-1">
                  {sourceFileName}
                </span>
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sourceInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded border border-zinc-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSource();
                  }}
                  className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs rounded border border-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-zinc-400">
              <Upload className="w-5 h-5 text-zinc-500 mb-1" />
              <span className="text-xs font-semibold text-zinc-200">Drop Source Image</span>
              <span className="text-[11px] text-zinc-500">PNG, JPG, WebP</span>
            </div>
          )}
        </div>
      </div>

      {/* Target Image Box (Only in Particle Morph Mode) */}
      {activeAppMode === 'particle-morph' ? (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              Target Image
            </span>
            {targetPreviewUrl && <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-mono">Loaded</span>}
          </div>

          <div
            className={`relative flex-1 min-h-[140px] rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-950 hover:border-zinc-500 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-3 text-center ${
              targetPreviewUrl ? 'border-solid border-zinc-800 bg-zinc-950' : ''
            }`}
            onDrop={(e) => handleDrop(e, 'target')}
            onDragOver={handleDragOver}
            onClick={() => targetInputRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload Target Image"
          >
            <input
              ref={targetInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onTargetSelect(e.target.files[0])}
            />

            {targetPreviewUrl ? (
              <div className="relative w-full h-full group flex flex-col items-center justify-center">
                <img src={targetPreviewUrl} alt="Target Preview" className="max-h-[110px] w-auto object-contain rounded" />
                {targetFileName && (
                  <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px] mt-1">
                    {targetFileName}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      targetInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded border border-zinc-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearTarget();
                    }}
                    className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs rounded border border-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                <span className="text-xs font-semibold text-zinc-200">Drop Target Image</span>
                <span className="text-[11px] text-zinc-500">PNG, JPG, WebP</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <span>Obama Mosaic requires 1 Source Image.</span>
        </div>
      )}
    </div>
  );
};
