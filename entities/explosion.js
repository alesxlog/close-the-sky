// ============================================================
// CLOSE THE SKY — explosion.js
// Generic explosion animation — one type for all enemies
// ============================================================

class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.duration = CONFIG.EXPLOSION.DURATION;
    this.done = false;
    this.particles = this._generate();
  }

  _generate() {
    const particles = [];
    const colors = CONFIG.EXPLOSION.COLORS;
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 / 18) * i + Math.random() * 0.3;
      const speed = 60 + Math.random() * 120;
      particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return particles;
  }

  update(dt) {
    this.age += dt * 1000;
    if (this.age >= this.duration) { this.done = true; return; }

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt; // slight gravity
    }
  }

  draw(ctx) {
    const progress = this.age / this.duration;
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Flash ring
    if (progress < 0.15) {
      const r = (CONFIG.EXPLOSION.WIDTH / 2) * (progress / 0.15);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 100, ${0.6 * (1 - progress / 0.15)})`;
      ctx.fill();
    }

    // Expanding ring
    const ringR = (CONFIG.EXPLOSION.WIDTH / 2) * progress;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 140, 0, ${alpha * 0.6})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.size * (1 - progress * 0.7)), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }

    ctx.restore();
  }
}
