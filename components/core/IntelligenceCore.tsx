/**
 * IntelligenceCore - 3D Hero Visualization Engine
 * NoDAW Frontend Excellence System
 * 
 * Layer: WebGL Canvas (Layer 2)
 * Purpose: Central visual identity - animated sphere with shaders
 */

import React, { useRef, useMemo, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  MeshDistortMaterial, 
  GradientTexture, 
  Float,
  Sparkles,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '../../launcher/themeStore';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface IntelligenceCoreProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'processing' | 'success' | 'error' | 'idle';
  intensity?: number;
  speed?: number;
  className?: string;
  onClick?: () => void;
}

// ═══════════════════════════════════════════════════════════
// SIZE MAPS
// ═══════════════════════════════════════════════════════════

const sizeConfigs = {
  sm: { radius: 1, particleCount: 50, sparkleCount: 20 },
  md: { radius: 1.5, particleCount: 100, sparkleCount: 40 },
  lg: { radius: 2, particleCount: 150, sparkleCount: 60 },
  xl: { radius: 2.5, particleCount: 200, sparkleCount: 80 },
};

const variantColors = {
  default: { primary: '#7B61FF', secondary: '#00D4FF' },
  processing: { primary: '#00D4FF', secondary: '#7B61FF' },
  success: { primary: '#00FF94', secondary: '#00D4FF' },
  error: { primary: '#FF3366', secondary: '#FF6B9D' },
  idle: { primary: '#4A5568', secondary: '#718096' },
};

// ═══════════════════════════════════════════════════════════
// CORE SPHERE COMPONENT
// ═══════════════════════════════════════════════════════════

interface CoreSphereProps {
  radius: number;
  colors: { primary: string; secondary: string };
  intensity: number;
  speed: number;
  isProcessing: boolean;
}

const CoreSphere: React.FC<CoreSphereProps> = memo(({ 
  radius, 
  colors, 
  intensity, 
  speed,
  isProcessing 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  // Animate distortion
  useFrame((state) => {
    if (materialRef.current) {
      // Pulsating distortion
      const distort = 0.3 + Math.sin(state.clock.elapsedTime * speed) * 0.1 * intensity;
      materialRef.current.distort = distort;
      
      // Processing state: faster, more erratic
      if (isProcessing) {
        materialRef.current.distort = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    }
    
    // Subtle rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      floatingRange={[-0.1, 0.1]}
    >
      <Sphere ref={meshRef} args={[radius, 128, 128]}>
        <MeshDistortMaterial
          ref={materialRef}
          color={colors.primary}
          attach="material"
          distort={0.4}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
        >
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={[colors.primary, colors.secondary, colors.primary]}
            size={1024}
          />
        </MeshDistortMaterial>
      </Sphere>
    </Float>
  );
});

// ═══════════════════════════════════════════════════════════
// ORBITAL RING COMPONENT
// ═══════════════════════════════════════════════════════════

interface OrbitalRingProps {
  radius: number;
  color: string;
  speed: number;
  tilt: number;
}

const OrbitalRing: React.FC<OrbitalRingProps> = memo(({ radius, color, speed, tilt }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += speed * 0.01;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius * 1.3, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
});

// ═══════════════════════════════════════════════════════════
// PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════

interface ParticleFieldProps {
  count: number;
  radius: number;
  color: string;
}

const ParticleField: React.FC<ParticleFieldProps> = memo(({ count, radius, color }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (1.5 + Math.random() * 0.5);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});

// ═══════════════════════════════════════════════════════════
// GLOW EFFECT COMPONENT
// ═══════════════════════════════════════════════════════════

interface GlowEffectProps {
  radius: number;
  color: string;
  intensity: number;
}

const GlowEffect: React.FC<GlowEffectProps> = memo(({ radius, color, intensity }) => {
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * intensity;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={glowRef}>
      <sphereGeometry args={[radius * 1.2, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1 * intensity}
        side={THREE.BackSide}
      />
    </mesh>
  );
});

// ═══════════════════════════════════════════════════════════
// SCENE COMPONENT
// ═══════════════════════════════════════════════════════════

interface SceneProps {
  config: typeof sizeConfigs.md;
  colors: typeof variantColors.default;
  intensity: number;
  speed: number;
  isProcessing: boolean;
}

const Scene: React.FC<SceneProps> = ({ config, colors, intensity, speed, isProcessing }) => {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Key light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        color="#ffffff"
      />
      
      {/* Rim light */}
      <pointLight
        position={[-5, -5, 5]}
        intensity={0.5}
        color={colors.secondary}
      />

      {/* Core sphere */}
      <CoreSphere
        radius={config.radius}
        colors={colors}
        intensity={intensity}
        speed={speed}
        isProcessing={isProcessing}
      />
      
      {/* Glow effect */}
      <GlowEffect
        radius={config.radius}
        color={colors.primary}
        intensity={intensity}
      />
      
      {/* Orbital rings */}
      <OrbitalRing
        radius={config.radius}
        color={colors.primary}
        speed={speed}
        tilt={Math.PI / 4}
      />
      <OrbitalRing
        radius={config.radius}
        color={colors.secondary}
        speed={speed * 0.7}
        tilt={-Math.PI / 6}
      />
      
      {/* Particle field */}
      <ParticleField
        count={config.particleCount}
        radius={config.radius}
        color={colors.secondary}
      />
      
      {/* Sparkles */}
      <Sparkles
        count={config.sparkleCount}
        scale={config.radius * 3}
        size={2}
        speed={0.5}
        color={colors.primary}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const IntelligenceCore: React.FC<IntelligenceCoreProps> = ({
  size = 'md',
  variant = 'default',
  intensity = 1,
  speed = 1,
  className = '',
  onClick,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  const config = sizeConfigs[size];
  const colors = variantColors[variant];
  const isProcessing = variant === 'processing';

  return (
    <div 
      className={`relative ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
      >
        <Scene
          config={config}
          colors={colors}
          intensity={intensity}
          speed={speed}
          isProcessing={isProcessing}
        />
      </Canvas>
      
      {/* CSS glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${colors.primary}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default memo(IntelligenceCore);

// ═══════════════════════════════════════════════════════════
// SELF-CRITIQUE
// ═══════════════════════════════════════════════════════════

/**
 * [SELF-CRITIQUE]
 * 
 * 1. IMPROVEMENT: useFrame runs every frame regardless of visibility.
 *    Should pause animations when component is off-screen using
 *    Intersection Observer.
 * 
 * 2. IMPROVEMENT: Particle positions are regenerated on each count/radius
 *    change. Should use instancedMesh for better GPU performance with
 *    many particles.
 * 
 * 3. IMPROVEMENT: The scene doesn't dispose of geometries/materials on
 *    unmount. Should add cleanup in useEffect to prevent memory leaks.
 */
