import React from 'react';

interface HeaderProps {
  onOpenGallery: () => void;
  onReset: () => void;
  isProcessing: boolean;
  activeRenderMode: 'webgl' | 'canvas2d';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGallery,
  onReset,
  isProcessing,
  activeRenderMode
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="brand-title">PixelMorph</span>
        <span className="engine-badge uppercase">{activeRenderMode}</span>
      </div>

      <div className="header-actions">
        <button
          onClick={onOpenGallery}
          disabled={isProcessing}
          className="btn btn-secondary text-xs"
          aria-label="เปิดคลังภาพตัวอย่าง"
        >
          🖼️ คลังภาพตัวอย่าง
        </button>

        <button
          onClick={onReset}
          disabled={isProcessing}
          className="btn btn-secondary text-xs"
          aria-label="รีเซ็ตพื้นที่ทำงาน"
        >
          รีเซ็ต
        </button>
      </div>
    </header>
  );
};
