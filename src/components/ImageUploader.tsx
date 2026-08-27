import React, { useRef } from 'react';

interface ImageUploaderProps {
  sourcePreviewUrl: string | null;
  targetPreviewUrl: string | null;
  onSourceSelect: (file: File) => void;
  onTargetSelect: (file: File) => void;
  onClearSource: () => void;
  onClearTarget: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  sourcePreviewUrl,
  targetPreviewUrl,
  onSourceSelect,
  onTargetSelect,
  onClearSource,
  onClearTarget
}) => {
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'source' | 'target') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (type === 'source') onSourceSelect(file);
      else onTargetSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="upload-column">
      {/* Source Box */}
      <div className="upload-box-wrapper">
        <div className="flex justify-between items-center mb-1">
          <span className="box-label">ภาพต้นทาง (SOURCE)</span>
          {sourcePreviewUrl && <span className="badge-tag">โหลดแล้ว</span>}
        </div>
        <div
          className={`upload-box ${sourcePreviewUrl ? 'has-image' : ''}`}
          onDrop={(e) => handleDrop(e, 'source')}
          onDragOver={handleDragOver}
          onClick={() => sourceInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="อัปโหลดภาพต้นทาง"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              sourceInputRef.current?.click();
            }
          }}
        >
          <input
            ref={sourceInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onSourceSelect(e.target.files[0])}
          />
          {sourcePreviewUrl ? (
            <div className="preview-container">
              <img src={sourcePreviewUrl} alt="ตัวอย่างภาพต้นทาง" className="preview-img" />
              <div className="preview-actions">
                <button
                  type="button"
                  className="btn-mini"
                  onClick={(e) => {
                    e.stopPropagation();
                    sourceInputRef.current?.click();
                  }}
                >
                  เปลี่ยนภาพ
                </button>
                <button
                  type="button"
                  className="btn-mini btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSource();
                  }}
                >
                  ลบภาพ
                </button>
              </div>
            </div>
          ) : (
            <div className="drop-prompt">
              <span className="drop-text">วางภาพต้นทางที่นี่</span>
              <span className="drop-subtext">คลิกหรือลากไฟล์ภาพ (PNG, JPG, WebP)</span>
            </div>
          )}
        </div>
      </div>

      {/* Flow Arrow */}
      <div className="flow-arrow" aria-hidden="true">↓</div>

      {/* Target Box */}
      <div className="upload-box-wrapper">
        <div className="flex justify-between items-center mb-1">
          <span className="box-label">ภาพเป้าหมาย (TARGET)</span>
          {targetPreviewUrl && <span className="badge-tag">โหลดแล้ว</span>}
        </div>
        <div
          className={`upload-box ${targetPreviewUrl ? 'has-image' : ''}`}
          onDrop={(e) => handleDrop(e, 'target')}
          onDragOver={handleDragOver}
          onClick={() => targetInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="อัปโหลดภาพเป้าหมาย"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              targetInputRef.current?.click();
            }
          }}
        >
          <input
            ref={targetInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onTargetSelect(e.target.files[0])}
          />
          {targetPreviewUrl ? (
            <div className="preview-container">
              <img src={targetPreviewUrl} alt="ตัวอย่างภาพเป้าหมาย" className="preview-img" />
              <div className="preview-actions">
                <button
                  type="button"
                  className="btn-mini"
                  onClick={(e) => {
                    e.stopPropagation();
                    targetInputRef.current?.click();
                  }}
                >
                  เปลี่ยนภาพ
                </button>
                <button
                  type="button"
                  className="btn-mini btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTarget();
                  }}
                >
                  ลบภาพ
                </button>
              </div>
            </div>
          ) : (
            <div className="drop-prompt">
              <span className="drop-text">วางภาพเป้าหมายที่นี่</span>
              <span className="drop-subtext">คลิกหรือลากไฟล์ภาพ (PNG, JPG, WebP)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
