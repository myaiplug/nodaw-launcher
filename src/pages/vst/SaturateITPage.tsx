import React, { useEffect, useRef } from 'react';
import './vst-premium.css';

export default function SaturateITPage() {
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

      // Warm, vintage saturation visualization
      const centerY = canvas.offsetHeight / 2;
      
      // Soft saturation curve
      ctx.strokeStyle = '#FFB800';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < canvas.offsetWidth; i += 2) {
        const x = i;
        const input = (i / canvas.offsetWidth) * 2 - 1;
        const saturated = Math.tanh(input * (2 + Math.sin(time) * 0.5));
        const harmonic = Math.sin(time * 2 + i / 20) * 0.1;
        const y = centerY - (saturated + harmonic) * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Warm glow
      ctx.strokeStyle = 'rgba(255, 184, 0, 0.2)';
      ctx.lineWidth = 16;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Harmonic overtones visualization
      ctx.fillStyle = 'rgba(255, 184, 0, 0.1)';
      for (let harmonic = 1; harmonic <= 4; harmonic++) {
        ctx.beginPath();
        for (let i = 0; i < canvas.offsetWidth; i += 3) {
          const freq = harmonic;
          const amp = 40 / harmonic;
          const y = centerY + Math.sin((i / 30) * freq + time * harmonic) * amp;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="vst-page vst-saturateit">
      <section className="vst-hero vst-hero--saturateit">
        <div className="vst-hero__bg">
          <canvas ref={canvasRef} className="vst-hero__canvas" />
        </div>
        <div className="vst-hero__overlay" />

        <div className="vst-hero__content">
          <div className="vst-hero__badge">Analog Warmth</div>
          <h1 className="vst-hero__title">
            SaturateIT<br />
            <span className="vst-hero__subtitle">Vintage Tape • Harmonic Richness</span>
          </h1>
          <p className="vst-hero__description">
            Experience authentic analog saturation. SaturateIT models classic tape machines and tube circuits.
            Warm, smooth, musical. The secret weapon in professional studios.
          </p>

          <div className="vst-hero__ctas">
            <button className="vst-btn vst-btn--primary vst-btn--saturateit">
              Add Warmth Now
            </button>
            <button className="vst-btn vst-btn--secondary">Hear Comparisons</button>
          </div>

          <div className="vst-hero__stats">
            <div className="vst-stat">
              <div className="vst-stat__value">12</div>
              <div className="vst-stat__label">Tape Models</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">5K+</div>
              <div className="vst-stat__label">Studio Professionals</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">Unmeasurable</div>
              <div className="vst-stat__label">Vibe Impact</div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-features vst-features--saturateit">
        <div className="vst-container">
          <h2 className="vst-section__title">Authentic Analog Emulation</h2>

          <div className="vst-features__grid">
            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎙️</div>
              <h3>Vintage Tape Models</h3>
              <p>12 authentic tape machine emulations. Chamberlin, Studer, Otari, Ampex, and more.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔥</div>
              <h3>Tube Circuit Emulation</h3>
              <p>Warm, musical tube saturation. Modeled from classic hardware.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎛️</div>
              <h3>Blend Control</h3>
              <p>Mix dry with saturated signal. Parallel processing built-in.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">📊</div>
              <h3>Analog Meter</h3>
              <p>Vintage VU meter display. Watch your levels like a true analog engineer.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🌊</div>
              <h3>Soft Clipping</h3>
              <p>Smooth, musical soft knee. Graceful overdrive character.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">✨</div>
              <h3>Harmonic Enhancement</h3>
              <p>Add subtle harmonics and texture. Bring old recordings to life.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-specs vst-specs--saturateit">
        <div className="vst-container">
          <h2 className="vst-section__title">Engineering Specs</h2>

          <div className="vst-specs__grid">
            <div className="vst-spec-item">
              <label>Tape Models</label>
              <value>12 authentic algorithms</value>
            </div>
            <div className="vst-spec-item">
              <label>Processing Quality</label>
              <value>64-bit double precision</value>
            </div>
            <div className="vst-spec-item">
              <label>Formats</label>
              <value>VST3, AU, AAX, Standalone</value>
            </div>
            <div className="vst-spec-item">
              <label>Latency</label>
              <value>&lt;1ms algorithmic</value>
            </div>
            <div className="vst-spec-item">
              <label>CPU Usage</label>
              <value>&lt;2.5% average</value>
            </div>
            <div className="vst-spec-item">
              <label>Audio Quality</label>
              <value>Transparent to source</value>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-pricing vst-pricing--saturateit">
        <div className="vst-container">
          <h2 className="vst-section__title">Warmth Pricing</h2>

          <div className="vst-pricing__cards">
            <div className="vst-pricing-card">
              <h3>Essentials</h3>
              <div className="vst-pricing-card__price">$39</div>
              <p>Core saturation suite</p>
              <ul className="vst-pricing-features">
                <li>✓ 6 tape models</li>
                <li>✓ Blend control</li>
                <li>✓ Free updates</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get Started</button>
            </div>

            <div className="vst-pricing-card vst-pricing-card--featured">
              <div className="vst-pricing-card__badge">Complete Collection</div>
              <h3>Complete</h3>
              <div className="vst-pricing-card__price">$99</div>
              <p>Full studio suite</p>
              <ul className="vst-pricing-features">
                <li>✓ All 12 tape models</li>
                <li>✓ Tube emulation</li>
                <li>✓ 100 presets</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="vst-btn vst-btn--primary vst-btn--saturateit">
                Get SaturateIT Complete
              </button>
            </div>

            <div className="vst-pricing-card">
              <h3>Lifetime</h3>
              <div className="vst-pricing-card__price">$199</div>
              <p>Forever license</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Complete</li>
                <li>✓ Future updates</li>
                <li>✓ Lifetime support</li>
                <li>✓ API access</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get Lifetime</button>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-social-proof vst-social-proof--saturateit">
        <div className="vst-container">
          <h2 className="vst-section__title">Analog Warmth Champions</h2>

          <div className="vst-testimonials">
            <div className="vst-testimonial">
              <p>"SaturateIT is the warmth I've been missing. Sounds like real tape. Incredible plugin."</p>
              <div className="vst-testimonial__author">
                <strong>Chris Nolan</strong>
                <span>Mix Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Finally, analog saturation that doesn't sound plastic. This is the real deal."</p>
              <div className="vst-testimonial__author">
                <strong>Rebecca Stone</strong>
                <span>Producer / Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Used this on every track. The tape models are so authentic. Worth every penny."</p>
              <div className="vst-testimonial__author">
                <strong>Ryan Torres</strong>
                <span>Mastering Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-footer-cta vst-footer-cta--saturateit">
        <div className="vst-container">
          <h2>Bring Warmth to Your Mix</h2>
          <p>Experience authentic analog saturation. Join 5K+ professionals.</p>
          <button className="vst-btn vst-btn--primary vst-btn--large vst-btn--saturateit">
            Get SaturateIT Now
          </button>
        </div>
      </section>
    </div>
  );
}
