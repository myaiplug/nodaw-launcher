/**
 * PromptGenius - EditPix AI Prompt Enhancement Engine
 * Ivy-league wordsmith obsessed with photorealistic descriptions
 * 
 * Goal: Generate prompts so realistic that AI-generated content passes
 * as authentic real-world imagery/video with 99.9% undetectability.
 * 
 * Core Philosophy:
 * - Real photography language, not AI art terminology
 * - Specific equipment references (cameras, lenses, lighting)
 * - Environmental imperfections that signal authenticity
 * - Human behavior patterns that defeat AI detection
 * - Technical photography parameters over aesthetic descriptors
 */

import {
  PromptRequest,
  EnhancedPrompt,
} from './types';

// Photography equipment database for authentic technical language
const CAMERAS = {
  professional: [
    'Canon EOS R5', 'Sony A7R V', 'Nikon Z9', 'Hasselblad X2D',
    'Phase One IQ4', 'Leica SL2-S', 'Fujifilm GFX 100S',
  ],
  cinema: [
    'ARRI ALEXA 35', 'RED V-RAPTOR', 'Sony VENICE 2', 'Blackmagic URSA Mini Pro',
  ],
  vintage: [
    'Nikon FM2', 'Canon AE-1', 'Leica M6', 'Pentax K1000', 'Hasselblad 500C/M',
  ],
  smartphone: [
    'iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro',
  ],
};

const LENSES = {
  portrait: ['85mm f/1.4', '50mm f/1.2', '135mm f/2', '105mm f/1.4'],
  wide: ['24mm f/1.4', '35mm f/1.4', '14mm f/2.8', '16-35mm f/2.8'],
  telephoto: ['70-200mm f/2.8', '100-400mm f/5.6', '400mm f/2.8'],
  macro: ['100mm macro', '90mm macro f/2.8'],
  cine: ['Cooke S7/i', 'Zeiss Supreme Prime', 'ARRI Signature Prime'],
};

const LIGHTING = {
  natural: [
    'golden hour sunlight', 'overcast diffused daylight', 'blue hour ambient',
    'harsh midday sun', 'window light with sheers', 'dappled forest light',
  ],
  studio: [
    'softbox key light with fill', 'ring light with beauty dish hairlight',
    'Rembrandt lighting setup', 'butterfly lighting', 'split lighting',
  ],
  practical: [
    'tungsten desk lamp', 'neon signage spill', 'fluorescent overhead',
    'candlelight', 'fireplace glow', 'streetlight sodium vapor',
  ],
};

// Real-world imperfections that signal authenticity
const IMPERFECTIONS = {
  lens: [
    'slight chromatic aberration at edges', 'natural lens vignetting',
    'subtle barrel distortion', 'bokeh with onion rings', 'lens flare artifact',
  ],
  sensor: [
    'visible grain at high ISO', 'slight color noise in shadows',
    'minor hot pixels', 'subtle banding in gradients',
  ],
  focus: [
    'razor-thin depth of field', 'slight front focus', 'motion blur on extremities',
    'subject slightly out of focus plane', 'autofocus hunting on eye',
  ],
  exposure: [
    'blown highlights on light sources', 'crushed blacks in shadows',
    'recovery artifacts in highlights', 'slight underexposure',
  ],
  environmental: [
    'dust particles in light beam', 'water droplets on lens',
    'fingerprint smudge on corner', 'minor sensor dust spot',
  ],
};

// Human behavioral patterns for portraits
const HUMAN_BEHAVIORS = {
  micro_expressions: [
    'caught mid-blink', 'slight asymmetric smile', 'one squinted eye',
    'lips slightly parted', 'brow furrowed in thought', 'nostril flare',
  ],
  body_language: [
    'weight shifted to one leg', 'arms crossed loosely', 'hand touching neck',
    'leaning slightly forward', 'shoulders uneven', 'head tilted 3 degrees',
  ],
  skin: [
    'visible pores on nose', 'slight under-eye shadow', 'single stray hair',
    'minor skin texture', 'natural skin oils reflecting light', 'tiny mole',
  ],
  clothing: [
    'wrinkled shirt collar', 'thread loose on seam', 'button slightly askew',
    'fabric pilling visible', 'slight color fade on worn areas',
  ],
};

// Environmental authenticity markers
const ENVIRONMENT_MARKERS = {
  urban: [
    'weathered paint on wall', 'chipped curb edge', 'faded street sign',
    'cracked sidewalk section', 'graffiti partially removed', 'rust stains',
  ],
  interior: [
    'dust on baseboards', 'scuff marks on floor', 'paint drip on trim',
    'slightly crooked picture frame', 'outlet cover misaligned',
  ],
  nature: [
    'dead leaves mixed with green', 'insect on plant', 'uneven grass height',
    'dried mud splatter', 'bird droppings on rock', 'spider web corner',
  ],
};

