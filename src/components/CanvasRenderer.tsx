import React, { useEffect, useRef } from 'react';

interface CanvasRendererProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  width?: number;
  height?: number;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  onCanvasReady,
  width = 600,
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      onCanvasReady(canvas);
    }
  }, [width, height, onCanvasReady]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="transformation-canvas"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};
