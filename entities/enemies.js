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
  }

  update(dt) {
    this.age += dt * 1000;
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
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y >= CONFIG.CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Delta wing — tip at BOTTOM (pointing toward player)
    // Tail/wings at top
    const path = new Path2D();
    path.moveTo(0,      h/2);            // tip — bottom
    path.lineTo(-w/2,  -h/2 * 0.5);     // left wing tip
    path.lineTo(-w/8,  -h/2 * 0.1);     // inner left
    path.lineTo(0,     -h/2);            // tail center top
    path.lineTo(w/8,   -h/2 * 0.1);     // inner right
    path.lineTo(w/2,   -h/2 * 0.5);     // right wing tip
    path.closePath();

    // Body fill
    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    // Dark center spine
    const spine = new Path2D();
    spine.moveTo(0,     h/2);
    spine.lineTo(-w/8, -h/2 * 0.1);
    spine.lineTo(0,    -h/2);
    spine.lineTo(w/8,  -h/2 * 0.1);
    spine.closePath();
    ctx.fillStyle = cfg.accentColor;
    ctx.fill(spine);

    // Rim light — clip to body shape
    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    // Orange sensor dot at tip (bottom)
    ctx.beginPath();
    ctx.arc(0, h/2 - 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600';
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
    this.x = this.startX + Math.sin(this.y * 0.0018 + this.phase) * amp;

    if (this.y >= CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Taller narrower delta — tip at bottom
    const path = new Path2D();
    path.moveTo(0,      h/2);
    path.lineTo(-w/2,  -h/2 * 0.4);
    path.lineTo(-w/10, -h/2 * 0.05);
    path.lineTo(0,     -h/2);
    path.lineTo(w/10,  -h/2 * 0.05);
    path.lineTo(w/2,   -h/2 * 0.4);
    path.closePath();

    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    // Split center
    const spine = new Path2D();
    spine.moveTo(-w/10, -h/2 * 0.5);
    spine.lineTo(-w/10, -h/2 * 0.05);
    spine.lineTo(0,      h/2);
    spine.lineTo(w/10,  -h/2 * 0.05);
    spine.lineTo(w/10,  -h/2 * 0.5);
    spine.closePath();
    ctx.fillStyle = cfg.accentColor;
    ctx.fill(spine);

    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, h/2 - 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600';
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
    this.x += this._dirX * speed * dt;

    if (this.y >= CANVAS.PLAY_BOTTOM) this.reachedBottom = true;
  }

  draw(ctx) {
    const cfg = this.cfg;
    const w = cfg.spriteW, h = cfg.spriteH;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Wider flatter shape — tip at bottom
    const path = new Path2D();
    path.moveTo(0,      h/2 * 0.6);     // blunt tip at bottom
    path.lineTo(-w/2,  -h/2 * 0.4);
    path.lineTo(-w/6,  -h/2 * 0.05);
    path.lineTo(0,     -h/2);
    path.lineTo(w/6,   -h/2 * 0.05);
    path.lineTo(w/2,   -h/2 * 0.4);
    path.closePath();

    ctx.fillStyle = cfg.bodyColor;
    ctx.fill(path);

    const spine = new Path2D();
    spine.moveTo(0,     h/2 * 0.6);
    spine.lineTo(-w/6, -h/2 * 0.05);
    spine.lineTo(0,    -h/2);
    spine.lineTo(w/6,  -h/2 * 0.05);
    spine.closePath();
    ctx.fillStyle = cfg.accentColor;
    ctx.fill(spine);

    ctx.save();
    ctx.clip(path);
    this._applyRimLight(ctx, w, h, cfg.rimColor);
    ctx.restore();

    // Terminal glow at rear (top)
    if (this._terminal) {
      ctx.beginPath();
      ctx.arc(0, -h/2 + 6, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,120,0,0.85)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, h/2 * 0.6 - 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600';
    ctx.fill();

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
    this.x = this.startX + Math.sin(t * Math.PI * 2 + this.phase) * cfg.sineAmplitude;
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
    this.x = this.startX + Math.sin(t * Math.PI * 2 + this.phase) * cfg.sineAmplitude;
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

    this.x = Math.max(40, Math.min(CANVAS.WIDTH - 40, this.x));
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
