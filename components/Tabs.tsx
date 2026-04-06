import React from 'react';

// Minimal Knob stub for clean build
export const Knob: React.FC<{ value: number, min: number, max: number, onChange: (val: number) => void, label: string, unit?: string, size?: number }> = ({ value, min, max, onChange, label, unit, size = 64 }) => {
  return <div>{label}: {value}{unit}</div>;
};


// Minimal placeholder tab components for app navigation
export const ConvertTab: React.FC<{ onFileLoaded?: (file: File) => void }> = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <h2>Convert Tab</h2>
    <p>This is a placeholder for the Convert tab.</p>
  </div>
);

export const TrimTab: React.FC<any> = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <h2>Trim Tab</h2>
    <p>This is a placeholder for the Trim tab.</p>
  </div>
);

export const CompareTab: React.FC<any> = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <h2>Compare Tab</h2>
    <p>This is a placeholder for the Compare tab.</p>
  </div>
);

export const EffectsTab: React.FC<any> = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <h2>Effects Tab</h2>
    <p>This is a placeholder for the Effects tab.</p>
  </div>
);

export const MultiTrackTab: React.FC<any> = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <h2>MultiTrack Tab</h2>
    <p>This is a placeholder for the MultiTrack tab.</p>
  </div>
);