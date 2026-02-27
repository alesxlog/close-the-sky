// ============================================================
// CLOSE THE SKY — tuning.js
// YOUR file. Never overwritten by developer updates.
// ============================================================

const TUNING = {

  // ================================================================
  // VEHICLES
  // ================================================================
  TRUCK_SPEED:  200,
  TRUCK_HP:     2,
  TRUCK_SLOTS:  1,

  LAV_SPEED:    175,
  LAV_HP:       3,
  LAV_SLOTS:    2,

  // ================================================================
  // ENEMY SPEEDS
  // ================================================================
  GERAN1_SPEED:          110,
  GERAN2_SPEED:          120,
  GERAN3_SPEED_NORMAL:   130,
  GERAN3_SPEED_TERMINAL: 150,
  KH555_SPEED:           160,
  KALIBR_SPEED:          170,
  KH101_SPEED:           180,

  // ================================================================
  // ENEMY HP
  // ================================================================
  GERAN1_HP:  2,
  GERAN2_HP:  3,
  GERAN3_HP:  4,
  KH555_HP:   6,
  KALIBR_HP:  8,
  KH101_HP:   10,

  // ================================================================
  // ENEMY KILL POINTS
  // ================================================================
  GERAN1_PTS:  5,
  GERAN2_PTS:  10,
  GERAN3_PTS:  15,
  KH555_PTS:   40,
  KALIBR_PTS:  50,
  KH101_PTS:   60,

  // ================================================================
  // ENEMY TRAJECTORIES
  // ================================================================
  GERAN1_DIAGONAL_ANGLE:    30,   // degrees from vertical
  GERAN3_DIAGONAL_ANGLE:    60,   // degrees from vertical
  GERAN3_TERMINAL_TIME:     3000, // ms before bottom to accelerate

  GERAN2_SLALOM_AMP_TOP:    30,   // px oscillation at spawn
  GERAN2_SLALOM_AMP_BOTTOM: 180,  // px oscillation near bottom

  KH555_SINE_AMPLITUDE:  275,     // px
  KH555_SINE_PERIOD:     4000,    // ms per full oscillation
  KALIBR_SINE_AMPLITUDE: 125,
  KALIBR_SINE_PERIOD:    5000,

  // ================================================================
  // WEAPONS
  // ================================================================

  MG_PROJ_SPEED:         500,
  MG_DAMAGE:             1,
  MG_COOLDOWN:           400,
  MG_DESPAWN_DIST:       768,

  MG_FALLOFF_FULL_DIST:    384,
  MG_FALLOFF_HALF_DIST:    768,
  MG_FALLOFF_QUARTER_DIST: 1020,

  AUTOCANNON_PROJ_SPEED:   420,
  AUTOCANNON_DAMAGE:       3,
  AUTOCANNON_COOLDOWN:     300,
  AUTOCANNON_DESPAWN_DIST: 1024,

  SAM_PROJ_SPEED:   360,
  SAM_DAMAGE:       7,
  SAM_COOLDOWN:     750,
  SAM_RADAR_RADIUS: 640,
  SAM_LOCK_DELAY:   250,

  // ================================================================
  // SPAWNING
  // ================================================================
  SPAWN_LOCK_AFTER_DEATH:    15000,
  MIN_SPAWN_INTERVAL:        2000,
  NO_HIGHTIER_FIRST:         15000,
  MAX_SIMULTANEOUS_HIGHTIER: 2,
  MAX_SIMULTANEOUS_KH101:    2,

  // ================================================================
  // ARCADE MODE
  // ================================================================
  ARCADE_WAVE_PAUSE:         4000,
  ARCADE_START_SIMULTANEOUS: 5,

  ARCADE_UPGRADE_1_THRESHOLD: 100,
  ARCADE_UPGRADE_2_THRESHOLD: 400,
  ARCADE_UPGRADE_3_THRESHOLD: 750,
  ARCADE_UPGRADE_4_THRESHOLD: 950,
  ARCADE_UPGRADE_5_THRESHOLD: 1300,

  // ================================================================
  // CAMPAIGN
  // ================================================================
  ATTACK1_SPAWN_MIN: 5000, ATTACK1_SPAWN_MAX: 6000, ATTACK1_MAX_SIM: 2,
  ATTACK2_SPAWN_MIN: 4000, ATTACK2_SPAWN_MAX: 5000, ATTACK2_MAX_SIM: 3,
  ATTACK3_SPAWN_MIN: 3000, ATTACK3_SPAWN_MAX: 400, ATTACK3_MAX_SIM: 4,
  ATTACK4_SPAWN_MIN: 2000, ATTACK4_SPAWN_MAX: 3000, ATTACK4_MAX_SIM: 5,
  ATTACK5_SPAWN_MIN: 1000, ATTACK5_SPAWN_MAX: 2000, ATTACK5_MAX_SIM: 6,

};
