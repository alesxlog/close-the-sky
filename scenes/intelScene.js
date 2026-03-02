// ============================================================
// CLOSE THE SKY — intelScene.js
// Intelligence briefing before each campaign attack.
// Thin wrapper around TabletUI — scene only resolves data.
// ============================================================

class IntelScene {
  constructor(canvas, ctx, attackNum, onComplete) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.attackNum  = attackNum;
    this.onComplete = onComplete;

    this._tablet = new TabletUI(
      canvas, ctx,
      'content',
      this._buildData(attackNum, onComplete)
    );
  }

  // ----------------------------------------------------------
  // BUILD DATA
  // ----------------------------------------------------------
  _buildData(attackNum, onComplete) {
    const brief   = INTEL['attack' + attackNum];
    const waveCfg = WAVES.campaign['attack' + attackNum];
    const template = INTEL.templates[brief.template];

    // Collect unique enemy names from roster
    const seen = new Set(), names = [];
    for (const r of waveCfg.roster) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        const cfg = CONFIG.ENEMIES[r.type.toUpperCase()];
        if (cfg) names.push(cfg.name);
      }
    }

    // Resolve placeholders
    const bodyText = template
      .replace(/%AGENCY_NAME%/g,   brief.agency)
      .replace(/%TOTAL_ENEMIES%/g, waveCfg.total)
      .replace(/%ENEMY_ROSTER%/g,  names.join(', '))
      .replace(/%TARGET_LIST%/g,   brief.targets);

    // Build highlight keyword set
    const highlights = new Set([
      ...names,
      String(waveCfg.total),
      ...brief.targets.split(/[\s,]+/).filter(w => w.length >= 5),
    ]);

    // Tokenize body into highlighted tokens for TabletUI
    const tokens = bodyText.split(' ').map(word => {
      const clean = word.replace(/[^a-zA-Z0-9\-]/g, '');
      const hl    = highlights.has(word) || highlights.has(clean);
      return { text: word, highlight: hl };
    });

    return {
      title:    'INTEL UPDATE',
      subtitle: `ATTACK ${attackNum}  —  ${brief.date || ''}`.trim().replace(/—\s*$/, ''),
      body: {
        type:    'highlighted',
        content: tokens,
      },
      footer: [
        { label: 'GOT IT — DEPLOY', style: 'primary', action: onComplete },
      ],
    };
  }

  // ----------------------------------------------------------
  // LIFECYCLE — delegate to TabletUI
  // ----------------------------------------------------------
  update(dt) { this._tablet.update(dt); }
  draw(ctx)  { this._tablet.draw(ctx);  }

  destroy() {
    this._tablet.destroy();
  }
}
