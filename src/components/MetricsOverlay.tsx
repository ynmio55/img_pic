import React from 'react';
import type { MetricsState } from '../engine/types';

interface MetricsOverlayProps {
  metrics: MetricsState;
  resolution: number;
}

export const MetricsOverlay: React.FC<MetricsOverlayProps> = ({ metrics, resolution }) => {
  return (
    <div className="metrics-bar">
      <span>{metrics.fps} FPS</span>
      <span className="dot">•</span>
      <span>{metrics.particleCount.toLocaleString()} อนุภาค</span>
      <span className="dot">•</span>
      <span className="uppercase">{metrics.renderMode}</span>
      <span className="dot">•</span>
      <span>{resolution}×{resolution}</span>
    </div>
  );
};
