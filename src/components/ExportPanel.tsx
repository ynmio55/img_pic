import React, { useState } from 'react';
import type { EngineConfig } from '../engine/types';
import { exportToGif, recordToWebM, triggerDownload } from '../utils/export';

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: EngineConfig;
  onRenderFrameAtProgress: (progress: number) => void;
  onStartPlayback: () => void;
  onStopPlayback: () => void;
  disabled: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  canvasRef,
  config,
  onRenderFrameAtProgress,
  onStartPlayback,
  onStopPlayback,
  disabled
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const exportFps = 24;

  const handleExportGif = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('กำลังบันทึกไฟล์ GIF…');

    try {
      const dataUrl = await exportToGif(
        onRenderFrameAtProgress,
        canvas,
        { fps: exportFps, quality: 8, width: 400, height: 400 },
        config,
        (percent) => setExportProgress(percent)
      );
      triggerDownload(dataUrl, `pixelmorph-${config.algorithm}-${Date.now()}.gif`);
      setExportStatus('ดาวน์โหลดไฟล์ GIF เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('GIF export failed:', err);
      setExportStatus(`เกิดข้อผิดพลาด: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('กำลังบันทึกวิดีโอ WebM…');

    try {
      const blob = await recordToWebM(
        canvas,
        onStartPlayback,
        onStopPlayback,
        config.duration,
        exportFps,
        (percent) => setExportProgress(percent)
      );
      triggerDownload(blob, `pixelmorph-${config.algorithm}-${Date.now()}.webm`);
      setExportStatus('ดาวน์โหลดไฟล์ WebM เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('WebM export failed:', err);
      setExportStatus(`เกิดข้อผิดพลาด: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onRenderFrameAtProgress(1.0); // final target frame
    const dataUrl = canvas.toDataURL('image/png');
    triggerDownload(dataUrl, `pixelmorph-target-${Date.now()}.png`);
  };

  return (
    <div className="export-toolbar">
      <div className="export-controls">
        <span className="export-label">ส่งออกผลลัพธ์</span>
        <div className="btn-group">
          <button
            type="button"
            onClick={handleExportGif}
            disabled={disabled || isExporting}
            className="btn-export"
          >
            บันทึก GIF
          </button>

          <button
            type="button"
            onClick={handleExportWebM}
            disabled={disabled || isExporting}
            className="btn-export"
          >
            บันทึก WebM
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={disabled || isExporting}
            className="btn-export"
          >
            บันทึก PNG
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="export-progress-bar">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>{exportStatus}</span>
            <span>{exportProgress}%</span>
          </div>
          <div className="progress-bg">
            <div
              className="progress-fill"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
