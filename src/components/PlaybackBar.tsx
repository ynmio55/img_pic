import React from 'react';
import { Play, Pause, RotateCcw, Repeat } from 'lucide-react';

interface PlaybackBarProps {
  isPlaying: boolean;
  progress: number;
  durationSec: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onSeek: (progress: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  disabled: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toFixed(1).padStart(4, '0');
  return `${minsStr}:${secsStr}`;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  isPlaying,
  progress,
  durationSec,
  onPlayPause,
  onRestart,
  onSeek,
  isLooping,
  onToggleLoop,
  disabled
}) => {
  const currentTime = progress * durationSec;

  return (
    <div className="playback-bar flex items-center justify-between gap-4 px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPlayPause}
          disabled={disabled}
          className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onRestart}
          disabled={disabled}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="Restart"
          aria-label="Restart Animation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleLoop}
          disabled={disabled}
          className={`p-2 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none ${
            isLooping
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
          }`}
          title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
          aria-label={isLooping ? 'Disable Loop' : 'Enable Loop'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline Slider */}
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-400 bg-zinc-800 h-2 rounded-lg cursor-pointer disabled:opacity-30"
          aria-label="Timeline Seek Progress"
        />
        <span className="font-mono text-xs text-zinc-400 whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(durationSec)}
        </span>
      </div>
    </div>
  );
};
