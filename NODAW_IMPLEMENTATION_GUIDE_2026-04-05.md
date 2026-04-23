# NoDAW Implementation Guide — Phase 1: Core Launcher
**Date:** April 5, 2026  
**Priority:** Immediate Action Items

---

## IMMEDIATE EXECUTION PLAN

### Priority Order (Based on Existing Progress)
```
1. [READY]     SplitIt (StemSplit)    → 90% complete, needs launcher integration
2. [READY]     ScrewIt (HalfScrew)    → 85% complete, needs launcher integration  
3. [MIGRATE]   TrimIt                 → 75% complete, already in workspace
4. [BUILD]     ConvertIt              → Components exist in App.tsx
5. [BUILD]     FXit                   → WORKFLOWS defined in constants.tsx
6. [BUILD]     TestIt                 → A/B logic exists in App.tsx
7. [LATER]     Workstation            → 40% complete, Phase 3
```

---

## STEP 1: Consolidate Current Structure

The current project already has solid foundations. Rather than migrating to Turborepo immediately, we can enhance the existing structure:

### Recommended Structure (Minimal Migration)
```
NoDAW-5-in-1/
├── src/                          # Launcher + shared code
│   ├── App.tsx                   # Main app shell
│   ├── launcher/                 # Launcher components
│   │   ├── LauncherApp.tsx       # Main launcher view
│   │   ├── FeatureTile.tsx       # Tool tiles
│   │   ├── ParticleField.tsx     # NEW: 3D background
│   │   ├── UnlockModal.tsx       # Unlock flow
│   │   └── OnboardingSequence.tsx
│   ├── tools/                    # Embedded tools
│   │   ├── split-it/             # StemSplit
│   │   ├── screw-it/             # HalfScrew  
│   │   ├── trim-it/              # TrimIt
│   │   ├── convert-it/           # Converter
│   │   ├── fx-it/                # One-click FX
│   │   └── test-it/              # A/B Compare
│   ├── shared/                   # Shared utilities
│   │   ├── audio-engine/
│   │   ├── license/
│   │   └── ui-components/
│   └── styles/
├── electron/
│   └── main.cjs
├── installers/                   # NEW
│   ├── windows/
│   └── macos/
└── package.json
```

---

## STEP 2: Enhanced 3D Particle System

Create a production-grade particle system for the launcher background:

### `src/launcher/ParticleField.tsx`
```tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  glitchIntensity?: number;
}

const Particles: React.FC<ParticleFieldProps> = ({ 
  count = 1000, 
  color = '#22d3ee',
  glitchIntensity = 0.02
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const glitchRef = useRef(0);
  
  // Generate sphere-distributed positions
  const [positions, velocities, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const baseColor = new THREE.Color(color);
    const glitchRed = new THREE.Color('#ff3355');
    const glitchBlue = new THREE.Color('#3366ff');
    
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const radius = 0.4 + Math.random() * 0.15;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random velocities for organic movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.001;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.001;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      
      // Gradient colors - mostly cyan, some purple accents
      const colorMix = Math.random();
      if (colorMix > 0.9) {
        colors[i * 3] = glitchRed.r;
        colors[i * 3 + 1] = glitchRed.g;
        colors[i * 3 + 2] = glitchRed.b;
      } else if (colorMix > 0.85) {
        colors[i * 3] = glitchBlue.r;
        colors[i * 3 + 1] = glitchBlue.g;
        colors[i * 3 + 2] = glitchBlue.b;
      } else {
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
      }
    }
    
    return [positions, velocities, colors];
  }, [count, color]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const geometry = meshRef.current.geometry;
    const positionAttr = geometry.attributes.position;
    const positions = positionAttr.array as Float32Array;
    
    // Glitch calculation (periodic with random intensity)
    glitchRef.current = Math.sin(time * 3.7) * glitchIntensity;
    
    // Animate particles
    for (let i = 0; i < count; i++) {
      // Organic breathing motion
      const breathe = Math.sin(time * 0.5 + i * 0.01) * 0.002;
      positions[i * 3] += velocities[i * 3] + breathe;
      positions[i * 3 + 1] += velocities[i * 3 + 1] + breathe;
      positions[i * 3 + 2] += velocities[i * 3 + 2];
      
      // Keep within bounds with soft bounce
      for (let j = 0; j < 3; j++) {
        const idx = i * 3 + j;
        if (Math.abs(positions[idx]) > 0.6) {
          velocities[idx] *= -0.8;
        }
      }
    }
    
    positionAttr.needsUpdate = true;
    
    // Slow rotation
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Chromatic aberration layers
const ChromaticParticles: React.FC<ParticleFieldProps> = (props) => {
  return (
    <>
      <Particles {...props} />
      {/* Red offset layer */}
      <group position={[0.008, 0, 0]}>
        <Particles {...props} color="#ff3355" />
      </group>
      {/* Blue offset layer */}
      <group position={[-0.008, 0, 0]}>
        <Particles {...props} color="#3366ff" />
      </group>
    </>
  );
};

export const ParticleField: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-slate-950">
      <Canvas
        camera={{ position: [0, 0, 1.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ChromaticParticles count={800} />
      </Canvas>
    </div>
  );
};

export default ParticleField;
```

