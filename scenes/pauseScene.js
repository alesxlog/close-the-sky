
class PauseScene extends SceneBase {
  constructor(canvas, ctx, snapshot, gameState, onResume, onRestart, onExit) {
    super(canvas, ctx);
    this._snapshot  = snapshot;
    this._gs        = gameState;
    this.onResume   = onResume;
    this.onRestart  = onRestart;
    this.onExit     = onExit;
    this._tablet    = new TabletUI(canvas, ctx);

    this._btnResumeY  = 0;
    this._btnRestartY = 0;
    this._btnExitY    = 0;

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
    this._on(window, 'keydown', (e) => {
      if (e.code === 'Escape') this.onResume();
    });
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;
    if (hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnResumeY  && hit.y <= this._btnResumeY + 48)  this.onResume();
      if (hit.y >= this._btnRestartY && hit.y <= this._btnRestartY + 48) this.onRestart();
      if (hit.y >= this._btnExitY    && hit.y <= this._btnExitY + 48)    this.onExit();
    }
  }

  update(dt) {
    this._fadeIn(dt, 4);
    this._tablet.updateScroll(dt);
  }

  draw(ctx) {
    // Frozen game frame
    if (this._snapshot) {
      ctx.drawImage(this._snapshot, 0, 0);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, this._CW, this._CH);

    const scene = this;
    const gs = this._gs;
    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;

      y += TabletUI.drawTitle(cctx, y, 'GAME PAUSED', { center: true, width: cw });

      const modeLabel = gs.mode === 'campaign'
        ? `Attack ${gs.attackNum} — Wave ${gs.waveNum}`
        : `Wave ${gs.waveNum}`;
      y += TabletUI.drawSubtitle(cctx, y, modeLabel, { center: true, width: cw });
      y += TabletUI.drawDivider(cctx, y, cw);
      y += 4;

      // Quick stats
      const fmt = (ms) => {
        const s = Math.floor(ms / 1000);
        return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
      };
      y += TabletUI.drawStatRow(cctx, y, 'Time Elapsed', fmt(gs.timeElapsed || 0), cw);
      y += TabletUI.drawStatRow(cctx, y, 'Enemies Destroyed', String(gs.kills), cw);
      y += TabletUI.drawStatRow(cctx, y, 'Points', String(gs.points), cw, { valueColor: '#f0e080' });
      y += 16;

      scene._btnResumeY = y;
      y += TabletUI.drawButton(cctx, y, 'CONTINUE', cw);
      scene._btnRestartY = y;
      y += TabletUI.drawButton(cctx, y, 'RESTART', cw, { secondary: true });
      scene._btnExitY = y;
      y += TabletUI.drawButton(cctx, y, 'EXIT TO MENU', cw, { secondary: true });

      return y;
    }, { centered: true, alpha: this._alpha });
  }
}


