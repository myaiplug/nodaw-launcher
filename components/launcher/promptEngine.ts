/**
 * promptEngine.ts
 * SmartPromptIt Core Enhancement Engine
 * Transforms raw prompts into elite-tier AI communications
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type AIProvider = 
  | 'chatgpt' 
  | 'claude' 
  | 'gemini' 
  | 'perplexity' 
  | 'copilot' 
  | 'cursor'
  | 'midjourney' 
  | 'dalle' 
  | 'bing' 
  | 'meta'
  | 'unknown';

export type IntentCategory = 
  | 'code_generation'
  | 'creative_writing'
  | 'image_generation'
  | 'analysis_request'
  | 'research_query'
  | 'conversation'
  | 'debugging'
  | 'explanation'
  | 'brainstorming'
  | 'task_automation'
  | 'general';

export interface EnhancementResult {
  original: string;
  enhanced: string;
  provider: AIProvider;
  intent: IntentCategory;
  confidence: number;
  techniques: string[];
  wordCountChange: { before: number; after: number };
}

export interface EnhancementConfig {
  level: number;  // 0-100, how aggressive the enhancement
  preserveVoice: boolean;
  addClarifyingQuestions: boolean;
  addStructure: boolean;
  addConstraints: boolean;
  addQualityGates: boolean;
}

// ═══════════════════════════════════════════════════════════
// AI PROVIDER PROFILES
// ═══════════════════════════════════════════════════════════

interface AIProfile {
  id: AIProvider;
  displayName: string;
  strengths: string[];
  promptStyle: {
    prefersRolePlaying: boolean;
    prefersStructuredOutput: boolean;
    handlesAmbiguity: 'well' | 'poorly' | 'moderate';
    responseVerbosity: 'concise' | 'balanced' | 'verbose';
    bestFor: string[];
  };
  templateParts: {
    rolePrefix?: string;
    contextSection?: string;
    taskSection?: string;
    constraintsSection?: string;
    outputFormatSection?: string;
    qualityGateSection?: string;
  };
  avoidPatterns: string[];
}

const AI_PROFILES: Record<AIProvider, AIProfile> = {
  chatgpt: {
    id: 'chatgpt',
    displayName: 'ChatGPT (GPT-4)',
    strengths: ['versatile', 'creative', 'code-capable', 'follows instructions well'],
    promptStyle: {
      prefersRolePlaying: true,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'verbose',
      bestFor: ['coding', 'writing', 'analysis', 'brainstorming']
    },
    templateParts: {
      rolePrefix: 'You are a {{ROLE}} with extensive expertise in {{DOMAIN}}.',
      contextSection: 'Context: {{CONTEXT}}',
      taskSection: 'Task: {{TASK}}',
      constraintsSection: 'Constraints:\n{{CONSTRAINTS}}',
      outputFormatSection: 'Format your response as:\n{{FORMAT}}',
      qualityGateSection: 'Before finalizing, verify that your response {{QUALITY_CHECKS}}.'
    },
    avoidPatterns: ['vague requests', 'asking to "just do it"']
  },
  
  claude: {
    id: 'claude',
    displayName: 'Claude (Anthropic)',
    strengths: ['nuanced analysis', 'honest about limitations', 'philosophical', 'safety-conscious'],
    promptStyle: {
      prefersRolePlaying: false,  // Claude prefers direct, collaborative requests
      prefersStructuredOutput: true,
      handlesAmbiguity: 'well',
      responseVerbosity: 'balanced',
      bestFor: ['analysis', 'writing', 'ethics', 'code review', 'research']
    },
    templateParts: {
      rolePrefix: "I'd like your expert perspective on {{DOMAIN}}.",
      contextSection: 'Background: {{CONTEXT}}',
      taskSection: "Here's what I'm trying to accomplish: {{TASK}}",
      constraintsSection: 'Key considerations:\n{{CONSTRAINTS}}',
      outputFormatSection: 'Please structure your response to include:\n{{FORMAT}}',
      qualityGateSection: "If you see any issues or have concerns about this approach, I'd welcome your honest feedback."
    },
    avoidPatterns: ['overly commanding tone', 'assuming Claude will agree uncritically']
  },
  
  gemini: {
    id: 'gemini',
    displayName: 'Google Gemini',
    strengths: ['real-time info', 'multimodal', 'reasoning', 'Google ecosystem integration'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'balanced',
      bestFor: ['research', 'fact-checking', 'comparisons', 'current events']
    },
    templateParts: {
      rolePrefix: 'As an expert in {{DOMAIN}}, provide insights on the following:',
      contextSection: 'Context: {{CONTEXT}}',
      taskSection: 'Objective: {{TASK}}',
      constraintsSection: 'Requirements:\n{{CONSTRAINTS}}',
      outputFormatSection: 'Please provide:\n{{FORMAT}}',
      qualityGateSection: 'Include sources or basis for any factual claims where possible.'
    },
    avoidPatterns: ['asking about future events', 'highly speculative questions without framing']
  },
  
  perplexity: {
    id: 'perplexity',
    displayName: 'Perplexity AI',
    strengths: ['search-integrated', 'citations', 'current info', 'comparative analysis'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'concise',
      bestFor: ['research', 'fact-finding', 'comparisons', 'summaries']
    },
    templateParts: {
      rolePrefix: '',  // Perplexity works best with direct queries
      contextSection: 'Research topic: {{CONTEXT}}',
      taskSection: '{{TASK}}',
      constraintsSection: 'Focus on: {{CONSTRAINTS}}',
      outputFormatSection: 'Please provide citations and organize as:\n{{FORMAT}}',
      qualityGateSection: 'Cite sources for all factual claims.'
    },
    avoidPatterns: ['long creative writing requests', 'highly subjective questions']
  },
  
  copilot: {
    id: 'copilot',
    displayName: 'GitHub Copilot',
    strengths: ['code completion', 'context-aware', 'inline suggestions', 'test generation'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'poorly',  // Needs specific context
      responseVerbosity: 'concise',
      bestFor: ['code generation', 'refactoring', 'tests', 'documentation']
    },
    templateParts: {
      rolePrefix: '// {{LANGUAGE}} {{FRAMEWORK}} implementation',
      contextSection: '// Context: {{CONTEXT}}',
      taskSection: '// TODO: {{TASK}}',
      constraintsSection: '// Requirements:\n// {{CONSTRAINTS}}',
      outputFormatSection: '// Expected pattern:\n// {{FORMAT}}',
      qualityGateSection: '// Should handle edge cases: {{EDGE_CASES}}'
    },
    avoidPatterns: ['vague descriptions', 'missing type information', 'no context about surrounding code']
  },
  
  cursor: {
    id: 'cursor',
    displayName: 'Cursor AI',
    strengths: ['codebase-aware', 'refactoring', 'multi-file edits', 'explanations'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'balanced',
      bestFor: ['refactoring', 'debugging', 'architecture', 'code review']
    },
    templateParts: {
      rolePrefix: 'Working with {{LANGUAGE}}/{{FRAMEWORK}}:',
      contextSection: '@files {{FILES}}\n{{CONTEXT}}',
      taskSection: 'Task: {{TASK}}',
      constraintsSection: 'Maintain:\n{{CONSTRAINTS}}',
      outputFormatSection: 'Provide:\n{{FORMAT}}',
      qualityGateSection: 'Ensure the changes are consistent with existing patterns in the codebase.'
    },
    avoidPatterns: ['not referencing specific files', 'ignoring existing code patterns']
  },
  
  midjourney: {
    id: 'midjourney',
    displayName: 'Midjourney',
    strengths: ['artistic', 'stylized', 'abstract concepts', 'high aesthetic quality'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: false,
      handlesAmbiguity: 'well',  // Interprets artistically
      responseVerbosity: 'concise',  // Shorter prompts often better
      bestFor: ['art', 'illustration', 'concept design', 'photography-style']
    },
    templateParts: {
      rolePrefix: '',
      contextSection: '',
      taskSection: '{{SUBJECT}}, {{STYLE}}, {{LIGHTING}}, {{MOOD}}',
      constraintsSection: '{{NEGATIVE_PROMPTS}}',
      outputFormatSection: '{{ASPECT_RATIO}} {{QUALITY_FLAGS}}',
      qualityGateSection: ''
    },
    avoidPatterns: ['walls of text', 'logical/sequential descriptions', 'asking for text in images']
  },
  
  dalle: {
    id: 'dalle',
    displayName: 'DALL-E 3',
    strengths: ['literal interpretation', 'text in images', 'safety-conscious', 'high fidelity'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: false,
      handlesAmbiguity: 'poorly',  // Very literal
      responseVerbosity: 'balanced',
      bestFor: ['realistic images', 'specific compositions', 'product mockups']
    },
    templateParts: {
      rolePrefix: '',
      contextSection: '',
      taskSection: 'Create an image of: {{DESCRIPTION}}',
      constraintsSection: 'Style: {{STYLE}}. Ensure {{REQUIREMENTS}}.',
      outputFormatSection: '{{SIZE}} {{STYLE_MODIFIERS}}',
      qualityGateSection: ''
    },
    avoidPatterns: ['abstract concepts without grounding', 'artist name references', 'violent/explicit content']
  },
  
  bing: {
    id: 'bing',
    displayName: 'Microsoft Copilot (Bing)',
    strengths: ['web search', 'current info', 'Microsoft integration', 'balanced responses'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'balanced',
      bestFor: ['research', 'comparisons', 'current events', 'shopping research']
    },
    templateParts: {
      rolePrefix: '',
      contextSection: 'Topic: {{CONTEXT}}',
      taskSection: '{{TASK}}',
      constraintsSection: 'Focus on: {{CONSTRAINTS}}',
      outputFormatSection: 'Please organize your response as:\n{{FORMAT}}',
      qualityGateSection: 'Include relevant sources where applicable.'
    },
    avoidPatterns: ['highly controversial political questions', 'requests for harmful content']
  },
  
  meta: {
    id: 'meta',
    displayName: 'Meta AI',
    strengths: ['conversational', 'social awareness', 'casual interactions', 'image generation'],
    promptStyle: {
      prefersRolePlaying: false,
      prefersStructuredOutput: false,
      handlesAmbiguity: 'well',
      responseVerbosity: 'concise',
      bestFor: ['casual questions', 'social content', 'quick creative tasks']
    },
    templateParts: {
      rolePrefix: '',
      contextSection: '{{CONTEXT}}',
      taskSection: '{{TASK}}',
      constraintsSection: '{{CONSTRAINTS}}',
      outputFormatSection: '',
      qualityGateSection: ''
    },
    avoidPatterns: ['complex technical requests', 'very long-form content needs']
  },
  
  unknown: {
    id: 'unknown',
    displayName: 'Unknown AI',
    strengths: [],
    promptStyle: {
      prefersRolePlaying: true,
      prefersStructuredOutput: true,
      handlesAmbiguity: 'moderate',
      responseVerbosity: 'balanced',
      bestFor: []
    },
    templateParts: {
      rolePrefix: 'As an expert in {{DOMAIN}}:',
      contextSection: 'Context: {{CONTEXT}}',
      taskSection: 'Task: {{TASK}}',
      constraintsSection: 'Requirements:\n{{CONSTRAINTS}}',
      outputFormatSection: 'Please format as:\n{{FORMAT}}',
      qualityGateSection: 'Verify the accuracy and completeness of your response.'
    },
    avoidPatterns: []
  }
};

// ═══════════════════════════════════════════════════════════
// INTENT CLASSIFICATION
// ═══════════════════════════════════════════════════════════

const INTENT_PATTERNS: Record<IntentCategory, RegExp[]> = {
  code_generation: [
    /\b(write|create|make|build|generate|implement|code|function|class|component)\b.*\b(code|function|script|program|app|api|endpoint)\b/i,
    /\b(javascript|typescript|python|react|vue|node|html|css|sql|java|c\+\+|rust|go)\b/i,
    /\b(algorithm|data structure|loop|array|object|variable|import|export)\b/i
  ],
  creative_writing: [
    /\b(write|create|compose|draft)\b.*\b(story|poem|essay|article|blog|script|lyrics|novel)\b/i,
    /\b(creative|fiction|narrative|character|plot|dialogue)\b/i
  ],
  image_generation: [
    /\b(create|generate|make|draw|design|render)\b.*\b(image|picture|photo|illustration|art|logo|icon)\b/i,
    /\b(style|aesthetic|visual|graphic|painting|sketch)\b.*\b(of|for|showing)\b/i
  ],
  analysis_request: [
    /\b(analyze|analyse|review|evaluate|assess|examine|critique|compare)\b/i,
    /\b(pros|cons|advantages|disadvantages|strengths|weaknesses)\b/i,
    /\b(what do you think|your opinion|perspective on)\b/i
  ],
  research_query: [
    /\b(what is|who is|when did|where is|how does|why does|explain)\b/i,
    /\b(research|find|look up|search|information about|facts about)\b/i
  ],
  conversation: [
    /\b(hello|hi|hey|thanks|thank you|how are you|nice to meet)\b/i,
    /^(can you|could you|would you|will you)\b/i
  ],
  debugging: [
    /\b(error|bug|issue|problem|not working|fix|debug|broken|crash)\b/i,
    /\b(why is|why does|why isn't|why doesn't)\b.*\b(work|run|compile|execute)\b/i
  ],
  explanation: [
    /\b(explain|describe|what is|how does|why is|tell me about|elaborate)\b/i,
    /\b(understand|clarify|define|meaning of)\b/i
  ],
  brainstorming: [
    /\b(ideas|suggestions|recommendations|options|alternatives|possibilities)\b/i,
    /\b(brainstorm|come up with|think of|suggest)\b/i
  ],
  task_automation: [
    /\b(automate|script|batch|schedule|workflow|process)\b/i,
    /\b(convert|transform|extract|parse|format|organize)\b/i
  ],
  general: [/.*/]
};

