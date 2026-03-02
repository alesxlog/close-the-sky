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
    this._onClick = (e) => {
      e.stopPropagation(); // Prevent other click handlers
      this._handleClick(e);
    };
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CONFIG.CANVAS.WIDTH / rect.width;
      const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
      this._mouseX = (e.clientX - rect.left) * scaleX;
      this._mouseY = (e.clientY - rect.top) * scaleY;
    };
    this._onKey = (e) => {
      if (e.code === 'KeyC' || e.code === 'Digit1') this.onSelect('campaign');
      if (e.code === 'KeyE' || e.code === 'Digit2') this.onSelect('arcade');
    };
    this.canvas.addEventListener('click', this._onClick, true); // Use capture mode
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('keydown', this._onKey);
  }

  destroy() {
    this.canvas.removeEventListener('click', this._onClick, true);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('keydown', this._onKey);
  }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS.WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const CX = CONFIG.CANVAS.WIDTH / 2;

    const BTN_W = 400, BTN_H = 90, BTN_GAP = 130, BTN_START_Y = 580;
    const buttons = [
      { mode: 'arcade',   y: BTN_START_Y },
      { mode: 'campaign', y: BTN_START_Y + BTN_GAP },
    ];
    for (const btn of buttons) {
      const btnLeft = CX - BTN_W/2;
      const btnRight = CX + BTN_W/2;
      const btnTop = btn.y;
      const btnBottom = btn.y + BTN_H;
      
      if (x > btnLeft && x < btnRight && y > btnTop && y < btnBottom) {
        this.onSelect(btn.mode);
        return;
      }
    }
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
    ctx.fillText('Hold up the shield of truth', CX, 390);
    ctx.fillText('to stop the fiery arrows of the evil', CX, 420);

    // Select label
    ctx.font = `16px ${MENU_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('Choose your mission', CX, 550);

    // Buttons
    const BTN_W = 400, BTN_H = 90, BTN_GAP = 130;
    const BTN_START_Y = 580;
    const buttons = [
      { label: 'Arcade',   sub: 'No ceasefire. Wave after wave.', mode: 'arcade'   },
      { label: 'Campaign', sub: 'Story of resilience. Night after night.', mode: 'campaign' },
    ];
    buttons.forEach((btn, i) => {
      btn.y = BTN_START_Y + i * BTN_GAP;
      this._drawButton(ctx, CX, btn.y, BTN_W, BTN_H, btn.label, btn.sub);
    });

    // Controls
    ctx.font = `15px ${MENU_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('WASD / ARROWS — move   SPACE — fire', CX, 880);

    // Debug: Mouse position
    if (this._mouseX !== undefined && this._mouseY !== undefined) {
      ctx.fillStyle = 'yellow';
      ctx.font = `12px ${MENU_FONT}`;
      ctx.fillText(`Mouse: ${Math.round(this._mouseX)}, ${Math.round(this._mouseY)}`, 10, CONFIG.CANVAS.HEIGHT - 10);
    }

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
