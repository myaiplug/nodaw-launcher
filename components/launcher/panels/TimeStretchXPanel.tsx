/**
 * TimeStretchXPanel.tsx
 * Wrapper rendering TimeStretchX inside the standard ToolPanel shell.
 * The tool manages its own file drop so we simply mount it.
 */

import React from 'react';
import TimeStretchX from '../tools/TimeStretchX';

export const TimeStretchXPanel: React.FC = () => (
  <TimeStretchX isOpen={true} onClose={() => {}} />
);

export default TimeStretchXPanel;
