import React, { useEffect, useRef } from 'react';
import './vst-premium.css';

export default function TimeStretchXPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Three.js style canvas visualization for tempo/time stretching
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear with dark background
      ctx.fillStyle = 'rgba(2, 4, 8, 0.95)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Temporal waveform visualization
      ctx.strokeStyle = '#FF9F43';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = canvas.offsetHeight / 2;
      const waveLength = 8;
      
      for (let i = 0; i < canvas.offsetWidth; i += 4) {
        const x = i;
        // Create morphing waveform effect
        const baseWave = Math.sin((i / 50 + time * 2) * Math.PI) * 40;
        const modulation = Math.sin(time * 1.5) * 20;
        const y = centerY + baseWave + modulation;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = 'rgba(255, 159, 67, 0.2)';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Time markers
      ctx.fillStyle = 'rgba(255, 159, 67, 0.4)';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      for (let i = 0; i < 5; i++) {
        const x = (canvas.offsetWidth / 4) * i;
        ctx.fillRect(x - 1, centerY - 30, 2, 60);
        ctx.fillText(`${(i * 25).toFixed(0)}%`, x, centerY + 50);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="vst-page vst-timestretchx">
      {/* Hero Section */}
      <section className="vst-hero vst-hero--timestretchx">
        <div className="vst-hero__bg">
          <canvas
            ref={canvasRef}
            className="vst-hero__canvas"
          />
        </div>

        <div className="vst-hero__overlay" />

        <div className="vst-hero__content">
          <div className="vst-hero__badge">Temporal Intelligence</div>
          
          <h1 className="vst-hero__title">
            TimeStretchX<br />
            <span className="vst-hero__subtitle">Infinite Tempo • Zero Artifacts</span>
          </h1>

          <p className="vst-hero__description">
            Time-stretch like a prophet. Stretch to any tempo without losing musicality. 
            Real-time AI detects beat patterns and adapts intelligently.
          </p>

          <div className="vst-hero__ctas">
            <button className="vst-btn vst-btn--primary vst-btn--timestretchx">
              Try Free for 30 Days
            </button>
            <button className="vst-btn vst-btn--secondary">
              Watch Demo
            </button>
          </div>

          <div className="vst-hero__stats">
            <div className="vst-stat">
              <div className="vst-stat__value">1000+</div>
              <div className="vst-stat__label">Audio Professionals</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">4.9★</div>
              <div className="vst-stat__label">Average Rating</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">99%</div>
              <div className="vst-stat__label">Artifact Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="vst-features vst-features--timestretchx">
        <div className="vst-container">
          <h2 className="vst-section__title">Why TimeStretchX</h2>

          <div className="vst-features__grid">
            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">⚡</div>
              <h3>Intelligent Beat Detection</h3>
              <p>AI analyzes your track's tempo, rhythm, and musical character. Stretches preserve groove and feel.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎯</div>
              <h3>50-150% Speed Range</h3>
              <p>Extreme stretching capability. Slow down complex passages to learn. Speed up repetitive sections effortlessly.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎨</div>
              <h3>Zero Pitch Shift</h3>
              <p>Change tempo without altering pitch. Or link both for creative retuning effects.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">⚙️</div>
              <h3>Real-Time Preview</h3>
              <p>Hear changes instantly. No rendering required. Waveform updates as you adjust.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔗</div>
              <h3>DAW Integration</h3>
              <p>VST3, AU, AAX. Works in every major DAW. GPU-accelerated for zero CPU overhead.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🌙</div>
              <h3>Learning Mode</h3>
              <p>Adaptive UI learns your preferences. Custom presets for genre-specific stretching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section className="vst-specs vst-specs--timestretchx">
        <div className="vst-container">
          <h2 className="vst-section__title">Technical Specifications</h2>

          <div className="vst-specs__grid">
            <div className="vst-spec-item">
              <label>Processing Latency</label>
              <value>2.5ms @ 48kHz</value>
            </div>
            <div className="vst-spec-item">
              <label>CPU Usage</label>
              <value>&lt;3% (GPU-optimized)</value>
            </div>
            <div className="vst-spec-item">
              <label>Formats</label>
              <value>VST3, AU, AAX, Standalone</value>
            </div>
            <div className="vst-spec-item">
              <label>Min Requirements</label>
              <value>4GB RAM, GPU acceleration</value>
            </div>
            <div className="vst-spec-item">
              <label>Audio Quality</label>
              <value>32-bit floating point</value>
            </div>
            <div className="vst-spec-item">
              <label>Support Platforms</label>
              <value>Mac, Windows, Linux</value>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="vst-pricing vst-pricing--timestretchx">
        <div className="vst-container">
          <h2 className="vst-section__title">Simple, Transparent Pricing</h2>

          <div className="vst-pricing__cards">
            <div className="vst-pricing-card">
              <h3>Starter</h3>
              <div className="vst-pricing-card__price">$29</div>
              <p>One-time license</p>
              <ul className="vst-pricing-features">
                <li>✓ Full TimeStretchX</li>
                <li>✓ 30-day refund</li>
                <li>✓ Free updates</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get Started</button>
            </div>

            <div className="vst-pricing-card vst-pricing-card--featured">
              <div className="vst-pricing-card__badge">Most Popular</div>
              <h3>Studio</h3>
              <div className="vst-pricing-card__price">$79</div>
              <p>Lifetime license + support</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Starter</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced presets</li>
                <li>✓ Custom tempo profiles</li>
              </ul>
              <button className="vst-btn vst-btn--primary vst-btn--timestretchx">
                Get TimeStretchX Studio
              </button>
            </div>

            <div className="vst-pricing-card">
              <h3>Pro</h3>
              <div className="vst-pricing-card__price">$199</div>
              <p>Studio + suite license</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Studio</li>
                <li>✓ Team licenses (5)</li>
                <li>✓ API access</li>
                <li>✓ Custom branding</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Inquire</button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="vst-social-proof vst-social-proof--timestretchx">
        <div className="vst-container">
          <h2 className="vst-section__title">Loved by Top Artists</h2>

          <div className="vst-testimonials">
            <div className="vst-testimonial">
              <p>"TimeStretchX changed how I work. Zero artifacts, incredible speed. It's magic."</p>
              <div className="vst-testimonial__author">
                <strong>Alex Sterling</strong>
                <span>Producer, Grammy Nominated</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"The AI detection is insane. Detects tempo better than I can ear."</p>
              <div className="vst-testimonial__author">
                <strong>Jordan Mills</strong>
                <span>Mastering Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Finally, a tool that respects the music while stretching it."</p>
              <div className="vst-testimonial__author">
                <strong>Casey Liu</strong>
                <span>DJ / Remixer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="vst-footer-cta vst-footer-cta--timestretchx">
        <div className="vst-container">
          <h2>Ready to Revolutionize Your Workflow?</h2>
          <p>Join 1000+ professionals using TimeStretchX.</p>
          <button className="vst-btn vst-btn--primary vst-btn--large vst-btn--timestretchx">
            Get TimeStretchX Now
          </button>
        </div>
      </section>
    </div>
  );
}
