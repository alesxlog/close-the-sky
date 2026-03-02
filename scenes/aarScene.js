// ============================================================
// CLOSE THE SKY — aarScene.js
// After Action Review — shown after each campaign attack,
// before the pitstop shop.
// ============================================================

class AARScene {
  constructor(canvas, ctx, gameState, onContinue) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.gs         = gameState;
    this.onContinue = onContinue;

    this._CW   = CONFIG.CANVAS.WIDTH;
    this._CH   = CONFIG.CANVAS.HEIGHT;
    this._FONT = "'Share Tech Mono', monospace";

    // Animation
    this._startTime   = null;
    this._notifProgress = 0;
    this._NOTIF_DELAY = 3000;
    this._NOTIF_SLIDE = 400;

    // Layout — computed once in _computeLayout()
    this._layout = null;

    // Panel bounds — set during layout
    this._panel = null;
    this._btnRect = null;

    // Pre-compute stats
    this._stats = this._computeStats();

    // Fade-in
    this._alpha = 0;

    // Frozen background snapshot
    this._snapshot = gameState.snapshot || null;

    this._bind();
  }

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // LOGISTICS OFFICER MESSAGE
  // ----------------------------------------------------------
  _getLogisticsMsg() {
    const pts    = this.gs.points;
    const player = this.gs.player;

    const hasWeapon  = (id) => player.weapons && player.weapons.some(w => w.id === id);
    const hasVehicle = (id) => player.garage  && player.garage.some(v => v.id === id);
    const hasUpgrade = (id) => {
      if (id === 'mg_double') {
        const mg = player.weapons && player.weapons.find(w => w.id === 'mg');
        return mg && mg.doubleBarrel;
      }
      if (id === 'ac_double') {
        const ac = player.weapons && player.weapons.find(w => w.id === 'autocannon');
        return ac && ac.doubleBarrel;
      }
      if (id === 'sam_2rockets') {
        const sam = player.weapons && player.weapons.find(w => w.id === 'sam');
        return sam && sam.twoRockets;
      }
      return false;
    };

    let vehicleAvail = false;
    let weaponAvail  = false;

    if (!hasVehicle('lav') && pts >= CONFIG.VEHICLES.LAV.cost) {
      vehicleAvail = true;
    }

    for (const item of CONFIG.PITSTOP.ITEMS) {
      if (item.id === 'lav') continue;
      if (pts < item.cost)   continue;
      if (item.id === 'mg'           && hasWeapon('mg'))              continue;
      if (item.id === 'autocannon'   && hasWeapon('autocannon'))      continue;
      if (item.id === 'sam'          && hasWeapon('sam'))             continue;
      if (item.id === 'mg_double'    && hasUpgrade('mg_double'))      continue;
      if (item.id === 'ac_double'    && hasUpgrade('ac_double'))      continue;
      if (item.id === 'sam_2rockets' && hasUpgrade('sam_2rockets'))   continue;
      if (item.requires && !hasWeapon(item.requires))                 continue;
      if (item.id === 'sam') {
        if (player.slotsUsed + CONFIG.WEAPONS.SAM.slots > player.vehicle.slots) continue;
      }
      weaponAvail = true;
      break;
    }

    if (vehicleAvail && weaponAvail) return "Major restock! Vehicle and weapons — best selection we've had in a while.";
    if (vehicleAvail)                return "Heads up — we've got a vehicle that fits your price range.";
    if (weaponAvail)                 return "New shipment. Weapon upgrade available for your budget.";
    return "Current stock is above your budget. The catalogue is open — plan ahead.";
  }

  // ----------------------------------------------------------
  // LAYOUT CONSTANTS
  // ----------------------------------------------------------
  _getLayout() {
    if (this._layout) return this._layout;

    const FONT   = this._FONT;
    const ROW_F  = 17;
    const ROW_H  = 32;
    const NH     = 82;
    const PAD    = 28;
    const BEZEL  = 18;
    const TW     = 760;

    const SW = TW - (BEZEL + 8) * 2;

    // Measure content height
    let contentH = 0;
    contentH += 32;          // top padding
    contentH += 14;          // breadcrumb
    contentH += 36;          // gap
    contentH += 34;          // title
    contentH += 30;          // gap after title
    contentH += 28;          // divider + gap
    contentH += 15;          // PERFORMANCE label
    contentH += 28;          // label gap
    contentH += 4 * ROW_H;   // 4 perf rows
    contentH += 10;          // gap before divider
    contentH += 28;          // divider + gap
    contentH += 15;          // BREAKDOWN label
    contentH += 24;          // label gap
    contentH += 13;          // col headers
    contentH += 8;           // header gap
    contentH += 20;          // thin rule gap
    contentH += this._stats.rows.length * ROW_H;
    contentH += 20;          // rule gap
    contentH += ROW_H;       // TOTAL row
    contentH += 16;          // gap before notification
    contentH += NH;          // notification
    contentH += 24;          // bottom padding

    const PANEL_W   = Math.floor(SW * 0.67);
    const PANEL_H   = contentH;
    const SCREEN_PAD = 20;
    const TH        = PANEL_H + SCREEN_PAD * 2 + (BEZEL + 8) * 2;
    const TX        = (this._CW - TW) / 2;
    const TY        = (this._CH - TH) / 2;
    const SX        = TX + BEZEL + 8;
    const SY        = TY + BEZEL + 8;
    const PANEL_X   = SX + Math.floor((SW - PANEL_W) / 2);
    const PANEL_Y   = SY + SCREEN_PAD;

    this._layout = {
      BEZEL, TW, TH, TX, TY, SX, SY, SW,
      PANEL_X, PANEL_Y, PANEL_W, PANEL_H,
      ROW_F, ROW_H, NH, PAD, SCREEN_PAD,
    };
    return this._layout;
  }

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------
  _roundRect(x, y, w, h, r, fill, stroke) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    if (fill)   ctx.fill();
    if (stroke) ctx.stroke();
  }

  _screw(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2a3026';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(100,140,80,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,140,80,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x-3.5, y); ctx.lineTo(x+3.5, y);
    ctx.moveTo(x, y-3.5); ctx.lineTo(x, y+3.5);
    ctx.stroke();
  }

  _divider(x, y, w) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(126,207,90,0.2)'; ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+w, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  _wrapText(text, x, y, maxW, lineH) {
    const ctx = this.ctx;
    const words = text.split(' ');
    let line = '', lineY = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, lineY); line = word; lineY += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, lineY);
  }

  // ----------------------------------------------------------
  // DRAW
  // ----------------------------------------------------------
  _drawBezel() {
    const ctx = this.ctx;
    const L   = this._getLayout();

    ctx.fillStyle = '#1c2118';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 12;
    this._roundRect(L.TX, L.TY, L.TW, L.TH, 20, true, false);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(100,130,70,0.3)'; ctx.lineWidth = 2;
    this._roundRect(L.TX+1, L.TY+1, L.TW-2, L.TH-2, 19, false, true);

    this._screw(L.TX+24,       L.TY+24);
    this._screw(L.TX+L.TW-24, L.TY+24);
    this._screw(L.TX+24,       L.TY+L.TH-24);
    this._screw(L.TX+L.TW-24, L.TY+L.TH-24);

    // Screen
    ctx.fillStyle = '#0a120d';
    this._roundRect(L.SX, L.SY, L.SW, L.TH-(L.BEZEL+8)*2, 8, true, false);
    for (let ly = L.SY; ly < L.SY + L.TH-(L.BEZEL+8)*2; ly += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(L.SX, ly, L.SW, 1);
    }
  }

  _drawPanel() {
    const ctx  = this.ctx;
    const L    = this._getLayout();
    const FONT = this._FONT;

    // Panel box
    ctx.fillStyle = 'rgba(0,18,6,0.75)';
    this._roundRect(L.PANEL_X, L.PANEL_Y, L.PANEL_W, L.PANEL_H, 8, true, false);
    ctx.strokeStyle = 'rgba(126,207,90,0.28)'; ctx.lineWidth = 1;
    this._roundRect(L.PANEL_X, L.PANEL_Y, L.PANEL_W, L.PANEL_H, 8, false, true);

    const PX   = L.PANEL_X + L.PAD;
    const CW_c = L.PANEL_W - L.PAD * 2;
    let   CY   = L.PANEL_Y + 32;

    // Breadcrumb
    ctx.textAlign = 'left';
    ctx.font = `14px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.42)';
    ctx.fillText('INBOX  //  REVIEWS  //  AAR', PX, CY);
    CY += 36;

    // Title
    ctx.font = `bold 34px ${FONT}`; ctx.fillStyle = '#7ecf5a';
    ctx.fillText('AFTER ACTION REVIEW', PX, CY);
    CY += 30;

    this._divider(PX, CY, CW_c); CY += 28;

    // ── PERFORMANCE ─────────────────────────────────────────
    ctx.font = `bold 15px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.42)';
    ctx.fillText('PERFORMANCE', PX, CY); CY += 28;

    const s = this._stats;
    const perfRows = [
      ['Intercepted',    String(s.totalKilled)],
      ['Reached Ground', String(s.totalMissed)],
      ['Accuracy',       `${s.accuracy}%`],
      ['Ratio',          String(s.ratio)],
    ];

    for (const [label, val] of perfRows) {
      ctx.font = `${L.ROW_F}px ${FONT}`; ctx.fillStyle = '#a0c890';
      ctx.fillText(label, PX, CY);
      ctx.textAlign = 'right';
      ctx.font = `bold ${L.ROW_F}px ${FONT}`; ctx.fillStyle = '#e0f0d0';
      ctx.fillText(val, PX + CW_c, CY);
      ctx.textAlign = 'left';
      CY += L.ROW_H;
    }

    CY += 10; this._divider(PX, CY, CW_c); CY += 28;

    // ── BREAKDOWN ────────────────────────────────────────────
    ctx.font = `bold 15px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.42)';
    ctx.fillText('BREAKDOWN', PX, CY); CY += 24;

    const C1 = PX, C2 = PX+CW_c-220, C3 = PX+CW_c-110, C4 = PX+CW_c;

    // Column headers
    ctx.font = `13px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.38)';
    ctx.fillText('ENEMY', C1, CY);
    ctx.textAlign = 'right';
    ctx.fillText('MISSED', C2, CY);
    ctx.fillText('KILLED', C3, CY);
    ctx.fillText('PTS',    C4, CY);
    ctx.textAlign = 'left'; CY += 8;

    ctx.strokeStyle = 'rgba(126,207,90,0.15)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(PX, CY); ctx.lineTo(PX+CW_c, CY); ctx.stroke();
    CY += 20;

    // Enemy rows
    for (const row of s.rows) {
      ctx.font = `${L.ROW_F}px ${FONT}`; ctx.fillStyle = '#a0c890';
      ctx.fillText(row.name, C1, CY);
      ctx.textAlign = 'right';
      ctx.fillStyle  = row.missed > 0 ? '#e07050' : 'rgba(160,200,144,0.3)';
      ctx.font = `bold ${L.ROW_F}px ${FONT}`;
      ctx.fillText(String(row.missed), C2, CY);
      ctx.fillStyle = '#e0f0d0'; ctx.fillText(String(row.killed), C3, CY);
      ctx.fillStyle = '#f0e080'; ctx.fillText(String(row.pts),    C4, CY);
      ctx.textAlign = 'left';
      CY += L.ROW_H;
    }

    // Line after last row
    ctx.strokeStyle = 'rgba(126,207,90,0.22)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(PX, CY); ctx.lineTo(PX+CW_c, CY); ctx.stroke();
    CY += 20;

    // TOTAL row
    ctx.font = `bold ${L.ROW_F}px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.7)';
    ctx.fillText('TOTAL', C1, CY);
    ctx.textAlign = 'right'; ctx.fillStyle = '#f0e080';
    ctx.fillText(String(s.totalPts), C4, CY);
    ctx.textAlign = 'left';

    // Store panel ref for notification
    this._panel = { x: L.PANEL_X, y: L.PANEL_Y, w: L.PANEL_W, h: L.PANEL_H };
  }

  _drawNotification() {
    if (this._notifProgress <= 0) return;

    const ctx  = this.ctx;
    const FONT = this._FONT;
    const p    = this._panel;
    const NF   = 13;
    const NH   = this._getLayout().NH;

    const AMBER        = '#f0c040';
    const AMBER_BG     = '#1a1400';
    const AMBER_BORDER = 'rgba(240,192,64,0.45)';

    const NW   = Math.floor(p.w * 0.80);
    const NX   = p.x + Math.floor((p.w - NW) / 2);
    const fullY  = p.y + p.h - NH;
    const startY = p.y + p.h;
    const NY   = startY + (fullY - startY) * this._notifProgress;

    // Clip to panel so it slides in from inside
    ctx.save();
    ctx.beginPath();
    this._roundRect(p.x, p.y, p.w, p.h, 8, false, false);
    ctx.clip();

    // Background
    ctx.fillStyle = AMBER_BG;
    this._roundRect(NX, NY, NW, NH, 12, true, false);
    ctx.strokeStyle = AMBER_BORDER; ctx.lineWidth = 1.5;
    this._roundRect(NX, NY, NW, NH, 12, false, true);

    // OPEN button — filled amber, dark text, pinned right
    const BW = 104, BH = 50;
    const BX = NX + NW - BW - 10;
    const BY = NY + (NH - BH) / 2;
    ctx.fillStyle = AMBER;
    this._roundRect(BX, BY, BW, BH, 8, true, false);
    ctx.font = `bold ${Math.round(NF * 1.15)}px ${FONT}`;
    ctx.fillStyle = '#1a1400';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN', BX + BW/2, BY + BH/2 + 6);
    ctx.textAlign = 'left';

    // Store btn rect for click detection
    this._btnRect = { x: BX, y: BY, w: BW, h: BH };

    // Text — no icon, starts from left pad
    const TX2     = NX + 18;
    const maxMsgW = BX - TX2 - 12;

    ctx.font = `bold ${NF}px ${FONT}`; ctx.fillStyle = AMBER;
    ctx.fillText('Logistics Officer', TX2, NY + 24);

    ctx.font = `${NF}px ${FONT}`; ctx.fillStyle = 'rgba(240,192,64,0.75)';
    this._wrapText(this._getLogisticsMsg(), TX2, NY + 46, maxMsgW, 18);

    ctx.restore();
  }

  // ----------------------------------------------------------
  // INPUT
  // ----------------------------------------------------------
  _bind() {
    this._onClick = (e) => this._handleClick(e);
    this.canvas.addEventListener('click', this._onClick);
  }

  destroy() {
    this.canvas.removeEventListener('click', this._onClick);
  }

  _canvasXY(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this._CW / rect.width;
    const scaleY = this._CH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  _handleClick(e) {
    if (!this._btnRect || this._notifProgress < 1) return;
    const { x, y } = this._canvasXY(e);
    const b = this._btnRect;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      this.onContinue();
    }
  }

  // ----------------------------------------------------------
  // UPDATE / DRAW LOOP
  // ----------------------------------------------------------
  update(dt) {
    // Fade in
    this._alpha = Math.min(1, this._alpha + dt * 2.5);

    // Notification timer
    if (this._startTime === null) this._startTime = performance.now();
    const elapsed = performance.now() - this._startTime;

    if (elapsed > this._NOTIF_DELAY) {
      const t = Math.min(1, (elapsed - this._NOTIF_DELAY) / this._NOTIF_SLIDE);
      // ease out cubic
      this._notifProgress = 1 - Math.pow(1 - t, 3);
    }
  }

  draw(ctx) {
    const CW = this._CW, CH = this._CH;

    // Frozen background
    if (this._snapshot) {
      ctx.drawImage(this._snapshot, 0, 0);
    } else {
      ctx.fillStyle = '#0d1410';
      ctx.fillRect(0, 0, CW, CH);
    }

    // Dark overlay
    ctx.save();
    ctx.globalAlpha = Math.min(0.72, this._alpha * 0.72);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CW, CH);
    ctx.restore();

    // Tablet + content
    ctx.save();
    ctx.globalAlpha = this._alpha;
    this._drawBezel();
    this._drawPanel();
    this._drawNotification();
    ctx.restore();
  }
}
