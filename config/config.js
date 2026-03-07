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
    SPAWN_LOCK_AFTER_DEATH: (typeof TUNING !== 'undefined' ? TUNING.SPAWN_LOCK_AFTER_DEATH : 15000),
    MIN_SPAWN_INTERVAL:     (typeof TUNING !== 'undefined' ? TUNING.MIN_SPAWN_INTERVAL     : 2000),
    MAX_SIMULTANEOUS_HIGHTIER: (typeof TUNING !== 'undefined' ? TUNING.MAX_SIMULTANEOUS_HIGHTIER : 2),
    MAX_SIMULTANEOUS_KH101:    (typeof TUNING !== 'undefined' ? TUNING.MAX_SIMULTANEOUS_KH101    : 2),
    NO_HIGHTIER_FIRST:      (typeof TUNING !== 'undefined' ? TUNING.NO_HIGHTIER_FIRST      : 15000),
  },

  // ----------------------------------------------------------
  // VEHICLES
  // ----------------------------------------------------------
  VEHICLES: {
    TRUCK: {
      id: 'truck',
      name: 'Pickup Truck',
      hp:    (typeof TUNING !== 'undefined' ? TUNING.TRUCK_HP    : 2),
      slots: (typeof TUNING !== 'undefined' ? TUNING.TRUCK_SLOTS : 1),
      speed: (typeof TUNING !== 'undefined' ? TUNING.TRUCK_SPEED : 180),
      cost: 0,
      width: 168,
      height: 96,
      sprite: 'assets/images/truck.png',
    },
    LAV: {
      id: 'lav',
      name: 'Light Armoured Vehicle',
      hp:    (typeof TUNING !== 'undefined' ? TUNING.LAV_HP    : 3),
      slots: (typeof TUNING !== 'undefined' ? TUNING.LAV_SLOTS : 4),
      speed: (typeof TUNING !== 'undefined' ? TUNING.LAV_SPEED : 200),
      cost: 300,
      width: 224,
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
      damage:    (typeof TUNING !== 'undefined' ? TUNING.MG_DAMAGE      : 1),
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.MG_PROJ_SPEED  : 500),
      cooldown:  (typeof TUNING !== 'undefined' ? TUNING.MG_COOLDOWN    : 400),
      cost: 100,
      despawnDist: (typeof TUNING !== 'undefined' ? TUNING.MG_DESPAWN_DIST : 768),
      spread: 0,
      projectileWidth: 4,
      projectileColor: '#ffff99',
      trailAlpha: 0.3,
      falloff: [
        { maxDist: (typeof TUNING !== 'undefined' ? TUNING.MG_FALLOFF_FULL_DIST    : 384),  multiplier: 1.0  },
        { maxDist: (typeof TUNING !== 'undefined' ? TUNING.MG_FALLOFF_HALF_DIST    : 768),  multiplier: 0.5  },
        { maxDist: (typeof TUNING !== 'undefined' ? TUNING.MG_FALLOFF_QUARTER_DIST : 1020), multiplier: 0.25 },
      ],
      exclusions: ['autocannon'],
      doubleBarrel: { cost: 100, separation: 32 },
    },

    AUTOCANNON: {
      id: 'autocannon',
      name: 'Autocannon (20mm)',
      slots: 2,
      damage:    (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_DAMAGE      : 3),
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_PROJ_SPEED  : 420),
      cooldown:  (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_COOLDOWN    : 300),
      cost: 200,
      despawnDist: (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_DESPAWN_DIST : 1024),
      spread: 0,
      projectileWidth: 8,
      projectileColor: '#ff9900',
      trailAlpha: 0.6,
      falloff: null,
      exclusions: ['mg'],
      doubleBarrel: { cost: 200, separation: 40 },
    },

    SAM: {
      id: 'sam',
      name: 'SAM Launcher',
      slots: 2,
      damage:    (typeof TUNING !== 'undefined' ? TUNING.SAM_DAMAGE      : 7),
      projSpeed: (typeof TUNING !== 'undefined' ? TUNING.SAM_PROJ_SPEED  : 280),
      cooldown:  (typeof TUNING !== 'undefined' ? TUNING.SAM_COOLDOWN    : 750),
      cost: 350,
      despawnDist: null,
      radarRadius:  (typeof TUNING !== 'undefined' ? TUNING.SAM_RADAR_RADIUS : 640),
      lockOnDelay:  (typeof TUNING !== 'undefined' ? TUNING.SAM_LOCK_DELAY   : 250),
      kh101LockDelay: 750,
      projectileWidth: 12,
      projectileColor: '#ff4400',
      thrustColor: '#ffaa00',
      exclusions: ['manpads'],
      twoRockets: { cost: 350 },
    },
  },

  // ----------------------------------------------------------
  // ENEMIES
  // ----------------------------------------------------------
  ENEMIES: {
    GERAN1: {
      id: 'geran1',
      name: 'Geran-1',
      spriteW: 64, spriteH: 64, hitboxW: 77, hitboxH: 77,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.GERAN1_HP  : 2),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.GERAN1_PTS : 5),
      speed:   (typeof TUNING !== 'undefined' ? TUNING.GERAN1_SPEED : 60),
      radarTarget: false,
      trajectory: 'diagonal',
      diagonalAngle: (typeof TUNING !== 'undefined' ? TUNING.GERAN1_DIAGONAL_ANGLE : 20),
      spawnXMin: 192, spawnXMax: 1088,
      rimColor: 'rgba(255, 160, 60, 0.4)', bodyColor: '#a0a69e', accentColor: '#6b725e',
    },

    GERAN2: {
      id: 'geran2',
      name: 'Geran-2',
      spriteW: 64, spriteH: 80, hitboxW: 77, hitboxH: 96,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.GERAN2_HP  : 3),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.GERAN2_PTS : 10),
      speed:   (typeof TUNING !== 'undefined' ? TUNING.GERAN2_SPEED : 70),
      radarTarget: false,
      trajectory: 'diagonalFlip',
      diagonalAngle:   (typeof TUNING !== 'undefined' ? TUNING.GERAN2_DIAGONAL_ANGLE : 30),
      flipProgress:    (typeof TUNING !== 'undefined' ? TUNING.GERAN2_FLIP_PROGRESS : 0.5),
      spawnXMin: 192, spawnXMax: 1088,
      rimColor: 'rgba(255, 160, 60, 0.4)', bodyColor: '#888d7e90', accentColor: '#748259',
    },

    GERAN3: {
      id: 'geran3',
      name: 'Geran-3',
      spriteW: 72, spriteH: 80, hitboxW: 86, hitboxH: 96,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.GERAN3_HP  : 4),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.GERAN3_PTS : 15),
      speedNormal:   (typeof TUNING !== 'undefined' ? TUNING.GERAN3_SPEED_NORMAL   : 50),
      speedTerminal: (typeof TUNING !== 'undefined' ? TUNING.GERAN3_SPEED_TERMINAL : 100),
      terminalTime:  (typeof TUNING !== 'undefined' ? TUNING.GERAN3_TERMINAL_TIME  : 3000),
      radarTarget: false,
      trajectory: 'diagonal_accel',
      diagonalAngle: (typeof TUNING !== 'undefined' ? TUNING.GERAN3_DIAGONAL_ANGLE : 15),
      spawnXMin: 100, spawnXMax: 1180,
      rimColor: 'rgba(255, 160, 60, 0.35)', bodyColor: '#5a6a7a', accentColor: '#3a4a5a',
    },

    KH555: {
      id: 'kh555',
      name: 'Kh-555',
      spriteW: 56, spriteH: 112, hitboxW: 67, hitboxH: 134,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.KH555_HP  : 6),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.KH555_PTS : 40),
      speed:   (typeof TUNING !== 'undefined' ? TUNING.KH555_SPEED : 90),
      radarTarget: true,
      trajectory: 'wide_sine',
      sineAmplitude: (typeof TUNING !== 'undefined' ? TUNING.KH555_SINE_AMPLITUDE : 275),
      sinePeriod:    (typeof TUNING !== 'undefined' ? TUNING.KH555_SINE_PERIOD    : 4000),
      spawnXMin: 320, spawnXMax: 960,
      rimColor: 'rgba(255, 180, 80, 0.5)', bodyColor: '#c8c8c8', finColor: '#aaaaaa', noseColor: '#e0e0e0',
    },

    KALIBR: {
      id: 'kalibr',
      name: '3M54 Kalibr',
      spriteW: 56, spriteH: 112, hitboxW: 67, hitboxH: 134,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.KALIBR_HP  : 8),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.KALIBR_PTS : 50),
      speed:   (typeof TUNING !== 'undefined' ? TUNING.KALIBR_SPEED : 105),
      radarTarget: true,
      trajectory: 'medium_sine',
      sineAmplitude: (typeof TUNING !== 'undefined' ? TUNING.KALIBR_SINE_AMPLITUDE : 125),
      sinePeriod:    (typeof TUNING !== 'undefined' ? TUNING.KALIBR_SINE_PERIOD    : 5000),
      spawnXMin: 200, spawnXMax: 1080,
      rimColor: 'rgba(255, 180, 80, 0.5)', bodyColor: '#b0b8c0', finColor: '#909aa0', noseColor: '#d0d8e0',
    },

    KH101: {
      id: 'kh101',
      name: 'Kh-101',
      spriteW: 64, spriteH: 128, hitboxW: 77, hitboxH: 154,
      hp:      (typeof TUNING !== 'undefined' ? TUNING.KH101_HP  : 10),
      killPts: (typeof TUNING !== 'undefined' ? TUNING.KH101_PTS : 60),
      speed:   (typeof TUNING !== 'undefined' ? TUNING.KH101_SPEED : 120),
      radarTarget: true,
      radarLockDelay: 750,
      trajectory: 'perlin',
      stealthDuration: 2000,
      stealthOpacity: 0.25,
      stealthFadeTime: 1000,
      spawnXMin: 200, spawnXMax: 1080,
      rimColor: 'rgba(255, 140, 60, 0.3)', bodyColor: '#2a3a5a', finColor: '#1a2a3a', noseColor: '#3a4a6a',
      flareDecoy: true,
    },
  },

  // ----------------------------------------------------------
  // EXPLOSION
  // ----------------------------------------------------------
  EXPLOSION: {
    WIDTH: 80,
    HEIGHT: 80,
    DURATION: 1000,       // ms
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
  // PITSTOP SHOP
  // ----------------------------------------------------------
  PITSTOP: {
    ITEMS: [
      { id: 'mg_double',   name: 'Machine Gun Double Barrel', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_MG_DOUBLE    : 100), requires: 'mg',          replaces: null  },
      { id: 'autocannon',  name: 'Autocannon', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_AUTOCANNON   : 200), requires: 'mg',          replaces: 'mg'  },
      { id: 'sam',         name: 'SAM Rocket Launcher', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_SAM          : 350), requires: null,          replaces: null, slots: 2 },
      { id: 'sam_2rockets',name: 'SAM 2 Rockets Launcher', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_SAM_2ROCKETS : 350), requires: 'sam',         replaces: null  },
      { id: 'ac_double',   name: 'Autocannon Twin Barrel', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_AC_DOUBLE    : 200), requires: 'autocannon',  replaces: null  },
      { id: 'lav',         name: 'Light Armoured Vehicle', cost: (typeof TUNING !== 'undefined' ? TUNING.COST_LAV          : 300), requires: null,          replaces: null  },
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
