
class MenuScene extends SceneBase {
  constructor(canvas, ctx, onSelect) {
    super(canvas, ctx);
    this.onSelect = onSelect;
    this._tablet  = new TabletUI(canvas, ctx);

    // Button Y positions (content-space) — set during render
    this._btnArcadeY   = 0;
    this._btnCampaignY = 0;

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
    this._on(window, 'keydown', (e) => {
      if (e.code === 'KeyE' || e.code === 'Digit1') this.onSelect('arcade');
      if (e.code === 'KeyC' || e.code === 'Digit2') this.onSelect('campaign');
    });
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;
    if (hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnArcadeY && hit.y <= this._btnArcadeY + 48) {
        this.onSelect('arcade');
      }
      if (hit.y >= this._btnCampaignY && hit.y <= this._btnCampaignY + 48) {
        this.onSelect('campaign');
      }
    }
  }

  update(dt) {
    this._fadeIn(dt);
    this._tablet.updateScroll(dt);
  }

  draw(ctx) {
    CityBackground.get().drawSnapshot(ctx);

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, this._CW, this._CH);

    const scene = this;
    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;

      y += TabletUI.drawTitle(cctx, y, 'MAIN MENU', { center: true, width: cw });
      y += TabletUI.drawSubtitle(cctx, y, 'Close the Sky — Air Defence Simulator', { center: true, width: cw });
      y += TabletUI.drawDivider(cctx, y, cw);
      y += 8;
      y += TabletUI.drawBody(cctx, y, 'Select your mission, Commander. The skies won\'t defend themselves.', cw);
      y += 16;

      scene._btnArcadeY = y;
      y += TabletUI.drawButton(cctx, y, 'START ARCADE', cw);
      scene._btnCampaignY = y;
      y += TabletUI.drawButton(cctx, y, 'LAUNCH CAMPAIGN', cw, { secondary: true });

      // Controls hint
      y += 16;
      cctx.font = `13px ${scene._FONT}`;
      cctx.fillStyle = 'rgba(126,207,90,0.25)';
      cctx.textAlign = 'center';
      cctx.fillText('WASD / ARROWS — move   SPACE — fire', cw / 2, y + 13);
      cctx.textAlign = 'left';
      y += 30;

      return y;
    }, { centered: true, alpha: this._alpha });
  }
}


