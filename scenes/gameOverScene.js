// ============================================================
// CLOSE THE SKY — gameOverScene.js
// Game over + win screen
// ============================================================

const FONT = "'Share Tech Mono', monospace";

class GameOverScene {
  constructor(canvas, ctx, stats, onRestart, onMenu) {
    this.canvas = canvas;
    this.ctx = ctx;
    // stats: { win, kills, points, mode, attackNum, waveNum, totalSpawned, timeElapsed }
    this.stats = stats;
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

    if (x > CX - 200 && x < CX + 200 && y > 960 && y < 1040) this.onRestart();
    if (x > CX - 200 && x < CX + 200 && y > 1060 && y < 1140) this.onMenu();
  }

  _formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  draw(ctx) {
    this._bg.draw(ctx);

    const CX = CONFIG.CANVAS.WIDTH / 2;
    const s = this.stats;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    ctx.textAlign = 'center';

    if (s.win) {
      // Campaign win
      ctx.font = `bold 64px ${FONT}`;
      ctx.fillStyle = '#44ff88';
      ctx.fillText('SKY CLOSED', CX, 260);

      ctx.font = `22px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('All attacks repelled. The city is safe.', CX, 320);

      this._drawStats(ctx, CX, 420, s);
      this._drawButton(ctx, CX, 960, 400, 80, 'R  PLAY AGAIN');
      this._drawButton(ctx, CX, 1060, 400, 80, 'M  MAIN MENU');

    } else if (s.mode === 'endless') {
      // Arcade game over
      ctx.font = `bold 72px ${FONT}`;
      ctx.fillStyle = '#ff3333';
      ctx.fillText('GAME OVER', CX, 220);

      // Narrative body
      ctx.font = `18px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      const lines = [
        'You failed to close the sky.',
        'The insidious enemy broke through the air defense',
        'and destroyed all critical infrastructure.',
        '600,000 residents left the city,',
        'abandoning their homes.',
        'The city is now deserted.',
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, CX, 300 + i * 32);
      });

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX - 300, 510);
      ctx.lineTo(CX + 300, 510);
      ctx.stroke();

      this._drawStats(ctx, CX, 560, s);
      this._drawButton(ctx, CX, 960, 400, 80, 'R  RESTART');
      this._drawButton(ctx, CX, 1060, 400, 80, 'M  MAIN MENU');

    } else {
      // Campaign game over
      ctx.font = `bold 64px ${FONT}`;
      ctx.fillStyle = '#ff3333';
      ctx.fillText('MISSION FAILED', CX, 260);

      ctx.font = `20px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`Fell at Attack ${s.attackNum}, Wave ${s.waveNum}`, CX, 320);

      this._drawStats(ctx, CX, 420, s);
      this._drawButton(ctx, CX, 960, 400, 80, 'R  TRY AGAIN');
      this._drawButton(ctx, CX, 1060, 400, 80, 'M  MAIN MENU');
    }

    ctx.textAlign = 'left';
  }

  _drawStats(ctx, cx, startY, s) {
    const rows = [
      { label: 'ENEMIES DESTROYED', value: `${s.kills}` },
      { label: 'POINTS EARNED',     value: `${s.points}` },
      { label: 'WAVES SURVIVED',    value: `${s.waveNum}` },
      { label: 'TIME SURVIVED',     value: this._formatTime(s.timeElapsed || 0) },
    ];

    rows.forEach((row, i) => {
      const y = startY + i * 72;

      // Row bg
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(cx - 300, y, 600, 56, 6);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.font = `16px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText(row.label, cx - 280, y + 34);

      ctx.textAlign = 'right';
      ctx.font = `bold 26px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(row.value, cx + 280, y + 36);

      ctx.textAlign = 'center';
    });
  }

  _drawButton(ctx, cx, y, w, h, label) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(cx - w/2, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(label, cx, y + 50);
  }
}
