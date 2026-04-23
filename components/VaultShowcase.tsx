/**
 * VaultShowcase - Demo Component
 * Interactive demonstration of all VAULT paradigm components
 * 
 * NoDAW Frontend Excellence System
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VaultDoor } from './core/VaultDoor';
import { VaultBottomBar } from './core/VaultBottomBar';
import { RotaryKnob, ToggleSwitch, PushButton, SliderControl } from './core/VaultControls';
import { DiagonalFlipPanel } from './core/DiagonalFlipPanel';
import { SoundManagerProvider } from '../hooks/useSoundManager';

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  } as React.CSSProperties,
  
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #00d9ff, #00ffaa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '1rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  
  section: {
    marginBottom: '4rem',
  } as React.CSSProperties,
  
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  
  vaultDemoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    height: '400px',
    margin: '0 auto',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  
  vaultContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  } as React.CSSProperties,
  
  secretContent: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
  } as React.CSSProperties,
  
  secretIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  
  controlPanel: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,
  
  controlLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  } as React.CSSProperties,
  
  flipPanelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  } as React.CSSProperties,
  
  panelContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '0.5rem',
  } as React.CSSProperties,
  
  panelIcon: {
    fontSize: '2rem',
  } as React.CSSProperties,
  
  panelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  } as React.CSSProperties,
  
  bottomBarDemo: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    height: '80px',
    margin: '0 auto',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  
  triggerButton: {
    display: 'block',
    margin: '1rem auto 0',
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #00d9ff 0%, #00ffaa 100%)',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  } as React.CSSProperties,
  
  readout: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
  } as React.CSSProperties,
  
  variantRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
  } as React.CSSProperties,
};

// ═══════════════════════════════════════════════════════════
// VAULT DOOR DEMO
// ═══════════════════════════════════════════════════════════

const VaultDoorDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<'default' | 'emergency' | 'secure' | 'classified'>('default');

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <span>🚪</span> Vault Door
      </h2>
      
      <div style={styles.vaultDemoContainer}>
        <div style={styles.vaultContent}>
          <div style={styles.secretContent}>
            <div style={styles.secretIcon}>🔐</div>
            <p>ACCESS GRANTED</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              TOP SECRET CONTENT
            </p>
          </div>
        </div>
        
        <VaultDoor 
          isOpen={isOpen} 
          variant={variant}
          enableSound={true}
        />
      </div>
      
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={styles.triggerButton}
        >
          {isOpen ? 'CLOSE VAULT' : 'OPEN VAULT'}
        </button>
        
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as typeof variant)}
          style={{
            ...styles.triggerButton,
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <option value="default">Default</option>
          <option value="emergency">Emergency</option>
          <option value="secure">Secure</option>
          <option value="classified">Classified</option>
        </select>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CONTROLS DEMO
// ═══════════════════════════════════════════════════════════

const ControlsDemo: React.FC = () => {
  const [knobValue, setKnobValue] = useState(5);
  const [toggleOn, setToggleOn] = useState(false);
  const [sliderValue, setSliderValue] = useState(0.5);
  const [buttonPressed, setButtonPressed] = useState(false);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <span>🎛️</span> Tactile Controls
      </h2>
      
      <div style={styles.controlPanel}>
        <div style={styles.controlGroup}>
          <span style={styles.controlLabel}>Rotary Knob</span>
          <RotaryKnob
            value={knobValue}
            min={0}
            max={10}
            onChange={setKnobValue}
            detents={11}
            variant="accent"
            enableSound={true}
          />
          <span style={{ color: '#00d9ff', fontFamily: 'monospace' }}>
            {knobValue.toFixed(0)}
          </span>
        </div>
        
        <div style={styles.controlGroup}>
          <span style={styles.controlLabel}>Toggle Switch</span>
          <ToggleSwitch
            isOn={toggleOn}
            onChange={setToggleOn}
            variant={toggleOn ? 'accent' : 'default'}
            enableSound={true}
          />
          <span style={{ color: toggleOn ? '#00ffaa' : '#ff6b6b', fontFamily: 'monospace' }}>
            {toggleOn ? 'ON' : 'OFF'}
          </span>
        </div>
        
        <div style={styles.controlGroup}>
          <span style={styles.controlLabel}>Push Button</span>
          <PushButton
            onPress={() => setButtonPressed(!buttonPressed)}
            variant={buttonPressed ? 'danger' : 'default'}
            mode="toggle"
            enableSound={true}
          >
            {buttonPressed ? 'ACTIVE' : 'PRESS'}
          </PushButton>
        </div>
        
        <div style={styles.controlGroup}>
          <span style={styles.controlLabel}>Slider Control</span>
          <SliderControl
            value={sliderValue}
            onChange={setSliderValue}
            orientation="vertical"
            height={100}
            variant="accent"
            enableSound={true}
          />
          <span style={{ color: '#00d9ff', fontFamily: 'monospace' }}>
            {Math.round(sliderValue * 100)}%
          </span>
        </div>
      </div>
      
      <div style={styles.readout}>
        STATE: knob={knobValue} toggle={toggleOn ? 1 : 0} button={buttonPressed ? 1 : 0} slider={sliderValue.toFixed(2)}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FLIP PANEL DEMO
// ═══════════════════════════════════════════════════════════

const FlipPanelDemo: React.FC = () => {
  const [flippedPanels, setFlippedPanels] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number) => {
    setFlippedPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const panels = [
    { id: 1, direction: 'top-left' as const, frontIcon: '🔊', frontText: 'AUDIO', backIcon: '🔇', backText: 'MUTED' },
    { id: 2, direction: 'top-right' as const, frontIcon: '📡', frontText: 'SIGNAL', backIcon: '📶', backText: 'CONNECTED' },
    { id: 3, direction: 'bottom-left' as const, frontIcon: '🔒', frontText: 'LOCKED', backIcon: '🔓', backText: 'UNLOCKED' },
    { id: 4, direction: 'bottom-right' as const, frontIcon: '⚡', frontText: 'POWER', backIcon: '💤', backText: 'STANDBY' },
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <span>🔄</span> Diagonal Flip Panels
      </h2>
      
      <div style={styles.flipPanelGrid}>
        {panels.map(panel => (
          <div key={panel.id} onClick={() => toggleFlip(panel.id)} style={{ cursor: 'pointer' }}>
            <DiagonalFlipPanel
              isFlipped={flippedPanels[panel.id] || false}
              flipDirection={panel.direction}
              width={280}
              height={120}
              enableSound={true}
              frontContent={
                <div style={styles.panelContent as React.CSSProperties}>
                  <div style={styles.panelIcon}>{panel.frontIcon}</div>
                  <div style={styles.panelText}>{panel.frontText}</div>
                </div>
              }
              backContent={
                <div style={styles.panelContent as React.CSSProperties}>
                  <div style={styles.panelIcon}>{panel.backIcon}</div>
                  <div style={{ ...styles.panelText, color: '#00ffaa' }}>{panel.backText}</div>
                </div>
              }
            />
          </div>
        ))}
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
        Click panels to flip • Each corner uses different diagonal axis
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// BOTTOM BAR DEMO
// ═══════════════════════════════════════════════════════════

const BottomBarDemo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <span>▬</span> Vault Bottom Bar
      </h2>
      
      <div style={styles.bottomBarDemo}>
        <VaultBottomBar 
          isActive={isActive}
          height={60}
          holdDuration={1000}
          speedMultiplier={1}
          enableSound={true}
        />
      </div>
      
      <button
        onClick={() => setIsActive(!isActive)}
        style={styles.triggerButton}
      >
        {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SHOWCASE
// ═══════════════════════════════════════════════════════════

export const VaultShowcase: React.FC = () => {
  return (
    <SoundManagerProvider>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>THE VAULT</h1>
          <p style={styles.subtitle}>Frontend Excellence System • Component Showcase</p>
        </header>
        
        <VaultDoorDemo />
        <ControlsDemo />
        <FlipPanelDemo />
        <BottomBarDemo />
        
        <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          NoDAW Frontend Excellence System • VAULT Paradigm v1.0
        </footer>
      </div>
    </SoundManagerProvider>
  );
};

export default VaultShowcase;
