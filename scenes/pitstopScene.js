// ============================================================
// CLOSE THE SKY — pitstopScene.js
// Army catalog brochure style shop between attacks
// ============================================================

const PAPER_BG   = '#ffffff';
const PAPER_LINE = '#c8b89a';
const INK        = '#1a1a1a';
const INK_DIM    = '#888070';
const GOLD       = '#7a6a2a';
const OLIVE_BTN  = '#4a5a1a';
const STAMP_COL  = 'rgba(80,80,80,0.45)';
const PS_FONT    = "'Share Tech Mono', monospace";

const BP_W  = 700;
const BP_H  = 920;

const CARD_COLS  = 2;
const CARD_ROWS  = 4;
const CARD_W     = 310;
const CARD_H     = 185;
const CARD_PAD_X = 16;
const GRID_GAP_X = 20;
const GRID_GAP_Y = 12;
const GRID_TOP   = 112;
const GRID_LEFT  = 20;

const CATALOG = [
  { id: 'truck',       label: 'Pickup Truck',         type: 'vehicle', img: 'assets/images/b_truck.png',        stat: null,     slots: 2, cost: 0   },
  { id: 'lav',         label: 'Light Armoured Vehicle',type: 'vehicle', img: 'assets/images/b_lav.png',          stat: null,     slots: 4, cost: 300 },
  { id: 'mg',          label: 'Machine Gun',           type: 'weapon',  img: 'assets/images/b_machinegun.png',   stat: 'DMG 1',  slots: 1, cost: 100 },
  { id: 'mg_double',   label: 'Double Barrel MG',      type: 'weapon',  img: 'assets/images/b_machinegun2b.png', stat: 'DMG 1×2',slots: 1, cost: 100 },
  { id: 'autocannon',  label: 'Autocannon 20mm',       type: 'weapon',  img: 'assets/images/b_autocannon.png',  stat: 'DMG 3',  slots: 2, cost: 200 },
  { id: 'ac_double',   label: 'Twin Autocannon',       type: 'weapon',  img: 'assets/images/b_autocannon2b.png',stat: 'DMG 3×2',slots: 2, cost: 200 },
  { id: 'sam',         label: 'SAM Launcher (1)',       type: 'weapon',  img: 'assets/images/b_sam1.png',         stat: 'DMG 7',  slots: 2, cost: 350 },
  { id: 'sam_2rockets',label: 'SAM Launcher (2)',       type: 'weapon',  img: 'assets/images/b_sam2.png',         stat: 'DMG 7×2',slots: 2, cost: 350 },
];

class PitstopScene {
  constructor(canvas, ctx, gameState, onContinue) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.gs         = gameState;
    this.onContinue = onContinue;

    this._px = Math.floor((CONFIG.CANVAS.WIDTH  - BP_W) / 2);
    this._py = Math.floor((CONFIG.CANVAS.HEIGHT - BP_H) / 2);

    this._imgs = {};
    for (const c of CATALOG) {
      const img = new Image();
      img.src = c.img;
      this._imgs[c.id] = img;
    }

    this._paperCanvas = document.createElement('canvas');
    this._paperCanvas.width  = BP_W;
    this._paperCanvas.height = BP_H;
    this._drawPaper(this._paperCanvas.getContext('2d'));