function classifyIntent(prompt: string): { intent: IntentCategory; confidence: number } {
  const lowerPrompt = prompt.toLowerCase();
  let topIntent: IntentCategory = 'general';
  let topScore = 0;
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(lowerPrompt)) {
        score += 1;
      }
    }
    if (score > topScore) {
      topScore = score;
      topIntent = intent as IntentCategory;
    }
  }
  
  // Normalize confidence (0-1)
  const confidence = Math.min(topScore / 3, 1);
  
  return { intent: topIntent, confidence };
}

// ═══════════════════════════════════════════════════════════
// VOCABULARY ENHANCEMENT
// ═══════════════════════════════════════════════════════════

const VOCABULARY_UPGRADES: Record<string, string[]> = {
  'good': ['excellent', 'exceptional', 'outstanding', 'high-quality'],
  'bad': ['suboptimal', 'problematic', 'inadequate', 'flawed'],
  'make': ['create', 'develop', 'construct', 'implement', 'generate'],
  'fix': ['resolve', 'remediate', 'address', 'rectify', 'correct'],
  'help': ['assist', 'guide', 'support', 'facilitate'],
  'thing': ['element', 'component', 'aspect', 'factor', 'item'],
  'very': ['highly', 'extremely', 'particularly', 'exceptionally'],
  'show': ['demonstrate', 'illustrate', 'present', 'display'],
  'use': ['utilize', 'employ', 'leverage', 'apply'],
  'get': ['obtain', 'acquire', 'retrieve', 'extract'],
  'big': ['substantial', 'significant', 'comprehensive', 'extensive'],
  'small': ['minimal', 'compact', 'concise', 'minor'],
  'fast': ['efficient', 'rapid', 'swift', 'optimized'],
  'slow': ['gradual', 'deliberate', 'measured', 'unhurried'],
  'hard': ['challenging', 'complex', 'demanding', 'intricate'],
  'easy': ['straightforward', 'simple', 'accessible', 'intuitive'],
  'new': ['novel', 'innovative', 'fresh', 'cutting-edge'],
  'old': ['legacy', 'traditional', 'established', 'historical']
};

