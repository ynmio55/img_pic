import React from 'react';
import type { EngineConfig, MorphAlgorithm, EasingType } from '../engine/types';

interface ControlPanelProps {
  config: EngineConfig;
  onChange: (newConfig: Partial<EngineConfig>) => void;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChange,
  disabled
}) => {
  const algorithms: { value: MorphAlgorithm; label: string }[] = [
    { value: 'pixel-morph', label: 'พิกเซลมอร์ฟ (Pixel Morph)' },
    { value: 'genetic-swap', label: 'สลับพันธุกรรม (Genetic Swap)' },
    { value: 'particle-morph', label: 'อนุภาคมอร์ฟ (Particle Morph)' },
    { value: 'nearest-color', label: 'แมตช์สีใกล้เคียง (Nearest Color)' },
    { value: 'nearest-position', label: 'แมตช์ตำแหน่งใกล้เคียง (Nearest Position)' },
    { value: 'random-chaos', label: 'วงโคจรโกลาหล (Random Chaos)' },
    { value: 'smooth-flow', label: 'การไหลแบบเวกเตอร์ (Smooth Flow)' }
  ];

  const resolutions = [128, 256, 384, 512];

  const easings: { value: EasingType; label: string }[] = [
    { value: 'cubic-in-out', label: 'Cubic Ease In-Out' },
    { value: 'linear', label: 'เส้นตรง (Linear)' },
    { value: 'quad-in-out', label: 'Quad Smooth' },
    { value: 'exponential', label: 'Exponential Burst' },
    { value: 'elastic', label: 'Elastic Overshoot' },
    { value: 'bounce', label: 'Bounce Arrival' },
    { value: 'chaos-burst', label: 'Chaos Burst' },
    { value: 'spiral-flow', label: 'Sigmoid Flow' }
  ];

  return (
    <aside className="control-panel">
      <div className="panel-header">
        <h2 className="panel-title">การแปลงภาพ (TRANSFORM)</h2>
      </div>

      <div className="panel-scroll-content">
        {/* Algorithm */}
        <div className="control-group">
          <label htmlFor="algo-select" className="control-label">อัลกอริทึม</label>
          <select
            id="algo-select"
            value={config.algorithm}
            disabled={disabled}
            onChange={(e) => onChange({ algorithm: e.target.value as MorphAlgorithm })}
            className="select-input"
          >
            {algorithms.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Resolution Control */}
        <div className="control-group">
          <span className="control-label">ความละเอียดภาพ</span>
          <div className="btn-group">
            {resolutions.map((res) => (
              <button
                key={res}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ resolution: res })}
                className={`btn-toggle ${config.resolution === res ? 'active' : ''}`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Easing Function */}
        <div className="control-group">
          <label htmlFor="easing-select" className="control-label">ความโค้งการเคลื่อนที่ (Easing)</label>
          <select
            id="easing-select"
            value={config.easing}
            disabled={disabled}
            onChange={(e) => onChange({ easing: e.target.value as EasingType })}
            className="select-input"
          >
            {easings.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        {/* Particle Count Slider */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="particles-range" className="control-label">จำนวนอนุภาค / พิกเซล</label>
            <span className="slider-val">{config.particleCount.toLocaleString()}</span>
          </div>
          <input
            id="particles-range"
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={config.particleCount}
            disabled={disabled}
            onChange={(e) => onChange({ particleCount: parseInt(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Duration */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="duration-range" className="control-label">ระยะเวลาแอนิเมชัน</label>
            <span className="slider-val">{config.duration.toFixed(1)} วินาที</span>
          </div>
          <input
            id="duration-range"
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={config.duration}
            disabled={disabled}
            onChange={(e) => onChange({ duration: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Particle Size */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="size-range" className="control-label">ขนาดอนุภาค</label>
            <span className="slider-val">{config.particleSize.toFixed(1)}px</span>
          </div>
          <input
            id="size-range"
            type="range"
            min="1.0"
            max="12.0"
            step="0.5"
            value={config.particleSize}
            disabled={disabled}
            onChange={(e) => onChange({ particleSize: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Motion Randomness */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="motion-range" className="control-label">ความสุ่มการเคลื่อนที่</label>
            <span className="slider-val">{Math.round(config.motionRandomness * 100)}%</span>
          </div>
          <input
            id="motion-range"
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.motionRandomness}
            disabled={disabled}
            onChange={(e) => onChange({ motionRandomness: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Color Importance */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="color-range" className="control-label">ความสำคัญของสี</label>
            <span className="slider-val">{Math.round(config.colorImportance * 100)}%</span>
          </div>
          <input
            id="color-range"
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.colorImportance}
            disabled={disabled}
            onChange={(e) => onChange({ colorImportance: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Position Importance */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="pos-range" className="control-label">ความสำคัญของตำแหน่ง</label>
            <span className="slider-val">{Math.round(config.positionImportance * 100)}%</span>
          </div>
          <input
            id="pos-range"
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.positionImportance}
            disabled={disabled}
            onChange={(e) => onChange({ positionImportance: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Blur Control */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="blur-range" className="control-label">ความเบลอ (Blur)</label>
            <span className="slider-val">{config.blur}</span>
          </div>
          <input
            id="blur-range"
            type="range"
            min="0"
            max="10"
            step="1"
            value={config.blur}
            disabled={disabled}
            onChange={(e) => onChange({ blur: parseInt(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Trail Effect */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="trail-range" className="control-label">เอฟเฟกต์หางเคลื่อนที่ (Trail)</label>
            <span className="slider-val">{Math.round(config.trail * 100)}%</span>
          </div>
          <input
            id="trail-range"
            type="range"
            min="0.0"
            max="0.9"
            step="0.05"
            value={config.trail}
            disabled={disabled}
            onChange={(e) => onChange({ trail: parseFloat(e.target.value) })}
            className="range-input"
          />
        </div>

        {/* Seed & Randomizer */}
        <div className="control-group">
          <div className="slider-header">
            <label htmlFor="seed-input" className="control-label">ค่าสุ่ม (Seed)</label>
            <button
              type="button"
              onClick={() => onChange({ seed: Math.floor(Math.random() * 99999) })}
              disabled={disabled}
              className="btn-icon-seed"
              aria-label="สุ่มค่า Seed ใหม่"
            >
              ↻
            </button>
          </div>
          <input
            id="seed-input"
            type="number"
            value={config.seed}
            disabled={disabled}
            onChange={(e) => onChange({ seed: parseInt(e.target.value) || 12345 })}
            className="number-input font-mono"
          />
        </div>
      </div>
    </aside>
  );
};