// Photographic terminology for specific styles
const STYLE_VOCABULARIES = {
  photorealistic: {
    adjectives: [
      'documentary', 'candid', 'unposed', 'environmental', 'available light',
      'naturalistic', 'unstaged', 'observational', 'slice-of-life',
    ],
    verbs: ['captured', 'documented', 'shot', 'photographed', 'recorded'],
    qualifiers: [
      'authentic moment', 'real interaction', 'genuine expression',
      'unstaged scene', 'natural occurrence',
    ],
  },
  cinematic: {
    adjectives: [
      'anamorphic', 'widescreen', 'theatrical', 'filmic', 'graded',
      'atmospheric', 'moody', 'dramatic', 'noir-influenced',
    ],
    verbs: ['framed', 'composed', 'lit', 'staged', 'blocked'],
    qualifiers: [
      'film still', 'production frame', 'behind-the-scenes',
      'on-set moment', 'practical lighting setup',
    ],
  },
  editorial: {
    adjectives: [
      'magazine-quality', 'publication-ready', 'editorial-style',
      'fashion-forward', 'commercially viable', 'print-worthy',
    ],
    verbs: ['styled', 'art-directed', 'curated', 'commissioned'],
    qualifiers: [
      'editorial spread', 'feature story', 'cover potential',
      'tear sheet quality', 'masthead worthy',
    ],
  },
  product: {
    adjectives: [
      'commercial', 'studio-lit', 'product-focused', 'catalog-style',
      'e-commerce ready', 'pack shot quality',
    ],
    verbs: ['showcased', 'highlighted', 'featured', 'displayed'],
    qualifiers: [
      'hero shot', 'lifestyle context', 'in-use demonstration',
      'detail view', 'scale reference',
    ],
  },
  lifestyle: {
    adjectives: [
      'aspirational', 'relatable', 'warm', 'inviting', 'authentic',
      'lived-in', 'comfortable', 'casual elegance',
    ],
    verbs: ['enjoying', 'experiencing', 'savoring', 'embracing'],
    qualifiers: [
      'everyday moment', 'morning ritual', 'weekend scene',
      'family gathering', 'quiet moment',
    ],
  },
};

// Technical camera parameters for specific looks
const TECHNICAL_PARAMS = {
  portraitShallow: 'f/1.4, 1/200s, ISO 100, 85mm',
  portraitEnvironmental: 'f/4, 1/125s, ISO 400, 35mm',
  landscape: 'f/11, 1/60s, ISO 100, 24mm, tripod',
  lowLight: 'f/1.8, 1/50s, ISO 3200, 50mm',
  action: 'f/2.8, 1/2000s, ISO 800, 70-200mm',
  macro: 'f/8, 1/125s, ISO 200, 100mm macro, focus stack',
  cinema: '2.39:1 aspect, 180° shutter, 24fps, T2.8, anamorphic squeeze 2x',
};

// Anti-AI-detection phrases (what to avoid and what to use instead)
const ANTI_DETECTION_RULES = {
  avoid: [
    'highly detailed', 'hyper realistic', '4K', '8K', 'octane render',
    'unreal engine', 'trending on artstation', 'masterpiece', 'best quality',
    'ultra realistic', 'photorealism', 'digital art', 'concept art',
    'beautiful lighting', 'perfect', 'flawless', 'stunning',
  ],
  useInstead: [
    'documentary photograph', 'press photo', 'stock photography style',
    'shot on film', 'raw unedited', 'contact sheet select', 'proof print',
    'behind the scenes still', 'BTS photograph', 'onset production still',
  ],
};

// Random selection helpers
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

/**
 * Core prompt enhancement engine
 */
