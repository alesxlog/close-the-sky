// ============================================================
// CLOSE THE SKY — background.js
//
// Three singletons sharing ONE generated city:
//   NightBackground   — dark blue sky, lit windows
//   DayBackground     — warm morning sky, unlit windows
//   DamagedBackground — night sky, damaged silhouettes, broken windows
//
// Buildings are generated ONCE (Math.random at boot), stored in
// _sharedCity, and referenced by all three classes.
// Each building carries an `hp` field for future damage tracking.
//
// Usage:
//   NightBackground.get().draw(ctx)          // live draw each frame
//   NightBackground.get().drawSnapshot(ctx)  // cached offscreen canvas
//   DayBackground.get().drawSnapshot(ctx)
//   DamagedBackground.get().drawSnapshot(ctx)
//
// Snapshots are invalidated automatically if buildings change (future).
// ============================================================

// ── Shared city data (generated once at first .get() call) ──────────

const _sharedCity = (() => {
  let _built = false;
  let buildings = [];
  let windows   = [];

  function build() {
    if (_built) return;
    _built = true;

    const C    = CONFIG.CANVAS;
    const CITY = CONFIG.CITY;
    const count  = CITY.BUILDING_COUNT;
    const slotW  = C.WIDTH / count;

    // ── Buildings ──
    for (let i = 0; i < count; i++) {
      const h = CITY.MIN_HEIGHT +
        Math.floor(Math.random() * (CITY.MAX_HEIGHT - CITY.MIN_HEIGHT));
      const w = Math.ceil(slotW + 1);
      const x = Math.floor(i * slotW);
      const y = C.ROAD_TOP - h;

      buildings.push({
        x, y, w, h,
        hp: 3,           // placeholder — future per-building damage
        damaged: false,  // set true when hp reaches 0
      });
    }

    // ── Windows ──
    for (const b of buildings) {
      const bWindows = [];
      const cols = Math.floor(b.w / 14);
      const rows = Math.floor(b.h / 16);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.6) {
            const color = CITY.WINDOW_COLORS[
              Math.floor(Math.random() * CITY.WINDOW_COLORS.length)
            ];
            bWindows.push({
              x: b.x + 4 + c * 14,
              y: b.y + 4 + r * 16,
              w: 7, h: 9,
              color,
              broken: false,  // placeholder — set true for damaged bg
            });
          }
        }
      }
      windows.push(bWindows);
    }

    // ── Damage scaffold ──
    // Pre-compute which buildings and windows look damaged for GameOver.
    // Uses a secondary deterministic pass (seeded by position) so the
    // pattern is fixed per session but doesn't alter the main city.
    _applyDamageScaffold();
  }

  // Seeded micro-rng using building position as seed
  function _posRng(seed) {
    let s = (seed * 9301 + 49297) % 233280;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function _applyDamageScaffold() {
    for (let i = 0; i < buildings.length; i++) {
      const b   = buildings[i];
      const rng = _posRng(b.x * 7 + b.h * 13 + i * 31);

      // ~55% of buildings show structural damage
      const isDamaged = rng() < 0.55;
      if (!isDamaged) {
        b._dmgType  = 'none';
        continue;
      }

      b._dmgType  = rng() < 0.5 ? 'top' : 'corner';
      b._dmgAmt   = 0.12 + rng() * 0.28;   // 12–40% of height chopped

      // Mark windows broken (high rate on damaged buildings)
      for (const w of windows[i]) {
        w.broken = rng() < 0.78;
      }
    }

    // A few windows on undamaged buildings also dark (power cuts)
    for (let i = 0; i < buildings.length; i++) {
      if (buildings[i]._dmgType !== 'none') continue;
      const rng = _posRng(buildings[i].x * 3 + i * 17);
      for (const w of windows[i]) {
        if (rng() < 0.12) w.broken = true;
      }
    }
  }

  return {
    get buildings() { build(); return buildings; },
    get windows()   { build(); return windows;   },
  };
})();


// ── Shared draw helpers ──────────────────────────────────────────────

function _drawRoad(ctx) {
  const C     = CONFIG.CANVAS;
  const ROAD  = CONFIG.ROAD;
  const roadY = C.ROAD_TOP;
  const roadH = C.ROAD_HEIGHT;
  const W     = C.WIDTH;

  ctx.fillStyle = ROAD.COLOR;
  ctx.fillRect(0, roadY, W, roadH);

  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, roadY); ctx.lineTo(W, roadY);
  ctx.stroke();

  ctx.strokeStyle = ROAD.LINE_COLOR;
  ctx.lineWidth = 3;
  ctx.setLineDash([ROAD.STRIPE_WIDTH, ROAD.STRIPE_GAP]);
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

