import React, { useEffect, useRef } from 'react';
import './vst-premium.css';

export default function RepairITPage() {
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
      time += 0.008;
      ctx.fillStyle = 'rgba(2, 4, 8, 0.95)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Surgical healing visualization - clean waveform with artifact removal
      const centerY = canvas.offsetHeight / 2;
      
      // Degraded waveform (before)
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < canvas.offsetWidth; i += 2) {
        const noise = Math.random() * 60 - 30;
        const y = centerY + noise + Math.sin(i / 30) * 20;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Clean waveform (after) - morphing in
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const morphAmount = (Math.sin(time * 1.5) + 1) / 2;
      for (let i = 0; i < canvas.offsetWidth; i += 2) {
        const cleanWave = Math.sin(i / 40 + time) * 25;
        const noise = Math.random() * 60 - 30;
        const y = centerY + cleanWave + (noise * (1 - morphAmount));
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Glow
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="vst-page vst-repairait">
      <section className="vst-hero vst-hero--repairait">
        <div className="vst-hero__bg">
          <canvas ref={canvasRef} className="vst-hero__canvas" />
        </div>
        <div className="vst-hero__overlay" />

        <div className="vst-hero__content">
          <div className="vst-hero__badge">Audio Restoration</div>
          <h1 className="vst-hero__title">
            RepairIT<br />
            <span className="vst-hero__subtitle">Surgical Precision • AI-Powered Healing</span>
          </h1>
          <p className="vst-hero__description">
            Remove clicks, pops, hum, and noise in seconds. AI understands your audio and heals it intelligently,
            preserving the source material while eliminating unwanted artifacts.
          </p>

          <div className="vst-hero__ctas">
            <button className="vst-btn vst-btn--primary vst-btn--repairait">
              Start Restoring Now
            </button>
            <button className="vst-btn vst-btn--secondary">Watch Demo</button>
          </div>

          <div className="vst-hero__stats">
            <div className="vst-stat">
              <div className="vst-stat__value">500K+</div>
              <div className="vst-stat__label">Audio Files Healed</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">95%</div>
              <div className="vst-stat__label">Artifact Removal Rate</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">2ms</div>
              <div className="vst-stat__label">Processing Latency</div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-features vst-features--repairait">
        <div className="vst-container">
          <h2 className="vst-section__title">Professional Restoration</h2>

          <div className="vst-features__grid">
            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔧</div>
              <h3>Intelligent Artifact Detection</h3>
              <p>AI identifies clicks, pops, crackle, and noise automatically. Works on any audio source.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎯</div>
              <h3>One-Click Restoration</h3>
              <p>Analyze and heal with a single click. Manual controls for precise tweaking when needed.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎙️</div>
              <h3>Mouth Noise & Breath</h3>
              <p>Reduce breath noise, lip smacks, and mouth clicks while preserving vocal clarity.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">⚡</div>
              <h3>Real-Time Processing</h3>
              <p>Zero latency on playback. Analyze complex passages in seconds.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🌐</div>
              <h3>Hum & Buzz Removal</h3>
              <p>Remove 50/60 Hz hum and electrical interference with surgical precision.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">📊</div>
              <h3>Before/After Preview</h3>
              <p>Side-by-side visualization. Hear exactly what's being removed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-specs vst-specs--repairait">
        <div className="vst-container">
          <h2 className="vst-section__title">Technical Specifications</h2>

          <div className="vst-specs__grid">
            <div className="vst-spec-item">
              <label>Restoration Types</label>
              <value>6 modes + AI auto</value>
            </div>
            <div className="vst-spec-item">
              <label>Processing Speed</label>
              <value>Real-time, no rendering</value>
            </div>
            <div className="vst-spec-item">
              <label>Formats</label>
              <value>VST3, AU, AAX</value>
            </div>
            <div className="vst-spec-item">
              <label>CPU Usage</label>
              <value>&lt;2% average</value>
            </div>
            <div className="vst-spec-item">
              <label>Audio Quality</label>
              <value>32-bit / 64-bit support</value>
            </div>
            <div className="vst-spec-item">
              <label>Sample Rates</label>
              <value>44.1 kHz - 384 kHz</value>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-pricing vst-pricing--repairait">
        <div className="vst-container">
          <h2 className="vst-section__title">Transparent Pricing</h2>

          <div className="vst-pricing__cards">
            <div className="vst-pricing-card">
              <h3>Starter</h3>
              <div className="vst-pricing-card__price">$39</div>
              <p>Essential restoration</p>
              <ul className="vst-pricing-features">
                <li>✓ Core restoration suite</li>
                <li>✓ 30-day refund guarantee</li>
                <li>✓ Free lifetime updates</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get Started</button>
            </div>

            <div className="vst-pricing-card vst-pricing-card--featured">
              <div className="vst-pricing-card__badge">Most Popular</div>
              <h3>Professional</h3>
              <div className="vst-pricing-card__price">$99</div>
              <p>Full restoration toolkit</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Starter</li>
                <li>✓ AI-powered restoration</li>
                <li>✓ Batch processing</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="vst-btn vst-btn--primary vst-btn--repairait">
                Get RepairIT Pro
              </button>
            </div>

            <div className="vst-pricing-card">
              <h3>Studio</h3>
              <div className="vst-pricing-card__price">$249</div>
              <p>Team license</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Pro</li>
                <li>✓ 5 team licenses</li>
                <li>✓ Custom workflows</li>
                <li>✓ Dedicated support</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-social-proof vst-social-proof--repairait">
        <div className="vst-container">
          <h2 className="vst-section__title">Trusted by Audio Professionals</h2>

          <div className="vst-testimonials">
            <div className="vst-testimonial">
              <p>"RepairIT saved my entire podcast archive. Restored 200+ episodes in weeks instead of months."</p>
              <div className="vst-testimonial__author">
                <strong>Sarah Chen</strong>
                <span>Podcast Producer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"The breath reduction is incredible. Vocal recordings sound studio-clean with zero artifacts."</p>
              <div className="vst-testimonial__author">
                <strong>Marcus Thompson</strong>
                <span>Audio Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Worth every penny. Removes the tedious restoration work so I can focus on mixing."</p>
              <div className="vst-testimonial__author">
                <strong>Elena Rodriguez</strong>
                <span>Mix Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-footer-cta vst-footer-cta--repairait">
        <div className="vst-container">
          <h2>Restore Your Audio Today</h2>
          <p>Join 500K+ professionals healing audio with RepairIT.</p>
          <button className="vst-btn vst-btn--primary vst-btn--large vst-btn--repairait">
            Get RepairIT Now
          </button>
        </div>
      </section>
    </div>
  );
}
