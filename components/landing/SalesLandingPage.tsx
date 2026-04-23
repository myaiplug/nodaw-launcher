import React from 'react';
import { TOOLS, Tool, ToolTier, ToolStatus } from '../launcher/tools';

type ToolMedia = {
  icon: string;
  screenshot?: string;
  preview?: string;
};

type ToolStory = {
  eyebrow: string;
  hook: string;
  audience: string;
  proof: string[];
  featureList: string[];
  accent: string;
  surface: string;
};

const TOOL_STORIES: Record<string, ToolStory> = {
  'split-it': {
    eyebrow: 'For sample hunters and remix engineers',
    hook: 'Pull stems out of finished records fast enough to keep the idea alive.',
    audience: 'Built for DJs, editors, beatmakers, and creators who need separation without opening a bloated DAW session.',
    proof: ['Vocals, drums, bass, instrumentals', 'Built for rapid export loops', 'Made for remix prep'],
    featureList: ['One-drop workflow', 'Instant source targeting', 'Export-ready stem packs'],
    accent: 'lime',
    surface: 'signal'
  },
  'screw-it': {
    eyebrow: 'For tempo vandalism and tone design',
    hook: 'Drag time until it turns cinematic, syrupy, or dangerous.',
    audience: 'For producers who treat pitch and time as character, not correction.',
    proof: ['Slowdown without guesswork', 'Pitch-first creative motion', 'Designed for texture'],
    featureList: ['Warp with intent', 'Hook-ready edits', 'Creative destruction controls'],
    accent: 'orange',
    surface: 'ember'
  },
  'trim-it': {
    eyebrow: 'For clean edits and no-friction exports',
    hook: 'Cut intros, isolate hooks, and bounce usable clips in seconds.',
    audience: 'For anyone who wants clean waveform work without the overhead of a full editor.',
    proof: ['Free tool', 'Waveform-accurate trimming', 'Built for quick batch sessions'],
    featureList: ['Set in and out points fast', 'Clean export workflow', 'Focused editing UI'],
    accent: 'cyan',
    surface: 'ocean'
  },
  'convert-it': {
    eyebrow: 'For format chaos and delivery cleanup',
    hook: 'Move between formats without opening six utilities and losing momentum.',
    audience: 'For creators delivering stems, previews, references, and uploads all day.',
    proof: ['MP3, WAV, FLAC, OGG', 'Free tool', 'Optimized for turnaround'],
    featureList: ['Simple conversion path', 'Creator-friendly formats', 'Minimal decision fatigue'],
    accent: 'teal',
    surface: 'mist'
  },
  'fx-it': {
    eyebrow: 'For instant color and louder first drafts',
    hook: 'Apply finished-sounding chains in one move when the idea matters more than menu diving.',
    audience: 'For artists who want vibe, speed, and confidence before technical polishing.',
    proof: ['One-click treatment chains', 'Built for previews and demos', 'Fast inspiration loop'],
    featureList: ['Chain-first approach', 'Quick sound identity', 'Instant before-and-after contrast'],
    accent: 'red',
    surface: 'heat'
  },
  'test-it': {
    eyebrow: 'For decisions you can actually trust',
    hook: 'Switch instantly between before and after so hype does not fool your ears.',
    audience: 'For producers, mix engineers, and product-minded creators comparing results under pressure.',
    proof: ['Free tool', 'Rapid A/B switching', 'Confidence-building workflow'],
    featureList: ['Cleaner comparison passes', 'Less placebo bias', 'Sharper final choices'],
    accent: 'blue',
    surface: 'glass'
  },
  'icon-it': {
    eyebrow: 'For launch polish outside audio',
    hook: 'Turn raw artwork into app-ready icons without a separate design pipeline.',
    audience: 'For indie builders shipping installers, plugins, apps, and micro-products.',
    proof: ['Platform-ready outputs', 'Fast image-to-icon flow', 'Useful for product teams'],
    featureList: ['Covers release polish', 'Reduces handoff friction', 'Built for small teams'],
    accent: 'gold',
    surface: 'sun'
  },
  workstation: {
    eyebrow: 'For the full NoDAW vision',
    hook: 'A compact multitrack environment when the project graduates from quick fix to real session.',
    audience: 'For users who want the suite to scale from utility work into full production territory.',
    proof: ['Pro+ beta', 'Multitrack direction', 'Designed as the command center'],
    featureList: ['Session-scale thinking', 'Central timeline workflow', 'Future-facing flagship'],
    accent: 'violet',
    surface: 'night'
  }
};

