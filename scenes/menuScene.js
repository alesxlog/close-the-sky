// ============================================================
// CLOSE THE SKY — menuScene.js
// Main menu — mode selection
// ============================================================

class MenuScene {
  constructor(canvas, ctx, onSelect) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onSelect = onSelect; // callback(mode) — 'campaign' or 'endless'
    this._bg = new Background();
    this._bind();
  }

  _bind() {
    this._onClick = (e) => this._handleClick(e);
    this._onKey = (e) => {
      if (e.code === 'KeyC' || e.code === 'Digit1') this.onSelect('campaign');
      if (e.code === 'KeyE' || e.code === 'Digit2') this.onSelect('endless');
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

    const CX = CONFIG.CANVAS.WIDTH / 2;
    const btnW = 360, btnH = 80;

    // Campaign button
    if (x > CX - btnW/2 && x < CX + btnW/2 &&
        y > 560 && y < 560 + btnH) {
      this.onSelect('campaign');
    }
    // Endless button
    if (x > CX - btnW/2 && x < CX + btnW/2 &&
        y > 680 && y < 680 + btnH) {
      this.onSelect('endless');
    }
  }

  draw(ctx) {
    this._bg.draw(ctx);

    const CX = CONFIG.CANVAS.WIDTH / 2;

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px monospace';
    ctx.fillText('CLOSE THE SKY', CX, 280);

    ctx.font = '24px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Ukraine Air Defence', CX, 340);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 200, 380);
    ctx.lineTo(CX + 200, 380);
    ctx.stroke();

    // Buttons
    this._drawButton(ctx, CX, 560, 360, 80, '1  STORY MODE',
      'Campaign — 5 attacks with upgrades');
    this._drawButton(ctx, CX, 680, 360, 80, '2  ARCADE MODE',
      'Endless — survive as long as you can');

    // Controls hint
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('Arrow keys / WASD to move   Space to fire', CX, 820);

    ctx.textAlign = 'left';
  }

  _drawButton(ctx, cx, y, w, h, label, sub) {
    // Button bg
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(label, cx, y + 34);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '14px monospace';
    ctx.fillText(sub, cx, y + 58);
  }
}
