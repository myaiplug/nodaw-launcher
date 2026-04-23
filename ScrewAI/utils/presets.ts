
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptPreset {
  text: string;
  color: string;
}

export interface RegionConfig {
  bpm: number;
  description: string;
  themeColor: string;
  prompts: PromptPreset[];
}

export const NEGATIVE_PROMPTS = "DO NOT GENERATE: Pop, EDM, Electronic Dance Music, Dubstep, Techno, House, Trance, Rock, Metal, Country, Classical, Jazz. STRICTLY HIP HOP / TRAP / RAP ONLY.";

export const REGION_PRESETS: Record<string, RegionConfig> = {
  'Atlanta': {
    bpm: 140,
    description: "Modern Atlanta Trap music. Fast hi-hat rolls, heavy distorted 808s, dark melodies.",
    themeColor: '#b30000',
    prompts: [
      { color: '#800000', text: 'Distorted 808 Bass' },
      { color: '#a00000', text: 'Hard Punchy Kick' },
      { color: '#c00000', text: 'Sharp Trap Snare' },
      { color: '#e00000', text: 'Fast Hi-Hat Rolls' },
      { color: '#ff0000', text: 'Loud Hand Clap' },
      { color: '#ff4000', text: 'Open Hi-Hat' },
      { color: '#ff8000', text: 'Metallic Percussion' },
      { color: '#ffbf00', text: 'Dark Minor Piano' },
      { color: '#ffff00', text: 'Synthetic Brass' },
      { color: '#80ff00', text: 'Tubular Bell Synth' },
      { color: '#00ff00', text: 'Trap Flute Melody' },
      { color: '#00ffff', text: 'Sawtooth Lead' },
      { color: '#0080ff', text: 'Gothic Choir Pad' },
      { color: '#0000ff', text: 'Dark Ambient Pad' },
      { color: '#8000ff', text: 'Ad-lib FX' },
    ]
  },
  'New York': {
    bpm: 90,
    description: "New York Boom Bap and Drill. Gritty textures, hard hitting drums, sample-based feel.",
    themeColor: '#333333',
    prompts: [
      { color: '#333333', text: 'Grimy Boom Bap Kick' },
      { color: '#555555', text: 'Heavy Bap Snare' },
      { color: '#777777', text: 'Closed Hi-Hat Swing' },
      { color: '#999999', text: 'Open Hat Jazz' },
      { color: '#4a4a4a', text: 'Vinyl Crackle Noise' },
      { color: '#5C4033', text: 'Upright Jazz Bass' },
      { color: '#8B4513', text: 'Brass Horn Stab' },
      { color: '#A0522D', text: 'Soul Sample Chop' },
      { color: '#CD853F', text: 'Hard Grand Piano' },
      { color: '#D2691E', text: 'Police Siren FX' },
      { color: '#FF4500', text: 'Sliding Drill 808' },
      { color: '#FF8C00', text: 'Slide Bass Glides' },
      { color: '#FFD700', text: 'Vocal Chant Hey' },
      { color: '#DAA520', text: 'Shaker Loop' },
      { color: '#B8860B', text: 'Orchestra Hit' },
    ]
  },
  'Detroit': {
    bpm: 190,
    description: "Detroit Scam Rap style. Fast tempo, punchy drums, off-beat piano, heavy bass.",
    themeColor: '#0000CD',
    prompts: [
      { color: '#000080', text: 'Punchy Dry Kick' },
      { color: '#0000CD', text: 'Detroit Pluck Bass' },
      { color: '#4169E1', text: 'Rimshot Snare' },
      { color: '#1E90FF', text: 'Fast Ticking Hat' },
      { color: '#00BFFF', text: 'Dry Clap' },
      { color: '#87CEFA', text: 'Zap Synth Bass' },
      { color: '#4682B4', text: 'Fast Piano Run' },
      { color: '#5F9EA0', text: 'FM Bell Melody' },
      { color: '#00CED1', text: 'Synth Pluck Lead' },
      { color: '#20B2AA', text: 'Staccato String' },
      { color: '#48D1CC', text: 'Vocal Shot' },
      { color: '#40E0D0', text: 'Open Hi-Hat' },
      { color: '#00FA9A', text: 'Percussion Loop' },
      { color: '#00FF7F', text: 'Electric Rhodes' },
      { color: '#32CD32', text: 'Detroit Lead' },
    ]
  },
  'Bay Area': {
    bpm: 98,
    description: "Bay Area Hyphy style. Heavy basslines, snaps, ratchets, energetic synths.",
    themeColor: '#FFD700',
    prompts: [
      { color: '#FFD700', text: 'Mob Style Bass' },
      { color: '#FFA500', text: 'Loud Finger Snap' },
      { color: '#FF8C00', text: 'Ratchet Hi-Hat' },
      { color: '#FF4500', text: 'Thumping Kick' },
      { color: '#FF0000', text: 'Sharp Clap' },
      { color: '#DC143C', text: 'Hyphy Whistle' },
      { color: '#B22222', text: 'Hey Vocal Chant' },
      { color: '#8B0000', text: '808 Cowbell' },
      { color: '#800080', text: 'Synth Brass Hit' },
      { color: '#4B0082', text: 'Vocal Chop' },
      { color: '#483D8B', text: 'Woodblock Perc' },
      { color: '#6A5ACD', text: 'Sub Sine Bass' },
      { color: '#7B68EE', text: 'Fast Shaker' },
      { color: '#9370DB', text: 'Synth Stab' },
      { color: '#BA55D3', text: 'Scratch FX' },
    ]
  },
  'Houston': {
    bpm: 130, // Often chopped and screwed feel, but base tempo implies double time or slow 65
    description: "Houston Chopped and Screwed influence. Deep bass, slow groove, psychedelic.",
    themeColor: '#800080',
    prompts: [
      { color: '#4B0082', text: 'Deep 808 Kick' },
      { color: '#800080', text: 'Heavy Reverb Snare' },
      { color: '#8A2BE2', text: 'Slow Rolling Hat' },
      { color: '#9400D3', text: 'Loud Clap' },
      { color: '#9932CC', text: 'Deep Sub Bass' },
      { color: '#BA55D3', text: 'Screwed Vocal' },
      { color: '#DA70D6', text: 'G-Funk Lead' },
      { color: '#EE82EE', text: 'Church Organ' },
      { color: '#DDA0DD', text: 'Vinyl Scratch' },
      { color: '#FF00FF', text: 'Ambient Pad' },
      { color: '#FF1493', text: 'Chopped Sample' },
      { color: '#C71585', text: 'Metallic Perc' },
      { color: '#DB7093', text: 'Open Hat' },
      { color: '#FF69B4', text: 'Orchestra Hit' },
      { color: '#FFB6C1', text: 'Low Sine Sub' },
    ]
  },
  'Louisiana': {
    bpm: 160, // Bounce tempo
    description: "New Orleans Bounce. Triggerman beat, high energy, call and response.",
    themeColor: '#008000',
    prompts: [
      { color: '#006400', text: 'Triggerman Beat' },
      { color: '#008000', text: 'Heavy Bounce Kick' },
      { color: '#228B22', text: 'Bounce Clap' },
      { color: '#32CD32', text: 'Fast Shaker Loop' },
      { color: '#00FF00', text: 'Sub Bass' },
      { color: '#7CFC00', text: 'Vocal Chop Loop' },
      { color: '#ADFF2F', text: 'Brass Section' },
      { color: '#FFFF00', text: 'Call & Response' },
      { color: '#FFD700', text: 'Breakbeat Loop' },
      { color: '#FFA500', text: 'Synth Stab' },
      { color: '#FF8C00', text: 'Party Whistle' },
      { color: '#FF4500', text: 'Conga Percussion' },
      { color: '#FF0000', text: 'Drum Loop' },
      { color: '#B22222', text: 'Hype Chant' },
      { color: '#8B0000', text: 'Siren FX' },
    ]
  },
  'Miami': {
    bpm: 128, // Miami Bass / Fast
    description: "Miami Bass. Fast tempo, heavy 808 kick, electro influence.",
    themeColor: '#00CED1',
    prompts: [
      { color: '#00CED1', text: 'Booming 808 Bass' },
      { color: '#40E0D0', text: 'Electro Kick' },
      { color: '#48D1CC', text: 'Fast Electro Snare' },
      { color: '#00FA9A', text: 'Closed Hi-Hat' },
      { color: '#00FF7F', text: 'Electronic Clap' },
      { color: '#FF1493', text: '808 Cowbell' },
      { color: '#FF00FF', text: 'Laser Zaps' },
      { color: '#DA70D6', text: 'Breakbeat' },
      { color: '#BA55D3', text: 'Vocal Yell' },
      { color: '#9370DB', text: 'Orchestra Stab' },
      { color: '#8A2BE2', text: 'Latin Percussion' },
      { color: '#4B0082', text: 'Orchestra Hit' },
      { color: '#483D8B', text: 'Sub Bass Sine' },
      { color: '#6A5ACD', text: 'Shaker' },
      { color: '#7B68EE', text: 'Square Wave Lead' },
    ]
  },
  'Memphis': {
    bpm: 135,
    description: "Memphis Phonk. Lo-fi, distorted, dark, horror movie samples, cowbells.",
    themeColor: '#2F4F4F',
    prompts: [
      { color: '#2F4F4F', text: 'Phonk 808 Bass' },
      { color: '#000000', text: 'Lo-fi Distorted Kick' },
      { color: '#333333', text: 'Tape Saturation Snare' },
      { color: '#696969', text: 'Trap Hi-Hat' },
      { color: '#808080', text: 'Crash Cymbal' },
      { color: '#A9A9A9', text: 'Cowbell Melody' },
      { color: '#C0C0C0', text: 'Distorted Bass' },
      { color: '#D3D3D3', text: 'Vocal Sample Loop' },
      { color: '#FFFFFF', text: 'Horror Synth Pad' },
      { color: '#8B0000', text: 'Dark Ambient' },
      { color: '#800000', text: 'Open Hi-Hat' },
      { color: '#A52A2A', text: 'Chant Vocal' },
      { color: '#B22222', text: 'Vinyl FX' },
      { color: '#DC143C', text: 'Dark Piano' },
      { color: '#FF0000', text: 'String Section' },
    ]
  },
};

export interface EqPreset {
  name: string;
  gains: number[]; // 7 bands
}

export const EQ_PRESETS: EqPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0] },
  { name: 'Trap Scoop', gains: [3, 2, -1, -3, -1, 2, 4] },
  { name: 'Bass Heavy', gains: [6, 4, 2, 0, -1, -1, -2] },
  { name: 'Vocal Clarity', gains: [-3, -2, 0, 3, 4, 2, 1] },
  { name: 'Crisp Highs', gains: [0, -1, -1, 0, 2, 4, 6] },
  { name: 'Lo-Fi', gains: [2, 1, 3, 0, -2, -6, -9] },
  { name: 'Warmth', gains: [2, 3, 2, 0, -1, -2, -3] },
  { name: 'Bright', gains: [-1, -1, 0, 2, 4, 5, 4] },
];
