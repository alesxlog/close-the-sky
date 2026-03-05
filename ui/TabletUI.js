//          Portrait 10:16, thick bezel, scrollable content area.
//          Scenes provide content via a render callback.

class TabletUI {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this._FONT  = "'Share Tech Mono', monospace";

    // ── Tablet dimensions (10:16 portrait) ──
    // Screen: 480 x 768, Bezel: 50 top, 70 bottom, 50 sides
    this.BEZEL_TOP    = 50;
    this.BEZEL_BOTTOM = 70;
    this.BEZEL_SIDE   = 50;
    this.SCREEN_W     = 480;
    this.SCREEN_H     = 768;
    this.TABLET_W     = this.SCREEN_W + this.BEZEL_SIDE * 2;  // 580
    this.TABLET_H     = this.SCREEN_H + this.BEZEL_TOP + this.BEZEL_BOTTOM; // 888
    this.CONTENT_PAD  = 28;

    // Position: centered on canvas
    const CW = CONFIG.CANVAS.WIDTH;
    const CH = CONFIG.CANVAS.HEIGHT;
    this.TX = Math.floor((CW - this.TABLET_W) / 2);
    this.TY = Math.floor((CH - this.TABLET_H) / 2) - 50;
    this.SX = this.TX + this.BEZEL_SIDE;
    this.SY = this.TY + this.BEZEL_TOP;

    // ── Scroll state ──
    this._scrollY       = 0;
    this._maxScroll     = 0;
    this._contentHeight = 0;
    this._isDragging    = false;
    this._dragStartY    = 0;
    this._dragScrollStart = 0;
    this._scrollVelocity  = 0;
    this._drawOffsetY     = 0;
    this._dragDistance    = 0;    // total px dragged (for click vs drag detection)
    this._DRAG_THRESHOLD  = 6;    // px — movement below this counts as a click

    // ── Offscreen content canvas ──
    this._contentCanvas = document.createElement('canvas');
    this._contentCanvas.width  = this.SCREEN_W;
    this._contentCanvas.height = 4096; // tall enough for any content
    this._contentCtx = this._contentCanvas.getContext('2d');

