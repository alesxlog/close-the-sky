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
  maxSimHighTier:      8,      // max simultaneous Kh-555 / Kalibr / Kh-101
  maxSimKh101:         2,      // max simultaneous Kh-101
  noHighTierFirst:     1000,  // ms — no high-tier in first N ms of attack

  // ----------------------------------------------------------
  // CAMPAIGN MODE
  // ----------------------------------------------------------
  campaign: {
    attack1: {
      total: 16,
      maxSim: 2,
      spawnMin: 2000,
      spawnMax: 4000,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 0, weight: 1 },
        { type: 'geran2', from: 8, weight: 1 }
      ],
      // Campaign metadata for progression
      totalEnemies: (typeof TUNING !== 'undefined' ? TUNING.ATTACK1_TOTAL : 20),
      minDistance: (typeof TUNING !== 'undefined' ? TUNING.ATTACK1_MIN_DISTANCE : 200),
      noHighTierFirst: true, 
      pitstopAfter: true,
    },

    attack2: {
      total: 24,
      maxSim: 3,
      spawnMin: 2500,
      spawnMax: 5000,
      spawnCount: [1,2],
      spawnGap: 100,
      roster: [
        { type: 'geran1', from: 8, weight: 1 },
        { type: 'geran2', from: 0, weight: 2 },
        { type: 'geran3', from: 16, weight: 2,},
      ],
      // Campaign metadata for progression
      totalEnemies: (typeof TUNING !== 'undefined' ? TUNING.ATTACK2_TOTAL : 40),
      minDistance: (typeof TUNING !== 'undefined' ? TUNING.ATTACK2_MIN_DISTANCE : 300),
      noHighTierFirst: true, 
      pitstopAfter: true,
    },

    attack3: {
      total: 32,
      maxSim: 3,
      spawnMin: 2500,
      spawnMax: 5000,
      spawnCount: [2],
      spawnGap: 200,
      roster: [
        { type: 'geran1', from: 24, weight: 1 },
        { type: 'geran2', from: 0, weight: 1 },
        { type: 'geran3', from: 8, weight: 1 },
        { type: 'kh555',  from: 16, weight: 1, max: 4 },
      ],
      // Campaign metadata for progression
      totalEnemies: (typeof TUNING !== 'undefined' ? TUNING.ATTACK3_TOTAL : 60),
      minDistance: (typeof TUNING !== 'undefined' ? TUNING.ATTACK3_MIN_DISTANCE : 180),
      noHighTierFirst: true, 
      pitstopAfter: true,
    },

    attack4: {
      total: 40,
      maxSim: 3,
      spawnMin: 3000,
      spawnMax: 6000,
      spawnCount: [2,3],
      spawnGap: 300,
      roster: [
        { type: 'geran1', from: 0, weight: 1 },
        { type: 'geran2', from: 4, weight: 1 },
        { type: 'geran3', from: 8, weight: 1 },
        { type: 'kh555',  from: 24, weight: 1, max: 4 },
        { type: 'kalibr', from: 32, weight: 2, max: 3 },
      ],
      // Campaign metadata for progression
      totalEnemies: 80,
      minDistance: (typeof TUNING !== 'undefined' ? TUNING.ATTACK4_MIN_DISTANCE : 160),
      noHighTierFirst: true, 
      pitstopAfter: true,
    },

    attack5: {
      total: 50,
      maxSim: 3,
      spawnMin: 2500,
      spawnMax: 5000,
      spawnCount: [1, 2, 3],
      spawnGap: 400,
      roster: [
        { type: 'geran1', from: 0, weight: 1 },
        { type: 'geran2', from: 8, weight: 1 },
        { type: 'geran3', from: 16, weight: 1 },
        { type: 'kh555',  from: 24, weight: 1, max: 4 },
        { type: 'kalibr', from: 32, weight: 1, max: 3 },
        { type: 'kh101',  from: 40, weight: 1, max: 2 },
      ],
      // Campaign metadata for progression
      totalEnemies: (typeof TUNING !== 'undefined' ? TUNING.ATTACK5_TOTAL : 100),
      minDistance: (typeof TUNING !== 'undefined' ? TUNING.ATTACK5_MIN_DISTANCE : 140),
      noHighTierFirst: true, 
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
        maxSim: 2,
        spawnMin: 2000,
        spawnMax: 3000,
        spawnCount: [1],
        sequence: [
          { types: ['geran1'],                     count: 4 },
          { types: ['geran1', 'geran2'],           count: 4 },
        ],
      },

      // Wave 2
      {
        total: 10,
        maxSim: 2,
        spawnMin: 2000,
        spawnMax: 3000,
        spawnCount: [1],
        sequence: [
          { types: ['geran1', 'geran2'],           count: 6 },
          { types: ['geran2'],                     count: 4 },
        ],
      },

      // Wave 3
      {
        total: 16,
        maxSim: 3,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1, 2],
        sequence: [
          { types: ['geran1', 'geran2'],           count: 8 },
          { types: ['geran2', 'geran3'],           count: 8 },
        ],
      },

      // Wave 4
      {
        total: 20,
        maxSim: 3,
        spawnMin: 2000,
        spawnMax: 4000,
        spawnCount: [1, 2],
        sequence: [
          { types: ['geran1', 'geran2'],           count: 6 },
          { types: ['geran3'],                     count: 5 },
          { types: ['geran1', 'geran2', 'geran3'], count: 9 },
        ],
      },

      // Wave 5
      {
        total: 25,
        maxSim: 3,
        spawnMin: 2000,
        spawnMax: 3000,
        spawnCount: [1, 2],
        sequence: [
          { types: ['geran2', 'geran3'],           count: 8 },
          { types: ['geran1', 'geran3'],           count: 8 },
          { types: ['geran1', 'geran2', 'geran3'], count: 9 },
        ],
      },
    ],

    // Phase 2: Combination (waves 6-10) — handcrafted
    phase2: [
      // Wave 6
      {
        total: 30,
        maxSim: 4,
        spawnMin: 1000,
        spawnMax: 2500,
        spawnCount: [1, 2],
        sequence: [
          { types: ['geran2', 'geran3'],           count: 10 },
          { types: ['geran1'],                     count: 8 },
          { types: ['geran1', 'geran2', 'geran3'], count: 12 },
        ],
      },

      // Wave 7
      {
        total: 35,
        maxSim: 4,
        spawnMin: 1000,
        spawnMax: 2500,
        spawnCount: [1, 2],
        sequence: [
          { types: ['geran1', 'geran2', 'geran3'], count: 15 },
          { types: ['geran2', 'geran3'],           count: 10 },
          { types: ['geran1'],                     count: 10 },
        ],
      },

      // Wave 8
      {
        total: 40,
        maxSim: 5,
        spawnMin: 800,
        spawnMax: 2000,
        spawnCount: [2, 3],
        sequence: [
          { types: ['kh555', 'geran1', 'geran2', 'kalibr'],  count: 10 },
          { types: ['geran1', 'geran2', 'geran3'],         count: 15 },
          { types: ['geran2', 'geran3'],                   count: 15 },
        ],
      },

      // Wave 9
      {
        total: 45,
        maxSim: 5,
        spawnMin: 800,
        spawnMax: 2000,
        spawnCount: [2, 3],
        sequence: [
          { types: ['geran1'],                              count: 8  },
          { types: ['geran2', 'geran3'],                   count: 12 },
          { types: ['kh555', 'geran1', 'geran2', 'kalibr'], count: 10 },
          { types: ['geran1', 'geran2', 'geran3'],         count: 15 },
        ],
      },

      // Wave 10
      {
        total: 50,
        maxSim: 6,
        spawnMin: 600,
        spawnMax: 1800,
        spawnCount: [2, 3],
        sequence: [
          { types: ['kh555'],                              count: 2  },
          { types: ['geran1', 'geran2', 'geran3'],         count: 12 },
          { types: ['kalibr'],                             count: 2  },
          { types: ['geran1', 'geran2', 'geran3'],         count: 12 },
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