const TIER_COPY: Record<ToolTier, { label: string; detail: string }> = {
  free: { label: 'Free', detail: 'Start with utility-grade essentials.' },
  pro: { label: 'Pro', detail: 'Unlock the creative power tools.' },
  pro_plus: { label: 'Pro+', detail: 'Get the full suite and flagship workflow.' }
};

const STATUS_COPY: Record<ToolStatus, string> = {
  ready: 'Shipping now',
  beta: 'In active beta',
  'coming-soon': 'Coming soon'
};

const TOOL_MEDIA: Record<string, ToolMedia> = {
  'split-it': {
    icon: 'assets/tools/split-it/icon.ico',
    screenshot: 'assets/tools/split-it/screenshot.png',
    preview: 'assets/tools/split-it/preview.mp4'
  },
  'screw-it': {
    icon: 'assets/tools/screw-it/icon.ico',
    screenshot: 'assets/tools/screw-it/screenshot.png'
  },
  'trim-it': {
    icon: 'assets/tools/trim-it/icon.ico',
    screenshot: 'assets/tools/trim-it/screenshot.png',
    preview: 'assets/tools/trim-it/preview.mp4'
  },
  'convert-it': {
    icon: 'assets/tools/convert-it/icon.ico',
    preview: 'assets/tools/convert-it/preview.mp4'
  },
  'fx-it': {
    icon: 'assets/tools/fx-it/icon.ico'
  },
  'test-it': {
    icon: 'assets/tools/test-it/icon.ico',
    preview: 'assets/tools/test-it/preview.mp4'
  },
  'icon-it': {
    icon: 'assets/tools/icon-it/icon.ico',
    preview: 'assets/tools/icon-it/preview.mp4'
  },
  workstation: {
    icon: 'assets/tools/workstation/icon.ico'
  }
};

const assetUrl = (relativePath: string): string => `${import.meta.env.BASE_URL}${relativePath}`;

const getScreenshotCandidates = (primaryScreenshot: string): string[] => {
  const candidates = [primaryScreenshot];

  if (primaryScreenshot.endsWith('.jpg')) {
    candidates.push(primaryScreenshot.replace(/\.jpg$/i, '.png'));
  }

  if (primaryScreenshot.endsWith('.jpeg')) {
    candidates.push(primaryScreenshot.replace(/\.jpeg$/i, '.png'));
  }

  return candidates;
};

const getIconCandidates = (primaryIcon: string): string[] => {
  const candidates = [primaryIcon];

  if (primaryIcon.endsWith('.png')) {
    candidates.push(primaryIcon.replace(/\.png$/i, '.ico'));
  }

  if (primaryIcon.endsWith('.ico')) {
    candidates.push(primaryIcon.replace(/\.ico$/i, '.png'));
  }

  return candidates;
};

function ToolMediaImage({
  src,
  alt,
  className,
  fallback
}: {
  src: string | string[];
  alt: string;
  className: string;
  fallback: React.ReactNode;
}) {
  const srcList = React.useMemo(() => (Array.isArray(src) ? src : [src]), [src]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [srcList]);

  const currentSrc = srcList[index];
  const exhausted = index >= srcList.length || !currentSrc;

  if (exhausted) return <>{fallback}</>;

  return (
    <img
      src={assetUrl(currentSrc)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setIndex(prev => prev + 1)}
    />
  );
}

