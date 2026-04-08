/**
 * IconItPanel.tsx
 * Icon generation tool - Create app icons for all platforms
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['ios', 'android', 'windows', 'macos', 'web']));
  const [generatedIcons, setGeneratedIcons] = useState<Map<number, string>>(new Map());
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }
    
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
    
    try {
      for (const size of uniqueSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;
        
        // Calculate crop area based on zoom and position
        const scale = Math.min(originalImage.width, originalImage.height) / 256;
        const cropSize = 256 / zoom * scale;
        const cropX = (originalImage.width - cropSize) / 2 - (position.x * scale / zoom);
        const cropY = (originalImage.height - cropSize) / 2 - (position.y * scale / zoom);
        
        // Draw with anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(
          originalImage,
          Math.max(0, cropX),
          Math.max(0, cropY),
          Math.min(originalImage.width, cropSize),
          Math.min(originalImage.height, cropSize),
          0,
          0,
          size,
          size
        );
        
        newIcons.set(size, canvas.toDataURL('image/png'));
      }
      
      setGeneratedIcons(newIcons);
      setMessage(`Generated ${newIcons.size} icon sizes`);
    } catch (error) {
      setMessage('Error generating icons');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download single icon
  const downloadIcon = (size: number, name: string) => {
    const dataUrl = generatedIcons.get(size);
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${name.replace(/\s+/g, '_')}_${size}x${size}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Download all icons as ZIP
  const downloadAll = async () => {
    if (generatedIcons.size === 0) return;
    
    setMessage('Preparing download...');
    
    // Simple multi-file download (for full ZIP support, would need JSZip)
    const sizesToDownload = ICON_SIZES.filter(s => 
      selectedPlatforms.has(s.platform) && generatedIcons.has(s.size)
    );
    
    for (const { name, size } of sizesToDownload) {
      const dataUrl = generatedIcons.get(size);
      if (!dataUrl) continue;
      
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '_')}_${size}x${size}.png`;
      link.href = dataUrl;
      link.click();
      
      // Small delay between downloads
      await new Promise(r => setTimeout(r, 100));
    }
    
    setMessage('Download complete!');
  };

  // Clear image
  const clearImage = () => {
    setImageSrc(null);
    setOriginalImage(null);
    setGeneratedIcons(new Map());
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const filteredSizes = ICON_SIZES.filter(s => selectedPlatforms.has(s.platform));

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🎨</span>
              IconIt
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Generate app icons for all platforms
            </p>
          </div>
          
          {/* Platform toggles */}
          <div className="flex gap-2">
            {Object.entries(PLATFORM_COLORS).map(([platform, colors]) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider
                  border transition-all
                  ${selectedPlatforms.has(platform)
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : isDark
                      ? 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
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
        {/* Left: Image preview / upload */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div
            ref={previewRef}
            className={`
              relative w-64 h-64 rounded-2xl overflow-hidden
              ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}
              border-2 border-dashed
              ${isDark ? 'border-slate-600' : 'border-slate-300'}
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
                {/* Crop guide overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className={`absolute inset-4 border-2 border-dashed ${isDark ? 'border-white/30' : 'border-black/30'} rounded-lg`} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center`}>
                  <span className="text-3xl">📷</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Drop image or click to upload
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  PNG, JPG, SVG supported
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {/* Controls */}
          {imageSrc && (
            <div className="mt-4 flex flex-col items-center gap-3">
              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Zoom</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {(zoom * 100).toFixed(0)}%
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={clearImage}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    ${isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }
                    transition-colors
                  `}
                >
                  Clear
                </button>
                <button
                  onClick={generateIcons}
                  disabled={isProcessing || filteredSizes.length === 0}
                  className={`
                    px-6 py-2 rounded-lg text-sm font-bold
                    bg-gradient-to-r from-cyan-500 to-blue-500
                    text-white shadow-lg shadow-cyan-500/30
                    hover:shadow-cyan-500/50 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isProcessing ? 'Generating...' : 'Generate Icons'}
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`
                  mt-4 px-4 py-2 rounded-lg text-sm font-mono
                  ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}
                `}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Generated icons list */}
        <div className={`w-80 border-l ${isDark ? 'border-slate-700/50 bg-slate-900/30' : 'border-slate-200 bg-slate-50'} p-4 overflow-y-auto`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Icon Sizes ({filteredSizes.length})
            </h3>
            {generatedIcons.size > 0 && (
              <button
                onClick={downloadAll}
                className={`
                  px-3 py-1 rounded text-xs font-medium
                  bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
                  hover:bg-emerald-500/30 transition-colors
                `}
              >
                Download All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredSizes.map(({ name, size, platform }) => {
              const colors = PLATFORM_COLORS[platform];
              const hasIcon = generatedIcons.has(size);
              
              return (
                <motion.div
                  key={`${platform}-${size}-${name}`}
                  layout
                  className={`
                    flex items-center gap-3 p-3 rounded-lg
                    ${isDark ? 'bg-slate-800/50' : 'bg-white'}
                    border ${colors.border}
                  `}
                >
                  {/* Preview */}
                  <div 
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${colors.bg} ${colors.text}
                      overflow-hidden
                    `}
                  >
                    {hasIcon ? (
                      <img 
                        src={generatedIcons.get(size)} 
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-mono">{size}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {size}×{size}px
                    </p>
                  </div>

                  {/* Download button */}
                  {hasIcon && (
                    <button
                      onClick={() => downloadIcon(size, name)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${isDark 
                          ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                          : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }
                      `}
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconItPanel;
