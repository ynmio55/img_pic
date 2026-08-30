import React, { useState } from 'react';
import { Sliders, Cpu, Eye, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [openSections, setOpenSections] = useState({
    transform: true,
    motion: true,
    look: false,
    advanced: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="control-panel-container space-y-4 text-xs text-zinc-300">
      {/* Section 1: TRANSFORM (Requires Recompute) */}
      <div className="section-card border border-zinc-800 bg-zinc-900/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('transform')}
          className="w-full p-3 flex justify-between items-center text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-cyan-400">
            <Cpu className="w-3.5 h-3.5" /> Transform
          </span>
          {openSections.transform ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </button>

        {openSections.transform && (
          <div className="p-3 pt-0 space-y-3.5 border-t border-zinc-800/60">
            {/* Algorithm Select */}
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Algorithm</label>
              <select
                value={config.algorithm}
                onChange={(e) => onChange({ algorithm: e.target.value as MorphAlgorithm })}
                disabled={disabled}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 outline-none disabled:opacity-40"
              >
                <option value="pixel-morph">Pixel Morph (Hybrid Optimal)</option>
                <option value="genetic-swap">Genetic Swap (Simulated Annealing)</option>
                <option value="particle-morph">Particle Morph (Edge Luminance)</option>
                <option value="nearest-color">Nearest Color Match</option>
                <option value="nearest-position">Nearest Position Spatial</option>
                <option value="random-chaos">Random Chaos Dispersion</option>
                <option value="smooth-flow">Smooth Vector Flow</option>
              </select>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Resolution</span>
                <span className="font-mono text-cyan-400">{config.resolution} × {config.resolution}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[128, 256, 384, 512].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => onChange({ resolution: res })}
                    disabled={disabled}
                    className={`py-1 rounded text-[11px] font-mono border transition-all ${
                      config.resolution === res
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Particle Count Slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Particle Count</span>
                <span className="font-mono text-cyan-400">{config.particleCount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={config.particleCount}
                onChange={(e) => onChange({ particleCount: parseInt(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Duration Slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Duration</span>
                <span className="font-mono text-cyan-400">{config.duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={config.duration}
                onChange={(e) => onChange({ duration: parseFloat(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: MOTION (Render-Only) */}
      <div className="section-card border border-zinc-800 bg-zinc-900/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('motion')}
          className="w-full p-3 flex justify-between items-center text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-cyan-400">
            <Sliders className="w-3.5 h-3.5" /> Motion & Size
          </span>
          {openSections.motion ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </button>

        {openSections.motion && (
          <div className="p-3 pt-0 space-y-3.5 border-t border-zinc-800/60">
            {/* Particle Size */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Particle Size</span>
                <span className="font-mono text-cyan-400">{config.particleSize.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={config.particleSize}
                onChange={(e) => onChange({ particleSize: parseFloat(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Motion Randomness */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Motion Randomness</span>
                <span className="font-mono text-cyan-400">{Math.round(config.motionRandomness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.motionRandomness}
                onChange={(e) => onChange({ motionRandomness: parseFloat(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Color Weight */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Color Weight</span>
                <span className="font-mono text-cyan-400">{Math.round(config.colorImportance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.colorImportance}
                onChange={(e) => onChange({ colorImportance: parseFloat(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: LOOK (Render-Only) */}
      <div className="section-card border border-zinc-800 bg-zinc-900/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('look')}
          className="w-full p-3 flex justify-between items-center text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-cyan-400">
            <Eye className="w-3.5 h-3.5" /> Appearance
          </span>
          {openSections.look ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </button>

        {openSections.look && (
          <div className="p-3 pt-0 space-y-3.5 border-t border-zinc-800/60">
            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Blur Diffusion</span>
                <span className="font-mono text-cyan-400">{config.blur}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={config.blur}
                onChange={(e) => onChange({ blur: parseInt(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Trail */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Motion Trail</span>
                <span className="font-mono text-cyan-400">{Math.round(config.trail * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={config.trail}
                onChange={(e) => onChange({ trail: parseFloat(e.target.value) })}
                disabled={disabled}
                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 4: ADVANCED */}
      <div className="section-card border border-zinc-800 bg-zinc-900/60 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('advanced')}
          className="w-full p-3 flex justify-between items-center text-xs font-semibold text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" /> Advanced
          </span>
          {openSections.advanced ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </button>

        {openSections.advanced && (
          <div className="p-3 pt-0 space-y-3.5 border-t border-zinc-800/60">
            {/* Easing */}
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Easing Curve</label>
              <select
                value={config.easing}
                onChange={(e) => onChange({ easing: e.target.value as EasingType })}
                disabled={disabled}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 outline-none disabled:opacity-40"
              >
                <option value="cubic-in-out">Cubic Ease In-Out</option>
                <option value="quad-in-out">Quadratic Ease In-Out</option>
                <option value="linear">Linear Uniform</option>
                <option value="exponential">Exponential Acceleration</option>
                <option value="elastic">Elastic Bounce</option>
                <option value="chaos-burst">Chaos Burst</option>
                <option value="spiral-flow">Spiral Vortex Flow</option>
              </select>
            </div>

            {/* Seed */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Random Seed</span>
                <span className="font-mono text-cyan-400">{config.seed}</span>
              </div>
              <input
                type="number"
                value={config.seed}
                onChange={(e) => onChange({ seed: parseInt(e.target.value) || 12345 })}
                disabled={disabled}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-zinc-200 outline-none focus:border-cyan-500 disabled:opacity-40"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
