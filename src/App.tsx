import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CanvasRenderer } from './components/CanvasRenderer';
import { PlaybackBar } from './components/PlaybackBar';
import { ControlPanel } from './components/ControlPanel';
import { ObamaControlPanel } from './components/ObamaControlPanel';
import { ExportPanel } from './components/ExportPanel';
import { MetricsOverlay } from './components/MetricsOverlay';
import { ToastNotification } from './components/ToastNotification';
import { PresetGalleryModal } from './components/PresetGalleryModal';
import type { ToastMessage } from './components/ToastNotification';

import type { EngineConfig, MetricsState, ProcessingProgress } from './engine/types';
import { ParticleEngine } from './engine/ParticleEngine';
import { ObamaMosaicEngine } from './engine/ObamaMosaicEngine';
import type { ObamaMosaicConfig } from './engine/ObamaMosaicEngine';
import { loadImageFromFile, extractImagePixelData } from './utils/image';
import type { ProcessedImageData } from './utils/image';
import { Play } from 'lucide-react';

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

const DEFAULT_OBAMA_CONFIG: ObamaMosaicConfig = {
  preset: 'obama',
  density: 55,
  stampScale: 1.2,
  contrast: 1.0,
  invert: false,
  colorMode: 'monochrome',
  backgroundColor: '#09090b'
};

