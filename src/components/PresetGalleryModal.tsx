import React, { useState } from 'react';
import { PRESET_LIBRARY, createPresetImage } from '../utils/image';
import type { PresetItem } from '../utils/image';

interface PresetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (img: HTMLImageElement, type: 'source' | 'target') => void;
}

export const PresetGalleryModal: React.FC<PresetGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'portraits' | 'art' | 'nature' | 'space' | 'anime'>('all');

  if (!isOpen) return null;

  const filteredPresets = PRESET_LIBRARY.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const handleSelect = (item: PresetItem, type: 'source' | 'target') => {
    const img = createPresetImage(item.id, 256);
    img.onload = () => {
      onSelectPreset(img, type);
      onClose();
    };
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <h2 className="modal-title">คลังรูปภาพตัวอย่าง ({PRESET_LIBRARY.length} รายการ)</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-close-modal" aria-label="ปิดหน้าต่าง">
            ✕
          </button>
        </div>

        {/* Category Filters */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            ทั้งหมด ({PRESET_LIBRARY.length})
          </button>
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'portraits' ? 'active' : ''}`}
            onClick={() => setFilterCategory('portraits')}
          >
            👤 บุคคลระดับโลก
          </button>
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'art' ? 'active' : ''}`}
            onClick={() => setFilterCategory('art')}
          >
            🎨 ศิลปะ & ป๊อปอาร์ต
          </button>
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'nature' ? 'active' : ''}`}
            onClick={() => setFilterCategory('nature')}
          >
            🐱 สัตว์ & สิ่งมีชีวิต
          </button>
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'space' ? 'active' : ''}`}
            onClick={() => setFilterCategory('space')}
          >
            🌌 อวกาศ & ธรรมชาติ
          </button>
          <button
            type="button"
            className={`btn-tab ${filterCategory === 'anime' ? 'active' : ''}`}
            onClick={() => setFilterCategory('anime')}
          >
            🍙 แอนิเมะ & ไอคอน
          </button>
        </div>

        {/* Presets Grid */}
        <div className="preset-grid">
          {filteredPresets.map((item) => {
            const previewSrc = createPresetImage(item.id, 200).src;
            return (
              <div key={item.id} className="preset-card">
                <div className="preset-img-wrapper">
                  <img src={previewSrc} alt={item.name} className="preset-img" />
                </div>
                <div className="preset-info">
                  <h3 className="preset-name">{item.name}</h3>
                  <p className="preset-desc">{item.description}</p>
                </div>
                <div className="preset-card-actions">
                  <button
                    type="button"
                    onClick={() => handleSelect(item, 'source')}
                    className="btn-select-preset btn-src"
                  >
                    ตั้งเป็น Source
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(item, 'target')}
                    className="btn-select-preset btn-tgt"
                  >
                    ตั้งเป็น Target
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
