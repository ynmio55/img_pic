/**
 * Utility functions for loading, resizing, and extracting pixel data from images.
 */

export interface ProcessedImageData {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  dataUrl: string;
}

export interface PresetItem {
  id: string;
  name: string;
  category: 'portraits' | 'art' | 'nature' | 'space' | 'anime';
  description: string;
}

export const PRESET_LIBRARY: PresetItem[] = [
  // 1. บุคคลระดับโลก (Portraits)
  { id: 'obama', name: 'Barack Obama (Obamify Style)', category: 'portraits', description: 'ภาพสไตล์โปสเตอร์ Hope สองสีสุดคลาสสิก' },
  { id: 'monalisa', name: 'Mona Lisa (โมนาลิซา)', category: 'portraits', description: 'ภาพวาดมาสเตอร์พีซโทนสีทองคลาสสิก' },
  { id: 'einstein', name: 'Albert Einstein (ไอน์สไตน์)', category: 'portraits', description: 'ภาพพอร์ตเทรตขาวดำเน้นความคมชัดสูง' },
  { id: 'lincoln', name: 'Abraham Lincoln (ลิงคอล์น)', category: 'portraits', description: 'ผู้นำประวัติศาสตร์โทนสีซีเปียคลาสสิก' },
  { id: 'che', name: 'Che Guevara (เช เกวารา)', category: 'portraits', description: 'ภาพซิลูเอทป๊อปอาร์ตปฏิวัติโทนสีแดง' },
  { id: 'vangogh-self', name: 'Van Gogh Portrait (ฟัน โกค)', category: 'portraits', description: 'ภาพวาดตัวเองสีน้ำมันโทนสีฟ้าและส้ม' },

  // 2. ศิลปะ & ป๊อปอาร์ต (Art)
  { id: 'cyberpunk', name: 'Cyberpunk City (ไซเบอร์พังก์)', category: 'art', description: 'เมืองนีออนโทนสีไซแอนและชมพูมาเจนต้า' },
  { id: 'synthwave', name: 'Synthwave Sun (ซินธ์เวฟ)', category: 'art', description: 'พระอาทิตย์ย้อนยุคปี 80s และเส้นกริดโฮโลแกรม' },
  { id: 'starrynight', name: 'Starry Night (คืนประดับดาว)', category: 'art', description: 'ภาพวาดวงโคจรดวงดาวโทนสีน้ำเงินทอง' },
  { id: 'pixelart', name: 'Pixel Arcade (พิกเซลอาร์เคด)', category: 'art', description: 'กราฟิกเกมพิกเซลย้อนยุคสีสันสดใส' },
  { id: 'popart', name: 'Pop Art Warhol (ป๊อปอาร์ต)', category: 'art', description: 'สไตล์ป๊อปอาร์ตสีตัดฉูดฉาดแบบแอนดี วอร์ฮอล' },
  { id: 'geometric', name: 'Minimal Geometric (รูปทรงเรขาคณิต)', category: 'art', description: 'ศิลปะมินิมอลรูปทรงเรขาคณิตตัดสี' },

  // 3. สัตว์ & สิ่งมีชีวิต (Nature & Animals)
  { id: 'cat', name: 'Cosmic Cat (แมวกาแล็กซี)', category: 'nature', description: 'แมวอวกาศลอยท่ามกลางดวงดาวและเนบิวลา' },
  { id: 'eagle', name: 'Golden Eagle (นกอินทรีทอง)', category: 'nature', description: 'นกอินทรีสยายปีกสีทองเรืองแสง' },
  { id: 'wolf', name: 'Cyber Wolf (หมาป่านีออน)', category: 'nature', description: 'หมาป่าไซเบอร์โฮโลแกรมเรืองแสง' },
  { id: 'doge', name: 'Shiba Inu Doge (สุนัขชิบะ)', category: 'nature', description: 'สุนัขชิบะสีส้มยิ้มแฉ่งสดใส' },
  { id: 'panda', name: 'Cute Panda (หมีแพนด้า)', category: 'nature', description: 'หมีแพนด้าน่ารักโทนสีขาวดำน่ารัก' },
  { id: 'lion', name: 'Majestic Lion (สิงโตเจ้าป่า)', category: 'nature', description: 'สิงโตเจ้าป่าแผงคอสีทองสง่างาม' },

  // 4. อวกาศ & ธรรมชาติ (Space)
  { id: 'nebula', name: 'Galaxy Nebula (เนบิวลาอวกาศ)', category: 'space', description: 'กลุ่มก๊าซอวกาศเรืองแสงหลากสี' },
  { id: 'aurora', name: 'Aurora Borealis (แสงเหนือ)', category: 'space', description: 'แสงเหนือสีเขียวมรกตพาดผ่านท้องฟ้า' },
  { id: 'volcano', name: 'Volcano Lava (ภูเขาไฟลาวา)', category: 'space', description: 'ภูเขาไฟปะทุลาวาสีแดงเพลิงระเบิด' },
  { id: 'sunset', name: 'Tropical Sunset (อาทิตย์ตกทะเล)', category: 'space', description: 'พระอาทิตย์ตกชายหาดเขตร้อนสีส้มอมชมพู' },

  // 5. แอนิเมะ & ไอคอน (Anime)
  { id: 'animehero', name: 'Anime Hero (ฮีโร่แอนิเมะ)', category: 'anime', description: 'ตัวละครแอนิเมะผมสีฟ้าทรงพลัง' },
  { id: 'ghost', name: 'Arcade Ghost (ผีพิกเซลเกม)', category: 'anime', description: 'ผีพิกเซลเกมน่ารักสีฟ้าเรืองแสง' }
];

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not a valid image format.'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image URL.'));
    img.src = url;
  });
}