const POWER_PHRASES = [
  'with attention to detail',
  'following best practices',
  'ensuring quality and consistency',
  'with proper error handling',
  'optimized for performance',
  'maintainable and scalable',
  'well-documented',
  'thoroughly tested',
  'production-ready',
  'with clear explanations'
];

function enhanceVocabulary(text: string, level: number): string {
  // Higher level = more aggressive vocabulary enhancement
  const threshold = (100 - level) / 100;
  
  let enhanced = text;
  
  for (const [word, replacements] of Object.entries(VOCABULARY_UPGRADES)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (Math.random() > threshold) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      enhanced = enhanced.replace(regex, replacement);
    }
  }
  
  return enhanced;
}

// ═══════════════════════════════════════════════════════════
// STRUCTURE ENHANCEMENT
// ═══════════════════════════════════════════════════════════

function addStructure(prompt: string, intent: IntentCategory): string {
  // Add numbered requirements if the prompt seems to have multiple parts
  const hasMultipleParts = prompt.includes(' and ') || prompt.includes(',');
  
  if (hasMultipleParts && intent !== 'conversation') {
    // Try to extract and number requirements
    const parts = prompt.split(/,|\band\b/);
    if (parts.length > 2) {
      return `${prompt}\n\nKey requirements:\n${parts.map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')}`;
    }
  }
  
  return prompt;
}

