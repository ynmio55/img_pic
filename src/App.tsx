import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CanvasRenderer } from './components/CanvasRenderer';
import { PlaybackBar } from './components/PlaybackBar';
import { ControlPanel } from './components/ControlPanel';
import { ExportPanel } from './components/ExportPanel';
import { MetricsOverlay } from './components/MetricsOverlay';
import { ToastNotification } from './components/ToastNotification';
import { PresetGalleryModal } from './components/PresetGalleryModal';
import type { ToastMessage } from './components/ToastNotification';

import type { EngineConfig, MetricsState, ProcessingProgress } from './engine/types';
import { ParticleEngine } from './engine/ParticleEngine';
import { loadImageFromFile, extractImagePixelData } from './utils/image';
import type { ProcessedImageData } from './utils/image';

const DEFAULT_CONFIG: EngineConfig = {
  algorithm: 'pixel-morph',
  resolution: 256,
  particleCount: 25000,
  duration: 3.0,
  particleSize: 3.0,
  motionRandomness: 0.25,
  colorImportance: 0.6,
  positionImportance: 0.4,
  blur: 0,
  trail: 0.15,
  easing: 'cubic-in-out',
  seed: 12345,
  renderMode: 'auto'
};

export const App: React.FC = () => {
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [targetImg, setTargetImg] = useState<HTMLImageElement | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [targetPreviewUrl, setTargetPreviewUrl] = useState<string | null>(null);

  const [sourceData, setSourceData] = useState<ProcessedImageData | null>(null);
  const [targetData, setTargetData] = useState<ProcessedImageData | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
  const configRef = useRef<EngineConfig>(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  const [metrics, setMetrics] = useState<MetricsState>({
    fps: 60,
    particleCount: 0,
    processingTimeMs: 0,
    renderMode: 'webgl',
    currentFrame: 0,
    totalFrames: 180,
    progress: 0,
    isProcessing: false
  });

  const addToast = (type: 'info' | 'success' | 'error', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Process and scale images into pixel data
  const prepareImageBuffers = useCallback((src: HTMLImageElement, tgt: HTMLImageElement, res: number) => {
    try {
      const sData = extractImagePixelData(src, res);
      const tData = extractImagePixelData(tgt, res);
      setSourceData(sData);
      setTargetData(tData);
      return { sData, tData };
    } catch (err: any) {
      addToast('error', `ไม่สามารถประมวลผลข้อมูลภาพ: ${err.message || err}`);
      return null;
    }
  }, []);

  // Compute Transformation helper
  const computeTransformation = useCallback((sData: ProcessedImageData, tData: ProcessedImageData) => {
    if (engineRef.current) {
      setIsProcessing(true);
      engineRef.current.processImages(sData, tData);
    }
  }, []);

  // Initialize Canvas & Engine
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasElementRef.current = canvas;
    if (!engineRef.current) {
      engineRef.current = new ParticleEngine(
        canvas,
        configRef.current,
        (status: ProcessingProgress) => {
          if (status.stage === 'ready') {
            setIsProcessing(false);
            setIsPlaying(true);
            addToast('success', `ประมวลผลสำเร็จ (${status.particleCount.toLocaleString()} อนุภาค, ${status.computeTimeMs}ms)`);
            
            if (status.computeTimeMs > 1500 && configRef.current.particleCount > 10000) {
              addToast('info', 'ปรับลดจำนวนอนุภาคอัตโนมัติเพื่อให้เฟรมเรตลื่นไหล');
              setConfig((prev) => ({ ...prev, particleCount: Math.max(10000, Math.floor(prev.particleCount / 2)) }));
            }
          } else if (status.stage === 'error') {
            setIsProcessing(false);
            addToast('error', status.message);
          }
        },
        (updatedMetrics) => {
          setMetrics((prev) => {
            const next = { ...prev, ...updatedMetrics };
            if (updatedMetrics.isProcessing !== undefined) {
              setIsPlaying(updatedMetrics.isProcessing);
            }
            if (updatedMetrics.progress !== undefined) {
              setProgress(updatedMetrics.progress);
            }
            return next;
          });
        }
      );
    }
  }, []);

  // Handle Source Select
  const handleSourceSelect = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'ขนาดไฟล์เกินกำหนด 25MB');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setSourceImg(img);
      setSourcePreviewUrl(img.src);
      addToast('info', 'โหลดภาพต้นทางเรียบร้อยแล้ว');
      if (targetImg) {
        const buffers = prepareImageBuffers(img, targetImg, config.resolution);
        if (buffers) computeTransformation(buffers.sData, buffers.tData);
      }
    } catch (e: any) {
      addToast('error', e.message || 'เกิดข้อผิดพลาดในการโหลดภาพต้นทาง');
    }
  };

  // Handle Target Select
  const handleTargetSelect = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'ขนาดไฟล์เกินกำหนด 25MB');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setTargetImg(img);
      setTargetPreviewUrl(img.src);
      addToast('info', 'โหลดภาพเป้าหมายเรียบร้อยแล้ว');
      if (sourceImg) {
        const buffers = prepareImageBuffers(sourceImg, img, config.resolution);
        if (buffers) computeTransformation(buffers.sData, buffers.tData);
      }
    } catch (e: any) {
      addToast('error', e.message || 'เกิดข้อผิดพลาดในการโหลดภาพเป้าหมาย');
    }
  };

  // Handle Preset Select from Gallery Modal
  const handleSelectPreset = (img: HTMLImageElement, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceImg(img);
      setSourcePreviewUrl(img.src);
      addToast('info', 'เลือกภาพพรีเซ็ตเป็น Source เรียบร้อย');
      if (targetImg) {
        const buffers = prepareImageBuffers(img, targetImg, config.resolution);
        if (buffers) computeTransformation(buffers.sData, buffers.tData);
      }
    } else {
      setTargetImg(img);
      setTargetPreviewUrl(img.src);
      addToast('info', 'เลือกภาพพรีเซ็ตเป็น Target เรียบร้อย');
      if (sourceImg) {
        const buffers = prepareImageBuffers(sourceImg, img, config.resolution);
        if (buffers) computeTransformation(buffers.sData, buffers.tData);
      }
    }
  };

  // Generate Transformation Button Click
  const handleGenerate = () => {
    if (!sourceImg || !targetImg) {
      addToast('error', 'กรุณาอัปโหลดทั้งภาพต้นทางและภาพเป้าหมาย');
      return;
    }

    let sData = sourceData;
    let tData = targetData;

    if (!sData || !tData) {
      const buffers = prepareImageBuffers(sourceImg, targetImg, config.resolution);
      if (buffers) {
        sData = buffers.sData;
        tData = buffers.tData;
      } else {
        return;
      }
    }

    computeTransformation(sData, tData);
  };

  // Config Slider / Toggle Changes
  const handleConfigChange = (newConfig: Partial<EngineConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (engineRef.current) {
        const needsRecompute = engineRef.current.updateConfig(updated);
        if (newConfig.resolution && newConfig.resolution !== prev.resolution && sourceImg && targetImg) {
          const buffers = prepareImageBuffers(sourceImg, targetImg, newConfig.resolution);
          if (buffers && !isProcessing) {
            computeTransformation(buffers.sData, buffers.tData);
          }
        } else if (needsRecompute && sourceData && targetData && !isProcessing) {
          computeTransformation(sourceData, targetData);
        }
      }
      return updated;
    });
  };

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      engineRef.current?.pause();
      setIsPlaying(false);
    } else {
      engineRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    engineRef.current?.restart();
    setIsPlaying(true);
  };

  const handleSeek = (p: number) => {
    engineRef.current?.seek(p);
    setProgress(p);
  };

  const handleReset = () => {
    engineRef.current?.reset();
    setSourceImg(null);
    setTargetImg(null);
    setSourcePreviewUrl(null);
    setTargetPreviewUrl(null);
    setSourceData(null);
    setTargetData(null);
    setIsPlaying(false);
    setProgress(0);
    addToast('info', 'รีเซ็ตพื้นที่ทำงานเรียบร้อยแล้ว');
  };

  const canGenerate = Boolean(sourceImg && targetImg);

  return (
    <div className="app-container dark-tool-theme">
      <Header
        onOpenGallery={() => setIsGalleryOpen(true)}
        onReset={handleReset}
        isProcessing={isProcessing}
        activeRenderMode={metrics.renderMode}
      />

      <main className="workspace-main">
        {/* Left Column: Image Upload Sidebar */}
        <aside className="upload-sidebar">
          <div className="panel-header flex justify-between items-center">
            <h2 className="panel-title">รูปภาพ (IMAGES)</h2>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="btn-mini text-xs"
            >
              🖼️ เลือกจากคลัง
            </button>
          </div>
          
          <ImageUploader
            sourcePreviewUrl={sourcePreviewUrl}
            targetPreviewUrl={targetPreviewUrl}
            onSourceSelect={handleSourceSelect}
            onTargetSelect={handleTargetSelect}
            onClearSource={() => {
              setSourceImg(null);
              setSourcePreviewUrl(null);
              setSourceData(null);
            }}
            onClearTarget={() => {
              setTargetImg(null);
              setTargetPreviewUrl(null);
              setTargetData(null);
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isProcessing}
            className="btn-generate w-full"
          >
            {isProcessing ? 'กำลังประมวลผล…' : 'ประมวลผลการแปลงภาพ'}
          </button>
        </aside>

        {/* Center Column: Large Hero Viewport & Controls */}
        <section className="viewport-section">
          <div className="canvas-frame">
            <MetricsOverlay metrics={metrics} resolution={config.resolution} />
            <CanvasRenderer onCanvasReady={handleCanvasReady} width={760} height={760} />
            <PlaybackBar
              isPlaying={isPlaying}
              progress={progress}
              durationSec={config.duration}
              onPlayPause={handlePlayPause}
              onRestart={handleRestart}
              onSeek={handleSeek}
              isLooping={isLooping}
              onToggleLoop={() => setIsLooping(!isLooping)}
              disabled={metrics.particleCount === 0 || isProcessing}
            />
          </div>

          <ExportPanel
            canvasRef={canvasElementRef}
            config={config}
            onRenderFrameAtProgress={(p) => engineRef.current?.seek(p)}
            onStartPlayback={() => engineRef.current?.play()}
            onStopPlayback={() => engineRef.current?.pause()}
            disabled={metrics.particleCount === 0 || isProcessing}
          />
        </section>

        {/* Right Column: Technical Settings Sidebar */}
        <ControlPanel
          config={config}
          onChange={handleConfigChange}
          disabled={isProcessing}
        />
      </main>

      <PresetGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