function _drawNormalBuildings(ctx) {
  const CITY = CONFIG.CITY;
  ctx.fillStyle = CITY.BUILDING_COLOR;
  for (const b of _sharedCity.buildings) {
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
}

function _drawDamagedBuildings(ctx) {
  const CITY  = CONFIG.CITY;
  const color = CITY.BUILDING_COLOR;

  for (const b of _sharedCity.buildings) {
    ctx.fillStyle = color;

    if (b._dmgType === 'top') {
      // Lower intact portion
      const chopH = Math.floor(b.h * b._dmgAmt);
      ctx.fillRect(b.x, b.y + chopH, b.w, b.h - chopH);

      // Jagged rubble silhouette across the top
      ctx.beginPath();
      const steps = Math.max(4, Math.floor(b.w / 8));
      // seed jitter from building position
      let s = (b.x * 9301 + b.h * 49297) % 233280;
      const jrng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

      ctx.moveTo(b.x, b.y + chopH);
      for (let si = 0; si <= steps; si++) {
        const px = b.x + (si / steps) * b.w;
        const py = b.y + chopH * 0.35 + (jrng() - 0.4) * chopH * 0.85;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(b.x + b.w, b.y + chopH);
      ctx.closePath();
      ctx.fillStyle = '#0a0a14';
      ctx.fill();
      ctx.fillStyle = color;

    } else if (b._dmgType === 'corner') {
      // Full rect
      ctx.fillRect(b.x, b.y, b.w, b.h);
      // Cut top-right corner with dark fill
      const chopW = Math.floor(b.w * b._dmgAmt);
      const chopH = Math.floor(b.h * b._dmgAmt * 0.55);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(b.x + b.w - chopW, b.y);
      ctx.lineTo(b.x + b.w,         b.y);
      ctx.lineTo(b.x + b.w,         b.y + chopH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;

    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  }
}

function _drawLitWindows(ctx) {
  for (let i = 0; i < _sharedCity.windows.length; i++) {
    for (const w of _sharedCity.windows[i]) {
      ctx.fillStyle = w.color;
      ctx.fillRect(w.x, w.y, w.w, w.h);
    }
  }
}

function _drawDamagedWindows(ctx) {
  for (let i = 0; i < _sharedCity.windows.length; i++) {
    for (const w of _sharedCity.windows[i]) {
      if (w.broken) {
        // Dark void with faint crack mark
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = 'rgba(55,50,45,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(w.x + 1,       w.y + 1);
        ctx.lineTo(w.x + w.w - 1, w.y + w.h - 1);
        ctx.moveTo(w.x + w.w - 1, w.y + 1);
        ctx.lineTo(w.x + 1,       w.y + w.h - 1);
        ctx.stroke();
      } else {
        ctx.fillStyle = w.color;
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }
    }
  }
}


// ════════════════════════════════════════════════════════════════════
// NightBackground
// Dark blue sky · lit windows · used by: Splash end-frame, Menu,
// MissionBrief, GameScene (live draw)
// ════════════════════════════════════════════════════════════════════

const NightBackground = (() => {
  let _instance = null;

  // Dark blue gradient — matches splash screenshot end-frame
  const SKY_STOPS = [
    { stop: 0.0,  color: '#0d1535' },
    { stop: 0.45, color: '#111d45' },
    { stop: 0.75, color: '#172150' },
    { stop: 1.0,  color: '#1e2d62' },
  ];

  class _NightBackground {
    constructor() {
      this._snapshot = null;
    }

    // Pass-through accessors — splashScene and interludeScene read
    // buildings/windows directly to drive their own animated rendering
    get buildings() { return _sharedCity.buildings; }
    get windows()   { return _sharedCity.windows;   }

    // _drawRoad alias — splashScene/interludeScene call this._bg._drawRoad(ctx)
    _drawRoad(ctx)  { _drawRoad(ctx); }

    // Live draw — called every frame in GameScene
    draw(ctx) {
      this._drawSky(ctx);
      _drawNormalBuildings(ctx);
      _drawLitWindows(ctx);
      _drawRoad(ctx);
    }

    // For animated scenes (splashScene, interludeScene) that manage
    // their own sky — just draws city + road over whatever sky is set
    drawCityOnly(ctx) {
      _drawNormalBuildings(ctx);
      _drawLitWindows(ctx);
      _drawRoad(ctx);
    }

    // Cached snapshot — rendered once, reused in Menu / MissionBrief
    snapshot() {
      if (!this._snapshot) {
        const C = CONFIG.CANVAS;
        this._snapshot = document.createElement('canvas');
        this._snapshot.width  = C.WIDTH;
        this._snapshot.height = C.HEIGHT;
        this.draw(this._snapshot.getContext('2d'));
      }
      return this._snapshot;
    }

    drawSnapshot(ctx) {
      ctx.drawImage(this.snapshot(), 0, 0);
    }

    _drawSky(ctx) {
      const C    = CONFIG.CANVAS;
      const grad = ctx.createLinearGradient(0, 0, 0, C.ROAD_TOP);
      for (const s of SKY_STOPS) grad.addColorStop(s.stop, s.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, C.WIDTH, C.ROAD_TOP);
    }
  }

  return {
    get() {
      if (!_instance) _instance = new _NightBackground();
      return _instance;
    }
  };
})();


// ════════════════════════════════════════════════════════════════════
// DayBackground
// Warm morning sky · unlit windows · used by: AAR, UpgradeStation
// ════════════════════════════════════════════════════════════════════

const DayBackground = (() => {
  let _instance = null;

  // Post-sunrise morning palette
  const SKY_STOPS = [
    { stop: 0.0,  color: '#4a8fe0' },
    { stop: 0.45, color: '#6baee8' },
    { stop: 0.75, color: '#f5c97a' },
    { stop: 1.0,  color: '#f09040' },
  ];

  class _DayBackground {
    constructor() {
      this._snapshot = null;
    }

    draw(ctx) {
      this._drawSky(ctx);
      _drawNormalBuildings(ctx);
      // Windows unlit — daytime
      _drawRoad(ctx);
    }

    snapshot() {
      if (!this._snapshot) {
        const C = CONFIG.CANVAS;
        this._snapshot = document.createElement('canvas');
        this._snapshot.width  = C.WIDTH;
        this._snapshot.height = C.HEIGHT;
        this.draw(this._snapshot.getContext('2d'));
      }
      return this._snapshot;
    }

    drawSnapshot(ctx) {
      ctx.drawImage(this.snapshot(), 0, 0);
    }

    _drawSky(ctx) {
      const C    = CONFIG.CANVAS;
      const grad = ctx.createLinearGradient(0, 0, 0, C.ROAD_TOP);
      for (const s of SKY_STOPS) grad.addColorStop(s.stop, s.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, C.WIDTH, C.ROAD_TOP);
    }
  }

  return {
    get() {
      if (!_instance) _instance = new _DayBackground();
      return _instance;
    }
  };
})();


// ════════════════════════════════════════════════════════════════════
// DamagedBackground
// Night sky · damaged building silhouettes · broken windows
// Used by: GameOver
// Future: per-building damage driven by gameplay hp values
// ════════════════════════════════════════════════════════════════════

const DamagedBackground = (() => {
  let _instance = null;

  // Same night sky as NightBackground
  const SKY_STOPS = [
    { stop: 0.0,  color: '#0d1535' },
    { stop: 0.45, color: '#111d45' },
    { stop: 0.75, color: '#172150' },
    { stop: 1.0,  color: '#1e2d62' },
  ];

  class _DamagedBackground {
    constructor() {
      this._snapshot = null;
      // Ensure shared city is built and damage scaffold is applied
      void _sharedCity.buildings;
    }

    draw(ctx) {
      this._drawSky(ctx);
      _drawDamagedBuildings(ctx);
      _drawDamagedWindows(ctx);
      _drawRoad(ctx);
    }

    snapshot() {
      if (!this._snapshot) {
        const C = CONFIG.CANVAS;
        this._snapshot = document.createElement('canvas');
        this._snapshot.width  = C.WIDTH;
        this._snapshot.height = C.HEIGHT;
        this.draw(this._snapshot.getContext('2d'));
      }
      return this._snapshot;
    }

    drawSnapshot(ctx) {
      ctx.drawImage(this.snapshot(), 0, 0);
    }

    _drawSky(ctx) {
      const C    = CONFIG.CANVAS;
      const grad = ctx.createLinearGradient(0, 0, 0, C.ROAD_TOP);
      for (const s of SKY_STOPS) grad.addColorStop(s.stop, s.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, C.WIDTH, C.ROAD_TOP);
    }
  }

  return {
    get() {
      if (!_instance) _instance = new _DamagedBackground();
      return _instance;
    }
  };
})();


// ════════════════════════════════════════════════════════════════════
// CityBackground — backwards-compatibility shim
// Existing code that still calls CityBackground.get() will get
// NightBackground. Remove once all call sites are updated.
// ════════════════════════════════════════════════════════════════════

const CityBackground = NightBackground;
