// ============================================================
// CLOSE THE SKY — tuning.js
// YOUR file. Never overwritten by developer updates.
// ============================================================

const TUNING = {

  // ================================================================
  // VEHICLES
  // ================================================================
  TRUCK_SPEED:  175,
  TRUCK_HP:     2,
  TRUCK_SLOTS:  2,

  LAV_SPEED:    210,
  LAV_HP:       3,
  LAV_SLOTS:    4,

  // ================================================================
  // WEAPONS
  // ================================================================

  MG_PROJ_SPEED:         400,
  MG_DAMAGE:             1,
  MG_COOLDOWN:           500,
  MG_DESPAWN_DIST:       768,

  MG_FALLOFF_FULL_DIST:    512,
  MG_FALLOFF_HALF_DIST:    768,
  MG_FALLOFF_QUARTER_DIST: 1020,

  AUTOCANNON_PROJ_SPEED:   500,
  AUTOCANNON_DAMAGE:       2,
  AUTOCANNON_COOLDOWN:     300,
  AUTOCANNON_DESPAWN_DIST: 920,

  SAM_PROJ_SPEED:   300,
  SAM_DAMAGE:       8,
  SAM_COOLDOWN:     1000,
  SAM_RADAR_RADIUS: 400,
  SAM_LOCK_DELAY:   400,

  // ================================================================
  // ENEMY SPEEDS
  // ================================================================
  GERAN1_SPEED:          130,
  GERAN2_SPEED:          140,
  GERAN3_SPEED_NORMAL:   120,
  GERAN3_SPEED_TERMINAL: 150,
  KH555_SPEED:           160,
  KALIBR_SPEED:          165,
  KH101_SPEED:           170,

  // ================================================================
  // ENEMY HP
  // ================================================================
  GERAN1_HP:  3,
  GERAN2_HP:  4,
  GERAN3_HP:  5,
  KH555_HP:   10,
  KALIBR_HP:  12,
  KH101_HP:   14,

  // ================================================================
  // ENEMY KILL POINTS
  // ================================================================
  GERAN1_PTS:  11,
  GERAN2_PTS:  13,
  GERAN3_PTS:  17,
  KH555_PTS:   21,
  KALIBR_PTS:  25,
  KH101_PTS:   30,

  // ================================================================
  // ENEMY TRAJECTORIES
  // ================================================================
  GERAN1_DIAGONAL_ANGLE:    20,
  GERAN3_DIAGONAL_ANGLE:    60,
  GERAN3_TERMINAL_TIME:     4000,

  GERAN2_DIAGONAL_ANGLE:    40,
  GERAN2_FLIP_PROGRESS:     0.5,  // Flip at 50% of screen height

  KH101_DIAGONAL_ANGLE:  80,
  KH555_SINE_AMPLITUDE:  100,
  KH555_SINE_PERIOD:     100,
  KALIBR_SINE_AMPLITUDE: 200,
  KALIBR_SINE_PERIOD:    200,

  // ================================================================
  // COSTS
  // ================================================================
  COST_LAV:          200,
  COST_MG:           100,
  COST_MG_DOUBLE:    100,
  COST_AUTOCANNON:   400,
  COST_AC_DOUBLE:    400,
  COST_SAM:          300,
  COST_SAM_2ROCKETS: 500,

  // ================================================================
  // ARCADE UPGRADES
  // ================================================================
  ARCADE_UPGRADE_1_THRESHOLD: 100,
  ARCADE_UPGRADE_2_THRESHOLD: 200,
  ARCADE_UPGRADE_3_THRESHOLD: 300,
  ARCADE_UPGRADE_4_THRESHOLD: 400,
  ARCADE_UPGRADE_5_THRESHOLD: 500,
};
