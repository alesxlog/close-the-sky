// ============================================================
// CLOSE THE SKY — interludeScene.js
// Animated sunrise → morning over city skyline.
// Plays between campaign attacks (before AAR → pitstop → brief).
// ============================================================

class InterludeScene extends SceneBase {
  constructor(canvas, ctx, onComplete) {
    super(canvas, ctx);
    this.onComplete = onComplete;
    this._bg = NightBackground.get();
    this._elapsed = 0;
    this._done = false;

    // Timeline
    this._SUNRISE_DUR  = 3;    // total animation
    this._AUTO_ADVANCE = 3.5;  // auto-continue after this
    this._FADE_OUT_DUR = 0.6;

    this._fadingOut = false;
    this._fadeOutTimer = 0;

    // Sky keyframes: night (dark blue) → pre-dawn → dawn → morning
    this._skyFrames = [
      { t: 0.0, stops: [
        { stop: 0.0, color: [13, 21, 53] },        // matches NightBackground top
        { stop: 0.4, color: [17, 29, 69] },        // rich navy
        { stop: 0.75,color: [23, 33, 80] },        // deep blue
        { stop: 1.0, color: [30, 45, 98] },        // horizon blue
      ]},
      { t: 0.3, stops: [
        { stop: 0.0, color: [15, 20, 55] },        // dark blue
        { stop: 0.4, color: [40, 50, 90] },        // indigo
        { stop: 0.75,color: [110, 70, 75] },       // mauve
        { stop: 1.0, color: [170, 90, 55] },       // warm glow
      ]},
      { t: 0.65, stops: [
        { stop: 0.0, color: [26, 35, 85] },        // navy
        { stop: 0.4, color: [74, 111, 165] },      // blue
        { stop: 0.75,color: [220, 155, 85] },      // golden
        { stop: 1.0, color: [255, 145, 65] },      // orange horizon
      ]},
      { t: 1.0, stops: [
        { stop: 0.0, color: [74, 143, 224] },      // matches DayBackground top
        { stop: 0.4, color: [107, 174, 232] },     // mid blue
        { stop: 0.75,color: [245, 201, 122] },     // golden
        { stop: 1.0, color: [240, 144, 64] },      // warm orange — matches DayBackground
      ]},
    ];

    // Window fade-out as sun rises (reverse of splash)
    this._windowAlphas = [];
    const wins = this._bg.windows;
    for (let i = 0; i < wins.length; i++) {
      const bAlphas = [];
      for (let j = 0; j < wins[i].length; j++) {
        bAlphas.push({
          offTime: 0.5 + Math.random() * 0.4,  // when window turns off
          phase: Math.random() * Math.PI * 2,
        });
      }
      this._windowAlphas.push(bAlphas);
    }

    // Skip on input
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

    // Auto-advance
    if (!this._fadingOut && this._elapsed >= this._AUTO_ADVANCE) {
      this._fadingOut = true;
      this._fadeOutTimer = this._FADE_OUT_DUR;
    }

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
    const progress = Math.min(1, this._elapsed / this._SUNRISE_DUR);

    // ── Animated sky ──
    this._drawAnimatedSky(ctx, progress);

    // ── City silhouette ──
    ctx.fillStyle = CONFIG.CITY.BUILDING_COLOR;
    for (const b of this._bg.buildings) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    // ── Windows — lit at start, fade out as sunrise progresses ──
    const wins = this._bg.windows;
    for (let i = 0; i < wins.length; i++) {
      for (let j = 0; j < wins[i].length; j++) {
        const w = wins[i][j];
        const wa = this._windowAlphas[i][j];
        let alpha = 1;

        if (progress > wa.offTime) {
          alpha = 1 - Math.min(1, (progress - wa.offTime) / 0.2);
        }
        // Gentle flicker
        alpha *= 0.7 + 0.3 * Math.sin(this._elapsed * 1.5 + wa.phase);
        alpha = Math.max(0, Math.min(1, alpha));

        if (alpha > 0.01) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = w.color;
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.fillStyle = w.color;
          ctx.globalAlpha = alpha * 0.12;
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

    // ── Fade out overlay ──
    if (this._fadingOut) {
      const fadeAlpha = 1 - (this._fadeOutTimer / this._FADE_OUT_DUR);
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

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
}