function ToolPreviewMedia({
  toolId,
  toolName
}: {
  toolId: string;
  toolName: string;
}) {
  const [videoFailed, setVideoFailed] = React.useState(false);
  const media = TOOL_MEDIA[toolId];

  if (!media) {
    return <div className="tool-visual__screenshot-fallback">No media configured for {toolName}</div>;
  }

  if (media.preview && !videoFailed) {
    return (
      <video
        className="tool-visual__preview"
        src={assetUrl(media.preview)}
        poster={media.screenshot ? assetUrl(media.screenshot) : undefined}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (!media.screenshot) {
    return <div className="tool-visual__screenshot-fallback">Preview media coming soon for {toolName}</div>;
  }

  return (
    <ToolMediaImage
      src={getScreenshotCandidates(media.screenshot)}
      alt={`${toolName} screenshot`}
      className="tool-visual__screenshot"
      fallback={<div className="tool-visual__screenshot-fallback">Add screenshot.jpg or screenshot.png for {toolName}</div>}
    />
  );
}

const LANDING_TOOLS = TOOLS.map((tool, index) => ({
  ...tool,
  order: index + 1,
  story: TOOL_STORIES[tool.id]
}));

const pricingTiers = [
  {
    name: 'Free',
    note: 'Essential utility layer',
    tools: ['TrimIt', 'ConvertIt', 'TestIt'],
    emphasis: 'start'
  },
  {
    name: 'Pro',
    note: 'Creative production toolkit',
    tools: ['SplitIt', 'ScrewIt', 'FXit', 'IconIt'],
    emphasis: 'grow'
  },
  {
    name: 'Pro+',
    note: 'Full suite with Workstation beta',
    tools: ['Everything in Pro', 'NoDAW Workstation beta'],
    emphasis: 'lead'
  }
];

const vstProducts = [
  {
    name: 'TimeStretchX',
    route: '/vst/timestretchx',
    line: 'Time and pitch control that stays musical at extreme moves.',
    value: 'Formant-safe algorithms, transient-preserving stretch, cinematic slowdown texture.',
    metric: '0.5x to 8x range'
  },
  {
    name: 'RepairIT',
    route: '/vst/repairait',
    line: 'Fast restoration for noisy takes and damaged archive material.',
    value: 'Spectral cleanup, click/hum correction, transparent noise reduction.',
    metric: 'Up to -24 dB noise shaping'
  },
  {
    name: 'ClipIT',
    route: '/vst/clipit',
    line: 'Precision clipping tuned for loudness without brittle artifacts.',
    value: 'Soft/hard clip curves, oversampling modes, mastering-safe transients.',
    metric: '< 1 ms processing latency'
  },
  {
    name: 'Chronos Dynamic EQ',
    route: '/vst/chronos-dynamic-eq',
    line: 'Surgical dynamic shaping that responds to musical context.',
    value: 'Band-dependent compression, adaptive thresholds, smart resonance control.',
    metric: 'Up to 12 dynamic bands'
  },
  {
    name: 'SaturateIT',
    route: '/vst/saturateit',
    line: 'Analog-style harmonic color with controlled warmth and depth.',
    value: 'Tape/tube voicing, blend workflow, harmonics that survive mastering chains.',
    metric: '12 saturation models'
  }
];

const buildAppHref = (path: string): string => {
  return `#${path}`;
};

const scrollToSection = (id: string) => {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function ThemeToggle() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    const html = document.documentElement;
    if (newTheme === 'light') {
      html.classList.add('theme-light');
      html.setAttribute('data-theme', 'light');
    } else {
      html.classList.remove('theme-light');
      html.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <span className="theme-toggle__icon theme-toggle__sun">☀️</span>
      ) : (
        <span className="theme-toggle__icon theme-toggle__moon">🌙</span>
      )}
    </button>
  );
}

