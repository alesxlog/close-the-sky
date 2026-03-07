class AARScene extends SceneBase {
  constructor(canvas, ctx, gameState, onContinue) {
    super(canvas, ctx);
    this.gs         = gameState;
    this.onContinue = onContinue;
    this._tablet    = new TabletUI(canvas, ctx);
    this._snapshot  = gameState.snapshot || null;

    this._btnContinueY = 0;

    this._stats = this._computeStats();
    this._logisticsMsg = this._getLogisticsMsg();

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
  }

  _computeStats() {
    const killed  = this.gs.killsByType   || {};
    const spawned = this.gs.spawnedByType || {};
    const TYPES   = ['geran1', 'geran2', 'geran3', 'kh555', 'kalibr', 'kh101'];

    let totalKilled = 0, totalMissed = 0, totalPts = 0;
    const rows = [];

    for (const type of TYPES) {
      const s = spawned[type] || 0;
      if (s === 0) continue;
      const k      = killed[type] || 0;
      const missed = s - k;
      const cfg    = CONFIG.ENEMIES[type.toUpperCase()];
      const pts    = k * (cfg ? cfg.killPts : 0);
      rows.push({ name: cfg ? cfg.name : type, missed, killed: k, pts });
      totalKilled += k;
      totalMissed += missed;
      totalPts    += pts;
    }

    const totalSpawned = totalKilled + totalMissed;
    const accuracy = totalSpawned > 0 ? Math.round((totalKilled / totalSpawned) * 100) : 0;
    const ratio    = totalMissed > 0
      ? (totalKilled / totalMissed).toFixed(1)
      : totalKilled > 0 ? '∞' : '0';

    return { rows, totalKilled, totalMissed, totalSpawned, accuracy, ratio, totalPts };
  }

  _getLogisticsMsg() {
    const pts    = this.gs.points;
    const player = this.gs.player;

    const hasWeapon  = (id) => player.weapons && player.weapons.some(w => w.id === id);
    const hasVehicle = (id) => player.garage  && player.garage.some(v => v.id === id);

    let vehicleAvail = !hasVehicle('lav') && pts >= CONFIG.VEHICLES.LAV.cost;
    let weaponAvail  = false;

    for (const item of CONFIG.PITSTOP.ITEMS) {
      if (item.id === 'lav') continue;
      if (pts < item.cost)   continue;
      if (item.id === 'mg'           && hasWeapon('mg'))         continue;
      if (item.id === 'autocannon'   && hasWeapon('autocannon')) continue;
      if (item.id === 'sam'          && hasWeapon('sam'))        continue;
      if (item.requires && !hasWeapon(item.requires))            continue;
      weaponAvail = true;
      break;
    }

    if (vehicleAvail && weaponAvail) return "Major restock! Vehicle and weapons — best selection we've had in a while.";
    if (vehicleAvail)                return "Heads up — we've got a vehicle that fits your price range.";
    if (weaponAvail)                 return "New shipment. Weapon upgrade available for your budget.";
    return "Current stock is above your budget. The catalogue is open — plan ahead.";
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;
    if (hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnContinueY && hit.y <= this._btnContinueY + 48) {
        this.onContinue();
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
    const s = this._stats;

    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;

      y += TabletUI.drawTitle(cctx, y, 'AFTER ACTION REVIEW', {});
      y += TabletUI.drawSubtitle(cctx, y, `Attack ${scene.gs.attackNum} — Complete`, {});
      y += TabletUI.drawDivider(cctx, y, cw);

      // Performance
      y += TabletUI.drawHeader(cctx, y, 'Performance', cw);
      y += 4;
      y += TabletUI.drawStatRow(cctx, y, 'Intercepted',    String(s.totalKilled), cw);
      y += TabletUI.drawStatRow(cctx, y, 'Reached Ground', String(s.totalMissed), cw,
        { valueColor: s.totalMissed > 0 ? '#e07050' : '#e0f0d0' });
      y += TabletUI.drawStatRow(cctx, y, 'Accuracy', `${s.accuracy}%`, cw);
      y += TabletUI.drawStatRow(cctx, y, 'Ratio', String(s.ratio), cw);
      y += 8;

      // Breakdown table
      y += TabletUI.drawHeader(cctx, y, 'Breakdown', cw);
      y += 4;

      const columns = [
        { label: 'ENEMY',  x: 0,         w: cw * 0.4,  align: 'left'  },
        { label: 'MISSED', x: cw * 0.4,  w: cw * 0.2,  align: 'right' },
        { label: 'KILLED', x: cw * 0.6,  w: cw * 0.2,  align: 'right' },
        { label: 'PTS',    x: cw * 0.8,  w: cw * 0.2,  align: 'right' },
      ];

      const rows = s.rows.map(r => ({
        values: [
          { text: r.name,           color: '#a0c890' },
          { text: String(r.missed), color: r.missed > 0 ? '#e07050' : 'rgba(160,200,144,0.3)' },
          { text: String(r.killed), color: '#e0f0d0' },
          { text: String(r.pts),    color: '#f0e080' },
        ]
      }));
      rows.push({
        bold: true,
        dividerAbove: true,
        values: [
          { text: 'TOTAL',              color: 'rgba(126,207,90,0.6)' },
          { text: String(s.totalMissed), color: '#e07050' },
          { text: String(s.totalKilled), color: '#e0f0d0' },
          { text: String(s.totalPts),    color: '#f0e080' },
        ]
      });

      y += TabletUI.drawBreakdownTable(cctx, y, columns, rows, cw);
      y += 8;

      // Logistics toast
      y += TabletUI.drawToast(cctx, y, 'Logistics Officer', scene._logisticsMsg, cw);
      y += 8;

      // Footer
      scene._btnContinueY = y;
      y += TabletUI.drawButton(cctx, y, 'OPEN UPGRADE STATION', cw);

      return y;
    }, { alpha: this._alpha });
  }
}