export const App: React.FC = () => {
  // Mode State: 'particle-morph' vs 'obama-mosaic'
  const [activeAppMode, setActiveAppMode] = useState<'particle-morph' | 'obama-mosaic'>('particle-morph');

  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [targetImg, setTargetImg] = useState<HTMLImageElement | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [targetPreviewUrl, setTargetPreviewUrl] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [targetFileName, setTargetFileName] = useState<string>('');

  const [sourceData, setSourceData] = useState<ProcessedImageData | null>(null);
  const [targetData, setTargetData] = useState<ProcessedImageData | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
  const [obamaConfig, setObamaConfig] = useState<ObamaMosaicConfig>(DEFAULT_OBAMA_CONFIG);

  const configRef = useRef<EngineConfig>(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Separate Canvas Refs for WebGL vs 2D to prevent getContext conflict
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);

  const engineRef = useRef<ParticleEngine | null>(null);
  const obamaEngineRef = useRef<ObamaMosaicEngine | null>(null);

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

  // Sync Loop setting with ParticleEngine
  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    engineRef.current?.setLooping(nextLoop);
  };

  // Render Obama Mosaic function onto pure 2D canvas
  const renderObamaMosaic = useCallback(() => {
    if (!canvas2dRef.current || !sourceImg) return;
    if (!obamaEngineRef.current) {
      obamaEngineRef.current = new ObamaMosaicEngine(canvas2dRef.current);
    }
    obamaEngineRef.current.renderMosaic(sourceImg, obamaConfig);
    setHasGenerated(true);
    setMetrics((prev) => ({
      ...prev,
      particleCount: obamaConfig.density * obamaConfig.density,
      renderMode: 'canvas2d'
    }));
  }, [sourceImg, obamaConfig]);

  // Re-render Obama Mosaic whenever config changes in obama mode
  useEffect(() => {
    if (activeAppMode === 'obama-mosaic' && sourceImg && hasGenerated) {
      renderObamaMosaic();
    }
  }, [activeAppMode, sourceImg, obamaConfig, renderObamaMosaic, hasGenerated]);

  // Process and scale images into pixel data
  const prepareImageBuffers = useCallback((src: HTMLImageElement, tgt: HTMLImageElement, res: number) => {
    try {
      const sData = extractImagePixelData(src, res);
      const tData = extractImagePixelData(tgt, res);
      setSourceData(sData);
      setTargetData(tData);
      return { sData, tData };
    } catch (err: any) {
      addToast('error', `Failed to process image data: ${err.message || err}`);
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

  // Initialize WebGL Canvas & ParticleEngine
  const handleWebGlCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    webglCanvasRef.current = canvas;
    if (!engineRef.current) {
      engineRef.current = new ParticleEngine(
        canvas,
        configRef.current,
        (status: ProcessingProgress) => {
          if (status.stage === 'ready') {
            setIsProcessing(false);
            setIsPlaying(true);
            setHasGenerated(true);
            addToast('success', `Transformation ready (${status.particleCount.toLocaleString()} particles, ${status.computeTimeMs}ms)`);
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
      engineRef.current.setLooping(isLooping);
    }
  }, [isLooping]);

  // Initialize 2D Canvas & ObamaMosaicEngine
  const handle2DCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvas2dRef.current = canvas;
    if (!obamaEngineRef.current) {
      obamaEngineRef.current = new ObamaMosaicEngine(canvas);
    }
  }, []);

  // Mode switching handler
  const handleSwitchMode = (mode: 'particle-morph' | 'obama-mosaic') => {
    setActiveAppMode(mode);
    if (mode === 'obama-mosaic') {
      engineRef.current?.pause();
      setIsPlaying(false);
      if (sourceImg && hasGenerated) {
        setTimeout(() => renderObamaMosaic(), 50);
      }
    } else {
      if (sourceData && targetData && hasGenerated) {
        computeTransformation(sourceData, targetData);
      }
    }
  };

  // Handle Source Select (Previews only, NO auto-generation)
  const handleSourceSelect = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'File size exceeds 25MB limit.');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setSourceImg(img);
      setSourcePreviewUrl(img.src);
      setSourceFileName(file.name);
      setHasGenerated(false);
      addToast('info', 'Source image loaded. Click Generate to process.');
    } catch (e: any) {
      addToast('error', e.message || 'Failed to load source image.');
    }
  };

  // Handle Target Select (Previews only, NO auto-generation)
  const handleTargetSelect = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'File size exceeds 25MB limit.');
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setTargetImg(img);
      setTargetPreviewUrl(img.src);
      setTargetFileName(file.name);
      setHasGenerated(false);
      addToast('info', 'Target image loaded. Click Generate to process.');
    } catch (e: any) {
      addToast('error', e.message || 'Failed to load target image.');
    }
  };

  // Handle Preset Select from Gallery Modal
  const handleSelectPreset = (img: HTMLImageElement, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceImg(img);
      setSourcePreviewUrl(img.src);
      setSourceFileName('Preset Source');
      setHasGenerated(false);
    } else {
      setTargetImg(img);
      setTargetPreviewUrl(img.src);
      setTargetFileName('Preset Target');
      setHasGenerated(false);
    }
  };

  // MANUAL GENERATION WORKFLOW: User explicitly clicks Generate
  const handleGenerate = () => {
    if (activeAppMode === 'obama-mosaic') {
      if (!sourceImg) {
        addToast('error', 'Please upload a Source image.');
        return;
      }
      renderObamaMosaic();
      addToast('success', 'Obama Mosaic generated.');
      return;
    }

    if (!sourceImg || !targetImg) {
      addToast('error', 'Please upload both Source and Target images.');
      return;
    }

    const buffers = prepareImageBuffers(sourceImg, targetImg, config.resolution);
    if (buffers) {
      computeTransformation(buffers.sData, buffers.tData);
    }
  };

  // Config Slider / Toggle Changes
  const handleConfigChange = (newConfig: Partial<EngineConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (engineRef.current) {
        const requiresRecompute = engineRef.current.updateConfig(updated);
        // Only re-trigger matching if already generated & setting requires recompute
        if (requiresRecompute && hasGenerated && sourceImg && targetImg && !isProcessing) {
          const buffers = prepareImageBuffers(sourceImg, targetImg, updated.resolution);
          if (buffers) computeTransformation(buffers.sData, buffers.tData);
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

  // Complete System Reset
  const handleReset = () => {
    engineRef.current?.reset();
    setSourceImg(null);
    setTargetImg(null);
    setSourcePreviewUrl(null);
    setTargetPreviewUrl(null);
    setSourceFileName('');
    setTargetFileName('');
    setSourceData(null);
    setTargetData(null);
    setIsPlaying(false);
    setProgress(0);
    setHasGenerated(false);
    setConfig(DEFAULT_CONFIG);
    addToast('info', 'Workspace reset to initial state.');
  };

  const canGenerate = activeAppMode === 'obama-mosaic' ? Boolean(sourceImg) : Boolean(sourceImg && targetImg);
  const activeCanvasRef = activeAppMode === 'obama-mosaic' ? canvas2dRef : webglCanvasRef;
  const isInputDisabled = isProcessing || isExporting;

  return (
    <div className="app-container dark-tool-theme flex flex-col min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
      <Header
        activeAppMode={activeAppMode}
        onSwitchMode={handleSwitchMode}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onReset={handleReset}
        isProcessing={isInputDisabled}
        activeRenderMode={metrics.renderMode}
        fps={metrics.fps}
      />

      <main className="workspace-main flex-1 p-4 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Main Column: Workflow, Hero Canvas, Playback, Export */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Top Workflow: Source & Target Image Uploaders */}
          <div className="flex flex-col gap-3">
            <ImageUploader
              activeAppMode={activeAppMode}
              sourcePreviewUrl={sourcePreviewUrl}
              targetPreviewUrl={activeAppMode === 'obama-mosaic' ? null : targetPreviewUrl}
              sourceFileName={sourceFileName}
              targetFileName={targetFileName}
              onSourceSelect={handleSourceSelect}
              onTargetSelect={handleTargetSelect}
              onClearSource={() => {
                setSourceImg(null);
                setSourcePreviewUrl(null);
                setSourceData(null);
                setSourceFileName('');
                setHasGenerated(false);
              }}
              onClearTarget={() => {
                setTargetImg(null);
                setTargetPreviewUrl(null);
                setTargetData(null);
                setTargetFileName('');
                setHasGenerated(false);
              }}
            />

            {/* Primary Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || isInputDisabled}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                {isProcessing
                  ? 'Processing Transformation…'
                  : hasGenerated
                  ? 'Regenerate Transformation'
                  : 'Generate Transformation'}
              </span>
            </button>
          </div>

          {/* Hero Canvas Centerpiece */}
          <div className="canvas-frame relative flex-1 flex flex-col min-h-[540px] bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3">
            <MetricsOverlay metrics={metrics} resolution={config.resolution} />
            
            <CanvasRenderer
              activeAppMode={activeAppMode}
              onWebGlCanvasReady={handleWebGlCanvasReady}
              on2DCanvasReady={handle2DCanvasReady}
              width={760}
              height={760}
              hasParticles={hasGenerated}
              isProcessing={isProcessing}
            />

            {activeAppMode === 'particle-morph' && (
              <div className="mt-3">
                <PlaybackBar
                  isPlaying={isPlaying}
                  progress={progress}
                  durationSec={config.duration}
                  onPlayPause={handlePlayPause}
                  onRestart={handleRestart}
                  onSeek={handleSeek}
                  isLooping={isLooping}
                  onToggleLoop={handleToggleLoop}
                  disabled={!hasGenerated || isInputDisabled}
                />
              </div>
            )}
          </div>

          {/* Bottom Export Toolbar */}
          <ExportPanel
            canvasRef={activeCanvasRef}
            config={config}
            onRenderFrameAtProgress={(p) => engineRef.current?.seek(p)}
            onStartPlayback={() => engineRef.current?.play()}
            onStopPlayback={() => engineRef.current?.pause()}
            disabled={!hasGenerated || isInputDisabled}
            onExportStateChange={(exporting) => setIsExporting(exporting)}
          />
        </div>

        {/* Right Settings Sidebar */}
        <aside className="control-sidebar bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">
            {activeAppMode === 'obama-mosaic' ? 'Obama Mosaic Settings' : 'Transformation Settings'}
          </h3>

          {activeAppMode === 'obama-mosaic' ? (
            <ObamaControlPanel
              config={obamaConfig}
              onChangeConfig={(newCfg) => setObamaConfig((prev) => ({ ...prev, ...newCfg }))}
              onGenerate={renderObamaMosaic}
              isProcessing={isInputDisabled}
            />
          ) : (
            <ControlPanel
              config={config}
              onChange={handleConfigChange}
              disabled={isInputDisabled}
            />
          )}
        </aside>
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