// ═══════════════════════════════════════════════════════════
// ROLE GENERATION
// ═══════════════════════════════════════════════════════════

const ROLE_TEMPLATES: Record<IntentCategory, string[]> = {
  code_generation: [
    'senior software engineer with 15+ years of experience',
    'principal developer specializing in clean architecture',
    'tech lead known for writing maintainable, efficient code'
  ],
  creative_writing: [
    'published author with expertise in compelling narratives',
    'creative writing professor at a top university',
    'award-winning storyteller known for engaging prose'
  ],
  image_generation: [
    'world-class visual artist and designer',
    'art director with decades of creative experience',
    'master of composition, lighting, and visual storytelling'
  ],
  analysis_request: [
    'expert analyst with deep domain knowledge',
    'strategic consultant known for incisive insights',
    'research specialist with rigorous analytical methods'
  ],
  research_query: [
    'research specialist with access to comprehensive data',
    'subject matter expert in the relevant field',
    'academic researcher with extensive knowledge'
  ],
  debugging: [
    'debugging specialist and performance optimization expert',
    'senior engineer experienced in troubleshooting complex systems',
    'code archaeologist skilled at finding root causes'
  ],
  explanation: [
    'expert educator skilled at breaking down complex topics',
    'technical writer known for clear, accessible explanations',
    'mentor with a talent for making concepts intuitive'
  ],
  brainstorming: [
    'innovation consultant and creative strategist',
    'design thinking facilitator skilled at generating ideas',
    'brainstorming expert known for thinking outside the box'
  ],
  task_automation: [
    'automation engineer and workflow optimization specialist',
    'systems architect focused on efficiency and scalability',
    'DevOps expert with extensive automation experience'
  ],
  conversation: [],  // No role for casual conversation
  general: [
    'knowledgeable expert in the relevant domain',
    'helpful assistant with broad expertise'
  ]
};