---

## STEP 3: Feature Tile with 3D Effects

### `src/launcher/FeatureTile3D.tsx`
```tsx
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface FeatureTileProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tier: 'free' | 'pro' | 'pro_plus';
  locked: boolean;
  onLaunch: () => void;
  onUnlockRequest: () => void;
}

const TIER_COLORS = {
  free: {
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
  },
  pro: {
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    badge: 'bg-purple-950/50 text-purple-400 border-purple-500/30'
  },
  pro_plus: {
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
    badge: 'bg-orange-950/50 text-orange-400 border-orange-500/30'
  }
};

export const FeatureTile3D: React.FC<FeatureTileProps> = ({
  id,
  name,
  description,
  icon,
  tier,
  locked,
  onLaunch,
  onUnlockRequest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  
  const colors = TIER_COLORS[tier];
  
  const handleClick = () => {
    if (locked) {
      onUnlockRequest();
    } else {
      onLaunch();
    }
  };
  
  return (
    <motion.div
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={handleClick}
        className={`
          relative w-48 h-56 p-5 rounded-xl
          bg-slate-900/90 backdrop-blur-xl
          border ${colors.border}
          shadow-2xl ${isHovered ? colors.glow : ''}
          transition-all duration-300
          flex flex-col items-center justify-center gap-3
          overflow-hidden group
          ${locked ? 'cursor-pointer' : 'cursor-pointer'}
        `}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${
              tier === 'free' ? 'rgba(52,211,153,0.1)' : 
              tier === 'pro' ? 'rgba(167,139,250,0.1)' : 
              'rgba(251,146,60,0.1)'
            }, transparent 70%)`
          }}
        />
        
        {/* Shimmer effect for locked tiles */}
        {locked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        )}
        
        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              🔒
            </motion.div>
          </div>
        )}
        
        {/* Icon */}
        <div 
          className={`
            w-16 h-16 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-slate-800 to-slate-900
            border border-slate-700/50
            text-3xl transition-transform duration-300
            ${isHovered && !locked ? 'scale-110' : ''}
          `}
          style={{ transform: 'translateZ(20px)' }}
        >
          {icon}
        </div>
        
        {/* Name */}
        <h3 
          className="text-lg font-tech font-bold text-slate-200 tracking-wide"
          style={{ transform: 'translateZ(15px)' }}
        >
          {name}
        </h3>
        
        {/* Description */}
        <p 
          className="text-[10px] text-slate-500 text-center leading-tight"
          style={{ transform: 'translateZ(10px)' }}
        >
          {description}
        </p>
        
        {/* Tier badge */}
        <span 
          className={`
            absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider
            border ${colors.badge}
          `}
          style={{ transform: 'translateZ(25px)' }}
        >
          {tier === 'free' ? 'FREE' : tier === 'pro' ? 'PRO' : 'PRO+'}
        </span>
      </button>
    </motion.div>
  );
};

export default FeatureTile3D;
```

---

## STEP 4: Unlock Modal with Shatter Animation

### `src/launcher/ShatterUnlockModal.tsx`
```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnlockModalProps {
  open: boolean;
  featureName: string;
  featureTier: 'pro' | 'pro_plus';
  onClose: () => void;
  onUnlock: (key: string) => Promise<boolean>;
}

