// ============================================================
// CLOSE THE SKY — enemies.js
// All 6 enemy types. Each extends EnemyBase.
// Enemies descend nose/tip first (toward player at bottom)
// ============================================================

class EnemyBase {
  constructor(type, x) {
    this.type = type;
    this.cfg = CONFIG.ENEMIES[type.toUpperCase()];
    this.x = x;
    this.y = CONFIG.CANVAS.PLAY_TOP;
    this.hp = this.cfg.hp;
    this.maxHp = this.cfg.hp;
    this.dead = false;
    this.reachedBottom = false;
    this.age = 0;
    this.bounceFlip = 1;
  }

  update(dt) {
    this.age += dt * 1000;
  }

  _checkBounce() {
    const half = this.cfg.hitboxW / 2;
    if (this.x < half) {
      this.x = half;
      this.bounceFlip *= -1;
    } else if (this.x > CONFIG.CANVAS.WIDTH - half) {
      this.x = CONFIG.CANVAS.WIDTH - half;
      this.bounceFlip *= -1;
    }
  }

  isOffScreen() {
    return this.y > CONFIG.CANVAS.PLAY_BOTTOM + this.cfg.hitboxH;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.dead = true;
    return this.dead;
  }

  getBounds() {
    return {
      left:   this.x - this.cfg.hitboxW / 2,
      right:  this.x + this.cfg.hitboxW / 2,
      top:    this.y - this.cfg.hitboxH / 2,
      bottom: this.y + this.cfg.hitboxH / 2,
    };
  }

