/**
 * DevConsole.tsx
 * Advanced developer tools for NoDAW
 * Access internal APIs, debug audio processing, view telemetry
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../themeStore';
import { useLicenseStore } from '../licenseStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface DevConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug' | 'system';
  source: string;
  message: string;
  data?: any;
}

type TabId = 'console' | 'state' | 'audio' | 'network' | 'storage' | 'performance';

// ═══════════════════════════════════════════════════════════
// MOCK SYSTEM DATA
// ═══════════════════════════════════════════════════════════

const generateMockLogs = (): LogEntry[] => [
  { id: '1', timestamp: new Date(), level: 'system', source: 'Core', message: 'NoDAW DevConsole initialized' },
  { id: '2', timestamp: new Date(Date.now() - 1000), level: 'info', source: 'AudioEngine', message: 'WebAudio context created (48000Hz)' },
  { id: '3', timestamp: new Date(Date.now() - 2000), level: 'debug', source: 'LicenseStore', message: 'License tier: FREE' },
  { id: '4', timestamp: new Date(Date.now() - 3000), level: 'info', source: 'ThemeStore', message: 'Theme loaded: dark' },
  { id: '5', timestamp: new Date(Date.now() - 5000), level: 'warn', source: 'AudioBuffer', message: 'Large file detected, consider chunked loading' },
];

const COMMANDS: { cmd: string; description: string; handler: (args: string[]) => string }[] = [
  { cmd: 'help', description: 'Show available commands', handler: () => 
    'Available commands:\n' + COMMANDS.map(c => `  ${c.cmd.padEnd(15)} - ${c.description}`).join('\n')
  },
  { cmd: 'clear', description: 'Clear console output', handler: () => '__CLEAR__' },
  { cmd: 'version', description: 'Show NoDAW version', handler: () => 'NoDAW Studio v1.2.0 (build 2026.04.14)' },
  { cmd: 'license', description: 'Show license info', handler: () => 'License: FREE\nFeatures: Basic stem separation, limited exports' },
  { cmd: 'audio.info', description: 'Show audio context info', handler: () => 
    'AudioContext:\n  State: running\n  Sample Rate: 48000\n  Base Latency: 0.01s\n  Output Latency: 0.02s'
  },
  { cmd: 'audio.devices', description: 'List audio devices', handler: () => 
    'Output Devices:\n  [0] Default - Speakers (System)\n  [1] Headphones (USB)\n\nInput Devices:\n  [0] Default Microphone'
  },
  { cmd: 'memory', description: 'Show memory usage', handler: () => {
    const used = Math.floor(Math.random() * 200 + 100);
    return `Memory Usage:\n  JS Heap: ${used}MB / 4096MB\n  Audio Buffers: ${Math.floor(used * 0.3)}MB\n  DOM: ${Math.floor(used * 0.1)}MB`;
  }},
  { cmd: 'storage', description: 'Show storage info', handler: () => 
    'LocalStorage: 2.1MB / 5MB\nIndexedDB: 45MB\nCache: 12MB'
  },
  { cmd: 'debug.on', description: 'Enable debug mode', handler: () => '✓ Debug mode enabled' },
  { cmd: 'debug.off', description: 'Disable debug mode', handler: () => '✓ Debug mode disabled' },
  { cmd: 'theme.toggle', description: 'Toggle dark/light theme', handler: () => '✓ Theme toggled' },
  { cmd: 'unlock.pro', description: 'Unlock PRO features (dev)', handler: () => '✓ PRO features unlocked (dev mode)' },
  { cmd: 'state.dump', description: 'Dump all store states', handler: () => 
    'Stores:\n  licenseStore: { tier: "FREE", isDevMode: true }\n  themeStore: { theme: "dark" }\n  secretToolsStore: { isUnlocked: true, installedTools: [...] }'
  },
  { cmd: 'perf.mark', description: 'Create performance mark', handler: (args) => 
    `Performance mark "${args[0] || 'mark'}" created at ${Date.now()}`
  },
  { cmd: 'gpu.info', description: 'Show GPU info', handler: () => 
    'GPU: WebGL 2.0\nRenderer: ANGLE (NVIDIA)\nMax Texture Size: 16384\nShader Precision: highp'
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export const DevConsole: React.FC<DevConsoleProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const { toggleDevMode, isDevMode } = useLicenseStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('console');
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs());
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>(['Type "help" for available commands']);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeTab]);
  
  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);
  
  // Handle command execution
  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    // Add to history
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    
    // Parse command
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Find and execute
    const handler = COMMANDS.find(c => c.cmd === command);
    
    if (handler) {
      const result = handler.handler(args);
      if (result === '__CLEAR__') {
        setOutput([]);
      } else {
        setOutput(prev => [...prev, `> ${trimmed}`, result]);
      }
    } else {
      setOutput(prev => [...prev, `> ${trimmed}`, `Unknown command: ${command}. Type "help" for available commands.`]);
    }
    
    setInput('');
  }, []);
  
  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete
      const matches = COMMANDS.filter(c => c.cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0].cmd);
      } else if (matches.length > 1) {
        setOutput(prev => [...prev, `Matches: ${matches.map(m => m.cmd).join(', ')}`]);
      }
    }
  };
  
  // Add log
  const addLog = (level: LogEntry['level'], source: string, message: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      source,
      message
    }, ...prev].slice(0, 100));
  };
  
  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'console', label: 'Console', icon: '>' },
    { id: 'state', label: 'State', icon: '📦' },
    { id: 'audio', label: 'Audio', icon: '🔊' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'storage', label: 'Storage', icon: '💾' },
    { id: 'performance', label: 'Perf', icon: '📊' }
  ];
  
  const levelColors: Record<LogEntry['level'], string> = {
    info: 'text-cyan-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    debug: 'text-slate-500',
    system: 'text-purple-400'
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col
                 bg-[#0d1117] border border-slate-800"
        style={{
          fontFamily: 'Menlo, Monaco, Consolas, monospace'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-sm text-slate-400">NoDAW DevConsole</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDevMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              {isDevMode ? 'DEV MODE' : 'NORMAL'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleDevMode('nodaw-dev-2026')}
              className={`px-2 py-1 text-[10px] rounded transition-colors
                ${isDevMode 
                  ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70' 
                  : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/70'
                }`}
            >
              {isDevMode ? 'Disable Dev' : 'Enable Dev'}
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center
                       text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0d1117]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs flex items-center gap-1.5 border-b-2 transition-colors
                ${activeTab === tab.id 
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && (
            <div className="h-full flex flex-col">
              {/* Output */}
              <div
                ref={outputRef}
                className="flex-1 overflow-y-auto p-4 text-sm text-slate-300 space-y-1"
              >
                {output.map((line, i) => (
                  <div key={i} className={line.startsWith('>') ? 'text-cyan-400' : 'text-slate-400 whitespace-pre-wrap'}>
                    {line}
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex items-center gap-2 p-2 border-t border-slate-800 bg-[#161b22]">
                <span className="text-emerald-400">❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent text-slate-200 text-sm outline-none placeholder-slate-600"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'state' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {/* License Store */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-2">licenseStore</div>
                  <pre className="text-[11px] text-slate-400 overflow-x-auto">
{`{
  "tier": "FREE",
  "isDevMode": ${isDevMode},
  "activationDate": null,
  "expirationDate": null
}`}
                  </pre>
                </div>
                
                {/* Theme Store */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-2">themeStore</div>
                  <pre className="text-[11px] text-slate-400">
{`{
  "theme": "${theme}"
}`}
                  </pre>
                </div>
                
                {/* Secret Tools Store */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-2">secretToolsStore</div>
                  <pre className="text-[11px] text-slate-400">
{`{
  "isUnlocked": true,
  "installedTools": ["smart-prompt-it"],
  "isMenuOpen": true
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'audio' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Audio Context */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-3">AudioContext</div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">State</span>
                      <span className="text-emerald-400">running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sample Rate</span>
                      <span className="text-slate-300">48000 Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Latency</span>
                      <span className="text-slate-300">0.01s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Output Latency</span>
                      <span className="text-slate-300">0.02s</span>
                    </div>
                  </div>
                </div>
                
                {/* Active Nodes */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-3">Active Nodes</div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">GainNode</span>
                      <span className="text-slate-300">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AnalyserNode</span>
                      <span className="text-slate-300">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AudioBufferSourceNode</span>
                      <span className="text-slate-300">0</span>
                    </div>
                  </div>
                </div>
                
                {/* Buffer Pool */}
                <div className="col-span-2 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-3">Buffer Pool</div>
                  <div className="h-24 flex items-end gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-cyan-500/50 rounded-t"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                    <span>0s</span>
                    <span>Buffer Usage</span>
                    <span>5s</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'network' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="text-xs text-slate-500 mb-4">Network requests (last 5 minutes)</div>
              <div className="space-y-2">
                {[
                  { url: 'localhost:3001/api/license/validate', status: 200, time: '45ms', size: '1.2KB' },
                  { url: 'localhost:3001/api/stems/models', status: 200, time: '120ms', size: '4.5KB' },
                  { url: 'localhost:3001/assets/sounds/unlock.wav', status: 404, time: '12ms', size: '0B' },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded bg-slate-900/50 text-[11px]">
                    <span className={req.status === 200 ? 'text-emerald-400' : 'text-red-400'}>
                      {req.status}
                    </span>
                    <span className="flex-1 text-slate-300 truncate">{req.url}</span>
                    <span className="text-slate-500">{req.time}</span>
                    <span className="text-slate-500">{req.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'storage' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-2">LocalStorage</div>
                  <div className="text-2xl text-slate-200">2.1 MB</div>
                  <div className="text-[10px] text-slate-500">of 5 MB</div>
                  <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-purple-400 mb-2">IndexedDB</div>
                  <div className="text-2xl text-slate-200">45 MB</div>
                  <div className="text-[10px] text-slate-500">Audio cache</div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-emerald-400 mb-2">Session</div>
                  <div className="text-2xl text-slate-200">128 KB</div>
                  <div className="text-[10px] text-slate-500">Temp data</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="text-xs text-cyan-400 mb-3">Storage Keys</div>
                <div className="space-y-1 text-[11px] max-h-40 overflow-y-auto">
                  {[
                    'nodaw-license', 'nodaw-theme', 'nodaw-secret-tools',
                    'nodaw-recent-files', 'nodaw-preferences', 'nodaw-workstation-state'
                  ].map((key, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">{key}</span>
                      <button className="text-red-400 hover:text-red-300 text-[9px]">Clear</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* FPS */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-emerald-400 mb-2">Frame Rate</div>
                  <div className="text-3xl text-slate-200">60 <span className="text-sm text-slate-500">fps</span></div>
                  <div className="mt-2 h-16 flex items-end gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/50 rounded-t"
                        style={{ height: `${Math.random() * 20 + 80}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Memory */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-amber-400 mb-2">JS Heap</div>
                  <div className="text-3xl text-slate-200">142 <span className="text-sm text-slate-500">MB</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">of 4096 MB limit</div>
                  <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '3.5%' }} />
                  </div>
                </div>
                
                {/* CPU */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-cyan-400 mb-2">CPU Usage</div>
                  <div className="text-3xl text-slate-200">8<span className="text-sm text-slate-500">%</span></div>
                  <div className="mt-2 h-16 flex items-end gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-cyan-500/50 rounded-t"
                        style={{ height: `${Math.random() * 15 + 5}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Timings */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="text-xs text-purple-400 mb-2">Render Timings</div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Paint</span>
                      <span className="text-slate-300">2.4ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Script Eval</span>
                      <span className="text-slate-300">0.8ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Layout</span>
                      <span className="text-slate-300">0.3ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Composite</span>
                      <span className="text-slate-300">1.2ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Logs Panel (collapsible) */}
        <div className="border-t border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Event Log</span>
            <span className="text-[10px] text-slate-600">{logs.length} entries</span>
          </div>
          <div className="max-h-32 overflow-y-auto p-2 space-y-1 text-[10px]">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center gap-2">
                <span className="text-slate-600 w-16">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`w-12 ${levelColors[log.level]}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-500 w-24">{log.source}</span>
                <span className="text-slate-400 flex-1 truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DevConsole;
