import React, { useEffect, useRef } from 'react';
import './vst-premium.css';

export default function ChronosDynamicEQPage() {
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
      time += 0.01;
      ctx.fillStyle = 'rgba(2, 4, 8, 0.95)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // EQ frequency curve with dynamic response
      ctx.strokeStyle = '#7B61FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const centerY = canvas.offsetHeight / 2;
      for (let i = 0; i < canvas.offsetWidth; i += 1) {
        const freq = (i / canvas.offsetWidth) * 20000;
        const baseEQ = Math.sin((i / canvas.offsetWidth) * Math.PI * 2 + time) * 30;
        const dynamic = Math.sin(time * 1.5 + freq / 1000) * 15;
        const y = centerY + baseEQ + dynamic;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Spectrum analyzer bars
      ctx.fillStyle = '#7B61FF';
      for (let i = 0; i < 32; i++) {
        const x = (canvas.offsetWidth / 32) * i;
        const height = (Math.sin(time + i * 0.3) + 1) * 40;
        ctx.fillRect(x + 2, centerY - height, canvas.offsetWidth / 32 - 4, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="vst-page vst-chronos">
      <section className="vst-hero vst-hero--chronos">
        <div className="vst-hero__bg">
          <canvas ref={canvasRef} className="vst-hero__canvas" />
        </div>
        <div className="vst-hero__overlay" />

        <div className="vst-hero__content">
          <div className="vst-hero__badge">Surgical EQ</div>
          <h1 className="vst-hero__title">
            Chronos Dynamic EQ<br />
            <span className="vst-hero__subtitle">Intelligent Surgical Precision</span>
          </h1>
          <p className="vst-hero__description">
            7-band dynamic EQ with real-time frequency analysis. Automatically adapts to every part of your mix.
            Perfect for transparent tonal shaping.
          </p>

          <div className="vst-hero__ctas">
            <button className="vst-btn vst-btn--primary vst-btn--chronos">
              Start Sculpting
            </button>
            <button className="vst-btn vst-btn--secondary">See It in Action</button>
          </div>

          <div className="vst-hero__stats">
            <div className="vst-stat">
              <div className="vst-stat__value">7</div>
              <div className="vst-stat__label">Dynamic Bands</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">Real-Time</div>
              <div className="vst-stat__label">Frequency Analysis</div>
            </div>
            <div className="vst-stat">
              <div className="vst-stat__value">100%</div>
              <div className="vst-stat__label">Transparent</div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-features vst-features--chronos">
        <div className="vst-container">
          <h2 className="vst-section__title">Surgical Frequency Control</h2>

          <div className="vst-features__grid">
            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">📊</div>
              <h3>Real-Time Spectrum</h3>
              <p>Live frequency analysis with 32-band resolution. See exactly what you're EQing.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🎛️</div>
              <h3>7-Band Dynamic EQ</h3>
              <p>Each band responds dynamically to signal content. Threshold-based processing.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">🔍</div>
              <h3>Precision Metering</h3>
              <p>Detailed input/output metering. Mastery-grade measurement tools built-in.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">⚙️</div>
              <h3>Intelligent Automation</h3>
              <p>Fully automatable. Record and sculpt EQ in real-time while mixing.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">📈</div>
              <h3>Linear Phase Mode</h3>
              <p>Zero phase shift option for accurate surgical work.</p>
            </div>

            <div className="vst-feature-card">
              <div className="vst-feature-card__icon">💾</div>
              <h3>Preset Library</h3>
              <p>150+ professional presets for every mixing scenario.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-specs vst-specs--chronos">
        <div className="vst-container">
          <h2 className="vst-section__title">Technical Excellence</h2>

          <div className="vst-specs__grid">
            <div className="vst-spec-item">
              <label>Bands</label>
              <value>7 dynamic + 1 master</value>
            </div>
            <div className="vst-spec-item">
              <label>Spectrum Resolution</label>
              <value>32-band analyzer</value>
            </div>
            <div className="vst-spec-item">
              <label>Formats</label>
              <value>VST3, AU, AAX</value>
            </div>
            <div className="vst-spec-item">
              <label>Latency</label>
              <value>&lt;1ms (linear phase)</value>
            </div>
            <div className="vst-spec-item">
              <label>CPU Usage</label>
              <value>&lt;3% average</value>
            </div>
            <div className="vst-spec-item">
              <label>Automation</label>
              <value>Full parameter control</value>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-pricing vst-pricing--chronos">
        <div className="vst-container">
          <h2 className="vst-section__title">Professional Pricing</h2>

          <div className="vst-pricing__cards">
            <div className="vst-pricing-card">
              <h3>Mixing</h3>
              <div className="vst-pricing-card__price">$49</div>
              <p>For mixing engineers</p>
              <ul className="vst-pricing-features">
                <li>✓ 7-band dynamic EQ</li>
                <li>✓ Spectrum analyzer</li>
                <li>✓ 50 presets</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Get Started</button>
            </div>

            <div className="vst-pricing-card vst-pricing-card--featured">
              <div className="vst-pricing-card__badge">Professional</div>
              <h3>Mastering</h3>
              <div className="vst-pricing-card__price">$129</div>
              <p>Mastery-grade tools</p>
              <ul className="vst-pricing-features">
                <li>✓ Everything in Mixing</li>
                <li>✓ Linear phase mode</li>
                <li>✓ 150 presets</li>
                <li>✓ Dedicated support</li>
              </ul>
              <button className="vst-btn vst-btn--primary vst-btn--chronos">
                Get Chronos Pro
              </button>
            </div>

            <div className="vst-pricing-card">
              <h3>Studio</h3>
              <div className="vst-pricing-card__price">$299</div>
              <p>Studio + team</p>
              <ul className="vst-pricing-features">
                <li>✓ Unlimited instances</li>
                <li>✓ 5 team licenses</li>
                <li>✓ API access</li>
                <li>✓ Custom workflows</li>
              </ul>
              <button className="vst-btn vst-btn--secondary">Inquire</button>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-social-proof vst-social-proof--chronos">
        <div className="vst-container">
          <h2 className="vst-section__title">Mastering Engineer Favorite</h2>

          <div className="vst-testimonials">
            <div className="vst-testimonial">
              <p>"Chronos is my go-to for surgical EQ work. The transparency is unmatched in this category."</p>
              <div className="vst-testimonial__author">
                <strong>Tom Holken</strong>
                <span>Grammy-Winning Mastering Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"7 bands of pure precision. The real-time spectrum makes shaping effortless and transparent."</p>
              <div className="vst-testimonial__author">
                <strong>Patricia Young</strong>
                <span>Mix Engineer</span>
              </div>
            </div>

            <div className="vst-testimonial">
              <p>"Dynamic EQ that actually responds intelligently. Chronos takes the guesswork out of EQ."</p>
              <div className="vst-testimonial__author">
                <strong>David Park</strong>
                <span>Producer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vst-footer-cta vst-footer-cta--chronos">
        <div className="vst-container">
          <h2>Precision EQ for Professionals</h2>
          <p>Join mastering engineers who demand transparent, intelligent EQ.</p>
          <button className="vst-btn vst-btn--primary vst-btn--large vst-btn--chronos">
            Get Chronos Dynamic EQ
          </button>
        </div>
      </section>
    </div>
  );
}
