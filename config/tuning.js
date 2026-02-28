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

  LAV_SPEED:    190,
  LAV_HP:       3,
  LAV_SLOTS:    2,

  // ================================================================
  // ENEMY SPEEDS
  // ================================================================
  GERAN1_SPEED:          130,
  GERAN2_SPEED:          140,
  GERAN3_SPEED_NORMAL:   120,
  GERAN3_SPEED_TERMINAL: 150,
  KH555_SPEED:           150,
  KALIBR_SPEED:          155,
  KH101_SPEED:           160,

  // ================================================================
  // ENEMY HP
  // ================================================================
  GERAN1_HP:  3,
  GERAN2_HP:  4,
  GERAN3_HP:  5,
  KH555_HP:   8,
  KALIBR_HP:  9,
  KH101_HP:   10,

  // ================================================================
  // ENEMY KILL POINTS
  // ================================================================
  GERAN1_PTS:  11,
  GERAN2_PTS:  13,
  GERAN3_PTS:  17,
  KH555_PTS:   33,
  KALIBR_PTS:  44,
  KH101_PTS:   55,

  // ================================================================
  // ENEMY TRAJECTORIES
  // ================================================================
  GERAN1_DIAGONAL_ANGLE:    22,   // degrees from vertical
  GERAN3_DIAGONAL_ANGLE:    45,   // degrees from vertical
  GERAN3_TERMINAL_TIME:     3500, // ms before bottom to accelerate

  GERAN2_SLALOM_AMP_TOP:    45,   // px oscillation at spawn
  GERAN2_SLALOM_AMP_BOTTOM: 90,  // px oscillation near bottom

  KH555_SINE_AMPLITUDE:  640,     // px
  KH555_SINE_PERIOD:     4000,    // ms per full oscillation
  KALIBR_SINE_AMPLITUDE: 320,
  KALIBR_SINE_PERIOD:    3000,

  // ================================================================
  // WEAPONS
  // ================================================================

  MG_PROJ_SPEED:         500,
  MG_DAMAGE:             1,
  MG_COOLDOWN:           500,
  MG_DESPAWN_DIST:       768,

  MG_FALLOFF_FULL_DIST:    512,
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
  SPAWN_LOCK_AFTER_DEATH:    2000,
  MIN_SPAWN_INTERVAL:        1500,
  NO_HIGHTIER_FIRST:         15000,
  MAX_SIMULTANEOUS_HIGHTIER: 2,
  MAX_SIMULTANEOUS_KH101:    2,

  // ================================================================
  // ARCADE MODE
  // ================================================================
  ARCADE_WAVE_PAUSE:         2000,
  ARCADE_START_SIMULTANEOUS: 2,

  ARCADE_UPGRADE_1_THRESHOLD: 100,
  ARCADE_UPGRADE_2_THRESHOLD: 400,
  ARCADE_UPGRADE_3_THRESHOLD: 750,
  ARCADE_UPGRADE_4_THRESHOLD: 950,
  ARCADE_UPGRADE_5_THRESHOLD: 1300,

  // ================================================================
  // CAMPAIGN
  // ================================================================
  //   SPAWN_MIN/MAX  — ms between spawn events
  //   SPAWN_COUNT    — enemies fired per event
  //   MAX_SIM        — hard screen cap (skips event if exceeded)
  //   MIN_DISTANCE   — min px between enemies in same batch (Y axis)

  ATTACK1_SPAWN_MIN: 2000, ATTACK1_SPAWN_MAX: 5000, ATTACK1_MAX_SIM: 3,  ATTACK1_SPAWN_COUNT: 1, ATTACK1_MIN_DISTANCE: 200, ATTACK1_TOTAL: 20,
  ATTACK2_SPAWN_MIN: 2000, ATTACK2_SPAWN_MAX: 4000, ATTACK2_MAX_SIM: 4,  ATTACK2_SPAWN_COUNT: 2, ATTACK2_MIN_DISTANCE: 200, ATTACK2_TOTAL: 40,
  ATTACK3_SPAWN_MIN: 2500, ATTACK3_SPAWN_MAX: 3000, ATTACK3_MAX_SIM: 6,  ATTACK3_SPAWN_COUNT: 2, ATTACK3_MIN_DISTANCE: 180, ATTACK3_TOTAL: 60,
  ATTACK4_SPAWN_MIN: 2500, ATTACK4_SPAWN_MAX: 2500, ATTACK4_MAX_SIM: 8,  ATTACK4_SPAWN_COUNT: 3, ATTACK4_MIN_DISTANCE: 160, ATTACK4_TOTAL: 80,
  ATTACK5_SPAWN_MIN:  300, ATTACK5_SPAWN_MAX: 2000, ATTACK5_MAX_SIM: 10, ATTACK5_SPAWN_COUNT: 3, ATTACK5_MIN_DISTANCE: 140, ATTACK5_TOTAL: 100,

  // ================================================================
  // COSTS
  // ================================================================
  COST_LAV:          300,
  COST_MG:           100,
  COST_MG_DOUBLE:    100,
  COST_AUTOCANNON:   200,
  COST_AC_DOUBLE:    200,
  COST_SAM:          350,
  COST_SAM_2ROCKETS: 350,
};