function SalesHero() {
  const [activeToolId, setActiveToolId] = React.useState<string>('launcher');
  
  // Hero launcher video metadata
  const launcherHero = {
    id: 'launcher',
    name: 'NoDAW Launcher',
    tagline: 'Unified command center for all tools',
    tier: 'pro_plus' as ToolTier,
    status: 'ready' as ToolStatus,
  };

  const activeTool = activeToolId === 'launcher' 
    ? launcherHero 
    : LANDING_TOOLS.find(t => t.id === activeToolId) || LANDING_TOOLS[0];

  const isLauncherActive = activeToolId === 'launcher';

  return (
    <section className="sales-hero sales-hero--launcher">
      {/* Minimal header bar */}
      <div className="hero-launcher__header">
        <div className="hero-launcher__branding">
          <span className="hero-launcher__sigil">◆</span>
          <h1 className="hero-launcher__title">NoDAW</h1>
        </div>
        <div className="hero-launcher__header-right">
          <div className="hero-launcher__status">
            <span className="hero-launcher__pulse" aria-hidden="true" />
            <span>8 Tools Active</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Active tool demo zone (large, motion-heavy) */}
      <div className="hero-launcher__viewport">
        <div className="hero-launcher__viewport-bg" aria-hidden="true">
          <div className="hero-launcher__scanlines" />
          <div className="hero-launcher__glow" />
        </div>

        <div className="hero-launcher__demo">
          {/* Icon + name for active tool */}
          <div className="hero-launcher__tool-header">
            <div className="hero-launcher__tool-icon">
              {isLauncherActive ? (
                <span className="hero-launcher__tool-icon-fallback">◆</span>
              ) : (
                <ToolMediaImage
                  src={getIconCandidates(TOOL_MEDIA[activeTool.id]?.icon || '')}
                  alt={`${activeTool.name} icon`}
                  className="hero-launcher__tool-icon-image"
                  fallback={<span className="hero-launcher__tool-icon-fallback">{(activeTool as any).icon}</span>}
                />
              )}
            </div>
            <div>
              <h2 className="hero-launcher__tool-name">{activeTool.name}</h2>
              <p className="hero-launcher__tool-tagline">{activeTool.tagline}</p>
            </div>
          </div>

          {/* Large media preview */}
          <div className="hero-launcher__media-frame">
            {isLauncherActive ? (
              <video
                src="./assets/hero/launcher-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="hero-launcher__media-video"
              />
            ) : (
              <ToolPreviewMedia toolId={activeTool.id} toolName={activeTool.name} />
            )}
          </div>

          {/* Quick metadata */}
          <div className="hero-launcher__metadata">
            <span className="hero-launcher__tier">{isLauncherActive ? 'All Tiers' : TIER_COPY[(activeTool as any).tier].label}</span>
            <span className="hero-launcher__status">{isLauncherActive ? 'Live' : STATUS_COPY[(activeTool as any).status]}</span>
          </div>
        </div>
      </div>

      {/* Interactive tool grid (launcher pad) */}
      <div className="hero-launcher__tools">
        <div className="hero-launcher__tools-label">Tool Suite</div>
        <div className="hero-launcher__grid">
          {/* Launcher itself as first button */}
          <button
            className={`hero-launcher__tool-pad ${activeToolId === 'launcher' ? 'is-active' : ''}`}
            onClick={() => setActiveToolId('launcher')}
            aria-pressed={activeToolId === 'launcher'}
            aria-label="Select launcher"
            style={{ animationDelay: '0ms' }}
          >
            <div className="hero-launcher__pad-icon">
              <span className="hero-launcher__pad-icon-fallback">◆</span>
            </div>
            <span className="hero-launcher__pad-label">Launcher</span>
          </button>

          {/* Individual tools */}
          {LANDING_TOOLS.map((tool, idx) => (
            <button
              key={tool.id}
              className={`hero-launcher__tool-pad ${activeToolId === tool.id ? 'is-active' : ''}`}
              onClick={() => setActiveToolId(tool.id)}
              aria-pressed={activeToolId === tool.id}
              aria-label={`Select ${tool.name}`}
              style={{
                animationDelay: `${(idx + 1) * 30}ms`
              }}
            >
              <div className="hero-launcher__pad-icon">
                <ToolMediaImage
                  src={getIconCandidates(TOOL_MEDIA[tool.id]?.icon || '')}
                  alt={`${tool.name}`}
                  className="hero-launcher__pad-icon-image"
                  fallback={<span className="hero-launcher__pad-icon-fallback">{tool.icon}</span>}
                />
              </div>
              <span className="hero-launcher__pad-label">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="hero-launcher__actions">
        <button type="button" onClick={() => scrollToSection('tools')} className="hero-launcher__action-link">Explore Suite</button>
        <button type="button" onClick={() => scrollToSection('tiers')} className="hero-launcher__action-link">View Tiers</button>
      </div>
    </section>
  );
}

function ToolSection({ tool, index }: { tool: Tool & { order: number; story: ToolStory }; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <section id={tool.id} className={`tool-story tool-story--${tool.story.surface}${reversed ? ' tool-story--reverse' : ''}`}>
      <div className="sales-shell tool-story__grid">
        <div className="tool-story__visual">
          <div className={`tool-visual tool-visual--${tool.story.accent}`}>
            <div className="tool-visual__chrome">
              <span>{String(tool.order).padStart(2, '0')}</span>
              <span>{STATUS_COPY[tool.status]}</span>
            </div>
            <div className="tool-visual__hero">
              <div className="tool-visual__icon-wrap">
                <ToolMediaImage
                  src={getIconCandidates(TOOL_MEDIA[tool.id]?.icon || '')}
                  alt={`${tool.name} icon`}
                  className="tool-visual__icon-image"
                  fallback={<span className="tool-visual__icon-fallback">{tool.icon}</span>}
                />
              </div>
              <div className="tool-visual__screenshot-wrap">
                <ToolPreviewMedia toolId={tool.id} toolName={tool.name} />
              </div>
            </div>
            <div className="tool-visual__wave" />
            <div className="tool-visual__labels">
              <span>{tool.tagline}</span>
              <span>{TIER_COPY[tool.tier].label}</span>
            </div>
          </div>
        </div>

        <div className="tool-story__content">
          <span className="sales-kicker">{tool.story.eyebrow}</span>
          <h2>{tool.name}</h2>
          <p className="tool-story__hook">{tool.story.hook}</p>
          <p className="tool-story__body">{tool.story.audience}</p>

          <div className="tool-story__meta">
            <span className="tool-pill">{TIER_COPY[tool.tier].label}</span>
            <span className="tool-pill">{STATUS_COPY[tool.status]}</span>
            {tool.route ? <span className="tool-pill">{tool.route}</span> : null}
          </div>

          <div className="tool-story__lists">
            <ul>
              {tool.story.featureList.map(item => <li key={item}>{item}</li>)}
            </ul>
            <div className="tool-proofstack">
              {tool.story.proof.map(item => <span key={item}>{item}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="tiers" className="sales-shell pricing-grid">
      {pricingTiers.map(tier => (
        <article key={tier.name} className={`pricing-card pricing-card--${tier.emphasis}`}>
          <span className="sales-kicker">Suite tier</span>
          <h3>{tier.name}</h3>
          <p>{tier.note}</p>
          <ul>
            {tier.tools.map(tool => <li key={tool}>{tool}</li>)}
          </ul>
        </article>
      ))}
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    'Pull a finished song into SplitIt or ScrewIt depending on whether you need extraction or manipulation.',
    'Use TrimIt and ConvertIt to turn ideas into deliverables without detouring through a traditional editor.',
    'Shape previews with FXit, validate choices in TestIt, and escalate into Workstation when the idea becomes a session.'
  ];

  return (
    <section className="sales-shell workflow-band">
      <div>
        <span className="sales-kicker">How the suite works</span>
        <h2>Each page sells a tool. Together they sell momentum.</h2>
      </div>
      <ol>
        {steps.map(step => <li key={step}>{step}</li>)}
      </ol>
    </section>
  );
}

function VstAdvancedFxSection() {
  return (
    <section id="vst-fx" className="sales-shell vst-advanced">
      <div className="vst-advanced__header">
        <div>
          <span className="sales-kicker">VST Advanced FX</span>
          <h2>High quality processing built to add real value, not just knobs.</h2>
          <p>
            Every plugin is positioned as a focused outcome engine: cleaner source, louder masters,
            stronger tone identity, and faster delivery from draft to release.
          </p>
        </div>
        <a className="sales-button sales-button--primary" href={buildAppHref('/vst/saturateit')}>Explore flagship VST page</a>
      </div>

      <div className="vst-advanced__meta">
        <span>64-bit processing pipeline</span>
        <span>Studio-grade algorithms</span>
        <span>Fast modern UI workflows</span>
      </div>

      <div className="vst-advanced__grid">
        {vstProducts.map((product, index) => (
          <article key={product.name} className="vst-advanced__card" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="vst-advanced__card-top">
              <strong>{product.name}</strong>
              <span>{product.metric}</span>
            </div>
            <p className="vst-advanced__line">{product.line}</p>
            <p className="vst-advanced__value">{product.value}</p>
            <a href={buildAppHref(product.route)} className="vst-advanced__link">Open product page</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function FooterCta() {
  return (
    <section className="sales-shell footer-cta">
      <div>
        <span className="sales-kicker">Launch faster</span>
        <h2>Sell the suite like a modern product family, not a feature dump.</h2>
        <p>
          This landing structure gives every tool its own emotional angle while keeping the suite identity coherent.
        </p>
      </div>
      <div className="sales-actions">
        <button type="button" className="sales-button sales-button--primary" onClick={() => scrollToSection('top')}>Back to top</button>
        <button type="button" className="sales-button sales-button--secondary" onClick={() => scrollToSection('tools')}>Review the tools</button>
      </div>
    </section>
  );
}

export default function SalesLandingPage() {
  return (
    <main id="top" className="sales-page">
      <SalesHero />
      <VstAdvancedFxSection />
      <section id="tools" className="sales-toolrail">
        {LANDING_TOOLS.map((tool, index) => (
          <ToolSection key={tool.id} tool={tool} index={index} />
        ))}
      </section>
      <WorkflowSection />
      <PricingSection />
      <FooterCta />
    </main>
  );
}