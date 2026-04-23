
/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { PromptDjMidi } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';
import { REGION_PRESETS } from './utils/presets';
import type { PlaybackState, Prompt } from './types';

// Use the standard high-quality native audio model from guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

function main() {
  const initialPrompts = buildInitialPrompts();

  const pdjMidi = new PromptDjMidi(initialPrompts);
  document.body.appendChild(pdjMidi as unknown as Node);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage as unknown as Node);

  const liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(initialPrompts);
  
  // Pass helper reference for FX control
  pdjMidi.liveMusicHelper = liveMusicHelper;

  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;
  
  // Pass analyser and EQ callback to UI
  pdjMidi.audioAnalyser = audioAnalyser;
  pdjMidi.onEqChange = (gains: number[]) => {
    liveMusicHelper.setEqBands(gains);
  };

  // Ensure AudioContext is resumed on any interaction to prevent "not loading" audio issues
  const resumeAudio = async () => {
    if (liveMusicHelper.audioContext.state === 'suspended') {
      await liveMusicHelper.audioContext.resume();
    }
    window.removeEventListener('click', resumeAudio);
    window.removeEventListener('keydown', resumeAudio);
  };
  window.addEventListener('click', resumeAudio);
  window.addEventListener('keydown', resumeAudio);

  (pdjMidi as unknown as HTMLElement).addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    const prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
  }));

  (pdjMidi as unknown as HTMLElement).addEventListener('play-pause', () => {
    liveMusicHelper.playPause();
  });

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<any>; // Using any to avoid SDK version mismatches in types
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason || 'Content filtered');
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  (pdjMidi as unknown as HTMLElement).addEventListener('error', errorToast);

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

}

function buildInitialPrompts() {
  const config = REGION_PRESETS['Atlanta'];
  const defaultSet = config.prompts;

  // Pick 3 random prompts to start at weight = 1
  const startOn = [...defaultSet]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < defaultSet.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = defaultSet[i];
    const { text, color } = prompt;
    prompts.set(promptId, {
      promptId,
      text,
      weight: startOn.includes(prompt) ? 1 : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

main();
