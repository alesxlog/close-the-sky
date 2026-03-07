
class MissionBriefScene extends SceneBase {
  constructor(canvas, ctx, attackNum, onComplete) {
    super(canvas, ctx);
    this.attackNum  = attackNum;
    this.onComplete = onComplete;
    this._tablet    = new TabletUI(canvas, ctx);
    this._completed = false;
    this._btnDeployY = 0; // Track DEPLOY button position

    // Resolve briefing
    this._brief = this._resolve(attackNum);

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
    this._on(window, 'keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._complete();
      }
    });
  }

  _resolve(attackNum) {
    const brief   = INTEL['attack' + attackNum];
    const waveCfg = WAVES.campaign['attack' + attackNum];
    const template = INTEL.templates[brief.template];

    const seen = new Set(), names = [];
    for (const r of waveCfg.roster) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        const cfg = CONFIG.ENEMIES[r.type.toUpperCase()];
        if (cfg) names.push(cfg.name);
      }
    }

    const body = template
      .replace(/%AGENCY_NAME%/g,   brief.agency)
      .replace(/%TOTAL_ENEMIES%/g, waveCfg.total)
      .replace(/%ENEMY_ROSTER%/g,  names.join(', '))
      .replace(/%TARGET_LIST%/g,   brief.targets);

    const highlights = [
      ...names,
      String(waveCfg.total),
      ...brief.targets.split(/[\s,]+/).filter(w => w.length >= 5),
    ];

    return { agency: brief.agency, body, highlights };
  }

  _complete() {
    if (this._completed) return;
    this._completed = true;
    this.destroy();
    this.onComplete();
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;
    
    // Check if click is in content area
    if (!hit.isFooter && hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnDeployY && hit.y <= this._btnDeployY + 48) {
        this._complete();
      }
    }
  }

  update(dt) {
    this._fadeIn(dt);
    this._tablet.updateScroll(dt);
  }

  draw(ctx) {
    this._drawBackground(ctx);
    this._tablet.draw(ctx, this._renderContent.bind(this), { 
      alpha: this._alpha
    });
  }

  _drawBackground(ctx) {
    NightBackground.get().drawSnapshot(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, this._CW, this._CH);
  }

  _renderContent(cctx, cw) {
    let y = 0;
    y += TabletUI.drawTitle(cctx, y, 'MISSION BRIEF', {});
    y += TabletUI.drawDivider(cctx, y, cw);
    y += TabletUI.drawHeader(cctx, y, `Intelligence Report — Attack ${this.attackNum}`, cw);
    y += 4;
    y += TabletUI.drawBody(cctx, y, this._brief.body, cw, { highlights: this._brief.highlights });
    y += 16;
    this._btnDeployY = y; // Store DEPLOY button position
    y += TabletUI.drawButton(cctx, y, 'DEPLOY', cw);
    return y;
  }
}


