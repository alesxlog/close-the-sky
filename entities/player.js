// ============================================================
// CLOSE THE SKY — player.js
// Garage system: active vehicle + parked/destroyed vehicles
// ============================================================

class Player {
  constructor(vehicleId = 'truck') {
    this.C = CONFIG.CANVAS;

    // Garage: array of { id, state: 'active'|'parked'|'destroyed', hp, maxHp }
    this.garage = [];
    this.weapons = [];
    this.slotsUsed = 0;
    this.facingLeft = false;

    // Preload both images
    this._imgs = {};
    this._imgLoaded = {};
    for (const id of ['truck', 'lav']) {
      const img = new Image();
      img.src = CONFIG.VEHICLES[id.toUpperCase()].sprite;
      img.onload = () => { this._imgLoaded[id] = true; };
      this._imgs[id] = img;
    }

    this._addVehicle(vehicleId, 'active');
    this._syncActiveVehicle();

    this.x = this.C.WIDTH / 2;
    this.y = this.C.CAR_Y;
  }

  // ---- GARAGE ----

  _addVehicle(id, state) {
    const def = CONFIG.VEHICLES[id.toUpperCase()];
    this.garage.push({ id, state, hp: def.hp, maxHp: def.hp, def });
  }

  _syncActiveVehicle() {
    const active = this.garage.find(v => v.state === 'active');
    if (!active) return;
    this.vehicle = active.def;
    this.hp      = active.hp;
    this.maxHp   = active.maxHp;
    this.speed   = active.def.speed;
    this.width   = active.def.width;
    this.height  = active.def.height;
    this._activeEntry = active;
  }

  getActiveVehicle() {
    return this.garage.find(v => v.state === 'active');
  }

  // Buy LAV — truck moves to parked
  upgradeToLAV() {
    const truck = this.garage.find(v => v.id === 'truck');
    if (truck) truck.state = 'parked';

    this._addVehicle('lav', 'active');
    this._syncActiveVehicle();
    
    // Note: Weapon upgrades (MG → Autocannon) happen through pitstop shop
    // LAV upgrade only changes the vehicle, keeps existing weapons
  }

  // Called when active vehicle HP hits 0
  // Returns true if a backup vehicle exists, false = game over
  activateNextVehicle() {
    const active = this.garage.find(v => v.state === 'active');
    if (active) active.state = 'destroyed';

    const next = this.garage.find(v => v.state === 'parked');
    if (!next) return false; // no backup — game over

    next.state = 'active';
    next.hp = next.maxHp; // full HP on activation
    this._syncActiveVehicle();
    return true;
  }

  // ---- UPDATE / DRAW ----

  update(dt) {
    const input = Input.state;
    const halfW = this.width / 2;
    const prevX = this.x;

    if (input.usingMouse && input.mouseX !== null) {
      const target = Math.max(halfW, Math.min(this.C.WIDTH - halfW, input.mouseX));
      const dx = target - this.x;
      const maxMove = this.speed * dt;
      if (Math.abs(dx) <= maxMove) {
        this.x = target;
      } else {
        this.x += Math.sign(dx) * maxMove;
      }
    } else {
      if (input.left)  this.x -= this.speed * dt;
      if (input.right) this.x += this.speed * dt;
      this.x = Math.max(halfW, Math.min(this.C.WIDTH - halfW, this.x));
    }

    const dx = this.x - prevX;
    if (dx < -0.5) this.facingLeft = true;
    if (dx > 0.5)  this.facingLeft = false;

    // Keep garage entry in sync with hp
    if (this._activeEntry) this._activeEntry.hp = this.hp;
  }

  draw(ctx) {
    const id = this.vehicle.id;
    const x = Math.round(this.x - this.width / 2);
    const y = Math.round(this.y - this.height / 2);

    ctx.save();
    if (this.facingLeft) {
      ctx.translate(Math.round(this.x), 0);
      ctx.scale(-1, 1);
      ctx.translate(-Math.round(this.x), 0);
    }

    if (this._imgLoaded[id]) {
      ctx.drawImage(this._imgs[id], x, y, this.width, this.height);
    } else {
      ctx.fillStyle = '#4a8a4a';
      ctx.fillRect(x, y, this.width, this.height);
    }

    ctx.restore();
  }

  // ---- DAMAGE ----

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    if (this._activeEntry) this._activeEntry.hp = this.hp;
    return this.hp <= 0;
  }

  isDestroyed() { return this.hp <= 0; }

  resetHP() {
    this.hp = this.maxHp;
    if (this._activeEntry) this._activeEntry.hp = this.hp;
  }

  // ---- WEAPONS ----

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

  applyUpgrade(upgradeId) {
    if (upgradeId === 'lav') {
      this.upgradeToLAV();
    } else if (upgradeId === 'lav_mg') {
      // Special arcade upgrade: LAV + MG
      this.upgradeToLAV();
      if (!this.hasWeapon('mg')) {
        this.addWeapon('mg');
      }
    } else if (upgradeId === 'lav_mg_double') {
      // Special arcade upgrade: LAV + Double MG
      this.upgradeToLAV();
      if (!this.hasWeapon('mg')) {
        this.addWeapon('mg');
      }
      this.upgradeDoubleBarrel('mg');
    } else if (upgradeId === 'mg_double') {
      if (!this.hasWeapon('mg')) {
        this.addWeapon('mg');
      }
      this.upgradeDoubleBarrel('mg');
    } else if (upgradeId === 'ac_double') {
      // Handle upgrade from autocannon or mg_double to ac_double
      const mgIdx = this.weapons.findIndex(w => w.id === 'mg');
      if (mgIdx !== -1) {
        this.slotsUsed -= this.weapons[mgIdx].def.slots; 
        this.weapons.splice(mgIdx, 1); 
      }
      // Add autocannon if not already present, then upgrade to double
      if (!this.hasWeapon('autocannon')) {
        this.addWeapon('autocannon');
      }
      this.upgradeDoubleBarrel('autocannon');
    } else if (upgradeId === 'sam') {
      if (!this.hasWeapon('sam')) {
        this.addWeapon('sam');
      }
    } else if (upgradeId === 'sam_2rockets') {
      const sam = this.weapons.find(w => w.id === 'sam');
      if (sam) sam.twoRockets = true;
    }
  }

  getBounds() {
    return {
      left:   this.x - this.width / 2,
      right:  this.x + this.width / 2,
      top:    this.y - this.height / 2,
      bottom: this.y + this.height / 2,
    };
  }
}
