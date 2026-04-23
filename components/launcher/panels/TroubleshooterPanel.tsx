import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type InstallError,
  type InstallProgress,
  type SystemInfo,
  detectSystemInfo,
  runPreInstallChecks,
  autoTroubleshoot,
  generateTroubleshootReport,
  ERROR_SOLUTIONS,
} from '../utils/installerUtils';

interface Props {
  onClose: () => void;
}

// Error counter store (persisted across sessions)
const getErrorCounter = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem('nodaw_error_counter');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const incrementError = (code: string): number => {
  const counter = getErrorCounter();
  counter[code] = (counter[code] || 0) + 1;
  localStorage.setItem('nodaw_error_counter', JSON.stringify(counter));
  return counter[code];
};

const getTotalErrors = (): number => {
  const counter = getErrorCounter();
  return Object.values(counter).reduce((a, b) => a + b, 0);
};

export default function TroubleshooterPanel({ onClose }: Props) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [checks, setChecks] = useState<Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }>>([]);
  const [errors, setErrors] = useState<InstallError[]>([]);
  const [progress, setProgress] = useState<InstallProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errorCounts, setErrorCounts] = useState<Record<string, number>>(getErrorCounter());
  const [totalErrors, setTotalErrors] = useState(getTotalErrors());

  // Run system scan
  const runScan = useCallback(async () => {
    setIsScanning(true);
    setFixResult(null);
    
    try {
      // Detect system info
      const info = await detectSystemInfo();
      setSystemInfo(info);
      
      // Run pre-install checks
      const result = await runPreInstallChecks();
      setChecks(result.checks);
      
      // Convert failed checks to errors
      const foundErrors: InstallError[] = result.checks
        .filter(c => c.status === 'fail')
        .map(c => ({
          code: c.name.toUpperCase().replace(/\s+/g, '_'),
          message: c.message,
          severity: 'error' as const,
          autoFixable: false,
        }));
      
      setErrors(foundErrors);
      
      // Update error counter
      foundErrors.forEach(e => incrementError(e.code));
      setErrorCounts(getErrorCounter());
      setTotalErrors(getTotalErrors());
      
    } catch (e) {
      console.error('Scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Initial scan
  useEffect(() => {
    runScan();
  }, [runScan]);

  // Attempt auto-fix
  const handleAutoFix = async (error: InstallError) => {
    if (!systemInfo) return;
    
    setIsFixing(true);
    setFixResult(null);
    
    const result = await autoTroubleshoot(error, systemInfo, setProgress);
    setFixResult(result);
    setIsFixing(false);
    setProgress(null);
    
    if (result.success) {
      // Re-scan after successful fix
      await runScan();
    }
  };

  // Copy report to clipboard
  const copyReport = () => {
    if (!systemInfo) return;
    const report = generateTroubleshootReport(errors, systemInfo);
    navigator.clipboard.writeText(report);
  };

  // Clear error counter
  const clearErrorCounter = () => {
    localStorage.removeItem('nodaw_error_counter');
    setErrorCounts({});
    setTotalErrors(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-[700px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-600/90 to-red-600/90 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Auto Troubleshooter</h2>
                <p className="text-white/70 text-sm">Diagnose and fix installation issues</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Error Counter */}
          <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-400">{totalErrors}</span>
              </div>
              <div>
                <div className="text-white font-medium">Total Errors Encountered</div>
                <div className="text-white/50 text-sm">Lifetime error counter across all sessions</div>
              </div>
            </div>
            <button
              onClick={clearErrorCounter}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Reset Counter
            </button>
          </div>

          {/* System Info */}
          {systemInfo && (
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                System Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/50 text-xs uppercase tracking-wide">Platform</div>
                  <div className="text-white font-medium capitalize">{systemInfo.platform}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/50 text-xs uppercase tracking-wide">Architecture</div>
                  <div className="text-white font-medium">{systemInfo.arch}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/50 text-xs uppercase tracking-wide">OS Version</div>
                  <div className="text-white font-medium">{systemInfo.osVersion}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/50 text-xs uppercase tracking-wide">RAM</div>
                  <div className="text-white font-medium">{systemInfo.ramGB}GB</div>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Install Checks */}
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                System Checks
              </h3>
              <button
                onClick={runScan}
                disabled={isScanning}
                className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Re-scan'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {checks.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        check.status === 'pass' ? 'bg-green-500/10 border border-green-500/20' :
                        check.status === 'warn' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                        'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {check.status === 'pass' ? (
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : check.status === 'warn' ? (
                          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="font-medium text-white">{check.name}</span>
                      </div>
                      <span className={`text-sm ${
                        check.status === 'pass' ? 'text-green-400' :
                        check.status === 'warn' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {check.message}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Errors and Fixes */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Issues Found ({errors.length})
              </h3>
              <div className="space-y-3">
                {errors.map((error, i) => {
                  const solution = ERROR_SOLUTIONS[error.code];
                  const count = errorCounts[error.code] || 1;
                  
                  return (
                    <div key={i} className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">{error.message}</div>
                          <div className="text-sm text-white/50">
                            Error code: {error.code} 
                            {count > 1 && <span className="text-red-400 ml-2">(occurred {count}x)</span>}
                          </div>
                        </div>
                        {solution?.autoFix && (
                          <button
                            onClick={() => handleAutoFix(error)}
                            disabled={isFixing}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isFixing ? 'Fixing...' : 'Auto-Fix'}
                          </button>
                        )}
                      </div>
                      {solution && (
                        <div className="text-sm text-white/70 bg-black/20 rounded-lg p-3 mt-2">
                          <strong>Solution:</strong> {solution.manualFix}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress */}
          <AnimatePresence>
            {progress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full" />
                  <span className="text-blue-300 font-medium">{progress.step}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className="text-sm text-white/50 mt-2">{progress.message}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fix Result */}
          <AnimatePresence>
            {fixResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 border ${
                  fixResult.success 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {fixResult.success ? (
                    <svg className="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <div className={`font-medium ${fixResult.success ? 'text-green-300' : 'text-yellow-300'}`}>
                      {fixResult.success ? 'Issue Fixed!' : 'Manual Action Required'}
                    </div>
                    <div className="text-white/70 text-sm mt-1">{fixResult.message}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Clear */}
          {!isScanning && errors.length === 0 && checks.length > 0 && (
            <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20 text-center">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xl font-bold text-green-300">All Systems Go!</div>
              <div className="text-green-400/70 mt-1">No issues detected. Your system is ready.</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/50 backdrop-blur-sm border-t border-white/5 p-4 flex items-center justify-between">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Report
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
