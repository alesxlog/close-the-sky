// ============================================================
// CLOSE THE SKY — menuScene.js
// Main menu — mode selection
// ============================================================

const MENU_FONT = "'Share Tech Mono', monospace";

class MenuScene {
  constructor(canvas, ctx, onSelect) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onSelect = onSelect;
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
    const btnW = 400, btnH = 90;

    if (x > CX - btnW/2 && x < CX + btnW/2 && y > 580 && y < 580 + btnH)
      this.onSelect('campaign');
    if (x > CX - btnW/2 && x < CX + btnW/2 && y > 710 && y < 710 + btnH)
      this.onSelect('endless');
  }

  draw(ctx) {
    this._bg.draw(ctx);

    const CX = CONFIG.CANVAS.WIDTH / 2;

    // Dark overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    ctx.textAlign = 'center';

    // Title
    ctx.font = `bold 80px ${MENU_FONT}`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255,100,0,0.6)';
    ctx.shadowBlur = 24;
    ctx.fillText('CLOSE THE SKY', CX, 300);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = `22px ${MENU_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Ukraine Air Defence', CX, 355);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 220, 400);
    ctx.lineTo(CX + 220, 400);
    ctx.stroke();

    // Select label
    ctx.font = `16px ${MENU_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('SELECT MODE', CX, 510);

    // Buttons
    this._drawButton(ctx, CX, 580, 400, 90,
      '1  STORY MODE',
      '5 attacks · upgrades · campaign');
    this._drawButton(ctx, CX, 710, 400, 90,
      '2  ARCADE MODE',
      'Endless · auto-upgrades · survive');

    // Controls
    ctx.font = `15px ${MENU_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('WASD / ARROWS — move   SPACE — fire', CX, 880);

    ctx.textAlign = 'left';
  }

  _drawButton(ctx, cx, y, w, h, label, sub) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 26px ${MENU_FONT}`;
    ctx.fillText(label, cx, y + 38);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `15px ${MENU_FONT}`;
    ctx.fillText(sub, cx, y + 64);
  }
}
