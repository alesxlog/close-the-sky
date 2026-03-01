// ============================================================
// CLOSE THE SKY — intel.js
// Intelligence briefing data for Campaign mode.
// Placeholders resolved at render time from waves.js + config.js
//
// Placeholders:
//   %AGENCY_NAME%   — agency field below
//   %TOTAL_ENEMIES% — WAVES.campaign.attackN.total
//   %ENEMY_ROSTER%  — derived from WAVES.campaign.attackN.roster
//   %TARGET_LIST%   — targets field below
// ============================================================

const INTEL = {

  attack1: {
    agency:   'Sector Command',
    targets:  'residential districts, power substations, municipal water infrastructure',    threat:   'ELEVATED',
    template: 1,
  },

  attack2: {
    agency:   'Sector Command',
    targets:  'heating infrastructure, thermal plants, district heating hubs, hospital generators',
    template: 2,
  },

  attack3: {
    agency:   'Sector Command',
    targets:  'a children\'s hospital, two thermal power stations, the main water pumping facility serving 400,000 residents',
    template: 3,
  },

  attack4: {
    agency:   'Sector Command',
    targets:  'the main power grid, two heating plants, a maternity hospital',
    template: 4,
  },

  attack5: {
    agency:   'Sector Command',
    targets:  'power, water, heat — every critical node in a single package',
    template: 5,
  },

  // ---- Templates ----
  templates: {
    1: 'Sector Command reports confirmed hostile air activity east of the contact line. Expect %TOTAL_ENEMIES% threats inbound: %ENEMY_ROSTER%. Strike package is already airborne. Primary targets: %TARGET_LIST%.',

    2: 'Sector Command is tracking multiple hostile formations east of the contact line. Expect %TOTAL_ENEMIES% threats inbound: %ENEMY_ROSTER%. Russia is scaling. This is not a probing strike. Primary targets: %TARGET_LIST%.',

    3: 'Sector Command confirms a combined strike package — drones and cruise missiles. Expect %TOTAL_ENEMIES% threats inbound: %ENEMY_ROSTER%. Your guns will not be enough at range. You need SAM up before this hits. Primary targets: %TARGET_LIST%.',

    4: 'Sector Command has confirmed a large coordinated strike is inbound. Expect %TOTAL_ENEMIES% threats inbound: %ENEMY_ROSTER%. Fast precision missiles in the mix. They are not hitting military targets. Primary targets: %TARGET_LIST%.',

    5: 'Sector Command is tracking the largest strike package recorded against this city. Expect %TOTAL_ENEMIES% threats inbound: %ENEMY_ROSTER%. Stealth assets confirmed. SAM may lose first lock — fire again immediately. Primary targets: %TARGET_LIST%. If this wave gets through, the city does not recover.',
  },

};