export const enhancePrompt = (request: PromptRequest): EnhancedPrompt => {
  const style = request.style || 'photorealistic';
  const mediaType = request.mediaType;
  const vocab = STYLE_VOCABULARIES[style] || STYLE_VOCABULARIES.photorealistic;
  
  // Build equipment description
  const equipmentType = style === 'cinematic' ? 'cinema' : 
    request.rawIdea.toLowerCase().includes('phone') ? 'smartphone' : 'professional';
  const camera = pick(CAMERAS[equipmentType as keyof typeof CAMERAS] || CAMERAS.professional);
  const lensCategory = request.rawIdea.toLowerCase().includes('landscape') ? 'wide' :
    request.rawIdea.toLowerCase().includes('portrait') ? 'portrait' : 'portrait';
  const lens = style === 'cinematic' ? pick(LENSES.cine) : pick(LENSES[lensCategory as keyof typeof LENSES] || LENSES.portrait);
  
  // Select lighting
  const lightingType = request.rawIdea.toLowerCase().includes('outdoor') || 
    request.rawIdea.toLowerCase().includes('nature') ? 'natural' :
    request.rawIdea.toLowerCase().includes('studio') ? 'studio' : 'natural';
  const lighting = pick(LIGHTING[lightingType as keyof typeof LIGHTING]);
  
  // Select imperfections for realism
  const imperfections = [
    pick(IMPERFECTIONS.lens),
    pick(IMPERFECTIONS.focus),
    pick(IMPERFECTIONS.environmental),
  ];
  
  // Add human elements if applicable
  const hasHuman = /person|portrait|people|man|woman|face|model/i.test(request.rawIdea);
  const humanElements = hasHuman ? [
    pick(HUMAN_BEHAVIORS.micro_expressions),
    pick(HUMAN_BEHAVIORS.body_language),
    pick(HUMAN_BEHAVIORS.skin),
  ] : [];
  
  // Add environmental markers
  const envType = /outdoor|street|urban|city/i.test(request.rawIdea) ? 'urban' :
    /indoor|interior|room|house/i.test(request.rawIdea) ? 'interior' : 'nature';
  const envMarkers = pickN(ENVIRONMENT_MARKERS[envType as keyof typeof ENVIRONMENT_MARKERS], 2);
  
  // Build technical parameters
  const techParams = style === 'cinematic' ? TECHNICAL_PARAMS.cinema :
    hasHuman ? TECHNICAL_PARAMS.portraitShallow :
    /landscape|nature|outdoor/i.test(request.rawIdea) ? TECHNICAL_PARAMS.landscape :
    TECHNICAL_PARAMS.portraitEnvironmental;
  
  // Construct the primary prompt
  const primaryParts = [
    // Opening with documentary/authentic framing
    `${pick(vocab.qualifiers)}, ${pick(vocab.adjectives)} ${pick(vocab.verbs)}`,
    
    // Core subject from user input (cleaned and enhanced)
    cleanAndEnhanceSubject(request.rawIdea),
    
    // Equipment authenticity
    `shot on ${camera} with ${lens}`,
    
    // Lighting description
    lighting,
    
    // Imperfections for realism
    imperfections.join(', '),
    
    // Human elements if applicable
    ...humanElements,
    
    // Environmental authenticity
    envMarkers.join(', '),
    
    // Technical parameters
    `camera settings: ${techParams}`,
  ];
  
  // Build negative prompt (what to avoid)
  const negativePrompt = [
    ...ANTI_DETECTION_RULES.avoid,
    'smooth skin', 'plastic skin', 'airbrushed', 'oversaturated',
    'artificial lighting', 'CGI', 'rendered', 'illustrated',
    'cartoon', 'anime', 'painting', 'drawing', 'digital painting',
    'bad anatomy', 'extra limbs', 'deformed', 'blurry text',
    'watermark', 'signature', 'logo', 'text overlay',
  ].join(', ');
  
  // Generate alternative versions
  const alternateVersions = [
    generateAlternateVersion(request, 'vintage'),
    generateAlternateVersion(request, 'candid'),
    generateAlternateVersion(request, 'editorial'),
  ];
  
  // Calculate risk scores
  const realismScore = calculateRealismScore(primaryParts.join(', '));
  const detectionRiskScore = calculateDetectionRisk(primaryParts.join(', '));
  
  // Generate tips
  const tips = generateTips(request, realismScore, detectionRiskScore);
  
  return {
    primary: primaryParts.filter(Boolean).join(', '),
    negative: negativePrompt,
    technicalParams: techParams,
    alternateVersions,
    realismScore,
    detectionRiskScore,
    tips,
  };
};

/**
 * Clean user input and enhance with photographic language
 */
