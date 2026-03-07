// ============================================================
// CLOSE THE SKY — splashScene.js
// Animated sunset → night over city skyline.
// Title + subtitle fade in. Press any key → menu.
// ============================================================

class SplashScene extends SceneBase {
  constructor(canvas, ctx, onComplete) {
    super(canvas, ctx);
    this.onComplete = onComplete;
    this._bg = NightBackground.get();
    this._elapsed = 0;
    this._done = false;

    // Timeline (seconds)
    this._SUNSET_DUR   = 6;    // sky animation duration
    this._TITLE_START  = 2.5;  // title begins fading in
    this._TITLE_DUR    = 1.5;  // title fade duration
    this._SUB_START    = 4.0;  // subtitle begins fading in
    this._SUB_DUR      = 1.5;
    this._PROMPT_START = 6.0;  // "press any key" appears
    this._FADE_OUT_DUR = 0.6;

    // Fade out state
    this._fadingOut = false;
    this._fadeOutTimer = 0;

    // Sky keyframes: bright afternoon → warm sunset → dusk → night
    this._skyFrames = [
      { t: 0.0, stops: [
        { stop: 0.0, color: [90, 150, 220] },   // bright blue
        { stop: 0.4, color: [140, 190, 240] },   // light blue
        { stop: 0.75,color: [250, 200, 120] },   // warm gold
        { stop: 1.0, color: [255, 140, 60] },    // orange horizon
      ]},
      { t: 0.35, stops: [
        { stop: 0.0, color: [60, 80, 140] },     // deeper blue
        { stop: 0.4, color: [180, 120, 80] },     // amber
        { stop: 0.75,color: [240, 140, 50] },     // deep orange
        { stop: 1.0, color: [220, 80, 30] },      // red horizon
      ]},
      { t: 0.65, stops: [
        { stop: 0.0, color: [30, 30, 70] },       // dark navy
        { stop: 0.4, color: [80, 50, 80] },        // purple
        { stop: 0.75,color: [160, 80, 50] },       // burnt orange
        { stop: 1.0, color: [120, 40, 30] },       // dark red
      ]},
      { t: 1.0, stops: [
        { stop: 0.0, color: [13, 21, 53] },        // dark navy — matches NightBackground
        { stop: 0.4, color: [17, 29, 69] },        // rich navy
        { stop: 0.75,color: [23, 33, 80] },        // deep blue
        { stop: 1.0, color: [30, 45, 98] },        // horizon blue
      ]},
    ];

    // Window twinkle state
    this._windowAlphas = [];
    const wins = this._bg.windows;
    for (let i = 0; i < wins.length; i++) {
      const bAlphas = [];
      for (let j = 0; j < wins[i].length; j++) {
        bAlphas.push({
          onTime: 0.3 + Math.random() * 0.5,  // when window turns on (0-1 of sunset)
          flicker: Math.random() * 0.15,
          phase: Math.random() * Math.PI * 2,
        });
      }
      this._windowAlphas.push(bAlphas);
    }

    this._on(window, 'keydown', (e) => this._skip(e), true);
    this._on(this.canvas, 'click', () => this._skip(), true);
    this._on(this.canvas, 'touchstart', () => this._skip(), true);
  }

  _skip() {
    if (this._fadingOut || this._done) return;
    this._fadingOut = true;
    this._fadeOutTimer = this._FADE_OUT_DUR;
  }

  update(dt) {
    if (this._done) return;
    this._elapsed += dt;

    if (this._fadingOut) {
      this._fadeOutTimer -= dt;
      if (this._fadeOutTimer <= 0) {
        this._done = true;
        this.onComplete();
      }
    }
  }

  draw(ctx) {
    const W = this._CW;
    const H = this._CH;
    const progress = Math.min(1, this._elapsed / this._SUNSET_DUR);

    // ── Animated sky ──
    this._drawAnimatedSky(ctx, progress);

    // ── City silhouette (buildings as black) ──
    ctx.fillStyle = CONFIG.CITY.BUILDING_COLOR;
    for (const b of this._bg.buildings) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    // ── Windows with progressive illumination ──
    const wins = this._bg.windows;
    for (let i = 0; i < wins.length; i++) {
      for (let j = 0; j < wins[i].length; j++) {
        const w = wins[i][j];
        const wa = this._windowAlphas[i][j];
        let alpha = 0;

        if (progress > wa.onTime) {
          const wProg = Math.min(1, (progress - wa.onTime) / 0.15);
          alpha = wProg * (0.7 + 0.3 * Math.sin(this._elapsed * 2 + wa.phase));
          alpha += Math.sin(this._elapsed * 6 + wa.phase) * wa.flicker;
          alpha = Math.max(0, Math.min(1, alpha));
        }

        if (alpha > 0.01) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = w.color;
          ctx.fillRect(w.x, w.y, w.w, w.h);
          // Window glow
          ctx.fillStyle = w.color;
          ctx.globalAlpha = alpha * 0.15;
          ctx.fillRect(w.x - 2, w.y - 2, w.w + 4, w.h + 4);
        }
      }
    }
    ctx.globalAlpha = 1;

    // ── Road ──
    this._bg._drawRoad(ctx);

    // ── HUD area black ──
    ctx.fillStyle = '#000';
    ctx.fillRect(0, CONFIG.CANVAS.HUD_TOP, W, CONFIG.CANVAS.HUD_HEIGHT);

    // ── Title ──
    const titleAlpha = this._textAlpha(this._TITLE_START, this._TITLE_DUR);
    if (titleAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = titleAlpha;
      ctx.font = `bold 56px ${this._FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e0f0d0';
      // Text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.fillText('CLOSE THE SKY', W / 2, 420);
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }

    // ── Subtitle ──
    const subAlpha = this._textAlpha(this._SUB_START, this._SUB_DUR);
    if (subAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = subAlpha * 0.7;
      ctx.font = `italic 18px ${this._FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c8c0a0';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.fillText('Hold up the shield of truth', W / 2, 475);
      ctx.fillText('to stop the fiery arrows of the evil', W / 2, 500);
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }

    // ── Press any key ──
    if (this._elapsed >= this._PROMPT_START && !this._fadingOut) {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(this._elapsed * 2));
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.font = `14px ${this._FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(200,200,180,0.8)';
      ctx.fillText('PRESS ANY KEY', W / 2, 560);
      ctx.restore();
    }

    // ── Fade out overlay ──
    if (this._fadingOut) {
      const fadeAlpha = 1 - (this._fadeOutTimer / this._FADE_OUT_DUR);
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ── Interpolate sky gradient between keyframes ──

  _drawAnimatedSky(ctx, progress) {
    const frames = this._skyFrames;
    let a = frames[0], b = frames[1], t = 0;

    for (let i = 0; i < frames.length - 1; i++) {
      if (progress >= frames[i].t && progress <= frames[i + 1].t) {
        a = frames[i];
        b = frames[i + 1];
        t = (progress - a.t) / (b.t - a.t);
        break;
      }
    }
    if (progress >= frames[frames.length - 1].t) {
      a = b = frames[frames.length - 1];
      t = 0;
    }

    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.ROAD_TOP);
    for (let s = 0; s < a.stops.length; s++) {
      const ca = a.stops[s].color;
      const cb = b.stops[s].color;
      const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
      const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
      const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
      grad.addColorStop(a.stops[s].stop, `rgb(${r},${g},${bl})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this._CW, CONFIG.CANVAS.ROAD_TOP);
  }

  // ── Text alpha helper ──

  _textAlpha(start, dur) {
    if (this._elapsed < start) return 0;
    return Math.min(1, (this._elapsed - start) / dur);
  }
}
