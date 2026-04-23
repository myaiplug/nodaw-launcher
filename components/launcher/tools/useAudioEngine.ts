import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../../../audio/core/AudioEngine';

export function useAudioEngine(): { engineRef: React.MutableRefObject<AudioEngine | null>; ready: boolean } {
  const engineRef = useRef<AudioEngine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const engine = new AudioEngine();
    let mounted = true;

    void engine.init().then(() => {
      if (!mounted) return;
      engineRef.current = engine;
      setReady(true);
    });

    return () => {
      mounted = false;
      void engine.dispose();
      engineRef.current = null;
      setReady(false);
    };
  }, []);

  return { engineRef, ready };
}
