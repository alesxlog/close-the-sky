// ============================================================
// CLOSE THE SKY — player.js
// Car sprite, movement, HP, weapon state
// ============================================================

class Player {
  constructor(vehicleId = 'truck') {
    this.C = CONFIG.CANVAS;
    this._setVehicle(vehicleId);

    this.x = this.C.WIDTH / 2;
    this.y = this.C.CAR_Y;

    this.weapons = [];
    this.slotsUsed = 0;
    this.facingLeft = false; // track direction for sprite flip

    this._img = new Image();
    this._img.src = this.vehicle.sprite;
    this._imgLoaded = false;
    this._img.onload = () => { this._imgLoaded = true; };
  }

  _setVehicle(id) {
    const V = CONFIG.VEHICLES;
    this.vehicle = id === 'lav' ? V.LAV : V.TRUCK;
    this.hp = this.vehicle.hp;
    this.maxHp = this.vehicle.hp;
    this.speed = this.vehicle.speed;
    this.width = this.vehicle.width;
    this.height = this.vehicle.height;
  }

  update(dt) {
    const input = Input.state;
    const halfW = this.width / 2;
    const prevX = this.x;

    if (input.usingMouse && input.mouseX !== null) {
      // Move toward cursor at capped speed — same speed param as keyboard
      const target = Math.max(halfW, Math.min(this.C.WIDTH - halfW, input.mouseX));
      const dx = target - this.x;
      const maxMove = this.speed * dt;
      if (Math.abs(dx) <= maxMove) {
        this.x = target; // close enough — snap
      } else {
        this.x += Math.sign(dx) * maxMove;
      }
    } else {
      if (input.left)  this.x -= this.speed * dt;
      if (input.right) this.x += this.speed * dt;
      this.x = Math.max(halfW, Math.min(this.C.WIDTH - halfW, this.x));
    }

    // Update facing direction
    const dx = this.x - prevX;
    if (dx < -0.5) this.facingLeft = true;
    if (dx > 0.5)  this.facingLeft = false;
  }

  draw(ctx) {
    const x = Math.round(this.x - this.width / 2);
    const y = Math.round(this.y - this.height / 2);

    ctx.save();

    if (this.facingLeft) {
      // Flip horizontally around car center
      ctx.translate(Math.round(this.x), 0);
      ctx.scale(-1, 1);
      ctx.translate(-Math.round(this.x), 0);
    }

    if (this._imgLoaded) {
      ctx.drawImage(this._img, x, y, this.width, this.height);
    } else {
      ctx.fillStyle = '#4a8a4a';
      ctx.fillRect(x, y, this.width, this.height);
    }

    ctx.restore();
  }

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  isDestroyed() { return this.hp <= 0; }

  addWeapon(weaponId) {
    const def = CONFIG.WEAPONS[weaponId.toUpperCase()];
    if (!def) return false;
    if (this.slotsUsed + def.slots > this.vehicle.slots) return false;
    this.weapons.push({ id: weaponId, def, doubleBarrel: false });
    this.slotsUsed += def.slots;
    return true;
  }

  upgradeDoubleBarrel(weaponId) {
    const w = this.weapons.find(w => w.id === weaponId);
    if (w) w.doubleBarrel = true;
  }

  hasWeapon(weaponId) {
    return this.weapons.some(w => w.id === weaponId);
  }

  upgradeToLAV() {
    this._setVehicle('lav');
    this._img = new Image();
    this._img.src = this.vehicle.sprite;
    this._imgLoaded = false;
    this._img.onload = () => { this._imgLoaded = true; };

    const mgIndex = this.weapons.findIndex(w => w.id === 'mg');
    if (mgIndex !== -1) {
      this.slotsUsed -= this.weapons[mgIndex].def.slots;
      this.weapons.splice(mgIndex, 1);
      this.addWeapon('autocannon');
    }
  }

  resetHP() { this.hp = this.maxHp; }

  getBounds() {
    return {
      left:   this.x - this.width / 2,
      right:  this.x + this.width / 2,
      top:    this.y - this.height / 2,
      bottom: this.y + this.height / 2,
    };
  }
}
