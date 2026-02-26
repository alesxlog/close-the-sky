// ============================================================
// CLOSE THE SKY — input.js
// Handles keyboard, mouse and touch input
// ============================================================

const Input = {
  state: {
    left: false,
    right: false,
    mouseX: null,
    usingMouse: false,
  },

  _canvas: null,
  _getScale: null,
  _firePending: false,
  _wasDragging: false,
  _touchStartX: null,

  init(canvas, getScale) {
    this._canvas = canvas;
    this._getScale = getScale;

    // KEYBOARD
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA':
          this.state.left = true;
          this.state.usingMouse = false;
          break;
        case 'ArrowRight': case 'KeyD':
          this.state.right = true;
          this.state.usingMouse = false;
          break;
        case 'Space':
          this._firePending = true;
          e.preventDefault();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': this.state.left = false; break;
        case 'ArrowRight': case 'KeyD': this.state.right = false; break;
      }
    });

    // MOUSE
    canvas.addEventListener('mousemove', (e) => {
      this.state.usingMouse = true;
      this.state.mouseX = this._toCanvasX(e.clientX);
    });

    canvas.addEventListener('click', () => {
      this._firePending = true;
    });

    // TOUCH
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this._touchStartX = touch.clientX;
      this._wasDragging = false;
      this.state.usingMouse = true;
      this.state.mouseX = this._toCanvasX(touch.clientX);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - this._touchStartX);
      if (dx > 8) this._wasDragging = true;
      this.state.mouseX = this._toCanvasX(touch.clientX);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!this._wasDragging) this._firePending = true;
      this._wasDragging = false;
    }, { passive: false });
  },

  _toCanvasX(clientX) {
    const rect = this._canvas.getBoundingClientRect();
    const scale = this._getScale();
    return (clientX - rect.left) / scale;
  },

  consumeFire() {
    const fired = this._firePending;
    this._firePending = false;
    return fired;
  },

  reset() {
    this.state.left = false;
    this.state.right = false;
    this.state.mouseX = null;
    this.state.usingMouse = false;
    this._firePending = false;
    this._wasDragging = false;
  },
};