export const ShatterUnlockModal: React.FC<UnlockModalProps> = ({
  open,
  featureName,
  featureTier,
  onClose,
  onUnlock
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleUnlock = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await onUnlock(licenseKey);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setLicenseKey('');
        }, 1500);
      } else {
        setError('Invalid license key');
      }
    } catch (e) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              relative w-full max-w-md mx-4 p-8 rounded-2xl
              bg-slate-900/95 backdrop-blur-xl
              border ${featureTier === 'pro' ? 'border-purple-500/30' : 'border-orange-500/30'}
              shadow-2xl
            `}
          >
            {/* Success overlay with "shatter" effect */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: [0, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    🔓
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-emerald-400 font-tech text-xl"
                  >
                    UNLOCKED!
                  </motion.div>
                  {/* Confetti particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${
                        ['bg-cyan-400', 'bg-purple-400', 'bg-emerald-400', 'bg-orange-400'][i % 4]
                      }`}
                      initial={{ 
                        x: 0, 
                        y: 0,
                        scale: 0
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 300,
                        y: (Math.random() - 0.5) * 300,
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 1,
                        delay: 0.2 + Math.random() * 0.3
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Lock icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center
                  ${featureTier === 'pro' 
                    ? 'bg-purple-950/50 border border-purple-500/30' 
                    : 'bg-orange-950/50 border border-orange-500/30'
                  }
                `}
              >
                <span className="text-4xl">🔐</span>
              </motion.div>
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-tech font-bold text-center text-slate-200 mb-2">
              Unlock {featureName}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Enter your {featureTier === 'pro' ? 'Pro' : 'Pro+'} license key to unlock this feature.
            </p>
            
            {/* License input */}
            <div className="mb-4">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-slate-950 border 
                  ${error ? 'border-red-500/50' : 'border-slate-700'}
                  text-slate-200 font-mono text-center tracking-wider
                  focus:outline-none focus:border-cyan-500
                  transition-colors
                `}
                disabled={isLoading}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs text-center mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-bold
                  ${featureTier === 'pro'
                    ? 'bg-purple-900 border border-purple-500 text-purple-50 hover:bg-purple-800'
                    : 'bg-orange-900 border border-orange-500 text-orange-50 hover:bg-orange-800'
                  }
                  transition-colors disabled:opacity-50
                `}
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </button>
            </div>
            
            {/* Upgrade link */}
            <div className="mt-6 text-center">
              <span className="text-slate-600 text-sm">Don't have a license? </span>
              <a 
                href="https://nodaw.studio/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline"
              >
                Get {featureTier === 'pro' ? 'Pro' : 'Pro+'}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShatterUnlockModal;
```

---

## STEP 5: Tool Configuration

### `src/constants/tools.ts`
```typescript
export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  tier: 'free' | 'pro' | 'pro_plus';
  component: string;  // Path to lazy-loaded component
  status: 'ready' | 'beta' | 'coming-soon';
}

export const TOOLS: Tool[] = [
  {
    id: 'split-it',
    name: 'SplitIt',
    tagline: 'Audio Stem Separation',
    description: 'Extract vocals, drums, bass, guitar, piano from any audio file. Utilize additional drum seperation model and state of the art one click presets to enhance stems post split, individually enhanced with common workflows included to cover any need',
    icon: '🎵',
    tier: 'pro',
    component: 'tools/split-it/SplitItPanel',
    status: 'ready'
  },
  {
    id: 'screw-it',
    name: 'ScrewIt',
    tagline: 'Pitch & Tempo Warp',
    description: 'Slow, Screwed, or sped up manipulating Time and Pitch of uploaded audio with realtime surgical precision ensuring low end never affected or muffled only enhanced, seperating from other HalfTime tools with this never been seen halftime Bass Boosted Low End.',
    icon: '🔩',
    tier: 'pro',
    component: 'tools/screw-it/ScrewItPanel',
    status: 'ready'
  },
  {
    id: 'trim-it',
    name: 'TrimIt',
    tagline: 'Precision Trimming',
    description: 'Cut, split, and export audio waveform segments with pro-like simplicity & accuracy, easy and fast! Fade in, out, reverse, trim and more for free!',
    icon: '✂️',
    tier: 'free',
    component: 'tools/trim-it/TrimItPanel',
    status: 'ready'
  },
  {
    id: 'convert-it',
    name: 'ConvertIt',
    tagline: 'Format Converter',
    description: 'Convert between MP3, WAV, FLAC, OGG, and more. Each extension option of conversion available for each in all possibly formats. Convert entire audio collections for Free!',
    icon: '🔄',
    tier: 'free',
    component: 'tools/convert-it/ConvertItPanel',
    status: 'ready'
  },
  {
    id: 'fx-it',
    name: 'FXit',
    tagline: 'One-Click Effects',
    description: 'Professional effect chains in a single click, saving user precious time offering industry quality mix and master effects and workflows. Select from vocal fx, instrumental, both, or mastering effects with tweakable settings for intermediete users searching for max creative customization',
    icon: '✨',
    tier: 'pro',
    component: 'tools/fx-it/FXitPanel',
    status: 'ready'
  },
  {
    id: 'test-it',
    name: 'TestIt',
    tagline: 'A/B Comparison',
    description: 'Compare before/after with instant switching with easy to use A/B test tool. Switch back and fourth between effected audio and hear the difference for sure, option to record the test to have saved file option for later proof or quality change, extremely useful tool for FREE!',
    icon: '🔀',
    tier: 'free',
    component: 'tools/test-it/TestItPanel',
    status: 'ready'
  },
  {
    id: 'workstation',
    name: 'NoDAW Workstation',
    tagline: 'Multitrack DAW',
    description: 'Full-featured mixing and rendering workstation, with multi track import capabilities to mix song, add layers, bulk add that producer tag, add a signature or custom sound to one to an entire library of your selection with limited (tracks, features, renders) use for FREE users DAW level features for PRO users.',
    icon: '🎛️',
    tier: 'pro_plus',
    component: 'tools/workstation/WorkstationPanel',
    status: 'beta'
  }
];
```

---

## STEP 6: License System Update

### `src/shared/license/index.ts`
```typescript
export enum LicenseTier {
  FREE = 'free',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus'
}

interface License {
  tier: LicenseTier;
  key: string;
  email?: string;
  activatedAt: number;
  expiresAt: number | null;
}

const TIER_ACCESS: Record<LicenseTier, string[]> = {
  [LicenseTier.FREE]: ['trim-it', 'convert-it', 'test-it'],
  [LicenseTier.PRO]: ['trim-it', 'convert-it', 'test-it', 'split-it', 'screw-it', 'fx-it'],
  [LicenseTier.PRO_PLUS]: ['*']  // All tools
};

class LicenseManager {
  private static STORAGE_KEY = 'nodaw_license';
  private license: License | null = null;
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(LicenseManager.STORAGE_KEY);
      if (stored) {
        this.license = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load license from storage');
    }
  }
  
  private saveToStorage(): void {
    if (this.license) {
      localStorage.setItem(LicenseManager.STORAGE_KEY, JSON.stringify(this.license));
    } else {
      localStorage.removeItem(LicenseManager.STORAGE_KEY);
    }
  }
  
  getCurrentTier(): LicenseTier {
    if (!this.license) return LicenseTier.FREE;
    
    // Check expiration
    if (this.license.expiresAt && Date.now() > this.license.expiresAt) {
      return LicenseTier.FREE;
    }
    
    return this.license.tier;
  }
  
  canAccessTool(toolId: string): boolean {
    const tier = this.getCurrentTier();
    const allowedTools = TIER_ACCESS[tier];
    return allowedTools.includes('*') || allowedTools.includes(toolId);
  }
  
  async activateLicense(key: string): Promise<{ success: boolean; error?: string }> {
    // In production, validate with server
    // For now, accept specific patterns:
    // PRO-XXXX-XXXX-XXXX = Pro license
    // PLUS-XXXX-XXXX-XXXX = Pro+ license
    
    const cleanKey = key.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    if (cleanKey.startsWith('PRO-') && cleanKey.length >= 16) {
      this.license = {
        tier: LicenseTier.PRO,
        key: cleanKey,
        activatedAt: Date.now(),
        expiresAt: null  // Lifetime license
      };
      this.saveToStorage();
      return { success: true };
    }
    
    if (cleanKey.startsWith('PLUS-') && cleanKey.length >= 17) {
      this.license = {
        tier: LicenseTier.PRO_PLUS,
        key: cleanKey,
        activatedAt: Date.now(),
        expiresAt: null
      };
      this.saveToStorage();
      return { success: true };
    }
    
    return { success: false, error: 'Invalid license key format' };
  }
  
  deactivateLicense(): void {
    this.license = null;
    this.saveToStorage();
  }
}

export const licenseManager = new LicenseManager();
export default licenseManager;
```

---

## STEP 7: Required Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.159.0",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/three": "^0.159.0"
  }
}
```

Install with:
```bash
npm install @react-three/fiber @react-three/drei three framer-motion zustand
npm install -D @types/three
```

---

## IMMEDIATE ACTION CHECKLIST

```
□ 1. Install new dependencies (Three.js, R3F, Framer Motion)
□ 2. Create src/launcher/ directory structure
□ 3. Implement ParticleField.tsx (core visual)
□ 4. Implement FeatureTile3D.tsx (interactive tiles)
□ 5. Implement ShatterUnlockModal.tsx (unlock flow)
□ 6. Update license system with tier logic
□ 7. Define TOOLS constant with all 7 tools
□ 8. Update LauncherApp.tsx to use new components
□ 9. Test onboarding sequence
□ 10. Test unlock flow with mock keys
```

---

## Development Commands

```bash
# Start development
npm run dev

# Run Electron dev mode
npm run electron:dev

# Build production
npm run build

# Build installer (Windows)
npm run electron:build
```

---

*Implementation Guide v1.0*  
*April 5, 2026*
