/**
 * IconItPanel.tsx
 * Icon generation tool - Create app icons for all platforms
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { useThemeStore } from '../themeStore';

interface IconSize {
  name: string;
  size: number;
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'web';
}

const ICON_SIZES: IconSize[] = [
  // iOS
  { name: 'iOS App Icon', size: 1024, platform: 'ios' },
  { name: 'iOS 180px', size: 180, platform: 'ios' },
  { name: 'iOS 120px', size: 120, platform: 'ios' },
  // Android
  { name: 'Android xxxhdpi', size: 192, platform: 'android' },
  { name: 'Android xxhdpi', size: 144, platform: 'android' },
  { name: 'Android xhdpi', size: 96, platform: 'android' },
  // Windows
  { name: 'Windows ICO', size: 256, platform: 'windows' },
  { name: 'Windows Tile', size: 150, platform: 'windows' },
  // macOS
  { name: 'macOS 512@2x', size: 1024, platform: 'macos' },
  { name: 'macOS 256@2x', size: 512, platform: 'macos' },
  { name: 'macOS 128@2x', size: 256, platform: 'macos' },
  // Web
  { name: 'Favicon 192', size: 192, platform: 'web' },
  { name: 'Favicon 32', size: 32, platform: 'web' },
  { name: 'Favicon 16', size: 16, platform: 'web' },
];

const PLATFORM_COLORS = {
  ios: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  android: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  windows: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  macos: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  web: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const IconItPanel: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('icon');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['ios', 'android', 'windows']));
  const [generatedIcons, setGeneratedIcons] = useState<Map<number, string>>(new Map());
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Build ICO blob from a canvas (embeds PNG in ICO container - Vista+ format)
  const canvasToIcoBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    const pngBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const headerSize = 6;
    const dirEntrySize = 16;
    const dataOffset = headerSize + dirEntrySize;
    const buf = new ArrayBuffer(dataOffset + pngBytes.byteLength);
    const view = new DataView(buf);
    const bytes = new Uint8Array(buf);
    // ICONDIR
    view.setUint16(0, 0, true);  // reserved
    view.setUint16(2, 1, true);  // type = 1 (ICO)
    view.setUint16(4, 1, true);  // count = 1
    // ICONDIRENTRY
    const w = canvas.width;
    const h = canvas.height;
    bytes[6] = w >= 256 ? 0 : w;
    bytes[7] = h >= 256 ? 0 : h;
    bytes[8] = 0;  // color count
    bytes[9] = 0;  // reserved
    view.setUint16(10, 1, true);   // planes
    view.setUint16(12, 32, true);  // bit depth
    view.setUint32(14, pngBytes.byteLength, true);  // image data size
    view.setUint32(18, dataOffset, true);            // image data offset
    bytes.set(pngBytes, dataOffset);
    return new Blob([buf], { type: 'image/x-icon' });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }
    // Strip extension to use as base name
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
    setOriginalFileName(baseName);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageSrc(e.target?.result as string);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setGeneratedIcons(new Map());
        setMessage(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom with scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  // Generate icons for selected sizes
  const generateIcons = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    setMessage('Generating icons...');
    
    const newIcons = new Map<number, string>();
    const sizesToGenerate = ICON_SIZES.filter(s => selectedPlatforms.has(s.platform));
    const uniqueSizes = [...new Set(sizesToGenerate.map(s => s.size))];
    
    // Preview container is 256x256
    const previewSize = 256;
    
    // Calculate how bg-contain positions the image
    const imgAspect = originalImage.width / originalImage.height;
    let containedWidth: number, containedHeight: number;
    
    if (imgAspect > 1) {
      // Wider than tall - fit to width
      containedWidth = previewSize;
      containedHeight = previewSize / imgAspect;
    } else {
      // Taller than wide - fit to height
      containedHeight = previewSize;
      containedWidth = previewSize * imgAspect;
    }
    
    // The image is centered in the 256x256 box
    const containedX = (previewSize - containedWidth) / 2;
    const containedY = (previewSize - containedHeight) / 2;
    
    // Scale factor from original image to contained size
    const containedScale = containedWidth / originalImage.width;
    
    try {
      for (const size of uniqueSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;
        
        // Calculate what part of the preview is visible in the 256x256 square after zoom/pan
        // The transform is: scale(zoom) translate(position.x/zoom, position.y/zoom)
        // This means the center scales, then translates
        
        // After zoom, the visible region in "unzoomed preview coordinates" is:
        const visibleWidth = previewSize / zoom;
        const visibleHeight = previewSize / zoom;
        
        // The visible region's top-left in preview coordinates (before transform)
        // Center of preview is at (128, 128), after translation by (position.x, position.y), 
        // the center moves, so visible region shifts opposite
        const visibleCenterX = previewSize / 2 - position.x;
        const visibleCenterY = previewSize / 2 - position.y;
        
        const visibleLeft = visibleCenterX - visibleWidth / 2;
        const visibleTop = visibleCenterY - visibleHeight / 2;
        
        // Now map this visible region back to original image coordinates
        // The contained image starts at (containedX, containedY) in preview coords
        const srcLeft = (visibleLeft - containedX) / containedScale;
        const srcTop = (visibleTop - containedY) / containedScale;
        const srcWidth = visibleWidth / containedScale;
        const srcHeight = visibleHeight / containedScale;
        
        // Draw with anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill with transparent background first
        ctx.clearRect(0, 0, size, size);
        
        ctx.drawImage(
          originalImage,
          srcLeft,
          srcTop,
          srcWidth,
          srcHeight,
          0,
          0,
          size,
          size
        );
        
        newIcons.set(size, canvas.toDataURL('image/png'));
      }
      
      setGeneratedIcons(newIcons);
      setMessage(`Generated ${newIcons.size} icon sizes — ready to download as .ico`);
    } catch (error) {
      setMessage('Error generating icons');
    } finally {
      setIsProcessing(false);
    }
  };

  // Build safe filename: {originalName}_{size}x{size}_{platform_label}.ico
  const buildFileName = (size: number, platform: string, label: string) => {
    const platformLabel = label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    return `${originalFileName}_${size}x${size}_${platformLabel}.ico`;
  };

  // Download single icon as .ico
  const downloadIcon = async (size: number, name: string, platform: string) => {
    const dataUrl = generatedIcons.get(size);
    if (!dataUrl) return;
    // Reconstruct canvas to get ICO
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = dataUrl; });
    ctx.drawImage(img, 0, 0, size, size);
    const icoBlob = await canvasToIcoBlob(canvas);
    const url = URL.createObjectURL(icoBlob);
    const link = document.createElement('a');
    link.download = buildFileName(size, platform, name);
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Download all icons as ZIP
  const downloadAll = async () => {
    if (generatedIcons.size === 0) return;
    setMessage('Building ZIP...');
    const zip = new JSZip();
    const sizesToDownload = ICON_SIZES.filter(s =>
      selectedPlatforms.has(s.platform) && generatedIcons.has(s.size)
    );
    for (const { name, size, platform } of sizesToDownload) {
      const dataUrl = generatedIcons.get(size);
      if (!dataUrl) continue;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = dataUrl; });
      ctx.drawImage(img, 0, 0, size, size);
      const icoBlob = await canvasToIcoBlob(canvas);
      const icoBuffer = await icoBlob.arrayBuffer();
      zip.file(buildFileName(size, platform, name), icoBuffer);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.download = `${originalFileName}_icons.zip`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMessage(`Downloaded ${sizesToDownload.length} icons as ${originalFileName}_icons.zip`);
  };

  // Clear image
  const clearImage = () => {
    setImageSrc(null);
    setOriginalImage(null);
    setOriginalFileName('icon');
    setGeneratedIcons(new Map());
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const filteredSizes = ICON_SIZES.filter(s => selectedPlatforms.has(s.platform));

  // Retro bevel shadows
  const raisedShadow = isDark
    ? 'inset 1px 1px 0 #5a5a6a, inset -1px -1px 0 #0a0a0f'
    : 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080';
  const sunkenShadow = isDark
    ? 'inset -1px -1px 0 #5a5a6a, inset 1px 1px 0 #0a0a0f'
    : 'inset -1px -1px 0 #ffffff, inset 1px 1px 0 #808080';

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div
        className={`px-5 py-3 border-b ${isDark ? 'border-slate-700/50 bg-slate-900/60' : 'border-slate-300 bg-slate-100'}`}
        style={{ boxShadow: raisedShadow }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🎨</span>
              <span className={`font-mono tracking-widest uppercase text-sm ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>IconIt</span>
            </h2>
            <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Generate app icons for all platforms
            </p>
          </div>

          {/* Platform toggles */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            {Object.entries(PLATFORM_COLORS).map(([platform, colors]) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                style={{ boxShadow: selectedPlatforms.has(platform) ? sunkenShadow : raisedShadow }}
                className={`
                  px-2.5 py-1 text-xs font-mono uppercase tracking-wider
                  border transition-none
                  ${selectedPlatforms.has(platform)
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : isDark
                      ? 'bg-slate-800 text-slate-500 border-slate-600'
                      : 'bg-slate-200 text-slate-500 border-slate-400'
                  }
                `}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image preview / upload — shifted upward via pt+pb asymmetry */}
        <div className="flex-1 flex flex-col items-center justify-center pt-2 pb-14 px-6">
          <div
            ref={previewRef}
            style={{ boxShadow: sunkenShadow }}
            className={`
              relative w-64 h-64 overflow-hidden
              ${isDark ? 'bg-slate-800/60' : 'bg-slate-200'}
              border-2
              ${isDark ? 'border-slate-600' : 'border-slate-400'}
              cursor-pointer transition-all
              ${!imageSrc ? 'hover:border-cyan-500 hover:bg-cyan-500/5' : ''}
            `}
            onClick={() => !imageSrc && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {imageSrc ? (
              <>
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${imageSrc})`,
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className={`absolute inset-0 border-2 ${isDark ? 'border-cyan-400/40' : 'border-cyan-600/40'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 ${isDark ? 'border-cyan-400' : 'border-cyan-600'}`} />
                  <div className={`absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 ${isDark ? 'border-cyan-400' : 'border-cyan-600'}`} />
                  <div className={`absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 ${isDark ? 'border-cyan-400' : 'border-cyan-600'}`} />
                  <div className={`absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 ${isDark ? 'border-cyan-400' : 'border-cyan-600'}`} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className={`w-14 h-14 flex items-center justify-center border-2 ${isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-400 bg-slate-300'}`}
                  style={{ boxShadow: sunkenShadow }}>
                  <span className="text-2xl">📷</span>
                </div>
                <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Drop image or click to upload</p>
                <p className={`text-xs font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>PNG · JPG · SVG</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
          </div>

          {/* Controls */}
          {imageSrc && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ZOOM</span>
                <input type="range" min="0.5" max="3" step="0.1" value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-28" />
                <span className={`text-xs font-mono w-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {(zoom * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearImage}
                  style={{ boxShadow: raisedShadow }}
                  className={`px-4 py-1.5 text-xs font-mono uppercase border transition-none
                    ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-500' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-400'}`}
                >
                  Clear
                </button>
                <button
                  onClick={generateIcons}
                  disabled={isProcessing || filteredSizes.length === 0}
                  style={{ boxShadow: isProcessing ? sunkenShadow : raisedShadow }}
                  className={`px-6 py-1.5 text-xs font-mono uppercase font-bold border transition-none
                    ${isDark ? 'bg-cyan-900 text-cyan-300 border-cyan-700 hover:bg-cyan-800' : 'bg-cyan-100 text-cyan-800 border-cyan-400 hover:bg-cyan-200'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? 'Generating...' : 'Generate Icons'}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-3 px-3 py-1.5 text-xs font-mono border
                  ${isDark ? 'bg-slate-800 text-cyan-400 border-cyan-800' : 'bg-white text-cyan-700 border-cyan-400'}`}
                style={{ boxShadow: sunkenShadow }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Retro oldschool frame panel */}
        <div
          className={`w-72 flex flex-col border-l-2 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-400 bg-slate-100'}`}
          style={{ boxShadow: isDark ? '-2px 0 0 #0a0a0f' : '-2px 0 0 #ffffff' }}
        >
          {/* Retro title bar */}
          <div
            className={`flex items-center justify-between px-3 py-1.5 border-b-2 flex-shrink-0
              ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-400 bg-slate-300'}`}
            style={{ boxShadow: raisedShadow }}
          >
            <span className={`text-xs font-mono uppercase tracking-widest font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              ▣ Icon Sizes
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {filteredSizes.length} sizes
              </span>
              {generatedIcons.size > 0 && (
                <button
                  onClick={downloadAll}
                  style={{ boxShadow: raisedShadow }}
                  className={`px-2 py-0.5 text-xs font-mono uppercase border font-bold transition-none
                    ${isDark ? 'bg-emerald-900/60 text-emerald-400 border-emerald-700 hover:bg-emerald-900' : 'bg-emerald-100 text-emerald-700 border-emerald-500 hover:bg-emerald-200'}`}
                >
                  ⬇ ZIP
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list — independent scroll, retro scrollbar */}
          <div
            className={`flex-1 overflow-y-auto p-2`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? '#4a4a6a #1a1a2a' : '#999999 #dddddd',
            }}
          >
            <style>{`
              .retro-scroll::-webkit-scrollbar { width: 12px; }
              .retro-scroll::-webkit-scrollbar-track { background: ${isDark ? '#1a1a2a' : '#d0d0d0'}; box-shadow: inset 1px 1px 0 ${isDark ? '#0a0a1a' : '#808080'}, inset -1px -1px 0 ${isDark ? '#3a3a4a' : '#ffffff'}; }
              .retro-scroll::-webkit-scrollbar-thumb { background: ${isDark ? '#4a4a6a' : '#a0a0a0'}; box-shadow: inset 1px 1px 0 ${isDark ? '#6a6a8a' : '#ffffff'}, inset -1px -1px 0 ${isDark ? '#2a2a3a' : '#606060'}; }
            `}</style>
            <div className="retro-scroll space-y-1">
              {filteredSizes.map(({ name, size, platform }) => {
                const colors = PLATFORM_COLORS[platform];
                const hasIcon = generatedIcons.has(size);

                return (
                  <div
                    key={`${platform}-${size}-${name}`}
                    className={`flex items-center gap-2 px-2 py-1.5 border
                      ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-300'}`}
                    style={{ boxShadow: sunkenShadow }}
                  >
                    {/* Preview thumbnail */}
                    <div
                      className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border
                        ${colors.bg} ${colors.text}
                        ${isDark ? 'border-slate-600' : 'border-slate-400'} overflow-hidden`}
                      style={{ boxShadow: sunkenShadow }}
                    >
                      {hasIcon ? (
                        <img src={generatedIcons.get(size)} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-mono leading-none">{size >= 100 ? size : size}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-mono truncate leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {name}
                      </p>
                      <p className={`text-xs font-mono ${colors.text} opacity-80`}>
                        {size}×{size}
                      </p>
                    </div>

                    {/* Download button */}
                    {hasIcon && (
                      <button
                        onClick={() => downloadIcon(size, name, platform)}
                        style={{ boxShadow: raisedShadow }}
                        className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-mono border transition-none
                          ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border-slate-400'}`}
                        title="Download .ico"
                      >
                        ⬇
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconItPanel;
