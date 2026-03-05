// ============================================================
// CLOSE THE SKY — waves.js
// Single source of truth for all wave definitions.
// Campaign: ordered roster with from/weight/max per attack.
// Arcade: phase1 (sequenced), phase2 (sequenced), phase3 (procedural).
// ============================================================

const WAVES = {

  // ----------------------------------------------------------
  // GLOBAL SPAWNING CONSTRAINTS
  // ----------------------------------------------------------
  wavePause:           1000,   // ms between arcade waves
  spawnLockAfterDeath: 1000,   // ms no-spawn after car destroyed
  maxSimHighTier:      3,      // max simultaneous Kh-555 / Kalibr / Kh-101
  maxSimKh101:         2,      // max simultaneous Kh-101
  noHighTierFirst:     1000,  // ms — no high-tier in first N ms of attack

  // ----------------------------------------------------------
  // CAMPAIGN MODE
  // ----------------------------------------------------------
  campaign: {
    attack1: {
      total: 10,
      maxSim: 2,
      spawnMin: 2500,
      spawnMax: 5000,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 0, weight: 1 },
        { type: 'geran2', from: 5, weight: 1 }
      ],
      pitstopAfter: true,
    },

    attack2: {
      total: 20,
      maxSim: 2,
      spawnMin: 2000,
      spawnMax: 3500,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 0, weight: 1 },
        { type: 'geran2', from: 5, weight: 2, max: 5 },
        { type: 'geran3', from: 10, weight: 1},
      ],
      pitstopAfter: true,
    },

    attack3: {
      total: 25,
      maxSim: 3,
      spawnMin: 2000,
      spawnMax: 4000,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 10, weight: 1 },
        { type: 'geran2', from: 0, weight: 2 },
        { type: 'geran3', from: 5, weight: 2, max: 7 },
        { type: 'kh555',  from: 15, weight: 1, max: 3 },
      ],
      pitstopAfter: true,
    },

    attack4: {
      total: 32,
      maxSim: 3,
      spawnMin: 3000,
      spawnMax: 5000,
      spawnCount: [1, 2],
      spawnGap: 400,
      roster: [
        { type: 'geran1', from: 20, weight: 1 },
        { type: 'geran2', from: 5, weight: 2 },
        { type: 'geran3', from: 0, weight: 2 },
        { type: 'kh555',  from: 10, weight: 1, max: 5 },
        { type: 'kalibr', from: 30, weight: 3, max: 2 },
      ],
      pitstopAfter: true,
    },

    attack5: {
      total: 33,
      maxSim: 3,
      spawnMin: 3000,
      spawnMax: 6000,
      spawnCount: [1, 2, 3],
      spawnGap: 400,
      roster: [
        { type: 'geran1', from: 10, weight: 1 },
        { type: 'geran2', from: 15, weight: 2 },
        { type: 'geran3', from: 5, weight: 3 },
        { type: 'kh555',  from: 20, weight: 1, max: 6 },
        { type: 'kalibr', from: 0, weight: 1, max: 4 },
        { type: 'kh101',  from: 32, weight: 1, max: 2 },
      ],
      pitstopAfter: false,
    },
  },

  // ----------------------------------------------------------
  // ARCADE MODE
  // ----------------------------------------------------------
  arcade: {
    // Core arcade settings
    WAVE_PAUSE:        (typeof TUNING !== 'undefined' ? TUNING.ARCADE_WAVE_PAUSE         : 4000),
    START_SIMULTANEOUS:(typeof TUNING !== 'undefined' ? TUNING.ARCADE_START_SIMULTANEOUS : 4),

    // Upgrade progression
    UPGRADES: [
      { step: 1, cumulative: (typeof TUNING !== 'undefined' ? TUNING.ARCADE_UPGRADE_1_THRESHOLD : 100),  upgrade: 'mg_double',      enemyUnlock: 'geran3' },
      { step: 2, cumulative: (typeof TUNING !== 'undefined' ? TUNING.ARCADE_UPGRADE_2_THRESHOLD : 400),  upgrade: 'lav_autocannon', enemyUnlock: 'kh555'  },
      { step: 3, cumulative: (typeof TUNING !== 'undefined' ? TUNING.ARCADE_UPGRADE_3_THRESHOLD : 750),  upgrade: 'sam',            enemyUnlock: 'kalibr' },
      { step: 4, cumulative: (typeof TUNING !== 'undefined' ? TUNING.ARCADE_UPGRADE_4_THRESHOLD : 950),  upgrade: 'ac_double',      enemyUnlock: null     },
      { step: 5, cumulative: (typeof TUNING !== 'undefined' ? TUNING.ARCADE_UPGRADE_5_THRESHOLD : 1300), upgrade: 'sam_2rockets',   enemyUnlock: 'kh101'  },
    ],

    // Phase 1: Learning (waves 1-5) — sequenced
    phase1: [
      // Wave 1
      {
        total: 8,
        maxSim: 1,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1],
        roster: [
          { type: 'geran1', weight: 2 },
          { type: 'geran2', weight: 1 }
        ],
      },

      // Wave 2
      {
        total: 12,
        maxSim: 2,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 1 }
        ],
      },

      // Wave 3
      {
        total: 16,
        maxSim: 3,
        spawnMin: 3000,
        spawnMax: 4000,
        spawnCount: [1],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 1 }
        ],
      },

      // Wave 4
      {
        total: 20,
        maxSim: 3,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1, 2],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 1 },
          { type: 'geran3', weight: 1 }
        ],
      },

      // Wave 5
      {
        total: 24,
        maxSim: 3,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1, 2],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 2 }
        ],
      },
    ],

    // Phase 2: Combination (waves 6-10) — handcrafted
    phase2: [
      // Wave 6
      {
        total: 28,
        maxSim: 4,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [2],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 1 },
          { type: 'geran3', weight: 2 }
        ],
      },

      // Wave 7
      {
        total: 32,
        maxSim: 4,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [2],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 2 }
        ],
      },

      // Wave 8
      {
        total: 40,
        maxSim: 4,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [2],
        roster: [
          { type: 'geran1', weight: 2 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 1 },
          { type: 'kh555', weight: 1 },
          { type: 'kalibr', weight: 1 }
        ],
      },

      // Wave 9
      {
        total: 44,
        maxSim: 5,
        spawnMin: 800,
        spawnMax: 2000,
        spawnCount: [1, 2],
        roster: [
          { type: 'geran1', weight: 1 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 2 },
          { type: 'kh555', weight: 1 },
          { type: 'kalibr', weight: 1 }
        ],
      },

      // Wave 10
      {
        total: 50,
        maxSim: 5,
        spawnMin: 600,
        spawnMax: 1800,
        spawnCount: [1, 2],
        roster: [
          { type: 'geran1', weight: 2 },
          { type: 'geran2', weight: 2 },
          { type: 'geran3', weight: 2 },
          { type: 'kh555', weight: 1 },
          { type: 'kalibr', weight: 1 }
        ],
        triggered: [
          { type: 'kh101', spawnAt: 40 },
          { type: 'kh101', spawnAt: 44 },
          { type: 'kh101', spawnAt: 46 },
          { type: 'kh101', spawnAt: 48 },
          { type: 'kh101', spawnAt: 50 },
        ],
      },
    ],

    // Phase 3: Generated (wave 11+) — procedural
    phase3: {
      startWave: 11,

      total:          { start: 33,   increment: 3,    every: 1, cap: 50    },
      maxSim:         { start: 3,    increment: 1,    every: 3, cap: 6     },
      spawnMin:       { start: 2000, decrement: 100,  every: 2, floor: 800 },
      spawnMax:       { start: 3000, decrement: 100,  every: 2, floor: 1200},
      spawnCount:     { start: [2, 3], cap: [3, 4]                         },
      highTierRatio:  { start: 0.15, increment: 0.05, every: 3, cap: 0.50  },
      speedMultiplier:{ start: 1.0,  increment: 0.05, every: 5, cap: 1.20  },

      roster: [
        { type: 'geran1', weight: 1 },
        { type: 'geran2', weight: 3 },
        { type: 'geran3', weight: 1 },
        { type: 'kh555',  weight: 2 },
        { type: 'kalibr', weight: 1 },
        { type: 'kh101',  weight: 1 },
      ],
    },
  },
};
