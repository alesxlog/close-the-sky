// ============================================================
// CLOSE THE SKY — intelScene.js
// Displays intelligence briefing before each campaign attack.
// Reads data from intel.js, resolves placeholders from waves.js
// ============================================================

class IntelScene {
  constructor(canvas, ctx, attackNum, onComplete) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.attackNum  = attackNum;
    this.onComplete = onComplete;

    this._bg = new Background();
    this._resolvedText = this._resolve(attackNum);
    this._fullText = this._resolvedText.body; // Add this line

    this._onClick = (e) => {
      e.stopPropagation(); // Prevent other click handlers
      this._handleClick(e);
    };
    this.canvas.addEventListener('click', this._onClick, true); // Use capture mode

    this._onKey = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._complete();
      }
    };
    window.addEventListener('keydown', this._onKey);

    // Button bounds (set during draw)
    this._btnBounds  = null;
  }

  // ---- RESOLVE PLACEHOLDERS ----

  _resolve(attackNum) {
    const brief    = INTEL['attack' + attackNum];
    const waveCfg  = WAVES.campaign['attack' + attackNum];
    const template = INTEL.templates[brief.template];

    // Build enemy roster string from waves.js roster
    // Use unique types only (deduplicate)
    const seen  = new Set();
    const names = [];
    for (const r of waveCfg.roster) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        const cfg = CONFIG.ENEMIES[r.type.toUpperCase()];
        if (cfg) names.push(cfg.name);
      }
    }
    const rosterStr = names.join(', ');

    const body = template
      .replace(/%AGENCY_NAME%/g,   brief.agency)
      .replace(/%TOTAL_ENEMIES%/g, waveCfg.total)
      .replace(/%ENEMY_ROSTER%/g,  rosterStr)
      .replace(/%TARGET_LIST%/g,   brief.targets);

    return {
      agency:  brief.agency,
      threat:  brief.threat,
      body,
    };
  }

  // ---- LIFECYCLE ----

  destroy() {
    this.canvas.removeEventListener('click', this._onClick);
    window.removeEventListener('keydown', this._onKey);
  }

  _complete() {
    this.destroy();
    this.onComplete();
  }

  // ---- DRAW ----

  draw(ctx) {
    const CW   = CONFIG.CANVAS.WIDTH;
    const CH   = CONFIG.CANVAS.HEIGHT;
    const CX   = CW / 2;
    const FONT = "'Share Tech Mono', monospace";

    // Background — city frozen
    this._bg.draw(ctx);

    const PAD_X = 180, PAD_Y = 60;
    const PAD_W = CW - PAD_X * 2;
    const PAD_H = CH - PAD_Y * 2;
    ctx.fillStyle = 'rgba(0, 10, 6, 0.92)';
    ctx.fillRect(PAD_X, PAD_Y, PAD_W, PAD_H);
    ctx.strokeStyle = 'rgba(68,255,170,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD_X, PAD_Y, PAD_W, PAD_H);

    // ---- Header ----
    ctx.textAlign = 'center';
    ctx.font      = `bold 64px ${FONT}`;
    ctx.fillStyle = '#44ffaa';
    ctx.fillText('INTEL UPDATE', CX, 150);

    // Divider
    this._drawDivider(ctx, CX, 170);

    // FROM
    ctx.textAlign = 'left';
    ctx.font      = `20px ${FONT}`;
    ctx.fillStyle = 'rgba(68,255,170,0.6)';
    ctx.fillText(`FROM:  ${this._resolvedText.agency}`, CX - 380, 210);

    // Divider
    this._drawDivider(ctx, CX, 252);

    // ---- Body text (typewriter) ----
    const lines = this._wrapText(ctx, this._fullText, 680, `20px ${FONT}`);
    ctx.font      = `20px ${FONT}`;
    ctx.fillStyle = '#c8fce8';
    ctx.textAlign = 'left';

    let textY = 285;
    for (const line of lines) {
      if (line === '') { textY += 20; continue; }
      ctx.fillText(line, CX - 380, textY);
      textY += 26;
    }

    // ---- GOT IT button ----
    const BTN_W = 280, BTN_H = 60;
    const btnX  = CX - BTN_W / 2;
    const btnY  = CH - 130;

    this._btnBounds = { x: btnX, y: btnY, w: BTN_W, h: BTN_H };

    // Static button (no pulse since typewriter was removed)
    ctx.fillStyle = 'rgba(0,80,40,0.8)';
    ctx.strokeStyle = 'rgba(68,255,170,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(btnX, btnY, BTN_W, BTN_H);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font      = `bold 22px ${FONT}`;
    ctx.fillStyle = '#44ffaa';
    ctx.fillText('GOT IT', CX, btnY + 38);

    ctx.textAlign = 'left';
  }

  // ---- CLICK HANDLER ----

  _handleClick(e) {
    // Check GOT IT button
    if (!this._btnBounds) return;
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS.WIDTH  / rect.width;
    const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const b = this._btnBounds;
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
      this._complete();
    }
  }

  // ---- HELPERS ----

  _drawDivider(ctx, cx, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(68,255,170,0.25)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 380, y);
    ctx.lineTo(cx + 380, y);
    ctx.stroke();
    ctx.restore();
  }

  _wrapText(ctx, text, maxWidth, font) {
    ctx.font = font;
    const paragraphs = text.split('\n');
    const lines      = [];

    for (const para of paragraphs) {
      if (para === '') { lines.push(''); continue; }
      const words = para.split(' ');
      let   line  = '';

      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }

    return lines;
  }
}