    // ── Listeners (managed by scene, but we provide handlers) ──
    this._handlers = {
      wheel: (e) => this._onWheel(e),
      mousedown: (e) => this._onPointerDown(e),
      mousemove: (e) => this._onPointerMove(e),
      mouseup: (e) => this._onPointerUp(e),
      touchstart: (e) => this._onTouchStart(e),
      touchmove: (e) => this._onTouchMove(e),
      touchend: (e) => this._onTouchEnd(e),
    };
  }

  // ── Scene calls this to register scroll listeners ──

  registerListeners(scene) {
    scene._on(this.canvas, 'wheel',      this._handlers.wheel,      { passive: false });
    scene._on(this.canvas, 'mousedown',  this._handlers.mousedown,  false);
    scene._on(window,      'mousemove',  this._handlers.mousemove,  false);
    scene._on(window,      'mouseup',    this._handlers.mouseup,    false);
    scene._on(this.canvas, 'touchstart', this._handlers.touchstart, { passive: false });
    scene._on(this.canvas, 'touchmove',  this._handlers.touchmove,  { passive: false });
    scene._on(this.canvas, 'touchend',   this._handlers.touchend,   false);
  }

  // ── Convert page coords → canvas coords ──

  _toCanvas(clientX, clientY) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS.WIDTH  / rect.width;
    const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  }

  _isInsideScreen(cx, cy) {
    return cx >= this.SX && cx <= this.SX + this.SCREEN_W &&
           cy >= this.SY && cy <= this.SY + this.SCREEN_H;
  }

  // ── Scroll input handlers ──

  _onWheel(e) {
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    if (!this._isInsideScreen(x, y)) return;
    e.preventDefault();
    // Scale wheel delta to canvas space
    const rect  = this.canvas.getBoundingClientRect();
    const scale = CONFIG.CANVAS.HEIGHT / rect.height;
    this._scrollY += e.deltaY * scale * 0.8;
    this._clampScroll();
  }

  _onPointerDown(e) {
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    if (!this._isInsideScreen(x, y)) return;
    this._isDragging = true;
    this._dragStartY = y;
    this._dragScrollStart = this._scrollY;
    this._scrollVelocity = 0;
    this._dragDistance = 0;
  }

  _onPointerMove(e) {
    if (!this._isDragging) return;
    const { x, y } = this._toCanvas(e.clientX, e.clientY);
    const dy = this._dragStartY - y;
    this._dragDistance = Math.abs(dy);
    this._scrollVelocity = dy - (this._scrollY - this._dragScrollStart);
    this._scrollY = this._dragScrollStart + dy;
    this._clampScroll();
  }

  _onPointerUp(e) {
    this._isDragging = false;
  }

  _onTouchStart(e) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const { x, y } = this._toCanvas(touch.clientX, touch.clientY);
    if (!this._isInsideScreen(x, y)) return;
    e.preventDefault();
    this._isDragging = true;
    this._dragStartY = y;
    this._dragScrollStart = this._scrollY;
    this._scrollVelocity = 0;
    this._dragDistance = 0;
  }

  _onTouchMove(e) {
    if (!this._isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = this._toCanvas(touch.clientX, touch.clientY);
    const dy = this._dragStartY - y;
    this._dragDistance = Math.abs(dy);
    this._scrollVelocity = dy - (this._scrollY - this._dragScrollStart);
    this._scrollY = this._dragScrollStart + dy;
    this._clampScroll();
  }

  _onTouchEnd(e) {
    this._isDragging = false;
  }

  _clampScroll() {
    this._scrollY = Math.max(0, Math.min(this._maxScroll, this._scrollY));
  }

  // ── Inertia update (call from scene.update) ──

  updateScroll(dt) {
    if (!this._isDragging && Math.abs(this._scrollVelocity) > 0.5) {
      this._scrollY += this._scrollVelocity;
      this._scrollVelocity *= 0.92; // friction
      this._clampScroll();
    }
  }

  // ── Reset scroll position ──

  resetScroll() {
    this._scrollY = 0;
    this._scrollVelocity = 0;
  }

  // ── Was the last pointer interaction a drag (not a click)? ──

  wasDragging() {
    return this._dragDistance > this._DRAG_THRESHOLD;
  }

  // ── Hit test: convert canvas click → content-space coordinates ──
  //    Returns { x, y } in content space, or null if outside screen

  hitTest(canvasX, canvasY) {
    if (!this._isInsideScreen(canvasX, canvasY)) return null;
    return {
      x: canvasX - this.SX - this.CONTENT_PAD,
      y: canvasY - this.SY + this._scrollY - this.CONTENT_PAD - this._drawOffsetY,
    };
  }

  // ══════════════════════════════════════════════════════════
  // DRAW — Main entry point
  // renderContent: function(ctx, width, height) → returns contentHeight
  // options: { centered: bool, alpha: number }
  // ══════════════════════════════════════════════════════════

  draw(ctx, renderContent, options = {}) {
    const alpha = options.alpha !== undefined ? options.alpha : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    this._drawBezel(ctx);
    this._drawScreen(ctx);

    // Render content to offscreen canvas
    const cctx = this._contentCtx;
    const cw   = this.SCREEN_W - this.CONTENT_PAD * 2;
    cctx.clearRect(0, 0, this._contentCanvas.width, this._contentCanvas.height);
    cctx.save();
    cctx.translate(this.CONTENT_PAD, this.CONTENT_PAD);
    const contentH = renderContent(cctx, cw) || 0;
    cctx.restore();

    this._contentHeight = contentH + this.CONTENT_PAD * 2;
    this._maxScroll = Math.max(0, this._contentHeight - this.SCREEN_H);

    // If centered and content fits, offset to center
    this._drawOffsetY = 0;
    if (options.centered && this._contentHeight <= this.SCREEN_H) {
      this._drawOffsetY = Math.floor((this.SCREEN_H - this._contentHeight) / 2);
    }

    // Clip to screen area and blit content
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.SX, this.SY, this.SCREEN_W, this.SCREEN_H, 6);
    ctx.clip();

    ctx.drawImage(
      this._contentCanvas,
      0, this._scrollY,
      this.SCREEN_W, this.SCREEN_H,
      this.SX, this.SY + this._drawOffsetY,
      this.SCREEN_W, this.SCREEN_H
    );
    ctx.restore();

    // Scrollbar
    if (this._maxScroll > 0) {
      this._drawScrollbar(ctx);
    }

    // Screen inner shadow (on top of content)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.SX, this.SY, this.SCREEN_W, this.SCREEN_H, 6);
    ctx.clip();
    // Vignette
    const grad = ctx.createRadialGradient(
      this.SX + this.SCREEN_W / 2, this.SY + this.SCREEN_H / 2,
      this.SCREEN_W * 0.3,
      this.SX + this.SCREEN_W / 2, this.SY + this.SCREEN_H / 2,
      this.SCREEN_W * 0.7
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.SX, this.SY, this.SCREEN_W, this.SCREEN_H);
    ctx.restore();

    ctx.restore();
  }

  // ── Bezel (military rugged case) ──

  _drawBezel(ctx) {
    const { TX, TY, TABLET_W, TABLET_H } = this;

    // Main body
    ctx.fillStyle = '#1c2118';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 12;
    ctx.beginPath();
    ctx.roundRect(TX, TY, TABLET_W, TABLET_H, 24);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Subtle texture
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(TX, TY, TABLET_W, TABLET_H, 24);
    ctx.clip();
    for (let ly = TY; ly < TY + TABLET_H; ly += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.025)';
      ctx.fillRect(TX, ly, TABLET_W, 2);
    }
    ctx.restore();

    // Edge highlight
    ctx.strokeStyle = 'rgba(100,130,70,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(TX + 1, TY + 1, TABLET_W - 2, TABLET_H - 2, 23);
    ctx.stroke();

    // Screws
    this._drawScrew(ctx, TX + 18, TY + 18);
    this._drawScrew(ctx, TX + TABLET_W - 18, TY + 18);
    this._drawScrew(ctx, TX + 18, TY + TABLET_H - 18);
    this._drawScrew(ctx, TX + TABLET_W - 18, TY + TABLET_H - 18);

    // Physical buttons — top bezel
    this._drawPhysicalBtn(ctx, TX + TABLET_W - 100, TY + 16, 28, 8);  // power
    this._drawPhysicalBtn(ctx, TX + TABLET_W - 140, TY + 16, 18, 8);  // vol+
    this._drawPhysicalBtn(ctx, TX + TABLET_W - 168, TY + 16, 18, 8);  // vol-

    // Physical buttons — bottom bezel
    const bby = TY + TABLET_H - 30;
    const bcx = TX + TABLET_W / 2;
    this._drawNavBtn(ctx, bcx - 36, bby, 10, 10, 'back');
    this._drawNavBtn(ctx, bcx - 10, bby - 2, 14, 14, 'home');
    this._drawNavBtn(ctx, bcx + 16, bby, 10, 10, 'forward');
    this._drawNavBtn(ctx, bcx + 40, bby, 12, 12, 'enter');
  }

  _drawScrew(ctx, x, y) {
    ctx.fillStyle = '#2a3026';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(100,140,80,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(100,140,80,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 3.5, y); ctx.lineTo(x + 3.5, y);
    ctx.moveTo(x, y - 3.5); ctx.lineTo(x, y + 3.5);
    ctx.stroke();
  }

  _drawPhysicalBtn(ctx, x, y, w, h) {
    ctx.fillStyle = '#252e20';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(100,140,80,0.12)';
    ctx.fillRect(x + 1, y + 1, w - 2, 2);
  }

  _drawNavBtn(ctx, x, y, w, h, type) {
    ctx.fillStyle = '#252e20';
    if (type === 'home') {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,140,80,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 2);
      ctx.fill();
    }

    // Arrow marks for back/forward
    if (type === 'back' || type === 'forward') {
      ctx.fillStyle = 'rgba(100,140,80,0.25)';
      ctx.beginPath();
      const cx = x + w / 2, cy = y + h / 2;
      if (type === 'back') {
        ctx.moveTo(cx - 2, cy);
        ctx.lineTo(cx + 2, cy - 3);
        ctx.lineTo(cx + 2, cy + 3);
      } else {
        ctx.moveTo(cx + 2, cy);
        ctx.lineTo(cx - 2, cy - 3);
        ctx.lineTo(cx - 2, cy + 3);
      }
      ctx.fill();
    }

    // Square mark for enter
    if (type === 'enter') {
      ctx.strokeStyle = 'rgba(100,140,80,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    }
  }

  // ── Screen background ──

  _drawScreen(ctx) {
    ctx.fillStyle = '#0a120d';
    ctx.beginPath();
    ctx.roundRect(this.SX, this.SY, this.SCREEN_W, this.SCREEN_H, 6);
    ctx.fill();

    // Scanlines
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.SX, this.SY, this.SCREEN_W, this.SCREEN_H, 6);
    ctx.clip();
    for (let ly = this.SY; ly < this.SY + this.SCREEN_H; ly += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(this.SX, ly, this.SCREEN_W, 1);
    }
    ctx.restore();
  }

  // ── Scrollbar ──

  _drawScrollbar(ctx) {
    const trackX = this.SX + this.SCREEN_W - 10;
    const trackY = this.SY + 4;
    const trackH = this.SCREEN_H - 8;

    // Track
    ctx.fillStyle = 'rgba(126,207,90,0.04)';
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, 6, trackH, 3);
    ctx.fill();

    // Thumb
    const ratio  = this.SCREEN_H / this._contentHeight;
    const thumbH = Math.max(30, trackH * ratio);
    const thumbY = trackY + (trackH - thumbH) * (this._scrollY / this._maxScroll);

    ctx.fillStyle = this._isDragging ? 'rgba(126,207,90,0.4)' : 'rgba(126,207,90,0.2)';
    ctx.beginPath();
    ctx.roundRect(trackX, thumbY, 6, thumbH, 3);
    ctx.fill();
  }

  // ══════════════════════════════════════════════════════════
  // CONTENT HELPERS — call these inside renderContent callback
  // All return the Y advance (how many px they consumed)
  // ══════════════════════════════════════════════════════════

  static drawTitle(ctx, y, text, options = {}) {
    const FONT  = "'Share Tech Mono', monospace";
    const align = options.center ? 'center' : 'left';
    const color = options.color || '#7ecf5a';
    const width = options.width || 424;

    ctx.font = `bold 36px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    const tx = align === 'center' ? width / 2 : 0;
    ctx.fillText(text, tx, y + 28);
    ctx.textAlign = 'left';
    return 36;
  }

  static drawSubtitle(ctx, y, text, options = {}) {
    const FONT  = "'Share Tech Mono', monospace";
    const align = options.center ? 'center' : 'left';
    const color = options.color || 'rgba(126,207,90,0.45)';
    const width = options.width || 424;

    ctx.font = `24px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    const tx = align === 'center' ? width / 2 : 0;

    // Support multi-line
    const lines = text.split('\n');
    let dy = 0;
    for (const line of lines) {
      ctx.fillText(line, tx, y + 14 + dy);
      dy += 20;
    }
    ctx.textAlign = 'left';
    return dy + 8;
  }

  static drawDivider(ctx, y, width) {
    ctx.save();
    ctx.strokeStyle = 'rgba(126,207,90,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(0, y + 10);
    ctx.lineTo(width, y + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return 20;
  }

  static drawHeader(ctx, y, text, width) {
    const FONT = "'Share Tech Mono', monospace";
    ctx.font = `16px ${FONT}`;
    ctx.fillStyle = 'rgba(126,207,90,0.35)';
    ctx.letterSpacing = '2px';
    ctx.fillText(text.toUpperCase(), 0, y + 12);
    ctx.letterSpacing = '0px';

    // Underline
    ctx.strokeStyle = 'rgba(126,207,90,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(0, y + 20);
    ctx.lineTo(width, y + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    return 30;
  }

  static drawBody(ctx, y, text, width, options = {}) {
    const FONT    = "'Share Tech Mono', monospace";
    const fontSize = options.fontSize || 22;
    const lineH    = options.lineHeight || 32;
    const color    = options.color || '#a0c890';
    const highlights = options.highlights || [];

    ctx.font = `${fontSize}px ${FONT}`;

    const words = text.split(' ');
    let lineX = 0, lineY = y;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const clean = word.replace(/[^a-zA-Z0-9\-]/g, '');
      const isHL = highlights.some(h => word.includes(h) || clean === h);
      const str = word + (i < words.length - 1 ? ' ' : '');
      const ww = ctx.measureText(str).width;

      if (lineX + ww > width && lineX > 0) {
        lineX = 0;
        lineY += lineH;
      }

      ctx.fillStyle = isHL ? '#f0c040' : color;
      ctx.fillText(str, lineX, lineY + fontSize);
      lineX += ww;
    }

    return (lineY - y) + lineH + 8;
  }

  static drawStatRow(ctx, y, label, value, width, options = {}) {
    const FONT = "'Share Tech Mono', monospace";
    const valueColor = options.valueColor || '#e0f0d0';

    ctx.font = `20px ${FONT}`;
    ctx.fillStyle = '#a0c890';
    ctx.textAlign = 'left';
    ctx.fillText(label, 0, y + 15);

    ctx.font = `bold 20px ${FONT}`;
    ctx.fillStyle = valueColor;
    ctx.textAlign = 'right';
    ctx.fillText(value, width, y + 15);
    ctx.textAlign = 'left';

    return 32;
  }

  static drawButton(ctx, y, label, width, options = {}) {
    const FONT = "'Share Tech Mono', monospace";
    const h = 48;
    const secondary = options.secondary || false;

    // Background
    ctx.fillStyle = secondary ? 'rgba(126,207,90,0.04)' : 'rgba(30,61,16,0.7)';
    ctx.beginPath();
    ctx.roundRect(0, y, width, h, 6);
    ctx.fill();

    // Border
    ctx.strokeStyle = secondary ? 'rgba(126,207,90,0.2)' : 'rgba(126,207,90,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, y, width, h, 6);
    ctx.stroke();

    // Label
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillStyle = secondary ? 'rgba(126,207,90,0.55)' : '#7ecf5a';
    ctx.textAlign = 'center';
    ctx.fillText(label, width / 2, y + h / 2 + 6);
    ctx.textAlign = 'left';

    return h + 10;
  }

  // ── Upgrade card ──

  static drawUpgradeCard(ctx, y, item, width, options = {}) {
    const FONT = "'Share Tech Mono', monospace";
    const h = 80;
    const owned = options.owned || false;
    const checked = options.checked || false;
    const imgObj = options.image || null;

    ctx.save();
    if (owned) ctx.globalAlpha = 0.4;

    // Card background
    ctx.fillStyle = 'rgba(126,207,90,0.04)';
    ctx.beginPath();
    ctx.roundRect(0, y, width, h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(126,207,90,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, y, width, h, 6);
    ctx.stroke();

    // Image placeholder
    const imgW = 80, imgH = 56;
    const imgX = 12, imgY = y + (h - imgH) / 2;
    if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
      ctx.drawImage(imgObj, imgX, imgY, imgW, imgH);
    } else {
      ctx.fillStyle = 'rgba(126,207,90,0.08)';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 4);
      ctx.fill();
    }

    // Text
    const tx = imgX + imgW + 12;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillStyle = '#e0f0d0';
    ctx.fillText(item.name, tx, y + 22);

    ctx.font = `18px ${FONT}`;
    ctx.fillStyle = 'rgba(160,200,144,0.6)';
    ctx.fillText(item.stats || '', tx, y + 40);

    ctx.font = `16px ${FONT}`;
    ctx.fillStyle = owned ? 'rgba(126,207,90,0.4)' : '#f0e080';
    ctx.fillText(owned ? 'OWNED' : `${item.cost} pts`, tx, y + 58);

    // Checkbox
    const cbSize = 22;
    const cbX = width - cbSize - 12;
    const cbY = y + (h - cbSize) / 2;

    ctx.strokeStyle = checked ? '#7ecf5a' : 'rgba(126,207,90,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cbX, cbY, cbSize, cbSize, 4);
    ctx.stroke();

    if (checked) {
      ctx.fillStyle = 'rgba(126,207,90,0.15)';
      ctx.beginPath();
      ctx.roundRect(cbX, cbY, cbSize, cbSize, 4);
      ctx.fill();
      ctx.font = `bold 18px ${FONT}`;
      ctx.fillStyle = '#7ecf5a';
      ctx.textAlign = 'center';
      ctx.fillText('✓', cbX + cbSize / 2, cbY + cbSize / 2 + 5);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Return bounds for hit detection
    return {
      height: h + 10,
      checkboxBounds: { x: cbX, y: cbY, w: cbSize, h: cbSize },
    };
  }

  // ── Breakdown table (for AAR) ──

  static drawBreakdownTable(ctx, y, columns, rows, width) {
    const FONT = "'Share Tech Mono', monospace";
    const ROW_H = 30;
    let cy = y;

    // Column headers
    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = 'rgba(126,207,90,0.35)';
    for (const col of columns) {
      ctx.textAlign = col.align || 'left';
      const cx = col.align === 'right' ? col.x + col.w : col.x;
      ctx.fillText(col.label, cx, cy + 11);
    }
    ctx.textAlign = 'left';
    cy += 16;

    // Header line
    ctx.strokeStyle = 'rgba(126,207,90,0.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();
    cy += 8;

    // Data rows
    for (const row of rows) {
      ctx.font = row.bold ? `bold 18px ${FONT}` : `18px ${FONT}`;
      if (row.dividerAbove) {
        ctx.strokeStyle = 'rgba(126,207,90,0.2)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, cy - 2); ctx.lineTo(width, cy - 2);
        ctx.stroke();
        cy += 6;
      }
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const val = row.values[i];
        ctx.fillStyle = val.color || '#a0c890';
        ctx.textAlign = col.align || 'left';
        const cx = col.align === 'right' ? col.x + col.w : col.x;
        ctx.fillText(val.text, cx, cy + 14);
      }
      ctx.textAlign = 'left';
      cy += ROW_H;
    }

    return cy - y;
  }
}


