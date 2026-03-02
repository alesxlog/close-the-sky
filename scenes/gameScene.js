// ============================================================
// CLOSE THE SKY — gameScene.js
// Shared game loop for Campaign and Arcade modes
// ============================================================

class GameScene {
  constructor(canvas, ctx, mode, onGameOver, onPitstop) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.mode = mode;           // 'campaign' | 'arcade'
    this.onGameOver = onGameOver;
    this.onPitstop = onPitstop; // campaign only

    // Systems
    this._bg = new Background();
    this._hud = new HUD();
    this._spawner = new Spawner();

    // Game state
    this.player = new Player('truck');
    this.player.addWeapon('mg');

    this.enemies = [];
    this.projectiles = [];
    this.explosions = [];

    this.lives = CONFIG.GAME.LIVES;
    this.kills = 0;
    this.killsByType   = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this.spawnedByType = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };

    // Pause state
    this._paused = false;
    this.points = 0;
    this.cumulativePoints = 0;
    this.timeElapsed = 0; // ms

    // Attack / wave tracking
    this.attackNum = 1;
    this.waveNum = 1;
    this._waveStarted = false; // prevents false wave-end at game start
    this._attackEnemiesLeft = 0;

    // Weapon cooldowns
    this._cooldowns = { mg: 0, autocannon: 0 };

    // SAM state
    this._samState = { lockTarget: null, lockTimer: 0, cooldownUntil: 0 };

    // Timers
    this._spawnLocked = false;
    this._wavePauseTimer = 0;
    this._inWavePause = false;

    // Arcade unlock state
    this._arcadeStep = 0;
    this._unlockedEnemyTypes = ['geran1', 'geran2'];

    this._initMode();
    this._bindInput();
  }

  // ----------------------------------------------------------
  // INIT
  // ----------------------------------------------------------
  _initMode() {
    if (this.mode === 'campaign') {
      this._loadAttack(1);
    } else {
      this._spawner.resetArcade();
      this._spawner.setEnemyList(this.enemies);
      this._waveStarted = false;
      this._inWavePause = false;
    }
  }

  _loadAttack(num) {
    const atk = WAVES.campaign['attack' + num];
    this.attackNum = num;
    this.waveNum = 1;
    this._attackEnemiesLeft = atk.total;
    this._spawnedThisAttack = 0;
    this.spawnedByType = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this.killsByType   = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this._spawner.resetCampaign(num);
    this._spawner.setEnemyList(this.enemies);
  }

  _bindInput() {
    this._onKey = (e) => {
      if (e.code === 'Escape') { this._paused = !this._paused; return; }
      if (e.code === 'Space') {
        e.preventDefault();
        this._tryFire();
      }
    };
    window.addEventListener('keydown', this._onKey);
    this._onCanvasClick = (e) => {
      if (this._paused && this._pauseBtns) {
        const rect   = this.canvas.getBoundingClientRect();
        const scaleX = CONFIG.CANVAS.WIDTH  / rect.width;
        const scaleY = CONFIG.CANVAS.HEIGHT / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top)  * scaleY;

        const [resume, restart, exit] = this._pauseBtns;
        if (x > resume.cx - resume.w/2 && x < resume.cx + resume.w/2 && y > resume.y && y < resume.y + resume.h) {
          this._paused = false;
        } else if (x > restart.cx - restart.w/2 && x < restart.cx + restart.w/2 && y > restart.y && y < restart.y + restart.h) {
          this._paused = false;
          this.destroy();
          // Signal restart via game over with restart flag
          this._endGame(false, true);
        } else if (x > exit.cx - exit.w/2 && x < exit.cx + exit.w/2 && y > exit.y && y < exit.y + exit.h) {
          this._paused = false;
          this.destroy();
          this._endGame(false, false, true);
        }
        return;
      }
      this._tryFire();
    };
    this.canvas.addEventListener('click', this._onCanvasClick);
  }

  destroy() {
    if (this._onKey) window.removeEventListener('keydown', this._onKey);
    if (this._onCanvasClick) this.canvas.removeEventListener('click', this._onCanvasClick);
    this._destroyed = true;
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------
  update(dt) {
    if (this._destroyed) return;
    if (this._paused) return;
    const now = performance.now();

    this.timeElapsed += dt * 1000;

    // Wave pause countdown
    if (this._inWavePause) {
      this._wavePauseTimer -= dt * 1000;
      if (this._wavePauseTimer <= 0) {
        this._inWavePause = false;
        this.waveNum++;
        if (this.mode === 'arcade') this._spawner.nextWave();
      }
      // Still update existing entities during pause
      this._updateEntities(dt, now);
      return;
    }

    // Spawn
    const newEnemies = this._spawner.update(this._spawnedThisAttack || 0);
    for (const e of newEnemies) {
      if (this.mode === 'campaign' && this._attackEnemiesLeft <= 0) break;
      this.enemies.push(e);
      this._waveStarted = true;
      if (this.mode === 'campaign') {
        this._attackEnemiesLeft--;
        this._spawnedThisAttack = (this._spawnedThisAttack || 0) + 1;
        if (this.spawnedByType[e.type] !== undefined) this.spawnedByType[e.type]++;
      }
    }

    // SAM auto-fire
    const rockets = Collision.updateSAM(this.player, this.enemies, this._samState, now);
    this.projectiles.push(...rockets);

    // Update all entities
    this._updateEntities(dt, now);

    // Collision
    const hits = Collision.check(this.projectiles, this.enemies, this.explosions);
    for (const h of hits) {
      if (h.killed) {
        this.kills++;
        if (this.killsByType[h.enemy.type] !== undefined) this.killsByType[h.enemy.type]++;
        this.points += h.enemy.cfg.killPts;
        this.cumulativePoints += h.enemy.cfg.killPts;
        if (this.mode === 'arcade') this._checkArcadeUpgrades();
      }
    }

    // Enemies reaching bottom
    Collision.checkBottomReached(this.enemies, this.explosions);

    // Vehicle collisions
    Collision.checkCarHit(this.enemies, this.player, this.explosions);

    // Clean up dead/off-screen entities
    this._cleanup();

    // Check player death
    if (this.player.isDestroyed()) {
      this._onPlayerDeath();
      return;
    }

    // Check wave / attack completion
    this._checkProgression();
  }

  _updateEntities(dt, now) {
    this.player.update(dt);
    for (const e of this.enemies) e.update(dt);
    for (const p of this.projectiles) p.update(dt);
    for (const ex of this.explosions) ex.update(dt);
  }

  _cleanup() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].dead || this.enemies[i].isOffScreen()) {
        this.enemies.splice(i, 1);
      }
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (this.projectiles[i].dead) this.projectiles.splice(i, 1);
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      if (this.explosions[i].done) this.explosions.splice(i, 1);
    }
  }

  // ----------------------------------------------------------
  // FIRING
  // ----------------------------------------------------------
  _tryFire() {
    const now = performance.now();
    for (const weapon of this.player.weapons) {
      if (weapon.id === 'mg' && now >= (this._cooldowns.mg || 0)) {
        this.projectiles.push(...createProjectiles(this.player));
        this._cooldowns.mg = now + CONFIG.WEAPONS.MG.cooldown;
      }
      if (weapon.id === 'autocannon' && now >= (this._cooldowns.autocannon || 0)) {
        this.projectiles.push(...createProjectiles(this.player));
        this._cooldowns.autocannon = now + CONFIG.WEAPONS.AUTOCANNON.cooldown;
      }
    }
  }

  // ----------------------------------------------------------
  // PLAYER DEATH
  // ----------------------------------------------------------
  _onPlayerDeath() {
    this.explosions.push(new Explosion(this.player.x, this.player.y));

    const hasBackup = this.player.activateNextVehicle();

    if (!hasBackup) {
      this._gameEnded = true;
      setTimeout(() => this._endGame(false), 500);
      return;
    }

    // Backup vehicle activated — clear field and respawn
    this.enemies = [];
    this.projectiles = [];
    this._spawner.triggerSpawnLock();
    this._samState = { lockTarget: null, lockTimer: 0, cooldownUntil: 0 };

    if (this.mode === 'campaign') {
      this._loadAttack(this.attackNum);
    }
  }

  // ----------------------------------------------------------
  // PROGRESSION
  // ----------------------------------------------------------
  _checkProgression() {
    if (this.mode === 'campaign') {
      // All enemies spawned and cleared
      if (this._attackEnemiesLeft <= 0 && this.enemies.length === 0) {
        const atk = WAVES.campaign['attack' + this.attackNum];
        const atkMeta = CONFIG.ATTACKS[this.attackNum - 1];
        if (atkMeta.pitstopAfter) {
          this.player.resetHP();

          // Capture frozen frame for AAR background
          const snap = document.createElement('canvas');
          snap.width  = CONFIG.CANVAS.WIDTH;
          snap.height = CONFIG.CANVAS.HEIGHT;
          snap.getContext('2d').drawImage(this.canvas, 0, 0);

          const aarData = {
            points:        this.points,
            player:        this.player,
            attackNum:     this.attackNum,
            killsByType:   Object.assign({}, this.killsByType),
            spawnedByType: Object.assign({}, this.spawnedByType),
            snapshot:      snap,
          };

          // Brief delay so last explosion settles before modal appears
          setTimeout(() => this.onPitstop(aarData), 1500);

        } else {
          this._endGame(true);
        }
      }
    } else {
      // Arcade — wave complete when spawner is done and screen is clear
      if (this._spawner.isWaveComplete() && this.enemies.length === 0 && !this._inWavePause) {
        this._waveStarted = false;
        this._inWavePause = true;
        this._wavePauseTimer = CONFIG.ARCADE.WAVE_PAUSE;
      }
    }
  }

  _endGame(win, restart = false, exit = false) {
    this.onGameOver({
      win,
      restart,
      exit,
      kills: this.kills,
      points: this.points,
      mode: this.mode,
      attackNum: this.attackNum,
      waveNum: this.waveNum,
      timeElapsed: this.timeElapsed,
    });
  }

  // ----------------------------------------------------------
  // ARCADE — upgrades
  // ----------------------------------------------------------
  _checkArcadeUpgrades() {
    const steps = CONFIG.ARCADE.UPGRADES;
    while (this._arcadeStep < steps.length) {
      const step = steps[this._arcadeStep];
      if (this.cumulativePoints >= step.cumulative) {
        this._applyArcadeUpgrade(step);
        this._arcadeStep++;
      } else break;
    }
  }

  _applyArcadeUpgrade(step) {
    const p = this.player;
    switch (step.upgrade) {
      case 'mg_double':      p.upgradeDoubleBarrel('mg');        break;
      case 'lav_autocannon': p.upgradeToLAV();                    break;
      case 'sam':            p.addWeapon('sam');                  break;
      case 'ac_double':      p.upgradeDoubleBarrel('autocannon'); break;
      case 'sam_2rockets': {
        const sam = p.weapons.find(w => w.id === 'sam');
        if (sam) sam.twoRockets = true;
        break;
      }
    }
    this._upgradeMsg = 'UPGRADE: ' + step.upgrade.toUpperCase().replace('_', ' ');
    this._upgradeMsgTimer = 3000;
  }

  // ----------------------------------------------------------
  // DRAW
  // ----------------------------------------------------------
  draw(ctx) {
    ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    this._bg.draw(ctx);

    // SAM radar
    this._drawRadar(ctx);

    // Entities
    for (const e of this.enemies) e.draw(ctx);
    for (const p of this.projectiles) p.draw(ctx);
    for (const ex of this.explosions) ex.draw(ctx);
    this.player.draw(ctx);

    // HUD
    this._hud.draw(ctx, {
      garage:    this.player.garage,
      hp:        this.player.hp,
      maxHp:     this.player.maxHp,
      kills:     this.kills,
      points:    this.points,
      mode:      this.mode,
      attackNum: this.attackNum,
      waveNum:   this.waveNum,
      timeElapsed: this.timeElapsed,
    });

    // Wave pause overlay
    if (this._inWavePause) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${this.waveNum} CLEAR`, CONFIG.CANVAS.WIDTH / 2, 200);
      ctx.textAlign = 'left';
    }

    // Arcade upgrade notification
    if (this._upgradeMsgTimer > 0) {
      this._upgradeMsgTimer -= 16;
      ctx.save();
      ctx.globalAlpha = Math.min(1, this._upgradeMsgTimer / 500);
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#44ff88';
      ctx.textAlign = 'center';
      ctx.fillText(this._upgradeMsg, CONFIG.CANVAS.WIDTH / 2, 160);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // Pause overlay — drawn last, on top of everything
    if (this._paused) this._drawPauseOverlay(ctx);
  }

  _drawPauseOverlay(ctx) {
    const CW = CONFIG.CANVAS.WIDTH;
    const CH = CONFIG.CANVAS.HEIGHT;
    const CX = CW / 2;
    const FONT = "'Share Tech Mono', monospace";

    // Night vision tint
    ctx.fillStyle = 'rgba(0, 48, 28, 0.78)';
    ctx.fillRect(0, 0, CW, CH);

    // Scanlines
    ctx.save();
    for (let y = 0; y < CH; y += 4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, y, CW, 2);
    }
    ctx.restore();

    // Header
    ctx.textAlign = 'center';
    ctx.font = `bold 56px ${FONT}`;
    ctx.fillStyle = '#44ffaa';
    ctx.fillText('GAME PAUSED', CX, 220);

    // Divider
    ctx.strokeStyle = 'rgba(68,255,170,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 300, 250); ctx.lineTo(CX + 300, 250);
    ctx.stroke();

    // Total kills
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillStyle = '#44ffaa';
    ctx.fillText('KILLED', CX, 300);

    // Kill breakdown
    const ENEMY_LABELS = {
      geran1: 'Geran-1',
      geran2: 'Geran-2',
      geran3: 'Geran-3',
      kh555:  'Kh-555',
      kalibr: 'Kalibr',
      kh101:  'Kh-101',
      total:  'TOTAL',
    };

    let rowY = 350;
    for (const [type, label] of Object.entries(ENEMY_LABELS)) {
      const count = type === 'total' ? this.kills : (this.killsByType[type] || 0);
      ctx.font = `18px ${FONT}`;
      ctx.fillStyle = count > 0 ? 'rgba(68,255,170,0.9)' : 'rgba(68,255,170,0.35)';
      ctx.textAlign = 'left';
      ctx.fillText(label, CX - 120, rowY);
      ctx.textAlign = 'right';
      ctx.font = `bold 18px ${FONT}`;
      ctx.fillText(`${count}`, CX + 120, rowY);
      rowY += 34;
    }

    // Divider
    ctx.strokeStyle = 'rgba(68,255,170,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 300, rowY + 10); ctx.lineTo(CX + 300, rowY + 10);
    ctx.stroke();

    // Buttons
    const BTN_W = 280, BTN_H = 60, BTN_GAP = 20;
    const btns = [
      { label: 'RESUME',         y: rowY + 40  },
      { label: 'RESTART',        y: rowY + 40 + BTN_H + BTN_GAP },
      { label: 'EXIT TO MENU',   y: rowY + 40 + (BTN_H + BTN_GAP) * 2 },
    ];

    for (const btn of btns) {
      ctx.fillStyle = 'rgba(0,80,40,0.7)';
      ctx.strokeStyle = 'rgba(68,255,170,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(CX - BTN_W/2, btn.y, BTN_W, BTN_H);
      ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillStyle = '#44ffaa';
      ctx.fillText(btn.label, CX, btn.y + 38);
    }

    // Store button Y positions for click detection
    this._pauseBtns = btns.map(b => ({ ...b, w: BTN_W, h: BTN_H, cx: CX }));

    ctx.textAlign = 'left';
  }

  _drawRadar(ctx) {
    if (!this.player.hasWeapon('sam')) return;
    const r = CONFIG.WEAPONS.SAM.radarRadius;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,100,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this._samState.lockTarget && !this._samState.lockTarget.dead) {
      const t = this._samState.lockTarget;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 28, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,100,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Lock progress arc
      const lockDelay = t.cfg.radarLockDelay || CONFIG.WEAPONS.SAM.lockOnDelay;
      const progress = Math.min(1, this._samState.lockTimer / lockDelay);
      ctx.beginPath();
      ctx.arc(t.x, t.y, 28, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,0,0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }
}
