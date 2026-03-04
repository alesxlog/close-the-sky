//          Auto-cleanup listeners, coordinate transform, fade.

class SceneBase {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this._CW    = CONFIG.CANVAS.WIDTH;
    this._CH    = CONFIG.CANVAS.HEIGHT;
    this._FONT  = "'Share Tech Mono', monospace";
    this._alpha = 0;
    this._destroyed  = false;
    this._listeners  = [];   // { target, event, handler, options }
  }

  // ── Listener management (auto-cleanup on destroy) ──

  _on(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this._listeners.push({ target, event, handler, options });
  }

  destroy() {
    for (const l of this._listeners) {
      l.target.removeEventListener(l.event, l.handler, l.options);
    }
    this._listeners = [];
    this._destroyed = true;
  }

  // ── Canvas coordinate transform ──

  _canvasXY(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this._CW / rect.width;
    const scaleY = this._CH / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  }

  // ── Fade-in helper ──

  _fadeIn(dt, speed = 2.5) {
    this._alpha = Math.min(1, this._alpha + dt * speed);
  }

  // ── Override these ──

  update(dt) {}
  draw(ctx) {}
}


