class UpgradeStationScene extends SceneBase {
  constructor(canvas, ctx, gameState, onContinue) {
    super(canvas, ctx);
    this.gs         = gameState;
    this.onContinue = onContinue;
    this._tablet    = new TabletUI(canvas, ctx);

    this._btnDeployY = 0;
    this._cardBounds = []; // { y, h, item }

    // Load card images
    this._imgs = {};
    for (const item of this._getCatalog()) {
      const img = new Image();
      img.src = item.imgSrc;
      this._imgs[item.id] = img;
    }

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
  }

  _getCatalog() {
    return [
      { id: 'truck',      name: 'Pickup Truck',         type: 'vehicle', imgSrc: 'assets/images/b_truck.png',         stats: 'HP 2 · SLOTS 2 · SPD 420', cost: 0 },
      { id: 'lav',        name: 'Light Armoured Vehicle',type: 'vehicle', imgSrc: 'assets/images/b_lav.png',           stats: 'HP 3 · SLOTS 4 · SPD 330', cost: 300 },
      { id: 'mg',         name: 'Machine Gun',           type: 'weapon',  imgSrc: 'assets/images/b_machinegun.png',    stats: 'DMG 1 · SLOTS 1',          cost: 100 },
      { id: 'mg_double',  name: 'Double Barrel MG',      type: 'weapon',  imgSrc: 'assets/images/b_machinegun2b.png',  stats: 'DMG 1×2 · SLOTS 1',        cost: 100 },
      { id: 'autocannon', name: 'Autocannon 20mm',       type: 'weapon',  imgSrc: 'assets/images/b_autocannon.png',    stats: 'DMG 3 · SLOTS 2',          cost: 200 },
      { id: 'ac_double',  name: 'Twin Barrel Autocannon',type: 'weapon',  imgSrc: 'assets/images/b_autocannon2b.png',  stats: 'DMG 3×2 · SLOTS 2',        cost: 200 },
      { id: 'sam',        name: 'SAM Launcher',          type: 'weapon',  imgSrc: 'assets/images/b_sam1.png',          stats: 'DMG 7 · SLOTS 2',          cost: 350 },
      { id: 'sam_2rockets',name:'SAM Launcher (×2)',      type: 'weapon',  imgSrc: 'assets/images/b_sam2.png',          stats: 'DMG 7×2 · SLOTS 2',        cost: 350 },
    ];
  }

  _cardState(item) {
    const p = this.gs.player;

    // Owned checks
    if (item.id === 'truck')       return 'owned';
    if (item.id === 'lav'          && p.garage.some(v => v.id === 'lav')) return 'owned';
    if (item.id === 'mg'           && p.hasWeapon('mg'))        return 'owned';
    if (item.id === 'mg_double')   { const mg = p.weapons.find(w => w.id === 'mg');       if (mg && mg.doubleBarrel) return 'owned'; }
    if (item.id === 'autocannon'   && p.hasWeapon('autocannon'))return 'owned';
    if (item.id === 'ac_double')   { const ac = p.weapons.find(w => w.id === 'autocannon'); if (ac && ac.doubleBarrel) return 'owned'; }
    if (item.id === 'sam'          && p.hasWeapon('sam'))       return 'owned';
    if (item.id === 'sam_2rockets'){ const sam = p.weapons.find(w => w.id === 'sam');     if (sam && sam.twoRockets) return 'owned'; }

    // Prerequisites / exclusions
    if (item.id === 'mg'           && p.hasWeapon('autocannon'))  return 'unavailable';
    if (item.id === 'mg_double'    && !p.hasWeapon('mg'))         return 'unavailable';
    if (item.id === 'mg_double'    && p.hasWeapon('autocannon'))  return 'unavailable';
    if (item.id === 'autocannon'   && !p.hasWeapon('mg'))         return 'unavailable';
    if (item.id === 'ac_double'    && !p.hasWeapon('autocannon')) return 'unavailable';
    if (item.id === 'sam_2rockets' && !p.hasWeapon('sam'))        return 'unavailable';
    if (item.type === 'weapon') {
      const def = CONFIG.WEAPONS[item.id.toUpperCase()];
      if (def && p.slotsUsed + def.slots > p.vehicle.slots) return 'unavailable';
    }
    if (this.gs.points < item.cost) return 'unavailable';

    return 'buyable';
  }

  _executePurchase(item) {
    const p = this.gs.player;
    this.gs.points -= item.cost;
    if (item.id === 'lav') {
      p.upgradeToLAV();
    } else if (item.id === 'mg') {
      p.addWeapon('mg');
    } else if (item.id === 'mg_double') {
      p.upgradeDoubleBarrel('mg');
    } else if (item.id === 'autocannon') {
      const mgIdx = p.weapons.findIndex(w => w.id === 'mg');
      if (mgIdx !== -1) { p.slotsUsed -= p.weapons[mgIdx].def.slots; p.weapons.splice(mgIdx, 1); }
      p.addWeapon('autocannon');
    } else if (item.id === 'ac_double') {
      p.upgradeDoubleBarrel('autocannon');
    } else if (item.id === 'sam') {
      p.addWeapon('sam');
    } else if (item.id === 'sam_2rockets') {
      const sam = p.weapons.find(w => w.id === 'sam');
      if (sam) sam.twoRockets = true;
    }
  }

  _handleClick(e) {
    if (this._tablet.wasDragging()) return;

    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;

    // Deploy button
    if (hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnDeployY && hit.y <= this._btnDeployY + 48) {
        this.onContinue();
        return;
      }
    }

    // Card click — instant purchase
    for (const cb of this._cardBounds) {
      if (this._cardState(cb.item) === 'buyable') {
        if (hit.x >= 0 && hit.x <= cw && hit.y >= cb.y && hit.y <= cb.y + cb.h) {
          this._executePurchase(cb.item);
          return;
        }
      }
    }
  }

  update(dt) {
    this._fadeIn(dt);
    this._tablet.updateScroll(dt);
  }

  draw(ctx) {
    DayBackground.get().drawSnapshot(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, this._CW, this._CH);

    const scene = this;
    const catalog = this._getCatalog();

    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;
      scene._cardBounds = [];

      y += TabletUI.drawTitle(cctx, y, 'UPGRADE STATION', {});
      y += TabletUI.drawSubtitle(cctx, y, `Available points: ${scene.gs.points} pts`, { color: '#f0e080' });
      y += TabletUI.drawDivider(cctx, y, cw);

      // Vehicles section
      y += TabletUI.drawHeader(cctx, y, 'Vehicles', cw);
      y += 4;
      for (const item of catalog.filter(c => c.type === 'vehicle')) {
        const state = scene._cardState(item);
        const owned = state === 'owned';
        const result = TabletUI.drawUpgradeCard(cctx, y, item, cw, {
          owned,
          checked: owned,
          image: scene._imgs[item.id],
        });
        scene._cardBounds.push({ y, h: result.height, item });
        y += result.height;
      }

      // Weapons section
      y += 8;
      y += TabletUI.drawHeader(cctx, y, 'Weapons', cw);
      y += 4;
      for (const item of catalog.filter(c => c.type === 'weapon')) {
        const state = scene._cardState(item);
        const owned = state === 'owned';
        const result = TabletUI.drawUpgradeCard(cctx, y, item, cw, {
          owned,
          checked: owned,
          image: scene._imgs[item.id],
        });
        scene._cardBounds.push({ y, h: result.height, item });
        y += result.height;
      }

      y += 16;
      scene._btnDeployY = y;
      y += TabletUI.drawButton(cctx, y, 'CONFIRM', cw);

      return y;
    }, { alpha: this._alpha });
  }
}