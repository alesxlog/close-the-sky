
class GameOverScene extends SceneBase {
  constructor(canvas, ctx, stats, onRestart, onMenu) {
    super(canvas, ctx);
    this.stats     = stats;
    this.onRestart = onRestart;
    this.onMenu    = onMenu;
    this._tablet   = new TabletUI(canvas, ctx);

    this._btnRestartY = 0;
    this._btnMenuY    = 0;

    // Typewriter state
    this._typeText = stats.win
      ? 'Congratulations! You have successfully closed the sky over your city. The North Atlantic Council was very impressed and decided to invite you to join NATO.'
      : 'Your city has fallen silent. Streets once full of life now lie empty — no power, no water, no way home. The sky belonged to the enemy today.';
    this._typeIndex = 0;
    this._typeTimer = 0;
    this._typeSpeed = 35; // ms per character

    this._tablet.registerListeners(this);
    this._on(this.canvas, 'click', (e) => this._handleClick(e), true);
    this._on(window, 'keydown', (e) => {
      if (e.code === 'KeyR' || e.code === 'Space') this.onRestart();
      if (e.code === 'Escape' || e.code === 'KeyM') this.onMenu();
    });
  }

  _handleClick(e) {
    const { x, y } = this._canvasXY(e);
    const hit = this._tablet.hitTest(x, y);
    if (!hit) return;
    const cw = this._tablet.SCREEN_W - this._tablet.CONTENT_PAD * 2;
    if (hit.x >= 0 && hit.x <= cw) {
      if (hit.y >= this._btnRestartY && hit.y <= this._btnRestartY + 48) {
        if (this.stats.win) {
          // JOIN NATO - start Arcade mode on Wave 11 with saved loadout
          this._startArcadeWave11();
        } else {
          this.onRestart();
        }
      }
      if (hit.y >= this._btnMenuY && hit.y <= this._btnMenuY + 48) this.onMenu();
    }
  }

  _startArcadeWave11() {
    // Save current player loadout when winning Campaign
    const savedLoadout = this._savePlayerLoadout();
    
    // Start Arcade mode on Wave 11 with saved loadout
    if (this.onRestart) {
      this.onRestart('arcade', 11, savedLoadout);
    }
  }

  _savePlayerLoadout() {
    // Extract player's current loadout from the completed Campaign
    // This should be called when player wins Campaign
    const loadout = {
      vehicle: this.stats.playerVehicle || 'lav',
      weapons: this.stats.playerWeapons || ['autocannon', 'sam'],
      upgrades: this.stats.playerUpgrades || ['mg_double', 'ac_double']
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('natoLoadout', JSON.stringify(loadout));
    return loadout;
  }

  _getPlayerVehicle() {
    // Get current vehicle type from stats
    return this.stats.playerVehicle || 'lav';
  }

  _getPlayerWeapons() {
    // Get current weapons from stats
    return this.stats.playerWeapons || ['autocannon', 'sam'];
  }

  _getPlayerUpgrades() {
    // Get current upgrades from stats
    return this.stats.playerUpgrades || ['mg_double', 'ac_double'];
  }

  update(dt) {
    this._fadeIn(dt);
    this._tablet.updateScroll(dt);

    // Typewriter advance
    this._typeTimer += dt * 1000;
    while (this._typeTimer >= this._typeSpeed && this._typeIndex < this._typeText.length) {
      this._typeIndex++;
      this._typeTimer -= this._typeSpeed;
    }
  }

  draw(ctx) {
    CityBackground.get().drawSnapshot(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, this._CW, this._CH);

    const scene = this;
    const s = this.stats;
    const visibleText = this._typeText.substring(0, this._typeIndex);
    const showCaret = this._typeIndex < this._typeText.length;

    this._tablet.draw(ctx, (cctx, cw) => {
      let y = 0;

      const titleColor = s.win ? '#44ff88' : '#e04040';
      const titleText  = s.win ? 'SKY CLOSED' : 'GAME OVER';
      y += TabletUI.drawTitle(cctx, y, titleText, { center: true, width: cw, color: titleColor });
      y += TabletUI.drawDivider(cctx, y, cw);
      y += 4;

      // Typewriter body
      const bodyH = TabletUI.drawBody(cctx, y, visibleText, cw, {
        color: 'rgba(160,200,144,0.7)',
        lineHeight: 26,
      });
      // Blinking caret
      if (showCaret) {
        // Draw a thin line after last character — approximate position
        cctx.fillStyle = 'rgba(126,207,90,0.6)';
        const caretBlink = Math.floor(Date.now() / 500) % 2 === 0;
        if (caretBlink) {
          // Approximate caret position (end of last line)
          cctx.fillRect(cw * 0.05, y + bodyH - 12, 2, 16);
        }
      }
      y += bodyH + 8;

      // Stats
      if (s.mode === 'arcade' || s.win) {
        y += TabletUI.drawHeader(cctx, y, 'Final Results', cw);
        y += 4;
        y += TabletUI.drawStatRow(cctx, y, 'Waves Survived', String(s.waveNum), cw);
        const fmt = (ms) => {
          const sec = Math.floor(ms / 1000);
          const m = Math.floor(sec / 60), ss = sec % 60;
          return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
        };
        y += TabletUI.drawStatRow(cctx, y, 'Time Survived', fmt(s.timeElapsed || 0), cw);
        y += TabletUI.drawStatRow(cctx, y, 'Enemies Destroyed', String(s.kills), cw);
        y += TabletUI.drawStatRow(cctx, y, 'Points Earned', String(s.points), cw, { valueColor: '#f0e080' });
        y += 16;
      }

      // Footer buttons
      y += 8;
      scene._btnRestartY = y;
      y += TabletUI.drawButton(cctx, y, s.win ? 'JOIN NATO' : 'RESTART', cw);
      scene._btnMenuY = y;
      y += TabletUI.drawButton(cctx, y, 'MAIN MENU', cw, { secondary: true });

      return y;
    }, { centered: !s.win && s.mode !== 'arcade', alpha: this._alpha });
  }
}


