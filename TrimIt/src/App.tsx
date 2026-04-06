import React, { useState, useRef, useEffect, useCallback } from 'react';
import Waveform from './Waveform';
import DownloadModal from './components/DownloadModal';
import { 
  getSamplesFromBuffer, 
  simpleBufferToWave, 
  bufferToMp3,
  sliceBuffer, 
  removeRange, 
  fadeBuffer, 
  reverseBuffer 
} from './audioUtils';

const App: React.FC = () => {
  // --- State ---
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [samples, setSamples] = useState<number[]>([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  
  // Playback Refs
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    // Init AudioContext
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // --- Handlers ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !audioContext) return;
    const file = e.target.files[0];
    setFileName(file.name);
    
    // Stop any playing audio
    stopAudio();

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    setBuffer(audioBuffer);
    setSelection(null);
    setProgress(0);
    startOffsetRef.current = 0;
    
    // Generate samples for waveform (approx 500 bars)
    const data = getSamplesFromBuffer(audioBuffer, 800);
    setSamples(data);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    if (!audioContext || !buffer) return;
    
    // Create source
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    // Determine start time (resume from offset or start of selection)
    let offset = startOffsetRef.current;
    
    // If we have a selection, and we are not currently playing, maybe we want to loop selection?
    // For now, simple play. 
    
    if (selection) {
        // If offset is outside selection, reset to selection start
        const selStart = selection.start * buffer.duration;
        const selEnd = selection.end * buffer.duration;
        if (offset < selStart || offset > selEnd) {
            offset = selStart;
        }
    }
    
    if (offset >= buffer.duration) offset = 0;

    source.start(0, offset);
    sourceRef.current = source;
    startTimeRef.current = audioContext.currentTime - offset;
    setIsPlaying(true);
    
    // Animation Loop
    const loop = () => {
      const current = audioContext.currentTime - startTimeRef.current;
      
      // Check limits
      let shouldStop = false;
      if (current >= buffer.duration) shouldStop = true;
      if (selection) {
          const selEnd = selection.end * buffer.duration;
           // Loop or stop at end of selection? Let's just stop for now or loop if requested.
           // Implementing Stop at selection end
           if (current >= selEnd) shouldStop = true;
      }
      
      if (shouldStop) {
          stopAudio();
          // if loop, restart... simplistic "Trim" usually doesn't loop by default unless checked
          return;
      }

      setProgress(current / buffer.duration);
      startOffsetRef.current = current;
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    
    source.onended = () => {
       // Handled by loop mostly, but cleanup here
    };
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch(e) {}
      sourceRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  };

  const updateBuffer = (newBuffer: AudioBuffer) => {
      stopAudio();
      setBuffer(newBuffer);
      setSamples(getSamplesFromBuffer(newBuffer, 800));
      setSelection(null);
      setProgress(0);
      startOffsetRef.current = 0;
  };

  // --- Edit Actions ---

  const handleCrop = () => {
      if (!audioContext || !buffer || !selection) return;
      const start = selection.start * buffer.duration;
      const end = selection.end * buffer.duration;
      const newBuffer = sliceBuffer(audioContext, buffer, start, end);
      updateBuffer(newBuffer);
  };

  const handleCut = () => {
      if (!audioContext || !buffer || !selection) return;
      const start = selection.start * buffer.duration;
      const end = selection.end * buffer.duration;
      const newBuffer = removeRange(audioContext, buffer, start, end);
      updateBuffer(newBuffer);
  };

  const handleFadeIn = () => {
      if (!audioContext || !buffer || !selection) return;
      // Fade applies to selection
      const start = selection.start * buffer.duration;
      const end = selection.end * buffer.duration;
      const newBuffer = fadeBuffer(audioContext, buffer, start, end, 'in');
      updateBuffer(newBuffer);
  };

  const handleFadeOut = () => {
      if (!audioContext || !buffer || !selection) return;
      const start = selection.start * buffer.duration;
      const end = selection.end * buffer.duration;
      const newBuffer = fadeBuffer(audioContext, buffer, start, end, 'out');
      updateBuffer(newBuffer);
  };

  const handleReverse = () => {
        if (!audioContext || !buffer) return;
        const start = selection ? selection.start * buffer.duration : 0;
        const end = selection ? selection.end * buffer.duration : buffer.duration;
        const newBuffer = reverseBuffer(audioContext, buffer, start, end);
        updateBuffer(newBuffer);
  };

  const handleSave = () => {
      if (!buffer) return;
      const blob = simpleBufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Download handled by modal confirm
  };
    
  const handleDownloadClick = () => {
      setIsDownloadModalOpen(true);
  };

  const performDownload = (name: string, format: 'wav' | 'mp3', bitrate: number) => {
      if (!buffer) return;
      setIsDownloadModalOpen(false); // Close modal
      
      let blob: Blob;
      let extension = format;
      
      if (format === 'mp3') {
          blob = bufferToMp3(buffer, bitrate);
      } else {
          blob = simpleBufferToWave(buffer);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${name}.${extension}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
  };

  // --- UI Components ---
  
  const Button = ({ onClick, children, danger = false }: any) => (
      <button
        type="button"
        tabIndex={0}
        onClick={onClick}
        className={`force-pointer-events px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-100
        border border-opacity-30 rounded-sm shadow-lg
        ${danger
            ? 'border-red-500 text-red-400 bg-red-900/10 hover:bg-red-900/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
            : 'border-cyan-500 text-cyan-400 bg-cyan-900/10 hover:bg-cyan-900/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'}
        disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5
        `}
      >
        {children}
      </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-cyan-500/30 flex flex-col items-center py-10">
      
      {/* Header */}
      <div className="w-full max-w-4xl px-6 mb-8 flex justify-between items-end border-b border-[#222] pb-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                TRIM IT
            </h1>
            <p className="text-xs text-gray-500 font-mono tracking-widest mt-1">INDUSTRIAL AUDIO PROCESSOR</p>
          </div>
          <div className="flex gap-4">
             <label className="cursor-pointer">
                 <span className="px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-cyan-500/50 text-xs font-mono uppercase tracking-widest transition-colors block">
                     {fileName ? 'Open New File' : 'Load Audio (MP3/WAV)'}
                 </span>
                 <input type="file" onChange={handleFileChange} accept=".mp3,.wav,audio/*" className="hidden" />
             </label>
             {buffer && (
                 <Button onClick={handleDownloadClick}>Download Trimmed Audio</Button>
             )}
          </div>
      </div>
      
      <DownloadModal 
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onConfirm={performDownload}
          originalFileName={fileName}
      />

      {/* Main Display */}
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#222] rounded-lg shadow-2xl relative overflow-hidden mb-6 h-64 flex items-center justify-center">
        {!buffer ? (
            <div className="text-center opacity-30">
                <div className="text-6xl mb-4">∿</div>
                <p className="font-mono text-sm">DROP AUDIO HERE OR LOAD FILE</p>
            </div>
        ) : (
            <div className="w-full h-full p-4 relative">
                <Waveform 
                    samples={samples} 
                    progress={progress}
                    selectionStart={selection?.start}
                    selectionEnd={selection?.end}
                    isPlaying={isPlaying}
                    height={220}
                    onSelectionChange={(s, e) => {
                        // Debounce or just set
                        setSelection({ start: s, end: e });
                    }}
                />
                
                {/* Time Overlay */}
                <div className="absolute top-2 right-4 font-mono text-xs text-cyan-500/50 pointer-events-none">
                    {(progress * buffer.duration).toFixed(2)}s / {buffer.duration.toFixed(2)}s
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          
          {/* Transport */}
          <div className="bg-[#0a0a0a] border border-[#222] p-4 flex gap-4 items-center justify-center">
              <Button onClick={handlePlayToggle}>
                  {isPlaying ? 'STOP ■' : 'PLAY ▶'}
              </Button>
               <div className="h-8 w-[1px] bg-[#222]"></div>
              <Button onClick={() => { stopAudio(); setProgress(0); startOffsetRef.current = 0; }}>
                  RESET |&lt;
              </Button>
          </div>

          {/* Edit Tools */}
          <div className="bg-[#0a0a0a] border border-[#222] p-4 flex gap-2 items-center justify-between opacity-100 transition-opacity">
              {!buffer ? (
                 <span className="text-xs text-gray-600 font-mono w-full text-center">LOAD AUDIO TO ENABLE TOOLS</span>
              ) : (
                  <>
                    <Button onClick={handleCrop}>CROP</Button>
                    <Button onClick={handleCut}>CUT</Button>
                    <Button onClick={handleFadeIn}>FADE IN</Button>
                    <Button onClick={handleFadeOut}>FADE OUT</Button>
                    <Button onClick={handleReverse}>REV</Button>
                  </>
              )}
          </div>
      </div>

      {/* Status Footer */}
      <div className="mt-8 text-[10px] text-gray-600 font-mono">
          STATUS: {isPlaying ? 'PLAYING' : 'READY'} {selection ? ` | SELECTION: ${(selection.start*100).toFixed(1)}% - ${(selection.end*100).toFixed(1)}%` : ''}
      </div>

    </div>
  );
};

export default App;
