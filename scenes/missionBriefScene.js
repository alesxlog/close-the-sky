
class MissionBriefScene extends SceneBase {
  constructor(canvas, ctx, attackNum, onComplete) {
    super(canvas, ctx);
    this.attackNum  = attackNum;
    this.onComplete = onComplete;
    this._tablet    = new TabletUI(canvas, ctx);
    this._completed = false;

    this._btnDeployY = 0;

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
    if (hit.x >= 0 && hit.x <= cw) {
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
    CityBackground.get().drawSnapshot(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, this._CW, this._CH);

    const scene = this;
    const brief = this._brief;

    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;

      y += TabletUI.drawTitle(cctx, y, 'MISSION BRIEF', {});
      y += TabletUI.drawSubtitle(cctx, y, 'INBOX  //  UPDATES  //  INTEL', {});
      y += TabletUI.drawDivider(cctx, y, cw);
      y += TabletUI.drawHeader(cctx, y, `Intelligence Report — Attack ${scene.attackNum}`, cw);
      y += 4;
      y += TabletUI.drawBody(cctx, y, brief.body, cw, { highlights: brief.highlights });
      y += 16;

      scene._btnDeployY = y;
      y += TabletUI.drawButton(cctx, y, 'DEPLOY', cw);

      return y;
    }, { alpha: this._alpha });
  }
}