  // Rim light clipped to a path already defined in ctx
  // Call AFTER defining the clip path, BEFORE ctx.restore()
  _applyRimLight(ctx, w, h, color) {
    const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// ============================================================
// GERAN-1 — delta wing drone, sharp diagonal descent
// Tip points DOWN (toward player)
// ============================================================
class Geran1 extends EnemyBase {
  constructor(x) {
    super('geran1', x);
    const cfg = CONFIG.ENEMIES.GERAN1;
    const angle = (cfg.diagonalAngle + Math.random() * 5) * (Math.PI / 180);
    this.vx = Math.sin(angle) * cfg.speed * (Math.random() < 0.5 ? 1 : -1);
    this.vy = Math.cos(angle) * cfg.speed;
  }

  update(dt) {
    super.update(dt);
    this.x += this.vx * this.bounceFlip * dt;
    this.y += this.vy * dt;
    this._checkBounce();
    if (this.y >= CONFIG.CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH; // 64×64

    ctx.save();
    ctx.translate(this.x, this.y);

    // ---- Main delta wing — pure triangle ----
    // Tip at bottom, straight trailing edge at top
    ctx.beginPath();
    ctx.moveTo(0,      h/2);    // nose tip — bottom center
    ctx.lineTo(-w/2,  -h/2);    // left wingtip — top left
    ctx.lineTo( w/2,  -h/2);    // right wingtip — top right
    ctx.closePath();
    ctx.fillStyle = '#dcdcdc';
    ctx.fill();

    // ---- Panel line — darker inner triangle ----
    ctx.beginPath();
    ctx.moveTo(0,      h/2 - 4);
    ctx.lineTo(-w/2 + 10, -h/2 + 6);
    ctx.lineTo( w/2 - 10, -h/2 + 6);
    ctx.closePath();
    ctx.fillStyle = '#b8b8b8';
    ctx.fill();

    // ---- Fuselage — narrow oval along center spine ----
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.07, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#a8a8a8';
    ctx.fill();

    // ---- Tail fin — small rectangle at rear (top) ----
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-2, -h/2, 4, 10);

    // ---- Engine circle at very rear ----
    ctx.beginPath();
    ctx.arc(0, -h/2 + 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -h/2 + 6, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#cccccc';
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// GERAN-2 — taller delta, slalom
// ============================================================
class Geran2 extends EnemyBase {
  constructor(x) {
    super('geran2', x);
    this.startX = x;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    super.update(dt);
    const cfg = this.cfg;
    const CANVAS = CONFIG.CANVAS;

    this.y += cfg.speed * dt;

    const progress = Math.max(0, (this.y - CANVAS.PLAY_TOP) / (CANVAS.PLAY_BOTTOM - CANVAS.PLAY_TOP));
    const amp = cfg.slalomAmpTop + (cfg.slalomAmpBottom - cfg.slalomAmpTop) * progress;
    this.x = this.startX + Math.sin(this.y * 0.0018 + this.phase) * amp * this.bounceFlip;
    this._checkBounce();
    if (this.y >= CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH; // 64×80

    ctx.save();
    ctx.translate(this.x, this.y);

    // ---- Main delta wing — narrower, more elongated ----
    ctx.beginPath();
    ctx.moveTo(0,      h/2);
    ctx.lineTo(-w/2,  -h/2);
    ctx.lineTo( w/2,  -h/2);
    ctx.closePath();
    ctx.fillStyle = '#787878';
    ctx.fill();

    // ---- Panel line ----
    ctx.beginPath();
    ctx.moveTo(0,      h/2 - 4);
    ctx.lineTo(-w/2 + 10, -h/2 + 6);
    ctx.lineTo( w/2 - 10, -h/2 + 6);
    ctx.closePath();
    ctx.fillStyle = '#585858';
    ctx.fill();

    // ---- Fuselage ----
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.07, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#484848';
    ctx.fill();

    // ---- Tail fin ----
    ctx.fillStyle = '#686868';
    ctx.fillRect(-2, -h/2, 4, 10);

    // ---- Engine ----
    ctx.beginPath();
    ctx.arc(0, -h/2 + 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -h/2 + 6, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// GERAN-3 — wide flat drone, terminal acceleration
// ============================================================
class Geran3 extends EnemyBase {
  constructor(x) {
    super('geran3', x);
    const cfg = CONFIG.ENEMIES.GERAN3;
    const angle = cfg.diagonalAngle * (Math.PI / 180);
    this._dirX = Math.sin(angle) * (Math.random() < 0.5 ? 1 : -1);
    this._terminal = false;
  }

  update(dt) {
    super.update(dt);
    const cfg = this.cfg;
    const CANVAS = CONFIG.CANVAS;

    const distToBottom = CANVAS.PLAY_BOTTOM - this.y;
    const speed = this._terminal ? cfg.speedTerminal : cfg.speedNormal;
    const timeToBottom = distToBottom / speed;
    if (timeToBottom <= cfg.terminalTime / 1000) this._terminal = true;

    this.y += speed * dt;
    this.x += this._dirX * this.bounceFlip * speed * dt;
    this._checkBounce();

    if (this.y >= CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH; // 72×80

    ctx.save();
    ctx.translate(this.x, this.y);

    // ---- Main delta wing — wider, more aggressive sweep ----
    ctx.beginPath();
    ctx.moveTo(0,      h/2);
    ctx.lineTo(-w/2,  -h/2);
    ctx.lineTo( w/2,  -h/2);
    ctx.closePath();
    ctx.fillStyle = '#252525';
    ctx.fill();

    // ---- Panel line ----
    ctx.beginPath();
    ctx.moveTo(0,      h/2 - 4);
    ctx.lineTo(-w/2 + 12, -h/2 + 6);
    ctx.lineTo( w/2 - 12, -h/2 + 6);
    ctx.closePath();
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // ---- Fuselage — slightly thicker for Geran-3 ----
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.09, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();

    // ---- Tail fin ----
    ctx.fillStyle = '#303030';
    ctx.fillRect(-2, -h/2, 4, 12);

    // ---- Engine ----
    ctx.beginPath();
    ctx.arc(0, -h/2 + 7, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -h/2 + 7, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#555555';
    ctx.fill();

    // ---- Terminal glow — engine afterburner ----
    if (this._terminal) {
      ctx.beginPath();
      ctx.arc(0, -h/2 + 7, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,120,0,0.85)';
      ctx.fill();
    }

    ctx.restore();
  }
}

// ============================================================
// KH-555 — cruise missile, wide sine, nose at bottom
// ============================================================
class Kh555 extends EnemyBase {
  constructor(x) {
    super('kh555', x);
    this.startX = x;
    this.phase = Math.random() * Math.PI * 2;
    this.inRadar = false;
    this.lockTimer = 0;
  }

  update(dt) {
    super.update(dt);
    const cfg = this.cfg;
    this.y += cfg.speed * dt;
    const t = this.age / cfg.sinePeriod;
    this.x = this.startX + Math.sin(t * Math.PI * 2 + this.phase) * cfg.sineAmplitude * this.bounceFlip;
    this._checkBounce();
    if (this.y >= CONFIG.CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Body — vertical missile, nose at BOTTOM
    const bw = w * 0.45, bh = h * 0.72;

    const path = new Path2D();
    path.roundRect(-bw/2, -h/2, bw, bh, 4);

    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    // Nose cone at bottom
    ctx.beginPath();
    ctx.moveTo(-bw/2, -h/2 + bh);
    ctx.lineTo( bw/2, -h/2 + bh);
    ctx.lineTo(0,      h/2);
    ctx.closePath();
    ctx.fillStyle = cfg.noseColor;
    ctx.fill();

    // Upper fins (near top/tail)
    ctx.fillStyle = cfg.finColor;
    ctx.fillRect(-w/2, -h/2 + 10, w, 8);
    // Mid fins
    ctx.fillRect(-w/2 * 0.8, -h/2 + bh * 0.55, w * 0.8, 8);

    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    ctx.restore();
  }
}

// ============================================================
// KALIBR — slimmer missile, medium curves
// ============================================================
class Kalibr extends EnemyBase {
  constructor(x) {
    super('kalibr', x);
    this.startX = x;
    this.phase = Math.random() * Math.PI * 2;
    this.inRadar = false;
    this.lockTimer = 0;
  }

  update(dt) {
    super.update(dt);
    const cfg = this.cfg;
    this.y += cfg.speed * dt;
    const t = this.age / cfg.sinePeriod;
    this.x = this.startX + Math.sin(t * Math.PI * 2 + this.phase) * cfg.sineAmplitude * this.bounceFlip;
    this._checkBounce();
    if (this.y >= CONFIG.CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.translate(this.x, this.y);

    const bw = w * 0.36, bh = h * 0.70;

    const path = new Path2D();
    path.roundRect(-bw/2, -h/2, bw, bh, 4);

    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    // Nose at bottom
    ctx.beginPath();
    ctx.moveTo(-bw/2, -h/2 + bh);
    ctx.lineTo( bw/2, -h/2 + bh);
    ctx.lineTo(0,      h/2);
    ctx.closePath();
    ctx.fillStyle = cfg.noseColor;
    ctx.fill();

    ctx.fillStyle = cfg.finColor;
    ctx.fillRect(-w/2 * 0.7, -h/2 + 10, w * 0.7, 7);
    ctx.fillRect(-w/2 * 0.55, -h/2 + bh * 0.5, w * 0.55, 7);

    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    ctx.restore();
  }
}

// ============================================================
// KH-101 — stealth missile, unpredictable path
// ============================================================
class Kh101 extends EnemyBase {
  constructor(x) {
    super('kh101', x);
    this.startX = x;
    this.inRadar = false;
    this.lockTimer = 0;
    this.hasBeenFired = false;

    this._p1 = { freq: 0.0008, amp: 120, phase: Math.random() * Math.PI * 2 };
    this._p2 = { freq: 0.0021, amp: 60,  phase: Math.random() * Math.PI * 2 };
    this._p3 = { freq: 0.0047, amp: 30,  phase: Math.random() * Math.PI * 2 };
  }

  update(dt) {
    super.update(dt);
    const cfg = this.cfg;
    const CANVAS = CONFIG.CANVAS;

    this.y += cfg.speed * dt;

    const t = this.age;
    this.x = this.startX
      + Math.sin(t * this._p1.freq + this._p1.phase) * this._p1.amp
      + Math.sin(t * this._p2.freq + this._p2.phase) * this._p2.amp
      + Math.sin(t * this._p3.freq + this._p3.phase) * this._p3.amp;

    this._checkBounce();
    if (this.y >= CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  _getOpacity() {
    const cfg = this.cfg;
    if (this.age < cfg.stealthDuration) return cfg.stealthOpacity;
    if (this.age < cfg.stealthDuration + cfg.stealthFadeTime) {
      const t = (this.age - cfg.stealthDuration) / cfg.stealthFadeTime;
      return cfg.stealthOpacity + (1 - cfg.stealthOpacity) * t;
    }
    return 1;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.globalAlpha = this._getOpacity();
    ctx.translate(this.x, this.y);

    const bw = w * 0.36, bh = h * 0.76;

    const path = new Path2D();
    path.roundRect(-bw/2, -h/2, bw, bh, 3);

    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    // Nose at bottom
    ctx.beginPath();
    ctx.moveTo(-bw/2, -h/2 + bh);
    ctx.lineTo( bw/2, -h/2 + bh);
    ctx.lineTo(0,      h/2);
    ctx.closePath();
    ctx.fillStyle = cfg.noseColor;
    ctx.fill();

    // Swept fins — minimal
    ctx.fillStyle = cfg.finColor;
    ctx.fillRect(-w/2 * 0.6, -h/2 + 12, w * 0.6, 5);

    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    ctx.restore();
  }
}

// ============================================================
// FACTORY
// ============================================================
function createEnemy(type, x) {
  switch (type) {
    case 'geran1':  return new Geran1(x);
    case 'geran2':  return new Geran2(x);
    case 'geran3':  return new Geran3(x);
    case 'kh555':   return new Kh555(x);
    case 'kalibr':  return new Kalibr(x);
    case 'kh101':   return new Kh101(x);
    default: console.warn('Unknown enemy type:', type); return null;
  }
}
