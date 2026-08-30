import React from 'react';
import type { ObamaMosaicConfig } from '../engine/ObamaMosaicEngine';

interface ObamaControlPanelProps {
  config: ObamaMosaicConfig;
  onChangeConfig: (newConfig: Partial<ObamaMosaicConfig>) => void;
  onGenerate: () => void;
  isProcessing: boolean;
}

export const ObamaControlPanel: React.FC<ObamaControlPanelProps> = ({
  config,
  onChangeConfig,
  onGenerate,
  isProcessing
}) => {
  return (
    <div className="space-y-6 text-sm text-zinc-300">
      {/* Title Header */}
      <div className="border-b border-zinc-800 pb-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span>👨🏾‍💼</span> Obama Face Mosaic Controls
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          สร้างรูปภาพใหม่จากการจัดเรียงแสตมป์ใบหน้า Obama จิ๋วนับพันชิ้น
        </p>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-400">เลือกตรายางประทับ (Stamp Preset)</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeConfig({ preset: 'obama' })}
            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
              config.preset === 'obama'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <span>👨🏾‍💼</span> Obama Face
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ preset: 'monalisa' })}
            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
              config.preset === 'monalisa'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <span>🖼️</span> Mona Lisa
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ preset: 'pepe' })}
            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
              config.preset === 'pepe'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <span>🐸</span> Pepe Frog
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ preset: 'star' })}
            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
              config.preset === 'star'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <span>⭐</span> Pixel Star
          </button>
        </div>
      </div>

      {/* Grid Density Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">ความหนาแน่นตรายาง (Stamp Density)</span>
          <span className="font-mono text-cyan-400">{config.density} x {config.density} ({config.density * config.density} ชิ้น)</span>
        </div>
        <input
          type="range"
          min="20"
          max="100"
          step="5"
          value={config.density}
          onChange={(e) => onChangeConfig({ density: parseInt(e.target.value) })}
          className="w-full accent-cyan-500 bg-zinc-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Stamp Scale Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">ขนาดตรายาง (Stamp Scale)</span>
          <span className="font-mono text-cyan-400">{config.stampScale.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={config.stampScale}
          onChange={(e) => onChangeConfig({ stampScale: parseFloat(e.target.value) })}
          className="w-full accent-cyan-500 bg-zinc-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Color Mode */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-400">โหมดสี (Color Mode)</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeConfig({ colorMode: 'monochrome' })}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              config.colorMode === 'monochrome'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            ⚫ Monochrome (ขาว-ดำ)
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ colorMode: 'source-color' })}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              config.colorMode === 'source-color'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            🎨 Source Color (ตามสีภาพ)
          </button>
        </div>
      </div>

      {/* Invert & Contrast */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <span className="text-xs text-zinc-400">กลับค่าสี (Invert Colors)</span>
        <input
          type="checkbox"
          checked={config.invert}
          onChange={(e) => onChangeConfig({ invert: e.target.checked })}
          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
        />
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isProcessing}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? 'กำลังสร้างภาพ Obama Mosaic…' : '👨🏾‍💼 สร้างภาพ Obama Mosaic ใหม่'}
      </button>
    </div>
  );
};
