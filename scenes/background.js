//          generate() once at boot, reuse everywhere.

const CityBackground = (() => {
  let _instance = null;

  class _CityBackground {
    constructor() {
      this.C    = CONFIG.CANVAS;
      this.SKY  = CONFIG.SKY;
      this.CITY = CONFIG.CITY;
      this.ROAD = CONFIG.ROAD;

      this.buildings = this._generateBuildings();
      this.windows   = this._generateWindows();

      // Pre-rendered snapshot (offscreen canvas)
      this._snapshot = null;
    }

    // ── Generate once ──

    _generateBuildings() {
      const buildings = [];
      const count  = this.CITY.BUILDING_COUNT;
      const roadTop = this.C.ROAD_TOP;
      const canvasW = this.C.WIDTH;
      const slotW   = canvasW / count;

      for (let i = 0; i < count; i++) {
        const h = this.CITY.MIN_HEIGHT +
          Math.floor(Math.random() * (this.CITY.MAX_HEIGHT - this.CITY.MIN_HEIGHT));
        const w = Math.ceil(slotW + 1);
        const x = Math.floor(i * slotW);
        const y = roadTop - h;
        buildings.push({ x, y, w, h });
      }
      return buildings;
    }

    _generateWindows() {
      const windows = [];
      for (const b of this.buildings) {
        const bWindows = [];
        const cols = Math.floor(b.w / 14);
        const rows = Math.floor(b.h / 16);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.6) {
              const color = this.CITY.WINDOW_COLORS[
                Math.floor(Math.random() * this.CITY.WINDOW_COLORS.length)
              ];
              bWindows.push({
                x: b.x + 4 + c * 14,
                y: b.y + 4 + r * 16,
                w: 7, h: 9, color,
              });
            }
          }
        }
        windows.push(bWindows);
      }
      return windows;
    }

    // ── Draw full background (sky + city + road) ──

    draw(ctx) {
      this._drawSky(ctx);
      this._drawCity(ctx);
      this._drawRoad(ctx);
    }

    // ── Draw just the city silhouette (for animated sky scenes) ──

    drawCityOnly(ctx) {
      this._drawCity(ctx);
      this._drawRoad(ctx);
    }

    // ── Snapshot: render once to offscreen canvas, reuse ──

    snapshot() {
      if (!this._snapshot) {
        this._snapshot = document.createElement('canvas');
        this._snapshot.width  = this.C.WIDTH;
        this._snapshot.height = this.C.HEIGHT;
        const sctx = this._snapshot.getContext('2d');
        this.draw(sctx);
      }
      return this._snapshot;
    }

    drawSnapshot(ctx) {
      ctx.drawImage(this.snapshot(), 0, 0);
    }

    // ── Private draw methods ──

    _drawSky(ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, this.C.ROAD_TOP);
      for (const stop of this.SKY.COLORS) {
        grad.addColorStop(stop.stop, stop.color);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.C.WIDTH, this.C.ROAD_TOP);
    }

    _drawCity(ctx) {
      ctx.fillStyle = this.CITY.BUILDING_COLOR;
      for (const b of this.buildings) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      for (let i = 0; i < this.windows.length; i++) {
        for (const w of this.windows[i]) {
          ctx.fillStyle = w.color;
          ctx.fillRect(w.x, w.y, w.w, w.h);
        }
      }
    }

    _drawRoad(ctx) {
      const roadY = this.C.ROAD_TOP;
      const roadH = this.C.ROAD_HEIGHT;
      const W     = this.C.WIDTH;

      ctx.fillStyle = this.ROAD.COLOR;
      ctx.fillRect(0, roadY, W, roadH);

      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, roadY); ctx.lineTo(W, roadY);
      ctx.stroke();

      ctx.strokeStyle = this.ROAD.LINE_COLOR;
      ctx.lineWidth = 3;
      ctx.setLineDash([this.ROAD.STRIPE_WIDTH, this.ROAD.STRIPE_GAP]);
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH * 0.5);
      ctx.lineTo(W, roadY + roadH * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH);
      ctx.lineTo(W, roadY + roadH);
      ctx.stroke();
    }
  }

  return {
    get() {
      if (!_instance) _instance = new _CityBackground();
      return _instance;
    }
  };
})();


