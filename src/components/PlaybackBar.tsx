import React from 'react';

interface PlaybackBarProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  durationSec: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onSeek: (progress: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  disabled: boolean;
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
  const currentSec = (progress * durationSec).toFixed(1);
  const totalSec = durationSec.toFixed(1);

  return (
    <div className="playback-bar">
      <div className="playback-buttons">
        <button
          onClick={onPlayPause}
          disabled={disabled}
          className="btn-playback"
          aria-label={isPlaying ? 'หยุดชั่วคราว' : 'เล่น'}
        >
          {isPlaying ? 'หยุดชั่วคราว' : 'เล่น'}
        </button>

        <button
          onClick={onRestart}
          disabled={disabled}
          className="btn-playback"
          aria-label="เริ่มแอนิเมชันใหม่"
        >
          เริ่มใหม่
        </button>

        <button
          onClick={onToggleLoop}
          disabled={disabled}
          className={`btn-playback ${isLooping ? 'active' : ''}`}
          aria-label="สลับการเล่นวนซ้ำ"
        >
          เล่นวนซ้ำ
        </button>
      </div>

      <div className="timeline-wrapper">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          disabled={disabled}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="timeline-slider"
          aria-label="แถบความคืบหน้าแอนิเมชัน"
        />
      </div>

      <div className="timestamp font-mono">
        0:0{currentSec} / 0:0{totalSec}
      </div>
    </div>
  );
};