function generateRole(intent: IntentCategory): string {
  const roles = ROLE_TEMPLATES[intent];
  if (!roles || roles.length === 0) return '';
  return roles[Math.floor(Math.random() * roles.length)];
}

// ═══════════════════════════════════════════════════════════
// CLARIFYING QUESTIONS
// ═══════════════════════════════════════════════════════════

const CLARIFYING_QUESTIONS: Record<IntentCategory, string[]> = {
  code_generation: [
    'target programming language/framework',
    'specific requirements or constraints',
    'error handling expectations',
    'testing requirements',
    'integration points with existing code'
  ],
  creative_writing: [
    'target audience and tone',
    'desired length and format',
    'style references or inspirations',
    'key themes or messages',
    'any constraints or requirements'
  ],
  image_generation: [
    'subject and composition preferences',
    'desired style (realistic, artistic, etc.)',
    'mood and color palette',
    'intended use case',
    'any elements to include/exclude'
  ],
  analysis_request: [
    'specific aspects to focus on',
    'desired depth of analysis',
    'comparison points if applicable',
    'decision factors that matter most',
    'expected output format'
  ],
  research_query: [
    'level of detail needed',
    'specific aspects of interest',
    'recency requirements',
    'trusted source preferences',
    'format for the information'
  ],
  debugging: [
    'exact error message or behavior',
    'steps to reproduce',
    'environment and dependencies',
    'recent changes made',
    'expected vs actual behavior'
  ],
  explanation: [
    'current understanding level',
    'specific aspects that are unclear',
    'preferred explanation style',
    'use case for this knowledge',
    'any analogies that would help'
  ],
  brainstorming: [
    'constraints to work within',
    'what has already been tried',
    'target outcome or criteria',
    'timeline and resources',
    'stakeholders to consider'
  ],
  task_automation: [
    'input format and source',
    'desired output format',
    'frequency of execution',
    'error handling requirements',
    'integration with other systems'
  ],
  conversation: [],
  general: [
    'specific requirements',
    'expected outcome',
    'any constraints',
    'preferred format'
  ]
};