    this._bg = new Background();
    this._confirm = null;
    this._bind();
  }

  _drawPaper(pctx) {
    pctx.fillStyle = PAPER_BG;
    pctx.fillRect(0, 0, BP_W, BP_H);
    for (let i = 0; i < 9000; i++) {
      const a = Math.random() * 0.055;
      pctx.fillStyle = `rgba(80,60,20,${a})`;
      pctx.fillRect(Math.random() * BP_W, Math.random() * BP_H, 1, 1);
    }
    pctx.strokeStyle = '#b0a080';
    pctx.lineWidth = 2;
    pctx.strokeRect(8, 8, BP_W - 16, BP_H - 16);
  }

  _bind() {
    this._onClick = (e) => this._handleClick(e);
    this._onKey   = (e) => { if (e.code === 'Escape') this._confirm = null; };
    this.canvas.addEventListener('click', this._onClick);
    window.addEventListener('keydown', this._onKey);
  }

  destroy() {
    this.canvas.removeEventListener('click', this._onClick);
    window.removeEventListener('keydown', this._onKey);
  }

  _canvasXY(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS.WIDTH  / rect.width;
    const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);

    if (this._confirm) {
      const mx = CONFIG.CANVAS.WIDTH  / 2;
      const my = CONFIG.CANVAS.HEIGHT / 2;
      if (x > mx - 160 && x < mx - 30 && y > my + 36 && y < my + 86) {
        this._executePurchase(this._confirm.item);
        this._confirm = null;
        return;
      }
      if (x > mx + 30 && x < mx + 160 && y > my + 36 && y < my + 86) {
        this._confirm = null;
        return;
      }
      this._confirm = null;
      return;
    }

    // Continue button
    const bx = this._px + BP_W / 2 - 140;
    const by = this._py + BP_H - 70; // Move inside canvas (70px from bottom)
    if (x > bx && x < bx + 280 && y > by && y < by + 50) {
      this.onContinue();
      return;
    }

    // Card clicks
    CATALOG.forEach((item, idx) => {
      const { cx, cy } = this._cardPos(idx);
      if (x > cx && x < cx + CARD_W && y > cy && y < cy + CARD_H) {
        if (this._cardState(item) === 'buyable') {
          this._confirm = { item };
        }
      }
    });
  }

  _cardPos(idx) {
    const col = idx % CARD_COLS;
    const row = Math.floor(idx / CARD_COLS);
    return {
      cx: this._px + GRID_LEFT + col * (CARD_W + GRID_GAP_X),
      cy: this._py + GRID_TOP  + row * (CARD_H + GRID_GAP_Y),
    };
  }

  _cardState(item) {
    const p = this.gs.player;

    // Owned checks
    if (item.id === 'truck') return 'owned';
    if (item.id === 'lav'          && p.garage.some(v => v.id === 'lav')) return 'owned';
    if (item.id === 'mg'           && p.hasWeapon('mg')) return 'owned';
    if (item.id === 'mg_double') {
      const mg = p.weapons.find(w => w.id === 'mg');
      if (mg && mg.doubleBarrel) return 'owned';
    }
    if (item.id === 'autocannon'   && p.hasWeapon('autocannon')) return 'owned';
    if (item.id === 'ac_double') {
      const ac = p.weapons.find(w => w.id === 'autocannon');
      if (ac && ac.doubleBarrel) return 'owned';
    }
    if (item.id === 'sam'          && p.hasWeapon('sam')) return 'owned';
    if (item.id === 'sam_2rockets') {
      const sam = p.weapons.find(w => w.id === 'sam');
      if (sam && sam.twoRockets) return 'owned';
    }

    // Prerequisite / exclusion / affordability / slot checks
    if (item.id === 'mg'           && p.hasWeapon('autocannon'))  return 'unavailable';
    if (item.id === 'mg_double'    && !p.hasWeapon('mg'))         return 'unavailable';
    if (item.id === 'mg_double'    && p.hasWeapon('autocannon'))  return 'unavailable';
    if (item.id === 'autocannon'   && !p.hasWeapon('mg'))         return 'unavailable';
    if (item.id === 'ac_double'    && !p.hasWeapon('autocannon')) return 'unavailable';
    if (item.id === 'sam_2rockets' && !p.hasWeapon('sam'))        return 'unavailable';
    if (item.type === 'weapon') {
      const def = CONFIG.WEAPONS[item.id.toUpperCase()];
      if (def && p.slotsUsed + def.slots > p.vehicle.slots)       return 'unavailable';
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

  update(dt) {}

  draw(ctx) {
    // Game background behind brochure
    this._bg.draw(ctx);

    // Dark tint over background
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    const px = this._px, py = this._py;

    // Paper
    ctx.drawImage(this._paperCanvas, px, py);

    // Header bar
    ctx.fillStyle = INK;
    ctx.fillRect(px + 8, py + 8, BP_W - 16, 62);

    ctx.textAlign = 'left';
    ctx.font = `bold 26px ${PS_FONT}`;
    ctx.fillStyle = PAPER_BG;
    ctx.fillText('DEFENCE SUPPLY', px + 22, py + 50);

    ctx.textAlign = 'right';
    ctx.font = `20px ${PS_FONT}`;
    ctx.fillStyle = '#f0c040';
    ctx.fillText(`★  ${this.gs.points} pts`, px + BP_W - 22, py + 50);

    // Subtitle
    ctx.textAlign = 'left';
    ctx.font = `12px ${PS_FONT}`;
    ctx.fillStyle = INK_DIM;
    ctx.fillText(`ATTACK ${this.gs.attackNum} COMPLETE  —  SELECT EQUIPMENT`, px + 22, py + 88);

    // Header divider
    ctx.strokeStyle = PAPER_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 16, py + GRID_TOP - 6);
    ctx.lineTo(px + BP_W - 16, py + GRID_TOP - 6);
    ctx.stroke();

    // Row dividers
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = '#c0b090';
    ctx.lineWidth = 0.6;
    for (let row = 1; row < CARD_ROWS; row++) {
      const dy = py + GRID_TOP + row * (CARD_H + GRID_GAP_Y) - GRID_GAP_Y / 2;
      ctx.beginPath();
      ctx.moveTo(px + 16, dy);
      ctx.lineTo(px + BP_W - 16, dy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Cards
    CATALOG.forEach((item, idx) => this._drawCard(ctx, item, idx));

    // Continue button
    const bx = px + BP_W / 2 - 140;
    const by = py + BP_H - 70; // Move inside canvas (70px from bottom)
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, 280, 50);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, 280, 50);
    ctx.textAlign = 'center';
    ctx.font = `bold 20px ${PS_FONT}`;
    ctx.fillStyle = '#fff';
    ctx.fillText('CLOSE', px + BP_W / 2, by + 33);

    // Confirm modal
    if (this._confirm) this._drawConfirmModal(ctx, this._confirm.item);
  }

  _drawCard(ctx, item, idx) {
    const { cx, cy } = this._cardPos(idx);
    const state  = this._cardState(item);
    const owned  = state === 'owned';

    ctx.save();

    // Card fill - always active (white)
    ctx.fillStyle   = 'rgba(255,255,255,0.60)';
    ctx.strokeStyle = PAPER_LINE;
    ctx.lineWidth = 1;
    ctx.fillRect(cx, cy, CARD_W, CARD_H);
    ctx.strokeRect(cx, cy, CARD_W, CARD_H);

    ctx.globalAlpha = 1.0; // Always full opacity

    // Header - centered across full card width with actual item name
    ctx.font = `bold 14px ${PS_FONT}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.fillText(item.label.toUpperCase(), cx + CARD_W / 2, cy + 25);

    // Image (moved down to make space for header)
    const imgW = 130, imgH = 90; // Reduced height to fit header
    const imgX = cx + CARD_PAD_X;
    const imgY = cy + 40; // Moved down from center
    const img  = this._imgs[item.id];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
    }

    // Text column
    const tx = cx + imgW + CARD_PAD_X * 2 + 4;
    const tw = CARD_W - imgW - CARD_PAD_X * 3 - 4;

    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'left';

    // No name in body - moved to header

    // Divider
    ctx.strokeStyle = 'rgba(160,130,60,0.35)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(tx, cy + 44); ctx.lineTo(cx + CARD_W - CARD_PAD_X, cy + 44);
    ctx.stroke();

    // Stats - always normal color
    ctx.font = `11px ${PS_FONT}`;
    ctx.fillStyle = INK_DIM;
    let sy = cy + 62;
    if (item.type === 'vehicle') {
      const def = CONFIG.VEHICLES[item.id.toUpperCase()];
      if (def) {
        ctx.fillText(`HP     ${def.hp}`, tx, sy); sy += 16;
        ctx.fillText(`DMG    ${def.damage || 0}`, tx, sy); sy += 16;
        ctx.fillText(`SLOTS  ${def.slots}`, tx, sy); sy += 16;
      }
    } else {
      if (item.stat) { ctx.fillText(item.stat, tx, sy); sy += 16; }
      ctx.fillText(`DMG    ${item.damage || 0}`, tx, sy); sy += 16;
      ctx.fillText(`SLOTS  ${item.slots}`, tx, sy); sy += 16;
    }
    
    // Price
    ctx.fillText(`PRICE  ${item.cost} pts`, tx, sy);

    // BUY button - always show in bottom right corner
    ctx.globalAlpha = 1.0;
    const bx = cx + CARD_W - 86 - CARD_PAD_X;
    const by = cy + CARD_H - 36;
    
    // Determine button state and color
    let btnColor, btnText;
    if (owned) {
      btnColor = '#666666'; // Grey for owned
      btnText = 'OWNED';
    } else if (this.gs.points >= item.cost) {
      btnColor = '#4CAF50'; // Green for available
      btnText = `${item.cost} pts`;
    } else {
      btnColor = '#666666'; // Grey for not enough points
      btnText = `${item.cost} pts`;
    }
    
    ctx.fillStyle = btnColor;
    ctx.fillRect(bx, by, 86, 26);
    ctx.font = `bold 12px ${PS_FONT}`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(btnText, bx + 43, by + 18);
    ctx.textAlign = 'left'; // Reset alignment

    ctx.restore();
  }

  _wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '', lineY = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, lineY);
        line = word; lineY += lineH;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, x, lineY);
  }

  _drawConfirmModal(ctx, item) {
    const CW = CONFIG.CANVAS.WIDTH, CH = CONFIG.CANVAS.HEIGHT;
    const mx = CW / 2, my = CH / 2;
    const mw = 420, mh = 240;

    ctx.fillStyle = 'rgba(164, 152, 152, 0.7)';
    ctx.fillRect(0, 0, CW, CH);

    ctx.fillStyle = '#1e1e1e';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(mx - mw/2, my - mh/2, mw, mh, 6);
    ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = `bold 17px ${PS_FONT}`;
    ctx.fillStyle = '#fff';
    ctx.fillText(`Purchase: ${item.label}?`, mx, my - 24);

    ctx.font = `14px ${PS_FONT}`;
    ctx.fillStyle = '#f0c040';
    ctx.fillText(`${item.cost} pts  →  ${this.gs.points - item.cost} pts remaining`, mx, my + 4);

    // CONFIRM
    ctx.fillStyle = OLIVE_BTN;
    ctx.fillRect(mx - 155, my + 36, 120, 40);
    ctx.font = `bold 14px ${PS_FONT}`;
    ctx.fillStyle = '#fff';
    ctx.fillText('CONFIRM', mx - 95, my + 61);

    // CANCEL
    ctx.fillStyle = '#ecb4b4';
    ctx.fillRect(mx + 35, my + 36, 120, 40);
    ctx.fillText('CANCEL', mx + 95, my + 61);
  }
}
