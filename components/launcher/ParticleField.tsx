/**
 * ParticleField.tsx
 * Interactive particle wall with mouse-reactive flip/wave effects
 * Uses React Three Fiber for 3D rendering
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeStore } from './themeStore';

interface ParticleWallProps {
  gridX?: number;
  gridY?: number;
  primaryColor?: string;
  secondaryColor?: string;
  isDark?: boolean;
}

const ParticleWall: React.FC<ParticleWallProps> = ({
  gridX = 50,
  gridY = 30,
  primaryColor = '#22d3ee',
  secondaryColor = '#a855f7',
  isDark = true
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, size } = useThree();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const particleCount = gridX * gridY;
  
  // Dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store base positions, rotations, and phase offsets
  const particleData = useMemo(() => {
    const data = {
      basePositions: new Float32Array(particleCount * 3),
      rotations: new Float32Array(particleCount * 3),
      phases: new Float32Array(particleCount),
      flipStates: new Float32Array(particleCount),
      colors: new Float32Array(particleCount * 3)
    };
    
    const spacingX = viewport.width / gridX;
    const spacingY = viewport.height / gridY;
    const startX = -viewport.width / 2 + spacingX / 2;
    const startY = -viewport.height / 2 + spacingY / 2;
    
    for (let i = 0; i < gridX; i++) {
      for (let j = 0; j < gridY; j++) {
        const idx = i * gridY + j;
        const idx3 = idx * 3;
        
        // Grid positions
        data.basePositions[idx3] = startX + i * spacingX;
        data.basePositions[idx3 + 1] = startY + j * spacingY;
        data.basePositions[idx3 + 2] = 0;
        
        // Random phase offset for wave animation
        data.phases[idx] = Math.random() * Math.PI * 2;
        
        // Initial flip state
        data.flipStates[idx] = 0;
        
        // Random initial rotations
        data.rotations[idx3] = 0;
        data.rotations[idx3 + 1] = 0;
        data.rotations[idx3 + 2] = Math.random() * Math.PI * 0.1;
      }
    }
    
    return data;
  }, [gridX, gridY, viewport.width, viewport.height, particleCount]);
  
  // Mouse tracking with smooth interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert to normalized device coordinates
      mouseRef.current.targetX = (e.clientX / size.width) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / size.height) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size]);
  
  // Initialize instance colors
  useEffect(() => {
    if (!meshRef.current) return;
    
    const primary = new THREE.Color(primaryColor);
    const secondary = new THREE.Color(secondaryColor);
    
    for (let i = 0; i < particleCount; i++) {
      // Gradient from primary to secondary based on position
      const t = (particleData.basePositions[i * 3] + viewport.width / 2) / viewport.width;
      const color = primary.clone().lerp(secondary, t * 0.5 + Math.random() * 0.2);
      meshRef.current.setColorAt(i, color);
    }
    
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [primaryColor, secondaryColor, particleCount, particleData.basePositions, viewport.width]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Smooth mouse interpolation
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
    
    // Convert mouse to world coordinates
    const mouseWorldX = mouseRef.current.x * viewport.width / 2;
    const mouseWorldY = mouseRef.current.y * viewport.height / 2;
    
    const { basePositions, rotations, phases, flipStates } = particleData;
    const primary = new THREE.Color(primaryColor);
    const secondary = new THREE.Color(secondaryColor);
    const highlight = new THREE.Color(isDark ? '#ffffff' : '#000000');
    
    for (let i = 0; i < particleCount; i++) {
      const idx3 = i * 3;
      const baseX = basePositions[idx3];
      const baseY = basePositions[idx3 + 1];
      
      // Distance from mouse
      const dx = mouseWorldX - baseX;
      const dy = mouseWorldY - baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Mouse influence radius and strength
      const influenceRadius = 1.5;
      const influence = Math.max(0, 1 - dist / influenceRadius);
      const influenceSquared = influence * influence;
      
      // Wave animation
      const waveFreq = 0.8;
      const waveAmp = 0.08;
      const wave = Math.sin(time * waveFreq + phases[i] + baseX * 0.5 + baseY * 0.3) * waveAmp;
      
      // Ripple from mouse
      const ripplePhase = dist * 3 - time * 4;
      const ripple = Math.sin(ripplePhase) * 0.15 * influenceSquared;
      
      // Push away from mouse
      const pushStrength = 0.4;
      const pushX = influence > 0.1 ? (-dx / (dist + 0.001)) * influenceSquared * pushStrength : 0;
      const pushY = influence > 0.1 ? (-dy / (dist + 0.001)) * influenceSquared * pushStrength : 0;
      
      // Z displacement (pop out)
      const zDisplace = wave + ripple + influenceSquared * 0.3;
      
      // Calculate flip rotation based on mouse proximity
      const flipTarget = influenceSquared > 0.2 ? Math.PI : 0;
      flipStates[i] += (flipTarget - flipStates[i]) * 0.1;
      
      // Rotation towards mouse + flip
      const rotX = influenceSquared * Math.PI * 0.5 * Math.sign(dy);
      const rotY = influenceSquared * Math.PI * 0.5 * Math.sign(dx) + flipStates[i];
      const rotZ = rotations[idx3 + 2] + Math.sin(time * 0.3 + phases[i]) * 0.05;
      
      // Apply transformations
      dummy.position.set(
        baseX + pushX,
        baseY + pushY,
        zDisplace
      );
      
      dummy.rotation.set(rotX, rotY, rotZ);
      
      // Scale based on influence (particles grow when mouse is near)
      const baseScale = 0.015;
      const scale = baseScale * (1 + influenceSquared * 1.5);
      dummy.scale.setScalar(scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Dynamic color based on influence
      if (meshRef.current.instanceColor) {
        const t = (baseX + viewport.width / 2) / viewport.width;
        const baseColor = primary.clone().lerp(secondary, t * 0.5);
        const finalColor = baseColor.lerp(highlight, influenceSquared * 0.7);
        meshRef.current.setColorAt(i, finalColor);
      }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, particleCount]}
    >
      <boxGeometry args={[1, 1, 0.3]} />
      <meshStandardMaterial
        color={primaryColor}
        metalness={isDark ? 0.8 : 0.3}
        roughness={isDark ? 0.2 : 0.5}
        emissive={primaryColor}
        emissiveIntensity={isDark ? 0.3 : 0.1}
        transparent
        opacity={isDark ? 0.9 : 0.95}
      />
    </instancedMesh>
  );
};

// Floating accent particles for depth
const FloatingParticles: React.FC<{ count?: number; isDark?: boolean }> = ({ 
  count = 100,
  isDark = true 
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  const [positions, velocities, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * viewport.width * 1.5;
      positions[idx + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
      positions[idx + 2] = (Math.random() - 0.5) * 2;
      
      velocities[idx] = (Math.random() - 0.5) * 0.002;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.002;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.001;
      
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return [positions, velocities, phases];
  }, [count, viewport]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Gentle drift
      posArray[idx] += velocities[idx] + Math.sin(time * 0.5 + phases[i]) * 0.001;
      posArray[idx + 1] += velocities[idx + 1] + Math.cos(time * 0.3 + phases[i]) * 0.001;
      posArray[idx + 2] += velocities[idx + 2];
      
      // Wrap around bounds
      if (Math.abs(posArray[idx]) > viewport.width) posArray[idx] *= -0.9;
      if (Math.abs(posArray[idx + 1]) > viewport.height) posArray[idx + 1] *= -0.9;
      if (Math.abs(posArray[idx + 2]) > 2) posArray[idx + 2] *= -0.9;
    }
    
    posAttr.needsUpdate = true;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={isDark ? '#22d3ee' : '#0f766e'}
        transparent
        opacity={isDark ? 0.5 : 0.7}
        sizeAttenuation
        depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
};

interface ParticleFieldProps {
  className?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ className = '' }) => {
  const theme = useThemeStore(state => state.theme);
  const isDark = theme === 'dark';
  
  // Theme-aware colors
  const bgColor = isDark ? '#020617' : '#f8fafc';
  const primaryColor = isDark ? '#22d3ee' : '#0f766e';
  const secondaryColor = isDark ? '#a855f7' : '#7c3aed';
  
  return (
    <div className={`fixed inset-0 z-0 transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={isDark ? 0.4 : 0.6} />
        <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.6 : 0.8} />
        <pointLight position={[-5, -5, 5]} intensity={isDark ? 0.3 : 0.4} color={secondaryColor} />
        
        {/* Main interactive particle wall */}
        <ParticleWall
          gridX={45}
          gridY={25}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          isDark={isDark}
        />
        
        {/* Background floating particles for depth */}
        <FloatingParticles count={80} isDark={isDark} />
      </Canvas>
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(2,6,23,0.4) 70%, rgba(2,6,23,0.8) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(248,250,252,0.3) 70%, rgba(248,250,252,0.6) 100%)'
        }}
      />
      
      {/* Subtle scan lines - only in dark mode */}
      {isDark && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
          }}
        />
      )}
    </div>
  );
};

export default ParticleField;