const cleanAndEnhanceSubject = (rawIdea: string): string => {
  // Remove AI-speak terms
  let cleaned = rawIdea;
  ANTI_DETECTION_RULES.avoid.forEach(term => {
    cleaned = cleaned.replace(new RegExp(term, 'gi'), '');
  });
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Add photographic context if minimal
  if (cleaned.split(' ').length < 5) {
    cleaned = `${pick(STYLE_VOCABULARIES.photorealistic.adjectives)} ${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Generate alternate prompt versions with different approaches
 */
const generateAlternateVersion = (
  request: PromptRequest, 
  approach: 'vintage' | 'candid' | 'editorial'
): string => {
  const cleanedSubject = cleanAndEnhanceSubject(request.rawIdea);
  
  switch (approach) {
    case 'vintage':
      return `${pick(CAMERAS.vintage)} photograph, ${cleanedSubject}, film grain, slight color shift, ${pick(LIGHTING.natural)}, contact sheet aesthetic, period-accurate styling, analog warmth`;
      
    case 'candid':
      return `unposed candid moment, ${cleanedSubject}, available light only, ${pick(HUMAN_BEHAVIORS.micro_expressions)}, documentary photography style, no staging, natural environment, ${pick(IMPERFECTIONS.focus)}`;
      
    case 'editorial':
      return `magazine photography, ${cleanedSubject}, ${pick(STYLE_VOCABULARIES.editorial.adjectives)}, professional studio lighting, ${pick(LIGHTING.studio)}, publication ready, art directed composition`;
      
    default:
      return cleanedSubject;
  }
};

/**
 * Calculate realism score (0-100)
 */
const calculateRealismScore = (prompt: string): number => {
  let score = 50;
  
  // Positive factors
  const positiveIndicators = [
    /shot on \w+/i, /\d+mm/i, /f\/[\d.]+/i, /ISO \d+/i,
    /grain/i, /imperfection/i, /candid/i, /documentary/i,
    /available light/i, /natural/i, /unposed/i,
  ];
  positiveIndicators.forEach(pattern => {
    if (pattern.test(prompt)) score += 5;
  });
  
  // Negative factors
  ANTI_DETECTION_RULES.avoid.forEach(term => {
    if (prompt.toLowerCase().includes(term.toLowerCase())) score -= 10;
  });
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate detection risk score (0-100, lower is better)
 */
const calculateDetectionRisk = (prompt: string): number => {
  let risk = 30;
  
  // High-risk AI terminology
  ANTI_DETECTION_RULES.avoid.forEach(term => {
    if (prompt.toLowerCase().includes(term.toLowerCase())) risk += 8;
  });
  
  // Risk reducers
  const riskReducers = [
    /imperfection/i, /grain/i, /noise/i, /blur/i,
    /asymmetric/i, /uneven/i, /candid/i, /documentary/i,
    /dust/i, /scratch/i, /weathered/i,
  ];
  riskReducers.forEach(pattern => {
    if (pattern.test(prompt)) risk -= 5;
  });
  
  return Math.max(0, Math.min(100, risk));
};

/**
 * Generate improvement tips
 */
const generateTips = (
  request: PromptRequest,
  realismScore: number,
  detectionRisk: number
): string[] => {
  const tips: string[] = [];
  
  if (realismScore < 70) {
    tips.push('Add specific camera equipment mentions for authenticity');
    tips.push('Include technical photography parameters (f-stop, shutter, ISO)');
  }
  
  if (detectionRisk > 40) {
    tips.push('Remove generic AI art terminology');
    tips.push('Add natural imperfections (grain, slight blur, lens artifacts)');
  }
  
  if (request.mediaType === 'video') {
    tips.push('Specify frame rate, aspect ratio, and shutter angle for video');
    tips.push('Include camera movement descriptions (handheld, gimbal, dolly)');
  }
  
  if (/person|portrait|people/i.test(request.rawIdea)) {
    tips.push('Add micro-expressions and body language details');
    tips.push('Include natural skin texture and minor imperfections');
  }
  
  // Always include
  tips.push('Reference real lighting conditions, not "beautiful lighting"');
  tips.push('Use documentary/journalism photography vocabulary');
  
  return tips.slice(0, 5);
};

/**
 * Quick enhancement with magic wand click
 */
export const quickEnhance = (rawIdea: string): string => {
  const request: PromptRequest = {
    rawIdea,
    mediaType: 'image',
    style: 'photorealistic',
  };
  
  const enhanced = enhancePrompt(request);
  return enhanced.primary;
};

/**
 * Video-specific enhancement
 */
export const enhanceForVideo = (rawIdea: string, duration: 'short' | 'medium' = 'short'): string => {
  const baseEnhancement = quickEnhance(rawIdea);
  
  const videoParams = duration === 'short' 
    ? 'handheld documentary footage, 24fps, natural camera shake, single continuous shot, available sound'
    : 'multicam coverage, mixed handheld and locked shots, 24fps, diegetic audio, subtle color grade';
  
  const videoImperfections = [
    'slight focus hunting on subject movement',
    'ambient background noise',
    'natural room tone',
    'practical lighting only',
    'no artificial stabilization',
  ];
  
  return `${baseEnhancement}, ${videoParams}, ${pickN(videoImperfections, 2).join(', ')}`;
};
