// ============================================================
// CLOSE THE SKY — pitstopScene.js
// Campaign pitstop shop between attacks
// ============================================================

class PitstopScene {
  constructor(canvas, ctx, gameState, onContinue) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gs = gameState; // { points, player, attackNum }
    this.onContinue = onContinue;
    this._bg = new Background();
    this._message = '';
    this._messageTimer = 0;
    this._bind();
  }

  _bind() {
    this._onClick = (e) => this._handleClick(e);
    this._onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this.onContinue();
    };
    this.canvas.addEventListener('click', this._onClick);
    window.addEventListener('keydown', this._onKey);
  }

  destroy() {
    this.canvas.removeEventListener('click', this._onClick);
    window.removeEventListener('keydown', this._onKey);
  }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS.WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check shop item clicks
    const items = this._getAvailableItems();
    items.forEach((item, i) => {
      const iy = 360 + i * 100;
      if (x > 200 && x < 1080 && y > iy && y < iy + 80) {
        this._purchase(item);
      }
    });

    // Continue button
    const CX = CONFIG.CANVAS.WIDTH / 2;
    if (x > CX - 180 && x < CX + 180 && y > 950 && y < 1030) {
      this.onContinue();
    }
  }

  _getAvailableItems() {
    const player = this.gs.player;
    return CONFIG.PITSTOP.ITEMS.filter(item => {
      if (item.id === 'lav' && player.vehicle.id === 'lav') return false;
      if (item.requires && !player.hasWeapon(item.requires) && player.vehicle.id !== item.requires) return false;
      if (item.id === 'mg_double' && (player.weapons.find(w => w.id === 'mg' && w.doubleBarrel))) return false;
      if (item.id === 'ac_double' && (player.weapons.find(w => w.id === 'autocannon' && w.doubleBarrel))) return false;
      if (item.id === 'sam' && player.hasWeapon('sam')) return false;
      if (item.id === 'sam_2rockets') {
        const sam = player.weapons.find(w => w.id === 'sam');
        if (!sam || sam.twoRockets) return false;
      }
      if (item.id === 'autocannon' && player.hasWeapon('autocannon')) return false;
      return true;
    });
  }

  _purchase(item) {
    const player = this.gs.player;
    if (this.gs.points < item.cost) {
      this._showMessage('Not enough points');
      return;
    }

    this.gs.points -= item.cost;

    if (item.id === 'lav') {
      player.upgradeToLAV();
    } else if (item.id === 'mg_double') {
      player.upgradeDoubleBarrel('mg');
    } else if (item.id === 'ac_double') {
      player.upgradeDoubleBarrel('autocannon');
    } else if (item.id === 'autocannon') {
      const mgIdx = player.weapons.findIndex(w => w.id === 'mg');
      if (mgIdx !== -1) {
        player.slotsUsed -= player.weapons[mgIdx].def.slots;
        player.weapons.splice(mgIdx, 1);
      }
      player.addWeapon('autocannon');
    } else if (item.id === 'sam') {
      player.addWeapon('sam');
    } else if (item.id === 'sam_2rockets') {
      const sam = player.weapons.find(w => w.id === 'sam');
      if (sam) sam.twoRockets = true;
    }

    this._showMessage(`Purchased: ${item.name}`);
  }

  _showMessage(msg) {
    this._message = msg;
    this._messageTimer = 2000;
  }

  update(dt) {
    if (this._messageTimer > 0) this._messageTimer -= dt * 1000;
  }

  draw(ctx) {
    this._bg.draw(ctx);

    const CX = CONFIG.CANVAS.WIDTH / 2;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`PITSTOP — ATTACK ${this.gs.attackNum} COMPLETE`, CX, 120);

    // HP restored notice
    ctx.font = '20px monospace';
    ctx.fillStyle = '#44ff88';
    ctx.fillText('✓ Vehicle repaired to full HP', CX, 170);

    // Points
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ffdd44';
    ctx.fillText(`${this.gs.points} pts available`, CX, 240);

    // Loadout
    ctx.font = '18px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const weapons = this.gs.player.weapons.map(w => w.id).join(', ');
    ctx.fillText(`Loadout: ${this.gs.player.vehicle.name} | ${weapons}`, CX, 290);

    // Shop items
    const items = this._getAvailableItems();
    if (items.length === 0) {
      ctx.font = '22px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('No items available', CX, 480);
    } else {
      items.forEach((item, i) => {
        this._drawShopItem(ctx, item, 360 + i * 100);
      });
    }

    // Message
    if (this._messageTimer > 0) {
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#44ff88';
      ctx.fillText(this._message, CX, 880);
    }

    // Continue button
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.roundRect(CX - 180, 950, 360, 80, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CONTINUE →', CX, 1000);

    ctx.textAlign = 'left';
  }

  _drawShopItem(ctx, item, y) {
    const CX = CONFIG.CANVAS.WIDTH / 2;
    const canAfford = this.gs.points >= item.cost;

    ctx.fillStyle = canAfford ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(200, y, 880, 80, 8);
    ctx.fill();
    ctx.strokeStyle = canAfford ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = canAfford ? '#ffffff' : 'rgba(255,255,255,0.3)';
    ctx.fillText(item.name, 230, y + 34);

    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(item.requires ? `Requires: ${item.requires}` : '', 230, y + 58);

    ctx.textAlign = 'right';
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = canAfford ? '#ffdd44' : '#ff6644';
    ctx.fillText(`${item.cost} pts`, 1060, y + 44);

    ctx.textAlign = 'center';
  }
}