function generateClarifyingSection(intent: IntentCategory): string {
  const questions = CLARIFYING_QUESTIONS[intent];
  if (!questions || questions.length === 0) return '';
  
  const selected = questions.slice(0, Math.min(4, questions.length));
  return `\n\nBefore proceeding, please clarify:\n${selected.map((q, i) => `${i + 1}) ${q}`).join('\n')}`;
}

// ═══════════════════════════════════════════════════════════
// OUTPUT FORMAT SUGGESTIONS
// ═══════════════════════════════════════════════════════════

const OUTPUT_FORMATS: Record<IntentCategory, string> = {
  code_generation: 'Provide the code with:\n- Clear comments explaining key sections\n- Type definitions where applicable\n- Example usage\n- Any relevant edge case handling',
  creative_writing: 'Structure your response with clear sections. Include any structural elements appropriate to the format (chapters, stanzas, act breaks, etc.).',
  image_generation: '',  // Image prompts don't need output format
  analysis_request: 'Format as:\n## Summary\n## Detailed Analysis\n## Key Findings\n## Recommendations (if applicable)',
  research_query: 'Organize information with clear headings, bullet points for key facts, and citations where possible.',
  debugging: 'Provide:\n1) Root cause analysis\n2) Solution with code\n3) Explanation of why this fixes the issue\n4) Prevention tips for the future',
  explanation: 'Structure as:\n- High-level overview\n- Detailed breakdown\n- Practical examples\n- Common misconceptions (if any)',
  brainstorming: 'Present ideas in a structured format:\n- Quick summary of each idea\n- Pros and potential challenges\n- Implementation difficulty (Low/Medium/High)',
  task_automation: 'Include:\n- Step-by-step instructions or code\n- Configuration requirements\n- Testing/validation steps\n- Troubleshooting tips',
  conversation: '',
  general: 'Please structure your response clearly with appropriate sections and formatting.'
};

// ═══════════════════════════════════════════════════════════
// QUALITY GATES
// ═══════════════════════════════════════════════════════════

const QUALITY_GATES: Record<IntentCategory, string> = {
  code_generation: 'Before finalizing, verify that the code:\n- Handles edge cases\n- Follows the single responsibility principle\n- Is properly typed (if applicable)\n- Would pass a code review',
  creative_writing: 'After drafting, review for:\n- Consistent tone and voice\n- Proper pacing\n- Engaging opening and satisfying conclusion\n- Grammar and style',
  image_generation: '',
  analysis_request: 'Double-check that you have:\n- Considered multiple perspectives\n- Acknowledged limitations and assumptions\n- Provided actionable insights where appropriate',
  research_query: 'Verify:\n- Information accuracy (flag any uncertainty)\n- Completeness relative to the question\n- Proper attribution of sources',
  debugging: 'Confirm that your solution:\n- Actually addresses the root cause, not just symptoms\n- Won\'t introduce new issues\n- Is the simplest effective fix',
  explanation: 'Ensure your explanation:\n- Builds from familiar concepts\n- Doesn\'t skip important steps\n- Includes concrete examples\n- Would make sense to the target audience',
  brainstorming: 'Review ideas for:\n- Feasibility within stated constraints\n- Genuine novelty and creativity\n- Practical implementation path',
  task_automation: 'Verify that the solution:\n- Handles expected input variations\n- Fails gracefully with clear error messages\n- Is documented sufficiently for maintenance',
  conversation: '',
  general: 'Please review your response for accuracy, completeness, and clarity before submitting.'
};

