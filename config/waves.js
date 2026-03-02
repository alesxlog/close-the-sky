// ============================================================
// CLOSE THE SKY — waves.js
// Single source of truth for all wave definitions.
// Campaign: ordered roster with from/weight/max per attack.
// Arcade: phase1 (handcrafted), phase2 (sequenced), phase3 (procedural).
// ============================================================

const WAVES = {

  // ----------------------------------------------------------
  // CAMPAIGN
  // ----------------------------------------------------------
  campaign: {

    attack1: {
      total: 15,
      maxSim: 2,
      spawnMin: 2000,
      spawnMax: 3000,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 0,  weight: 2 },
        { type: 'geran2', from: 15, weight: 1 },
      ],
    },

    attack2: {
      total: 40,
      maxSim: 2,
      spawnMin: 1500,
      spawnMax: 2500,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 0,  weight: 1 },
        { type: 'geran2', from: 8,  weight: 3 },
        { type: 'geran3', from: 19, weight: 1 },
      ],
    },

    attack3: {
      total: 50,
      maxSim: 3,
      spawnMin: 1500,
      spawnMax: 3500,
      spawnCount: [1],
      roster: [
        { type: 'geran1', from: 6,  weight: 1 },
        { type: 'geran2', from: 2,  weight: 2 },
        { type: 'geran3', from: 0,  weight: 2 },
        { type: 'kh555',  from: 25, weight: 1 },
      ],
    },

    attack4: {
      total: 60,
      maxSim: 3,
      spawnMin: 2000,
      spawnMax: 5000,
      spawnCount: [1,2],
      spawnGap: 200,        // min px between enemies on X axis
      roster: [
        { type: 'geran2', from: 1,  weight: 3 },
        { type: 'geran3', from: 5,  weight: 2 },
        { type: 'kh555',  from: 0,  weight: 1 },
        { type: 'kalibr', from: 30, weight: 1, max: 5 },
      ],
    },

    attack5: {
      total: 75,
      maxSim: 3,
      spawnMin: 2500,
      spawnMax: 5000,
      spawnCount: [1, 2, 3],
      spawnGap: 300,        // min px between enemies on X axis
      roster: [
        { type: 'geran1', from: 3,  weight: 2 },
        { type: 'geran2', from: 35, weight: 2 },
        { type: 'geran3', from: 9,  weight: 2 },
        { type: 'kh555',  from: 30, weight: 2, max: 10 },
        { type: 'kalibr', from: 0,  weight: 1, max: 10 },
        { type: 'kh101',  from: 60, weight: 1, max: 10 },
      ],
    },

  },

  // ----------------------------------------------------------
  // ARCADE
  // ----------------------------------------------------------
  arcade: {

    // ---- Phase 1 — handcrafted waves 1-5 ----
    // from = cumulative enemies spawned across entire arcade run
    phase1: {
      waves: [
        { total: 8,  spawnCount: [1] },
        { total: 12, spawnCount: [1] },
        { total: 18, spawnCount: [1] },
        { total: 24, spawnCount: [1] },
        { total: 30, spawnCount: [1] },
      ],
      maxSim: 4,
      spawnMin: 2000,
      spawnMax: 4000,
      spawnCount: [1], // fallback for waves without specific spawnCount
      roster: [
        { type: 'geran1', from: 0,  weight: 1 },
        { type: 'geran2', from: 5,  weight: 2 },
        { type: 'geran3', from: 15, weight: 1 },
        { type: 'kh555',  from: 60, weight: 2, max: 5 },
      ],
    },

    // ---- Phase 2 — sequenced waves 6-10 ----
    // sequence: ordered groups, spawner works through them in order
    // spawnAt: trigger enemy at specific count within the wave (optional)
    phase2: [
      // Wave 6 — total: 30
      {
        total: 30,
        maxSim: 4,
        spawnMin: 1000,
        spawnMax: 2500,
        spawnCount: [1, 2],
        sequence: [
          { types: ['kh555'],                              count: 2  },
          { types: ['geran1', 'geran2', 'geran3'],         count: 8  },
          { types: ['kalibr'],                             count: 1  },
          { types: ['geran1', 'geran2', 'kh555'],          count: 12 },
          { types: ['kh101'],                              count: 1  },
        ],
      },

      // Wave 7 — total: 35
      {
        total: 35,
        maxSim: 4,
        spawnMin: 1000,
        spawnMax: 2500,
        spawnCount: [1, 2],
        sequence: [
          { types: ['kalibr'],                             count: 1  },
          { types: ['geran1', 'geran2', 'geran3'],         count: 10 },
          { types: ['kh555'],                              count: 1  },
          { types: ['geran1', 'geran2', 'geran3'],         count: 10 },
          { types: ['kh101'],                              count: 2  },
        ],
      },

      // Wave 8 — total: 40
      {
        total: 40,
        maxSim: 5,
        spawnMin: 800,
        spawnMax: 2000,
        spawnCount: [2, 3],
        sequence: [
          { types: ['kh555', 'geran1', 'geran2', 'kalibr'],  count: 10 },
          { types: ['geran1', 'geran2', 'geran3', 'kh555'],  count: 10 },
          { types: ['geran1', 'geran2', 'geran3', 'kalibr'], count: 10 },
          { types: ['kh101'],                                count: 3  },
        ],
      },

      // Wave 9 — total: 45
      {
        total: 45,
        maxSim: 5,
        spawnMin: 800,
        spawnMax: 2000,
        spawnCount: [2, 3],
        sequence: [
          { types: ['geran1'],                              count: 8  },
          { types: ['geran2'],                              count: 8  },
          { types: ['kh555',  'geran1', 'geran2'],          count: 10 },
          { types: ['kalibr', 'geran1', 'geran2'],          count: 10 },
        ],
        // kh101 triggered at specific enemy counts within wave
        triggered: [
          { type: 'kh101', spawnAt: 20 },
          { type: 'kh101', spawnAt: 30 },
          { type: 'kh101', spawnAt: 44 },
          { type: 'kh101', spawnAt: 44 },
        ],
      },

      // Wave 10 — total: 50
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

    // ---- Phase 3 — procedural wave 11+ ----
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
