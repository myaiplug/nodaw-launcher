import React, { useEffect, useRef } from 'react';
import './vst-premium.css';

export default function ClipITPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.012;
      ctx.fillStyle = 'rgba(2, 4, 8, 0.95)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Aggressive clipping visualization
      const centerY = canvas.offsetHeight / 2;
      
      // Waveform with aggressive clipping
      ctx.strokeStyle = '#FF6B9D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < canvas.offsetWidth; i += 1) {
        const wave = Math.sin(i / 20 + time) * 40;
        const clip = Math.max(-50, Math.min(50, wave + Math.sin(time * 2) * 20));
        const y = centerY + clip;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = 'rgba(255, 107, 157, 0.2)';
      ctx.lineWidth = 12;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Saturation indicators
      ctx.fillStyle = '#FF6B9D';
      for (let i = 0; i < 20; i++) {
        const x = (canvas.offsetWidth / 20) * i;
        const intensity = Math.abs(Math.sin(time * 2 + i)) * 6;
        ctx.fillRect(x - 2, centerY - 60 - intensity, 4, 120 + intensity * 2);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="vst-page vst-clipit">
      <section className="vst-hero vst-hero--clipit">
        <div className="vst-hero__bg">
          <canvas ref={canvasRef} className="vst-hero__canvas" />
        </div>
        <div className="vst-hero__overlay" />

        <div className="vst-hero__content">
          <div className="vst-hero__badge">Harmonic Saturation</div>
          <h1 className="vst-hero__title">
            ClipIT<br />
            <span className="vst-hero__subtitle">Aggressive Edge • Warm Harmonics</span>
          </h1>
          <p className="vst-hero__description">
            Transform dynamics into musicality. ClipIT adds warmth, character, and aggression.
            Perfect for drums, bass, vocals, and parallel compression chains.
          </p>

          <div className="vst-hero__ctas">
            <button className="vst-btn vst-btn--primary vst-btn--clipit">
              Unleash Your Sound
            </button>
            <button className="vst-btn vst-btn--secondary">Hear Examples</button>
          </div>

          <div className="vst-hero__stats">
            <div className="vst-stat">
              <div className="vst-stat__value">8</div>
              <div className="vst-stat__label">Clipping Algorithms</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">10K+</div>
              <div className="vst-stat__label">Happy Users</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">Surgical</div>
              <div className="vst-stat__label">Alias-Free</div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-features vst-features--clipit">
        <div className="vst-container">
          <h2 className="vst-section__title">Multifaceted Aggression</h2>

          <div className="vst-features__grid">
            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎸</div>
              <h3>8 Clipping Modes</h3>
              <p>From soft knee saturation to aggressive hard clipping. Each mode has unique harmonic character.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🥁</div>
              <h3>Drum Devastation</h3>
              <p>Add punch, glue, and aggression to any drum track. Control without destruction.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔊</div>
              <h3>Bass Magic</h3>
              <p>Warm, thick, aggressive bass. Perfect for synths and low-end saturation.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎤</div>
              <h3>Vocal Glue</h3>
              <p>Add presence, intimacy, and aggression to vocals without harshness.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔗</div>
              <h3>Parallel Chain Ready</h3>
              <p>Optimized for New York-style compression chains. Mix with dry signal seamlessly.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">⚙️</div>
              <h3>Aliasing-Free</h3>
              <p>Oversampling and anti-alias filtering. No digital artifacts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-specs vst-specs--clipit">
        <div className="vst-container">
          <h2 className="vst-section__title">Premium Specifications</h2>

          <div className="vst-specs__grid">
            <div className="vst-spec-item">
              <label>Clipping Algorithms</label>
              <value>8 unique algorithms</value>
            </div>
            <div className="vst-spec-item">
              <label>Oversampling</label>
              <value>Up to 8x</value>
            </div>
            <div className="vst-spec-item">
              <label>Formats</label>
              <value>VST3, AU, AAX, Standalone</value>
            </div>
            <div className="vst-spec-item">
              <label>Latency</label>
              <value>&lt;0.5ms (algorithmic)</value>
            </div>
            <div className="vst-spec-item">
              <label>CPU Usage</label>
              <value>&lt;4% (8x oversampling)</value>
            </div>
            <div className="vst-spec-item">
              <label>Quality</label>
              <value>64-bit internal processing</value>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-pricing vst-pricing--clipit">
        <div className="vst-container">
          <h2 className="vst-section__title">Direct Pricing</h2>

          <div className="vst-pricing__cards">
            <div className="vst-pricing-card">
              <h3>Standard</h3>
              <div className="vst-pricing-card__price">$34</div>
              <p>Powerful clipping engine</p>
              <ul className="vst-pricing-features">
                <li>✓ All 8 clipping modes</li>
                <li>✓ Oversampling support</li>
                <li>✓ Free updates</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get ClipIT</button>
            </div>

            <div className="vst-pricing-card vst-pricing-card--featured">
              <div className="vst-pricing-card__badge">Best Value</div>
              <h3>Premium</h3>
              <div className="vst-pricing-card__price">$84</div>
              <p>Professional + presets</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Standard</li>
                <li>✓ 200+ craft presets</li>
                <li>✓ Priority support</li>
                <li>✓ Resale license</li>
              </ul>
              <button className="vst-btn vst-btn--primary vst-btn--clipit">
                Get ClipIT Premium
              </button>
            </div>

            <div className="vst-pricing-card">
              <h3>Enterprise</h3>
              <div className="vst-pricing-card__price">Contact</div>
              <p>Custom licensing</p>
              <ul className="vst-pricing-features">
                <li>✓ Unlimited licenses</li>
                <li>✓ Custom algorithms</li>
                <li>✓ API access</li>
                <li>✓ White-label option</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get in Touch</button>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-social-proof vst-social-proof--clipit">
        <div className="vst-container">
          <h2 className="vst-section__title">Loved by Artists</h2>

          <div className="vst-testimonials">
            <div className="vst-testimonial">
              <p>"ClipIT is my secret weapon. Every drum track gets it. The warmth is incredible."</p>
              <div className="vst-testimonial__author">
                <strong>Dev Williams</strong>
                <span>Producer / Drummer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Added ClipIT to my mastering chain and it instantly improved glue. Permanent fixture now."</p>
              <div className="vst-testimonial__author">
                <strong>Lisa Ko</strong>
                <span>Mastering Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"The best saturation plugin I've used. Period. Eight modes of pure genius."</p>
              <div className="vst-testimonial__author">
                <strong>James Murphy</strong>
                <span>Electronic Producer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-footer-cta vst-footer-cta--clipit">
        <div className="vst-container">
          <h2>Add Character to Your Mix</h2>
          <p>Experience the warmth. Feel the aggression.</p>
          <button className="vst-btn vst-btn--primary vst-btn--large vst-btn--clipit">
            Get ClipIT Now
          </button>
        </div>
      </section>
    </div>
  );
}