// ═══════════════════════════════════════════════════════════
// MAIN ENHANCEMENT FUNCTION
// ═══════════════════════════════════════════════════════════

export function enhancePrompt(
  rawPrompt: string,
  provider: AIProvider,
  config: EnhancementConfig
): EnhancementResult {
  const profile = AI_PROFILES[provider] || AI_PROFILES.unknown;
  const { intent, confidence } = classifyIntent(rawPrompt);
  
  const techniques: string[] = [];
  let enhanced = rawPrompt;
  
  // 1. Vocabulary enhancement (if level > 40)
  if (config.level > 40) {
    enhanced = enhanceVocabulary(enhanced, config.level);
    techniques.push('vocabulary_enhancement');
  }
  
  // 2. Add structure (if level > 30 and appropriate)
  if (config.level > 30 && config.addStructure) {
    const structured = addStructure(enhanced, intent);
    if (structured !== enhanced) {
      enhanced = structured;
      techniques.push('structure_addition');
    }
  }
  
  // 3. Build enhanced prompt based on AI profile
  let finalPrompt = '';
  
  // Add role priming (for AIs that benefit from it)
  if (profile.promptStyle.prefersRolePlaying && config.level > 50 && intent !== 'conversation') {
    const role = generateRole(intent);
    if (role) {
      finalPrompt += `You are a ${role}.\n\n`;
      techniques.push('role_priming');
    }
  }
  
  // Add the enhanced core prompt
  finalPrompt += enhanced;
  
  // Add clarifying questions (if configured and level is high enough)
  if (config.addClarifyingQuestions && config.level > 60 && intent !== 'conversation') {
    const clarifying = generateClarifyingSection(intent);
    if (clarifying) {
      finalPrompt += clarifying;
      techniques.push('clarifying_questions');
    }
  }
  
  // Add output format (if configured and AI prefers structure)
  if (config.addStructure && config.level > 50 && profile.promptStyle.prefersStructuredOutput) {
    const format = OUTPUT_FORMATS[intent];
    if (format) {
      finalPrompt += `\n\n${format}`;
      techniques.push('output_format');
    }
  }
  
  // Add quality gates (if configured and level is very high)
  if (config.addQualityGates && config.level > 75) {
    const qualityGate = QUALITY_GATES[intent];
    if (qualityGate) {
      finalPrompt += `\n\n${qualityGate}`;
      techniques.push('quality_gates');
    }
  }
  
  return {
    original: rawPrompt,
    enhanced: finalPrompt.trim(),
    provider,
    intent,
    confidence,
    techniques,
    wordCountChange: {
      before: rawPrompt.split(/\s+/).length,
      after: finalPrompt.split(/\s+/).length
    }
  };
}

// ═══════════════════════════════════════════════════════════
// AI PROVIDER DETECTION
// ═══════════════════════════════════════════════════════════

const URL_PATTERNS: Record<AIProvider, RegExp[]> = {
  chatgpt: [/chat\.openai\.com/i, /chatgpt\.com/i, /openai\.com/i],
  claude: [/claude\.ai/i, /anthropic\.com/i],
  gemini: [/gemini\.google\.com/i, /bard\.google\.com/i],
  perplexity: [/perplexity\.ai/i],
  copilot: [/github\.com/i, /copilot/i],
  cursor: [/cursor\.sh/i, /cursor\.so/i],
  midjourney: [/midjourney\.com/i, /discord\.com.*midjourney/i],
  dalle: [/openai\.com.*dall-e/i, /labs\.openai\.com/i],
  bing: [/bing\.com/i, /copilot\.microsoft\.com/i],
  meta: [/meta\.ai/i, /facebook\.com.*ai/i, /instagram\.com/i, /whatsapp\.com/i],
  unknown: []
};

export function detectProvider(url: string): AIProvider {
  for (const [provider, patterns] of Object.entries(URL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return provider as AIProvider;
      }
    }
  }
  return 'unknown';
}

export function getProviderProfile(provider: AIProvider): AIProfile {
  return AI_PROFILES[provider] || AI_PROFILES.unknown;
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export { AI_PROFILES };
export default enhancePrompt;
