// ============================================================
// CLOSE THE SKY — projectiles.js
// MG tracer, Autocannon shell, SAM homing rocket
// ============================================================

class ProjectileBase {
  constructor(x, y, weaponId) {
    this.x = x;
    this.y = y;
    this.weaponId = weaponId;
    this.dead = false;
    this.distTravelled = 0;
  }
}

// ============================================================
// BULLET — Machine Gun tracer
// ============================================================
class Bullet extends ProjectileBase {
  constructor(x, y) {
    super(x, y, 'mg');
    const W = CONFIG.WEAPONS.MG;
    this.speed = W.projSpeed;
    this.despawnDist = W.despawnDist;
    this.damage = W.damage;
    this.width = W.projectileWidth;
    this.color = W.projectileColor;
    this.trailAlpha = W.trailAlpha;
    this._trail = [];
  }

  update(dt) {
    const dy = this.speed * dt;
    this._trail.unshift({ x: this.x, y: this.y });
    if (this._trail.length > 5) this._trail.pop();

    this.y -= dy;
    this.distTravelled += dy;

    if (this.distTravelled >= this.despawnDist) this.dead = true;
    if (this.y < CONFIG.CANVAS.PLAY_TOP) this.dead = true;
  }

  // Damage with distance falloff
  getDamage(enemyY) {
    const dist = Math.abs(CONFIG.CANVAS.CAR_Y - enemyY);
    const falloff = CONFIG.WEAPONS.MG.falloff;
    for (const f of falloff) {
      if (dist <= f.maxDist) return Math.round(this.damage * f.multiplier);
    }
    return Math.round(this.damage * falloff[falloff.length - 1].multiplier);
  }

  draw(ctx) {
    ctx.save();

    // Faint trail
    for (let i = 0; i < this._trail.length; i++) {
      const t = this._trail[i];
      const alpha = this.trailAlpha * (1 - i / this._trail.length);
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,150,${alpha})`;
      ctx.fill();
    }

    // Bullet
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// SHELL — Autocannon 20mm
// ============================================================
class Shell extends ProjectileBase {
  constructor(x, y) {
    super(x, y, 'autocannon');
    const W = CONFIG.WEAPONS.AUTOCANNON;
    this.speed = W.projSpeed;
    this.despawnDist = W.despawnDist;
    this.damage = W.damage;
    this.width = W.projectileWidth;
    this.color = W.projectileColor;
    this.trailAlpha = W.trailAlpha;
    this._trail = [];
  }

  update(dt) {
    const dy = this.speed * dt;
    this._trail.unshift({ x: this.x, y: this.y });
    if (this._trail.length > 8) this._trail.pop();

    this.y -= dy;
    this.distTravelled += dy;

    if (this.distTravelled >= this.despawnDist) this.dead = true;
    if (this.y < CONFIG.CANVAS.PLAY_TOP) this.dead = true;
  }

  getDamage() { return this.damage; }

  draw(ctx) {
    ctx.save();

    // Bright trail
    for (let i = 0; i < this._trail.length; i++) {
      const t = this._trail[i];
      const alpha = this.trailAlpha * (1 - i / this._trail.length);
      const r = (this.width / 2) * (1 - i / this._trail.length * 0.5);
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,180,50,${alpha})`;
      ctx.fill();
    }

    // Shell
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width / 2, this.width, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// ROCKET — SAM homing missile
// ============================================================
class Rocket extends ProjectileBase {
  constructor(x, y, target) {
    super(x, y, 'sam');
    const W = CONFIG.WEAPONS.SAM;
    this.speed = W.projSpeed;
    this.damage = W.damage;
    this.target = target; // enemy instance
    this.dead = false;
    this._trail = [];
    // Direction — initially straight up
    this.vx = 0;
    this.vy = -this.speed;
  }

  update(dt) {
    // Home toward target
    if (this.target && !this.target.dead && !this.target.reachedBottom) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        // Steer toward target — turn rate limits sharp u-turns
        const desiredVx = (dx / dist) * this.speed;
        const desiredVy = (dy / dist) * this.speed;
        const turnRate = 4.0; // higher = snappier homing
        this.vx += (desiredVx - this.vx) * turnRate * dt;
        this.vy += (desiredVy - this.vy) * turnRate * dt;
        // Normalise to maintain speed
        const mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = (this.vx / mag) * this.speed;
        this.vy = (this.vy / mag) * this.speed;
      }
    } else {
      // Target gone — continue straight
      this.dead = true;
      return;
    }

    this._trail.unshift({ x: this.x, y: this.y });
    if (this._trail.length > 12) this._trail.pop();

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Despawn if off canvas
    if (this.y < -50 || this.y > CONFIG.CANVAS.HEIGHT + 50) this.dead = true;
  }

  getDamage() { return this.damage; }

  draw(ctx) {
    const W = CONFIG.WEAPONS.SAM;

    ctx.save();

    // Fire thrust trail
    for (let i = 0; i < this._trail.length; i++) {
      const t = this._trail[i];
      const alpha = 0.7 * (1 - i / this._trail.length);
      const r = (W.projectileWidth / 2) * (1 - i / this._trail.length * 0.6);
      // Inner fire
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${Math.floor(200 - i * 12)},0,${alpha})`;
      ctx.fill();
      // Outer glow
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,0,${alpha * 0.3})`;
      ctx.fill();
    }

    // Rocket body
    const angle = Math.atan2(this.vy, this.vx);
    ctx.translate(this.x, this.y);
    ctx.rotate(angle + Math.PI / 2);

    ctx.fillStyle = W.projectileColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, W.projectileWidth / 2, W.projectileWidth, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose tip
    ctx.beginPath();
    ctx.moveTo(-W.projectileWidth / 2, 0);
    ctx.lineTo(W.projectileWidth / 2, 0);
    ctx.lineTo(0, -W.projectileWidth * 1.2);
    ctx.closePath();
    ctx.fillStyle = '#ffddaa';
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// FACTORY
// ============================================================
function createProjectiles(player) {
  const projectiles = [];

  for (const weapon of player.weapons) {
    const id = weapon.id;

    if (id === 'mg') {
      const sep = weapon.doubleBarrel ? CONFIG.WEAPONS.MG.doubleBarrel.separation / 2 : 0;
      if (weapon.doubleBarrel) {
        projectiles.push(new Bullet(player.x - sep, player.y - player.height / 2));
        projectiles.push(new Bullet(player.x + sep, player.y - player.height / 2));
      } else {
        projectiles.push(new Bullet(player.x, player.y - player.height / 2));
      }
    }

    if (id === 'autocannon') {
      const sep = weapon.doubleBarrel ? CONFIG.WEAPONS.AUTOCANNON.doubleBarrel.separation / 2 : 0;
      if (weapon.doubleBarrel) {
        projectiles.push(new Shell(player.x - sep, player.y - player.height / 2));
        projectiles.push(new Shell(player.x + sep, player.y - player.height / 2));
      } else {
        projectiles.push(new Shell(player.x, player.y - player.height / 2));
      }
    }

    // SAM fires autonomously — handled by SAMSystem, not here
  }

  return projectiles;
}