export function extractImagePixelData(
  img: HTMLImageElement,
  targetSize: number = 256
): ProcessedImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to create canvas 2d context for image processing.');
  }

  const scale = Math.max(targetSize / img.width, targetSize / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const dx = (targetSize - scaledWidth) / 2;
  const dy = (targetSize - scaledHeight) / 2;

  ctx.clearRect(0, 0, targetSize, targetSize);
  ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const dataUrl = canvas.toDataURL('image/png');

  return {
    width: targetSize,
    height: targetSize,
    pixels: imageData.data,
    dataUrl
  };
}

export function createPresetImage(id: string, size: number = 256): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create preset canvas');

  const half = size / 2;

  if (id === 'obama') {
    ctx.fillStyle = '#002B49';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#D71921';
    ctx.beginPath();
    ctx.arc(half, half - size * 0.05, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFC72C';
    ctx.beginPath();
    ctx.ellipse(half, half + size * 0.02, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#002B49';
    ctx.beginPath();
    ctx.arc(half - size * 0.1, half - size * 0.05, size * 0.04, 0, Math.PI * 2);
    ctx.arc(half + size * 0.1, half - size * 0.05, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8BB8E8';
    ctx.font = `bold ${Math.round(size * 0.09)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HOPE (OBAMA)', half, size * 0.9);
  } else if (id === 'monalisa') {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#451a03');
    grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(half, half, size * 0.25, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(half, half - size * 0.1, size * 0.3, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.font = `bold ${Math.round(size * 0.08)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MONA LISA', half, size * 0.9);
  } else if (id === 'einstein') {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#e4e4e7';
    ctx.beginPath();
    ctx.arc(half, half - size * 0.05, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#71717a';
    ctx.beginPath();
    ctx.ellipse(half, half + size * 0.05, size * 0.2, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(half, half + size * 0.18, size * 0.06, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('EINSTEIN', half, size * 0.9);
  } else if (id === 'lincoln') {
    ctx.fillStyle = '#291e17';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#18110c';
    ctx.fillRect(half - size * 0.2, half - size * 0.45, size * 0.4, size * 0.25);
    ctx.fillRect(half - size * 0.3, half - size * 0.22, size * 0.6, size * 0.05);
    ctx.fillStyle = '#a87954';
    ctx.beginPath();
    ctx.ellipse(half, half + size * 0.02, size * 0.2, size * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eedac3';
    ctx.font = `bold ${Math.round(size * 0.08)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('LINCOLN', half, size * 0.9);
  } else if (id === 'che') {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(half, half - size * 0.1, size * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(half - size * 0.1, half - size * 0.22, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CHE GUEVARA', half, size * 0.9);
  } else if (id === 'vangogh-self') {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0369a1');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(half, half, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('VAN GOGH', half, size * 0.9);
  } else if (id === 'cyberpunk') {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#581c87');
    grad.addColorStop(1, '#be185d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(size * 0.1, size * 0.3, size * 0.2, size * 0.7);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(size * 0.4, size * 0.2, size * 0.25, size * 0.8);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(size * 0.7, size * 0.4, size * 0.2, size * 0.6);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CYBERPUNK', half, size * 0.15);
  } else if (id === 'synthwave') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, size, size);
    const sunGrad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.7);
    sunGrad.addColorStop(0, '#facc15');
    sunGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(half, half, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, half, size, 2);
    ctx.fillRect(0, half + size * 0.1, size, 2);
    ctx.fillRect(0, half + size * 0.2, size, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHWAVE', half, size * 0.9);
  } else if (id === 'starrynight') {
    const grad = ctx.createRadialGradient(half, half, 10, half, half, size * 0.7);
    grad.addColorStop(0, '#facc15');
    grad.addColorStop(0.4, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.25, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(size * 0.1, size * 0.4, size * 0.15, size * 0.6);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('STARRY NIGHT', half, size * 0.9);
  } else if (id === 'pixelart') {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, size, size);
    const gridDim = 8;
    const pSize = size / gridDim;
    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = (r * c) % 3 === 0 ? '#ef4444' : '#3b82f6';
        } else {
          ctx.fillStyle = (r + c) % 5 === 0 ? '#10b981' : '#f59e0b';
        }
        ctx.fillRect(c * pSize, r * pSize, pSize, pSize);
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('PIXEL ART', half, size * 0.5);
  } else if (id === 'popart') {
    const s2 = half;
    ctx.fillStyle = '#f43f5e'; ctx.fillRect(0, 0, s2, s2);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(s2, 0, s2, s2);
    ctx.fillStyle = '#eab308'; ctx.fillRect(0, s2, s2, s2);
    ctx.fillStyle = '#a855f7'; ctx.fillRect(s2, s2, s2, s2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s2 / 2, s2 / 2, s2 * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s2 + s2 / 2, s2 / 2, s2 * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s2 / 2, s2 + s2 / 2, s2 * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s2 + s2 / 2, s2 + s2 / 2, s2 * 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'geometric') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(half, half, size * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(half - size * 0.2, half - size * 0.2, size * 0.4, size * 0.4);
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(half, half, size * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'cat') {
    const grad = ctx.createRadialGradient(half, half, 10, half, half, size * 0.6);
    grad.addColorStop(0, '#a855f7');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(half - size * 0.2, half - size * 0.1);
    ctx.lineTo(half - size * 0.3, half - size * 0.35);
    ctx.lineTo(half - size * 0.05, half - size * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(half + size * 0.2, half - size * 0.1);
    ctx.lineTo(half + size * 0.3, half - size * 0.35);
    ctx.lineTo(half + size * 0.05, half - size * 0.2);
    ctx.fill();
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.arc(half, half, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('COSMIC CAT', half, size * 0.9);
  } else if (id === 'eagle') {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(half, half, size * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(half + size * 0.15, half);
    ctx.lineTo(half + size * 0.35, half + size * 0.08);
    ctx.lineTo(half + size * 0.15, half + size * 0.18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('GOLDEN EAGLE', half, size * 0.9);
  } else if (id === 'wolf') {
    ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(half, half - size * 0.35);
    ctx.lineTo(half - size * 0.25, half + size * 0.2);
    ctx.lineTo(half, half + size * 0.1);
    ctx.lineTo(half + size * 0.25, half + size * 0.2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(half - size * 0.08, half - size * 0.05, size * 0.03, 0, Math.PI * 2);
    ctx.arc(half + size * 0.08, half - size * 0.05, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CYBER WOLF', half, size * 0.9);
  } else if (id === 'doge') {
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(half, half, size * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.ellipse(half, half + size * 0.08, size * 0.18, size * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.arc(half, half + size * 0.02, size * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('SHIBA DOGE', half, size * 0.9);
  } else if (id === 'panda') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(half, half, size * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(half - size * 0.22, half - size * 0.22, size * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(half + size * 0.22, half - size * 0.22, size * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(half - size * 0.1, half - size * 0.02, size * 0.06, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(half + size * 0.1, half - size * 0.02, size * 0.06, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('PANDA BEAR', half, size * 0.9);
  } else if (id === 'lion') {
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(half, half, size * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(half, half, size * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(half - size * 0.08, half - size * 0.05, size * 0.03, 0, Math.PI * 2); ctx.arc(half + size * 0.08, half - size * 0.05, size * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('LION KING', half, size * 0.9);
  } else if (id === 'nebula') {
    const grad = ctx.createRadialGradient(half * 0.7, half * 0.7, 5, half, half, size * 0.7);
    grad.addColorStop(0, '#ec4899'); grad.addColorStop(0.4, '#8b5cf6'); grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('GALAXY NEBULA', half, size * 0.9);
  } else if (id === 'aurora') {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#020617'); grad.addColorStop(0.5, '#10b981'); grad.addColorStop(1, '#065f46');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.ellipse(half, half, size * 0.45, size * 0.15, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('AURORA BOREALIS', half, size * 0.9);
  } else if (id === 'volcano') {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#450a0a'); grad.addColorStop(0.6, '#dc2626'); grad.addColorStop(1, '#f97316');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#18181b'; ctx.beginPath(); ctx.moveTo(half - size * 0.4, size); ctx.lineTo(half, half - size * 0.1); ctx.lineTo(half + size * 0.4, size); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(half, half - size * 0.1, size * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('VOLCANO LAVA', half, size * 0.9);
  } else if (id === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#ea580c'); grad.addColorStop(0.5, '#f43f5e'); grad.addColorStop(1, '#831843');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(half, half + size * 0.05, size * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, half + size * 0.15, size, size * 0.35);
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('TROPICAL SUNSET', half, size * 0.9);
  } else if (id === 'animehero') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(half, half - size * 0.1, size * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffedd5'; ctx.beginPath(); ctx.ellipse(half, half + size * 0.02, size * 0.18, size * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(half - size * 0.08, half - size * 0.02, size * 0.04, 0, Math.PI * 2); ctx.arc(half + size * 0.08, half - size * 0.02, size * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(size * 0.08)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('ANIME HERO', half, size * 0.9);
  } else {
    // Arcade Ghost
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(half, half - size * 0.05, size * 0.28, Math.PI, 0); ctx.lineTo(half + size * 0.28, half + size * 0.2); ctx.lineTo(half - size * 0.28, half + size * 0.2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(half - size * 0.1, half - size * 0.08, size * 0.07, 0, Math.PI * 2); ctx.arc(half + size * 0.1, half - size * 0.08, size * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.arc(half - size * 0.08, half - size * 0.08, size * 0.03, 0, Math.PI * 2); ctx.arc(half + size * 0.12, half - size * 0.08, size * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.font = `bold ${Math.round(size * 0.08)}px monospace`; ctx.textAlign = 'center'; ctx.fillText('ARCADE GHOST', half, size * 0.9);
  }

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

export function createSampleImage(
  type: 'source' | 'target',
  size: number = 256
): HTMLImageElement {
  return createPresetImage(type === 'source' ? 'obama' : 'cyberpunk', size);
}
