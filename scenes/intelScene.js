// ============================================================
// CLOSE THE SKY — intelScene.js
// Intelligence briefing before each campaign attack.
// Tablet + content-fitted panel design — matches aarScene.
// ============================================================

class IntelScene {
  constructor(canvas, ctx, attackNum, onComplete) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.attackNum  = attackNum;
    this.onComplete = onComplete;

    this._CW   = CONFIG.CANVAS.WIDTH;
    this._CH   = CONFIG.CANVAS.HEIGHT;
    this._FONT = "'Share Tech Mono', monospace";

    this._bg   = new Background();

    // Resolve placeholders from intel.js + waves.js
    this._brief = this._resolve(attackNum);

    // Tokenize body with highlights
    this._tokens = this._tokenize(this._brief.body);

    // Layout computed once on first draw (needs ctx for text measurement)
    this._layout = null;

    // Button bounds for click detection
    this._btnBounds = null;

    // Fade-in
    this._alpha = 0;

    this._bindInput();
  }

  // ----------------------------------------------------------
  // RESOLVE PLACEHOLDERS
  // ----------------------------------------------------------
  _resolve(attackNum) {
    const brief    = INTEL['attack' + attackNum];
    const waveCfg  = WAVES.campaign['attack' + attackNum];
    const template = INTEL.templates[brief.template];

    const seen = new Set(), names = [];
    for (const r of waveCfg.roster) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        const cfg = CONFIG.ENEMIES[r.type.toUpperCase()];
        if (cfg) names.push(cfg.name);
      }
    }

    const body = template
      .replace(/%AGENCY_NAME%/g,   brief.agency)
      .replace(/%TOTAL_ENEMIES%/g, waveCfg.total)
      .replace(/%ENEMY_ROSTER%/g,  names.join(', '))
      .replace(/%TARGET_LIST%/g,   brief.targets);

    // Build highlight keyword list:
    // enemy names, total count, target words (nouns 5+ chars)
    const highlights = [
      ...names,
      String(waveCfg.total),
      ...brief.targets.split(/[\s,]+/).filter(w => w.length >= 5),
    ];

    return { agency: brief.agency, body, highlights };
  }

  // ----------------------------------------------------------
  // TOKENIZE BODY TEXT
  // ----------------------------------------------------------
  _tokenize(text) {
    return text.split(' ').map(word => {
      const clean = word.replace(/[^a-zA-Z0-9\-]/g, '');
      const isHighlight = this._brief.highlights.some(h =>
        word.includes(h) || clean === h
      );
      return { word, highlight: isHighlight };
    });
  }

  // ----------------------------------------------------------
  // LAYOUT (computed once, needs ctx for text measurement)
  // ----------------------------------------------------------
  _computeLayout() {
    const ctx    = this.ctx;
    const FONT   = this._FONT;
    const BEZEL  = 18;
    const TW     = 760;
    const TH     = 900; // fixed tablet height
    const PAD    = 28;
    const BODY_F = 17;
    const LINE_H = 30;
    const BTN_H  = 54;
    const BTN_PAD = 20;

    const SW = TW - (BEZEL + 8) * 2;
    const SH = TH - (BEZEL + 8) * 2;

    // Panel is 67% of screen width
    const PANEL_W = Math.floor(SW * 0.67);
    const CW_c    = PANEL_W - PAD * 2;

    // Measure wrapped paragraph height
    ctx.font = `${BODY_F}px ${FONT}`;
    const words = this._brief.body.split(' ');
    let lw = 0, lines = 1;
    for (const w of words) {
      const ww = ctx.measureText(w + ' ').width;
      if (lw + ww > CW_c && lw > 0) { lines++; lw = 0; }
      lw += ww;
    }
    const paraH = lines * LINE_H;

    // Panel height = sum of all content
    let PANEL_H = 0;
    PANEL_H += 32;        // top pad
    PANEL_H += 14;        // breadcrumb
    PANEL_H += 36;        // gap
    PANEL_H += 34;        // title
    PANEL_H += 30;        // gap after title
    PANEL_H += 24;        // divider + gap
    PANEL_H += paraH;     // body paragraph
    PANEL_H += BTN_PAD;   // gap before btn
    PANEL_H += BTN_H;     // button
    PANEL_H += 28;        // bottom pad

    const TX = (this._CW - TW) / 2;
    const TY = (this._CH - TH) / 2;
    const SX = TX + BEZEL + 8;
    const SY = TY + BEZEL + 8;

    // Centre panel inside screen both axes
    const PANEL_X = SX + Math.floor((SW - PANEL_W) / 2);
    const PANEL_Y = SY + Math.floor((SH - PANEL_H) / 2);

    return {
      BEZEL, TW, TH, TX, TY,
      SX, SY, SW, SH,
      PANEL_X, PANEL_Y, PANEL_W, PANEL_H,
      PAD, CW_c, BODY_F, LINE_H, BTN_H, BTN_PAD,
    };
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

  _drawHighlightedPara(tokens, x, y, maxW, lineH, fontSize) {
    const ctx  = this.ctx;
    const FONT = this._FONT;
    let lineTokens = [], lineWidth = 0, currentY = y;

    const flushLine = (toks) => {
      let curX = x;
      for (let i = 0; i < toks.length; i++) {
        const tok = toks[i];
        const str = tok.word + (i < toks.length - 1 ? ' ' : '');
        ctx.font = `${fontSize}px ${FONT}`;
        ctx.fillStyle = tok.highlight ? '#f0c040' : '#a0c890';
        ctx.fillText(str, curX, currentY);
        curX += ctx.measureText(str).width;
      }
      currentY += lineH;
    };

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      ctx.font = `${fontSize}px ${FONT}`;
      const ww = ctx.measureText(tok.word + ' ').width;
      if (lineWidth + ww > maxW && lineTokens.length > 0) {
        flushLine(lineTokens);
        lineTokens = []; lineWidth = 0;
      }
      lineTokens.push(tok);
      lineWidth += ww;
    }
    if (lineTokens.length) flushLine(lineTokens);
    return currentY;
  }

  // ----------------------------------------------------------
  // INPUT
  // ----------------------------------------------------------
  _bindInput() {
    this._onClick = (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this._handleClick(e);
    };
    this._onKey = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._complete();
      }
    };
    this.canvas.addEventListener('click', this._onClick, true);
    window.addEventListener('keydown', this._onKey);
  }

  destroy() {
    this.canvas.removeEventListener('click', this._onClick, true);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('keydown', this._onKey);
  }

  _complete() {
    if (this._completed) return;
    this._completed = true;
    this.destroy();
    this.onComplete();
  }

  _handleClick(e) {
    if (!this._btnBounds) return;
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this._CW / rect.width;
    const scaleY = this._CH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const b = this._btnBounds;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      this._complete();
    }
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------
  update(dt) {
    this._alpha = Math.min(1, this._alpha + dt * 2.5);
  }

  // ----------------------------------------------------------
  // DRAW
  // ----------------------------------------------------------
  draw(ctx) {
    // Compute layout once (requires ctx for text measurement)
    if (!this._layout) this._layout = this._computeLayout();
    const L    = this._layout;
    const FONT = this._FONT;

    // Background
    this._bg.draw(ctx);
    ctx.save();
    ctx.globalAlpha = Math.min(0.68, this._alpha * 0.68);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this._CW, this._CH);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = this._alpha;

    // ── Bezel (fixed size) ────────────────────────────────────
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

    // ── Screen (fixed size) ───────────────────────────────────
    ctx.fillStyle = '#0a120d';
    this._roundRect(L.SX, L.SY, L.SW, L.SH, 8, true, false);
    for (let ly = L.SY; ly < L.SY + L.SH; ly += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(L.SX, ly, L.SW, 1);
    }

    // ── Panel (content-fitted, centred in screen) ─────────────
    ctx.fillStyle = 'rgba(0,18,6,0.75)';
    this._roundRect(L.PANEL_X, L.PANEL_Y, L.PANEL_W, L.PANEL_H, 8, true, false);
    ctx.strokeStyle = 'rgba(126,207,90,0.28)'; ctx.lineWidth = 1;
    this._roundRect(L.PANEL_X, L.PANEL_Y, L.PANEL_W, L.PANEL_H, 8, false, true);

    const PX = L.PANEL_X + L.PAD;
    let   CY = L.PANEL_Y + 32;

    // Breadcrumb
    ctx.textAlign = 'left';
    ctx.font = `14px ${FONT}`; ctx.fillStyle = 'rgba(126,207,90,0.42)';
    ctx.fillText('INBOX  //  UPDATES  //  INTEL', PX, CY);
    CY += 36;

    // Title
    ctx.font = `bold 34px ${FONT}`; ctx.fillStyle = '#7ecf5a';
    ctx.fillText('INTEL UPDATE', PX, CY);
    CY += 30;

    this._divider(PX, CY, L.CW_c); CY += 24;

    // Body paragraph with highlights
    CY = this._drawHighlightedPara(this._tokens, PX, CY, L.CW_c, L.LINE_H, L.BODY_F);
    CY += L.BTN_PAD;

    // GOT IT button
    const BX = PX, BY = CY, BW = L.CW_c, BH = L.BTN_H;
    this._btnBounds = { x: BX, y: BY, w: BW, h: BH };

    ctx.fillStyle = '#1e3d10';
    this._roundRect(BX, BY, BW, BH, 8, true, false);
    ctx.strokeStyle = 'rgba(126,207,90,0.55)'; ctx.lineWidth = 1.2;
    this._roundRect(BX, BY, BW, BH, 8, false, true);
    ctx.font = `bold 18px ${FONT}`; ctx.fillStyle = '#7ecf5a';
    ctx.textAlign = 'center';
    ctx.fillText('GOT IT', BX + BW/2, BY + BH/2 + 7);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}
