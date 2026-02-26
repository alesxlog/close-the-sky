// ============================================================
// CLOSE THE SKY — gameOverScene.js
// Game over + win screen
// ============================================================

class GameOverScene {
  constructor(canvas, ctx, stats, onRestart, onMenu) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.stats = stats; // { win, kills, points, mode, attackNum, waveNum }
    this.onRestart = onRestart;
    this.onMenu = onMenu;
    this._bg = new Background();
    this._bind();
  }

  _bind() {
    this._onClick = (e) => this._handleClick(e);
    this._onKey = (e) => {
      if (e.code === 'KeyR' || e.code === 'Space') this.onRestart();
      if (e.code === 'Escape' || e.code === 'KeyM') this.onMenu();
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
    const btnW = 300, btnH = 70;

    if (x > CX - btnW/2 && x < CX + btnW/2 && y > 620 && y < 620 + btnH)
      this.onRestart();
    if (x > CX - btnW/2 && x < CX + btnW/2 && y > 720 && y < 720 + btnH)
      this.onMenu();
  }

  draw(ctx) {
    this._bg.draw(ctx);

    const CX = CONFIG.CANVAS.WIDTH / 2;
    const s = this.stats;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    ctx.textAlign = 'center';

    // Title
    const title = s.win ? '✓ SKY CLOSED' : '✗ CITY HIT';
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = s.win ? '#44ff88' : '#ff4444';
    ctx.fillText(title, CX, 300);

    // Stats
    ctx.font = '28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${s.points} pts`, CX, 390);

    ctx.font = '20px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`Enemies destroyed: ${s.kills}`, CX, 440);

    if (s.mode === 'campaign') {
      ctx.fillText(`Reached: Attack ${s.attackNum}, Wave ${s.waveNum}`, CX, 475);
    } else {
      ctx.fillText(`Survived to Wave ${s.waveNum}`, CX, 475);
    }

    // Buttons
    this._drawButton(ctx, CX, 620, 300, 70, 'R  PLAY AGAIN');
    this._drawButton(ctx, CX, 720, 300, 70, 'M  MAIN MENU');

    ctx.textAlign = 'left';
  }

  _drawButton(ctx, cx, y, w, h, label) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(label, cx, y + 44);
  }
}
