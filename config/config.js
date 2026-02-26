// ============================================================
// CLOSE THE SKY — config.js
// Single source of truth for all game constants.
// Edit speeds, HP, damage, costs here — nowhere else.
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // CANVAS & LAYOUT
  // ----------------------------------------------------------
  CANVAS: {
    WIDTH: 1280,
    HEIGHT: 1280,
    PLAY_TOP: 0,          // enemies spawn from here
    PLAY_BOTTOM: 1100,    // enemies reach player / road starts
    ROAD_TOP: 1100,
    ROAD_HEIGHT: 80,
    HUD_TOP: 1180,
    HUD_HEIGHT: 100,
    CAR_Y: 1110,          // fixed Y position of car center
  },

  // ----------------------------------------------------------
  // SKY & VISUALS
  // ----------------------------------------------------------
  SKY: {
    // Gradient stops top → bottom (sunrise palette)
    COLORS: [
      { stop: 0.0,  color: '#1a1a4e' },  // deep navy top
      { stop: 0.4,  color: '#4a6fa5' },  // visible blue mid
      { stop: 0.75, color: '#f4a460' },  // warm amber
      { stop: 1.0,  color: '#ff6b35' },  // orange horizon
    ],
  },

  CITY: {
    MAX_HEIGHT: 160,      // tallest building from road up
    MIN_HEIGHT: 60,
    WINDOW_COLORS: ['#ffe066', '#ffcc44', '#fff0a0'],
    BUILDING_COLOR: '#0d0d1a',
    BUILDING_COUNT: 40,
  },

  ROAD: {
    COLOR: '#2a2a2a',
    LINE_COLOR: '#555555',
    STRIPE_WIDTH: 60,
    STRIPE_GAP: 40,
  },

  // ----------------------------------------------------------
  // GAME SETTINGS
  // ----------------------------------------------------------
  GAME: {
    TARGET_FPS: 60,
    LIVES: 2,
    SPAWN_LOCK_AFTER_DEATH: 15000,  // ms — no spawns after car destroyed
    MIN_SPAWN_INTERVAL: 2000,       // ms — hard floor
    MAX_SIMULTANEOUS_HIGHTIER: 2,   // Kh-555 and above
    MAX_SIMULTANEOUS_KH101: 2,      // hard cap
    NO_HIGHTIER_FIRST: 15000,       // ms — no Kalibr/Kh-101 in first 15s
  },

  // ----------------------------------------------------------
  // VEHICLES
  // ----------------------------------------------------------
  VEHICLES: {
    TRUCK: {
      id: 'truck',
      name: 'Pickup Truck',
      hp: 2,
      slots: 2,
      speed: (typeof TUNING !== 'undefined' ? TUNING.TRUCK_SPEED : 200),
      cost: 0,
      width: 168,
      height: 96,
      sprite: 'assets/images/truck.png',
    },
    LAV: {
      id: 'lav',
      name: 'Light Armoured Vehicle',
      hp: 3,
      slots: 4,
      speed: (typeof TUNING !== 'undefined' ? TUNING.LAV_SPEED : 160),
      cost: 300,
      width: 192,
      height: 96,
      sprite: 'assets/images/lav.png',
    },
  },

  // ----------------------------------------------------------
  // WEAPONS
  // ----------------------------------------------------------
  WEAPONS: {
    MG: {
      id: 'mg',
      name: 'Machine Gun',
      slots: 1,
      damage: 1,
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.MG_PROJ_SPEED : 500),     // px/s
      cooldown: 400,      // ms
      cost: 100,
      despawnDist: 768,   // px travel before despawn
      spread: 0,          // px from center (single barrel)
      projectileWidth: 4,
      projectileColor: '#ffff99',
      trailAlpha: 0.3,
      // Distance falloff
      falloff: [
        { maxDist: 384,  multiplier: 1.0 },
        { maxDist: 768,  multiplier: 0.5 },
        { maxDist: 1020, multiplier: 0.25 },
      ],
      exclusions: ['autocannon'],
      doubleBarrel: {
        cost: 100,
        separation: 32,   // px apart (16px each side of center)
      },
    },

    AUTOCANNON: {
      id: 'autocannon',
      name: 'Autocannon (20mm)',
      slots: 2,
      damage: 3,
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_PROJ_SPEED : 420),     // px/s
      cooldown: 300,      // ms
      cost: 200,
      despawnDist: 1024,  // px
      spread: 0,
      projectileWidth: 8,
      projectileColor: '#ff9900',
      trailAlpha: 0.6,
      falloff: null,      // no falloff
      exclusions: ['mg'],
      doubleBarrel: {
        cost: 200,
        separation: 40,   // px apart
      },
    },

    SAM: {
      id: 'sam',
      name: 'SAM Launcher',
      slots: 2,
      damage: 7,
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.SAM_PROJ_SPEED : 280),     // px/s
      cooldown: 750,      // ms
      cost: 350,
      despawnDist: null,  // unlimited — homing
      radarRadius: 640,   // px centered on car
      lockOnDelay: 250,   // ms standard
      kh101LockDelay: 750,// ms total (0.5s stealth + 250ms)
      projectileWidth: 12,
      projectileColor: '#ff4400',
      thrustColor: '#ffaa00',
      exclusions: ['manpads'],
      twoRockets: {
        cost: 350,
      },
    },
  },

  // ----------------------------------------------------------
  // ENEMIES
  // ----------------------------------------------------------
  ENEMIES: {
    GERAN1: {
      id: 'geran1',
      name: 'Geran-1',
      spriteW: 64,
      spriteH: 64,
      hitboxW: 77,
      hitboxH: 77,
      hp: 2,
      killPts: 5,
      speed: (typeof TUNING !== 'undefined' ? TUNING.GERAN1_SPEED : 60),         // px/s
      radarTarget: false,
      trajectory: 'diagonal',
      diagonalAngle: 20,  // degrees from vertical
      spawnXMin: 192,     // middle 70% of 1280
      spawnXMax: 1088,
      // Sunrise rim light color
      rimColor: 'rgba(255, 160, 60, 0.4)',
      bodyColor: '#4a5e2a',
      accentColor: '#3a4a1a',
    },

    GERAN2: {
      id: 'geran2',
      name: 'Geran-2',
      spriteW: 64,
      spriteH: 80,
      hitboxW: 77,
      hitboxH: 96,
      hp: 3,
      killPts: 10,
      speed: (typeof TUNING !== 'undefined' ? TUNING.GERAN2_SPEED : 70),
      radarTarget: false,
      trajectory: 'slalom',
      slalomAmpTop: 30,   // px amplitude at y=80
      slalomAmpBottom: 180, // px amplitude at y=1000
      spawnXMin: 192,
      spawnXMax: 1088,
      rimColor: 'rgba(255, 160, 60, 0.4)',
      bodyColor: '#4a5e2a',
      accentColor: '#3a4a1a',
    },

    GERAN3: {
      id: 'geran3',
      name: 'Geran-3',
      spriteW: 72,
      spriteH: 80,
      hitboxW: 86,
      hitboxH: 96,
      hp: 4,
      killPts: 15,
      speedNormal:   (typeof TUNING !== 'undefined' ? TUNING.GERAN3_SPEED_NORMAL   : 50),
      speedTerminal: (typeof TUNING !== 'undefined' ? TUNING.GERAN3_SPEED_TERMINAL : 100),
      terminalTime: 3000, // ms before bottom — switch to terminal speed
      radarTarget: false,
      trajectory: 'diagonal_accel',
      diagonalAngle: 15,
      spawnXMin: 100,
      spawnXMax: 1180,
      rimColor: 'rgba(255, 160, 60, 0.35)',
      bodyColor: '#5a6a7a',
      accentColor: '#3a4a5a',
    },

    KH555: {
      id: 'kh555',
      name: 'Kh-555',
      spriteW: 56,
      spriteH: 112,
      hitboxW: 67,
      hitboxH: 134,
      hp: 6,
      killPts: 40,
      speed: (typeof TUNING !== 'undefined' ? TUNING.KH555_SPEED : 90),
      radarTarget: true,
      trajectory: 'wide_sine',
      sineAmplitude: 275, // px
      sinePeriod: 3000,   // ms for one full oscillation
      spawnXMin: 320,     // middle 50%
      spawnXMax: 960,
      rimColor: 'rgba(255, 180, 80, 0.5)',
      bodyColor: '#c8c8c8',
      finColor: '#aaaaaa',
      noseColor: '#e0e0e0',
    },

    KALIBR: {
      id: 'kalibr',
      name: '3M54 Kalibr',
      spriteW: 56,
      spriteH: 112,
      hitboxW: 67,
      hitboxH: 134,
      hp: 8,
      killPts: 50,
      speed: (typeof TUNING !== 'undefined' ? TUNING.KALIBR_SPEED : 105),
      radarTarget: true,
      trajectory: 'medium_sine',
      sineAmplitude: 125,
      sinePeriod: 2500,
      spawnXMin: 200,
      spawnXMax: 1080,
      rimColor: 'rgba(255, 180, 80, 0.5)',
      bodyColor: '#b0b8c0',
      finColor: '#909aa0',
      noseColor: '#d0d8e0',
    },

    KH101: {
      id: 'kh101',
      name: 'Kh-101',
      spriteW: 64,
      spriteH: 128,
      hitboxW: 77,
      hitboxH: 154,
      hp: 10,
      killPts: 60,
      speed: (typeof TUNING !== 'undefined' ? TUNING.KH101_SPEED : 120),
      radarTarget: true,
      radarLockDelay: 750,  // ms total (stealth adds 0.5s)
      trajectory: 'perlin',
      stealthDuration: 2000,  // ms at low opacity
      stealthOpacity: 0.25,
      stealthFadeTime: 1000,  // ms to fade in
      spawnXMin: 200,
      spawnXMax: 1080,
      rimColor: 'rgba(255, 140, 60, 0.3)',
      bodyColor: '#2a3a5a',
      finColor: '#1a2a3a',
      noseColor: '#3a4a6a',
      // Flare decoy — first SAM shot always misses
      flareDecoy: true,
    },
  },

  // ----------------------------------------------------------
  // EXPLOSION
  // ----------------------------------------------------------
  EXPLOSION: {
    WIDTH: 100,
    HEIGHT: 100,
    DURATION: 1500,       // ms
    COLORS: ['#ff6600', '#ff9900', '#ffcc00', '#ffffff'],
  },

  // ----------------------------------------------------------
  // HUD
  // ----------------------------------------------------------
  HUD: {
    Y: 1180,
    HEIGHT: 100,
    FONT: "22px 'Share Tech Mono', monospace",
    FONT_SMALL: "16px 'Share Tech Mono', monospace",
    FONT_LARGE: "32px 'Share Tech Mono', monospace",
    COLOR: '#ffffff',
    HEART_SIZE: 32,
    CAR_ICON_WIDTH: 56,
    CAR_ICON_HEIGHT: 32,
    PADDING: 20,
  },

  // ----------------------------------------------------------
  // CAMPAIGN — ATTACKS
  // ----------------------------------------------------------
  ATTACKS: [
    {
      id: 1,
      roster: ['geran1', 'geran2'],
      totalEnemies: 40,
      duration: 90000,
      maxSimultaneous: 2,
      spawnIntervalMin: 5000,
      spawnIntervalMax: 7000,
      noHighTierFirst: true,
      pitstopAfter: true,
      waves: [
        { enemies: [{ type: 'geran1', count: 4, solo: true }] },
        { enemies: [{ type: 'geran2', count: 4, solo: true }] },
        { enemies: [{ type: 'geran1', count: 2 }, { type: 'geran2', count: 2 }] },
      ],
    },
    {
      id: 2,
      roster: ['geran1', 'geran2', 'geran3'],
      totalEnemies: 60,
      duration: 105000,
      maxSimultaneous: 3,
      spawnIntervalMin: 4000,
      spawnIntervalMax: 6000,
      noHighTierFirst: true,
      pitstopAfter: true,
      waves: [
        { enemies: [{ type: 'geran1', count: 3 }, { type: 'geran2', count: 3 }] },
        { enemies: [{ type: 'geran3', count: 3, solo: true }] },
        { enemies: [{ type: 'geran3', count: 2 }, { type: 'geran1', count: 3 }] },
      ],
    },
    {
      id: 3,
      roster: ['geran1', 'geran2', 'geran3', 'kh555'],
      totalEnemies: 80,
      duration: 120000,
      maxSimultaneous: 4,
      spawnIntervalMin: 3000,
      spawnIntervalMax: 5000,
      noHighTierFirst: true,
      pitstopAfter: true,
      waves: [
        { enemies: [{ type: 'geran1', count: 2 }, { type: 'geran2', count: 2 }, { type: 'geran3', count: 2 }] },
        { enemies: [{ type: 'kh555', count: 2, solo: true }] },
        { enemies: [{ type: 'kh555', count: 1 }, { type: 'geran1', count: 2 }, { type: 'geran2', count: 1 }] },
      ],
    },
    {
      id: 4,
      roster: ['geran1', 'geran2', 'geran3', 'kh555', 'kalibr'],
      totalEnemies: 100,
      duration: 135000,
      maxSimultaneous: 6,
      spawnIntervalMin: 2500,
      spawnIntervalMax: 4000,
      noHighTierFirst: true,
      pitstopAfter: true,
      waves: [
        { enemies: [{ type: 'geran1', count: 3 }, { type: 'geran2', count: 3 }, { type: 'geran3', count: 2 }] },
        { enemies: [{ type: 'kalibr', count: 1, solo: true }] },
        { enemies: [{ type: 'kalibr', count: 1 }, { type: 'kh555', count: 1 }, { type: 'geran1', count: 3 }] },
      ],
    },
    {
      id: 5,
      roster: ['geran1', 'geran2', 'geran3', 'kh555', 'kalibr', 'kh101'],
      totalEnemies: 120,
      duration: 150000,
      maxSimultaneous: 8,
      spawnIntervalMin: 2000,
      spawnIntervalMax: 3500,
      noHighTierFirst: true,
      pitstopAfter: false,
      waves: [
        { enemies: [{ type: 'geran1', count: 3 }, { type: 'geran2', count: 2 }, { type: 'kh555', count: 1 }] },
        { enemies: [{ type: 'kh101', count: 1, solo: true }] },
        { enemies: [{ type: 'kh101', count: 1 }, { type: 'kalibr', count: 1 }, { type: 'geran1', count: 3 }] },
        { enemies: [{ type: 'kh101', count: 1 }, { type: 'kalibr', count: 1 }, { type: 'kh555', count: 1 }, { type: 'geran1', count: 2 }, { type: 'geran2', count: 2 }] },
      ],
    },
  ],

  // ----------------------------------------------------------
  // ENDLESS MODE
  // ----------------------------------------------------------
  ENDLESS: {
    WAVE_PAUSE: 4000,         // ms between waves
    START_SIMULTANEOUS: 5,

    // Auto-upgrade thresholds (cumulative points)
    UPGRADES: [
      { step: 1, cumulative: 100,  upgrade: 'mg_double',      enemyUnlock: 'geran3' },
      { step: 2, cumulative: 400,  upgrade: 'lav_autocannon', enemyUnlock: 'kh555'  },
      { step: 3, cumulative: 750,  upgrade: 'sam',            enemyUnlock: 'kalibr' },
      { step: 4, cumulative: 950,  upgrade: 'ac_double',      enemyUnlock: null     },
      { step: 5, cumulative: 1300, upgrade: 'sam_2rockets',   enemyUnlock: 'kh101'  },
    ],

    // Phase 1: Learning (waves 1-14)
    PHASE1: {
      waves: [1, 14],
      simultaneousCap: 5,
      spawnIntervalMin: 3000,
      spawnIntervalMax: 5000,
    },

    // Phase 2: Combination (waves 15-19) — handcrafted
    PHASE2: {
      waves: [15, 19],
      simultaneousCap: 6,
      spawnIntervalMin: 2500,
      spawnIntervalMax: 3000,
    },

    // Phase 3: Generated (wave 20+)
    PHASE3: {
      startWave: 20,
      startSimultaneous: 6,
      simultaneousIncrement: 1,     // every 3 waves
      simultaneousCap: 10,
      startInterval: 2500,          // ms
      intervalDecrement: 100,       // ms every 2 waves
      intervalFloor: 1500,          // ms
      startEnemiesPerWave: 18,
      enemiesIncrement: 2,          // every 3 waves
      enemiesCap: 34,
      startHighTierRatio: 0.20,
      highTierIncrement: 0.05,      // every 3 waves
      highTierCap: 0.50,
      speedMultiplierStart: 1.0,
      speedIncrement: 0.05,         // every 5 waves
      speedCap: 1.20,
    },
  },

  // ----------------------------------------------------------
  // PITSTOP SHOP
  // ----------------------------------------------------------
  PITSTOP: {
    ITEMS: [
      { id: 'mg_double',   name: 'MG Double Barrel',   cost: 100, requires: 'mg',          replaces: null        },
      { id: 'autocannon',  name: 'Autocannon (20mm)',   cost: 200, requires: 'mg',          replaces: 'mg'        },
      { id: 'sam',         name: 'SAM Launcher',        cost: 350, requires: null,          replaces: null,  slots: 2 },
      { id: 'sam_2rockets',name: 'SAM: 2 Rockets',      cost: 350, requires: 'sam',         replaces: null        },
      { id: 'ac_double',   name: 'Autocannon 2-Barrel', cost: 200, requires: 'autocannon',  replaces: null        },
      { id: 'lav',         name: 'Light Armoured Vehicle', cost: 300, requires: null,       replaces: null        },
    ],
  },

  // ----------------------------------------------------------
  // ANALYTICS / LOGGING
  // ----------------------------------------------------------
  ANALYTICS: {
    // Replace with your Google Apps Script deployment URL
    SHEETS_WEBHOOK_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    ENABLED: true,
    // Events sent in batch at pitstop and game over
    BATCH_EVENTS: [
      'game_start',
      'enemy_killed',
      'enemy_reached_bottom',
      'car_destroyed',
      'upgrade_applied',
      'pitstop_entered',
      'game_over',
      'game_win',
    ],
  },

};

// Freeze to prevent accidental mutation at runtime
Object.freeze(CONFIG);
