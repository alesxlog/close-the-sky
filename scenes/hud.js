// ============================================================
// CLOSE THE SKY — hud.js
// Bottom strip: HP hearts, lives (car icons), kill counter
// ============================================================

class HUD {
  constructor() {
    this.C = CONFIG.CANVAS;
    this.H = CONFIG.HUD;
    this._truckImg = new Image();
    this._truckImg.src = 'assets/images/truck.png';
    this._lavImg = new Image();
    this._lavImg.src = 'assets/images/lav.png';
  }

  draw(ctx, state) {
    // state: { hp, maxHp, lives, maxLives, kills, points, vehicleId, mode, attackNum, waveNum }
    const y = this.C.HUD_TOP;
    const h = this.C.HUD_HEIGHT;
    const W = this.C.WIDTH;
    const P = this.H.PADDING;

    // HUD background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, y, W, h);

    // Top border line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    const midY = y + h / 2;

    // ---- LEFT: HP hearts ----
    this._drawHP(ctx, P, midY, state.hp, state.maxHp);

    // ---- CENTER: kills + points ----
    this._drawCenter(ctx, W / 2, midY, state.kills, state.points);

    // ---- RIGHT: lives (car icons) ----
    this._drawLives(ctx, W - P, midY, state.lives, state.vehicleId);

    // ---- Mode / attack label (top-left small) ----
    this._drawLabel(ctx, P, y + 14, state);
  }

  _drawHP(ctx, x, midY, hp, maxHp) {
    const size = this.H.HEART_SIZE;
    for (let i = 0; i < maxHp; i++) {
      const filled = i < hp;
      ctx.font = `${size}px serif`;
      ctx.globalAlpha = filled ? 1.0 : 0.25;
      ctx.fillText('❤️', x + i * (size + 4), midY + size / 2 - 4);
    }
    ctx.globalAlpha = 1;
  }

  _drawLives(ctx, rightX, midY, lives, vehicleId) {
    const iw = this.H.CAR_ICON_WIDTH;
    const ih = this.H.CAR_ICON_HEIGHT;
    const img = vehicleId === 'lav' ? this._lavImg : this._truckImg;
    const maxLives = CONFIG.GAME.LIVES;

    for (let i = 0; i < maxLives; i++) {
      const x = rightX - (i + 1) * (iw + 6);
      const alpha = i < lives ? 1.0 : 0.2;
      ctx.globalAlpha = alpha;
      if (img.complete) {
        ctx.drawImage(img, x, midY - ih / 2, iw, ih);
      } else {
        ctx.fillStyle = '#4a8a4a';
        ctx.fillRect(x, midY - ih / 2, iw, ih);
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawCenter(ctx, cx, midY, kills, points) {
    ctx.textAlign = 'center';

    // Points
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(points, cx, midY + 4);

    // Kills label
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`kills: ${kills}`, cx, midY + 22);

    ctx.textAlign = 'left';
  }

  _drawLabel(ctx, x, y, state) {
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    if (state.mode === 'campaign') {
      ctx.fillText(`ATTACK ${state.attackNum}  WAVE ${state.waveNum}`, x, y);
    } else {
      ctx.fillText(`ENDLESS  WAVE ${state.waveNum}`, x, y);
    }
  }
}
