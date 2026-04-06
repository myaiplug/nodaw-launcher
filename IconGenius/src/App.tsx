// Global declaration for Electron IPC
declare global {
  interface Window {
    require: any;
  }
}

import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import Cropper from 'react-easy-crop';
import { Upload, Download, Image as ImageIcon, CheckCircle, Smartphone, Zap, X, Save, Minus, Eraser } from 'lucide-react';
import { Area } from 'react-easy-crop/types';
import { removeBackground } from '@imgly/background-removal';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Window Controls
  const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;
  const minimizeWindow = () => ipcRenderer?.send('window-minimize');
  const closeWindow = () => ipcRenderer?.send('window-close');

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onCropComplete = useCallback((_formatted: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setZoom(1);
      setMessage(null);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Uint8Array> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    // Set standard icon size 256x256
    canvas.width = 256;
    canvas.height = 256;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      256,
      256
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Canvas is empty');
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => {
             resolve(new Uint8Array(reader.result as ArrayBuffer));
        }
      }, 'image/png');
    });
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    
    try {
        const pngBuffer = await getCroppedImg(imageSrc, croppedAreaPixels);
        
        // Electron IPC
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('save-icon', pngBuffer);
        
        if (result.success) {
            setMessage(`SAVED: ${result.path}`);
            setTimeout(() => setMessage(null), 3000);
        } else if (result.error !== 'Cancelled') {
            setMessage(`ERROR: ${result.error}`);
        }
    } catch (e: any) {
        setMessage(`ERROR: ${e.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
      if (!imageSrc) return;
      setIsProcessing(true);
      setMessage('REMOVING BACKGROUND...');
      
      try {
          // Convert current src to blob if it isn't already or let lib handle it
          // The lib accepts URL, Blob, File
          const blob = await removeBackground(imageSrc);
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
          setMessage('BACKGROUND REMOVED');
      } catch (err) {
          console.error(err);
          setMessage('REMOVE BG FAILED');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    // Transparent container
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-transparent overflow-hidden">
      
      {/* Device Casing */}
      <div className="device-casing w-full max-w-[600px] p-1 rounded-[32px] overflow-hidden shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Faceplate */}
        <div className="bg-[#2a2a2a] w-full h-full rounded-[28px] p-6 border border-[#333] relative">
            <div className="absolute inset-0 texture-grain rounded-[28px] opacity-20 pointer-events-none"></div>

            {/* Header / Brand Plate */}
            <div className="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4 shadow-[0_1px_0_#3a3a3a] draggable-region">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1a1a1a] to-[#252525] flex items-center justify-center border border-[#111] shadow-[inset_1px_1px_2px_#333]"> 
                        <Zap size={16} className="text-signal-orange" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-widest text-[#bbb] uppercase font-sans">ICON GENIUS</h1>
                        <p className="text-[9px] font-mono text-[#666] uppercase tracking-[0.2em]">Model IG-2000 // PURE ICO</p>
                    </div>
                </div>
                {/* Status LED & Controls */}
                <div className="flex items-center gap-4 no-drag-region">
                     {/* Window Controls */}
                     <div className="flex gap-2 mr-1">
                        <button type="button" title="Minimize" onClick={minimizeWindow} className="p-1 text-[#555] hover:text-[#bbb] transition-colors active:scale-95">
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <button type="button" title="Close" onClick={closeWindow} className="p-1 text-[#555] hover:text-red-500 transition-colors active:scale-95">
                            <X size={14} strokeWidth={3} />
                        </button>
                    </div>
                    
                    <div className="h-4 w-[1px] bg-[#1a1a1a] border-r border-[#333]"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#444] uppercase">POWER</span>
                        <div className="w-2 h-2 rounded-full bg-led-green shadow-[0_0_8px_#00ff41] animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Main Display Area (The "Lens") */}
            <div className="screen-inset w-full h-[360px] mb-6 relative group">
                {!imageSrc ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#333]">
                        <div className="w-24 h-24 border border-[#222] rounded-full flex items-center justify-center mb-4 transition-all group-hover:border-[#444] cursor-pointer">
                            <Upload size={32} className="opacity-50 group-hover:text-signal-orange transition-colors" />
                            <input type="file" onChange={onFileChange} accept="image/*" title="Upload image file" className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload image file" />
                        </div>
                        <p className="font-mono text-xs tracking-widest uppercase">Insert Source Media</p>
                    </div>
                ) : (
                    <>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        showGrid={true}
                        style={{
                            containerStyle: { background: '#080808' },
                            mediaStyle: {  },
                        }}
                    />
                    <div className="screen-glare absolute inset-0 pointer-events-none"></div>
                    </>
                )}
            </div>

            {/* Control Panel */}
            <div className="bg-[#222] rounded-xl p-4 border-t border-[#333] shadow-[inset_0_1px_3px_#000]">
                {/* Sliders/Controls */}
                <div className="flex items-center gap-6 mb-6">
                     <span className="text-[10px] font-bold text-[#555] font-mono w-12 text-right uppercase">Zoom</span>
                     <div className="flex-1 fader-track relative flex items-center px-1">
                        <input 
                            type="range" 
                            value={zoom} 
                            min={1} 
                            max={5} 
                            step={0.1} 
                            disabled={!imageSrc}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            title="Zoom level control"
                            className="w-full chrome-slider appearance-none bg-transparent focus:outline-none z-10" 
                        />
                        {/* Tick marks */}
                        <div className="absolute top-3 left-0 right-0 flex justify-between px-2">
                           {[...Array(11)].map((_, i) => (
                               <div key={i} className="w-px h-1 bg-[#444]"></div>
                           ))}
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-signal-orange font-mono">{(zoom * 100).toFixed(0)}%</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <button 
                        type="button"
                        title="Clear image"
                        onClick={() => setImageSrc(null)} 
                        disabled={!imageSrc}
                        className="mech-btn w-12 h-12 flex items-center justify-center text-[#666] hover:text-[#bbb] disabled:opacity-30 disabled:cursor-not-allowed">
                        <X size={20} strokeWidth={3} />
                    </button>
                    
                    {/* Remove BG Button */}
                    <button 
                        onClick={handleRemoveBackground} 
                        disabled={!imageSrc || isProcessing}
                        title="Remove Background"
                        className="mech-btn w-12 h-12 flex items-center justify-center text-[#666] hover:text-signal-orange disabled:opacity-30 disabled:cursor-not-allowed ml-2">
                        <Eraser size={20} strokeWidth={3} />
                    </button>

                    {/* LCD Message Display */}
                     <div className="flex-1 mx-4 h-10 bg-[#151515] rounded border border-[#000] shadow-[inset_0_2px_4px_#000] flex items-center justify-center overflow-hidden">
                        {message ? (
                            <span className="font-mono text-xs text-signal-orange animate-pulse truncate px-2">{message}</span>
                        ) : (
                            <span className="font-mono text-[10px] text-[#333] uppercase">Ready to Process</span>
                        )}
                     </div>

                    <button 
                        onClick={handleSave} 
                        disabled={!imageSrc || isProcessing} 
                        className="mech-btn-primary px-6 h-12 flex items-center gap-2 font-bold text-sm tracking-wide disabled:opacity-50 disabled:grayscale transition-all disabled:cursor-not-allowed">
                        {isProcessing ? 'BUSY' : 'EXECUTE'}
                    </button>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
}

export default App;
