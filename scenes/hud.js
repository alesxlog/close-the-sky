// ============================================================
// CLOSE THE SKY — hud.js
// LEFT: vehicle icons + HP hearts
// CENTER: mode label (row1) + stopwatch (row2)
// RIGHT: kills + points
// ============================================================

const HUD_FONT  = "'Share Tech Mono', monospace";

class HUD {
  constructor() {
    this.C = CONFIG.CANVAS;
    this.H = CONFIG.HUD;
    this._imgs = {};
    this._imgLoaded = {};
    for (const id of ['truck', 'lav']) {
      const img = new Image();
      img.src = CONFIG.VEHICLES[id.toUpperCase()].sprite;
      img.onload = () => { this._imgLoaded[id] = true; };
      this._imgs[id] = img;
    }
  }

  // state: { garage, hp, maxHp, kills, missed, points, mode, attackNum, waveNum, timeElapsed }
  draw(ctx, state) {
    const y  = this.C.HUD_TOP;
    const h  = this.C.HUD_HEIGHT;
    const W  = this.C.WIDTH;
    const P  = this.H.PADDING;
    const CX = W / 2;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, y, W, h);

    // Top border
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    const row1Y = y + 36;
    const row2Y = y + 72;

    // ---- LEFT: vehicles + hearts ----
    this._drawLeft(ctx, P, row1Y, row2Y, state);

    // ---- CENTER: mode label + stopwatch ----
    this._drawCenter(ctx, CX, row1Y, row2Y, state);

    // ---- RIGHT: kills + points ----
    this._drawRight(ctx, W - P, row1Y, row2Y, state);
  }

  _drawLeft(ctx, x, row1Y, row2Y, state) {
    const iw = 72;
    const ih = 40;
    const gap = 12;
    let cx = x;

    // Draw each vehicle in garage order (active first, then others)
    const garage = state.garage || [];
    // Sort: active first, then parked, then destroyed
    const order = ['active', 'parked', 'destroyed'];
    const sorted = [...garage].sort((a, b) =>
      order.indexOf(a.state) - order.indexOf(b.state)
    );

    for (const v of sorted) {
      const img = this._imgs[v.id];
      const loaded = this._imgLoaded[v.id];

      ctx.save();

      // Opacity by state
      ctx.globalAlpha = v.state === 'active' ? 1.0
        : v.state === 'parked' ? 0.45 : 0.25;

      if (loaded) {
        ctx.drawImage(img, cx, row1Y - ih / 2 - 4, iw, ih);
      } else {
        ctx.fillStyle = '#4a8a4a';
        ctx.fillRect(cx, row1Y - ih / 2 - 4, iw, ih);
      }

      // Red X over destroyed vehicle
      if (v.state === 'destroyed') {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#ff2222';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + 6,      row1Y - ih/2 - 4 + 4);
        ctx.lineTo(cx + iw - 6, row1Y + ih/2 - 4 - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + iw - 6, row1Y - ih/2 - 4 + 4);
        ctx.lineTo(cx + 6,      row1Y + ih/2 - 4 - 4);
        ctx.stroke();
      }

      ctx.restore();
      cx += iw + gap;
    }

    // HP hearts for active vehicle — row 2
    const active = garage.find(v => v.state === 'active');
    if (active) {
      this._drawHearts(ctx, x, row2Y, active.hp, active.maxHp);
    }
  }

  _drawHearts(ctx, x, y, hp, maxHp) {
    const size = 26;
    for (let i = 0; i < maxHp; i++) {
      ctx.globalAlpha = i < hp ? 1.0 : 0.2;
      ctx.font = `${size}px serif`;
      ctx.fillText('❤️', x + i * (size + 2), y + 8);
    }
    ctx.globalAlpha = 1;
  }

  _drawCenter(ctx, cx, row1Y, row2Y, state) {
    ctx.textAlign = 'center';

    // Row 1 — mode label
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.fillStyle = '#ffffff';
    if (state.mode === 'campaign') {
      ctx.fillText(`ATTACK ${state.attackNum}`, cx, row1Y);
    } else {
      ctx.fillText(`WAVE ${state.waveNum}`, cx, row1Y);
    }

    // Row 2 — stopwatch
    ctx.font = `20px ${HUD_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(this._formatTime(state.timeElapsed || 0), cx, row2Y);

    ctx.textAlign = 'left';
  }

  _drawRight(ctx, rightX, row1Y, row2Y, state) {
    ctx.textAlign = 'right';

    // Row 1 — kills/missed (e.g., "10/1" with missed in red)
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${state.kills}`, rightX - 35, row1Y);
    
    ctx.fillStyle = '#ff4444';
    ctx.fillText('/', rightX - 20, row1Y);
    ctx.fillText(`${state.missed}`, rightX, row1Y);

    // Row 2 — points
    ctx.font = `20px ${HUD_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`${state.points} pts`, rightX, row2Y);

    ctx.textAlign = 'left';
  }

  _formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
}
