// ============================================================
// CLOSE THE SKY — gameScene.js
// Shared game loop for Campaign and Endless modes
// ============================================================

class GameScene {
  constructor(canvas, ctx, mode, onGameOver, onPitstop) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.mode = mode;           // 'campaign' | 'endless'
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
    this.points = 0;
    this.cumulativePoints = 0; // endless — never decremented

    // Attack / wave tracking
    this.attackNum = 1;
    this.waveNum = 1;
    this._waveEnemiesLeft = 0;
    this._attackEnemiesLeft = 0;

    // Weapon cooldowns
    this._cooldowns = { mg: 0, autocannon: 0 };

    // SAM state
    this._samState = { lockTarget: null, lockTimer: 0, cooldownUntil: 0 };

    // Timers
    this._spawnLocked = false;
    this._wavePauseTimer = 0;
    this._inWavePause = false;

    // Endless unlock state
    this._endlessStep = 0;
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
      this._spawner.reset(
        CONFIG.ENDLESS.PHASE1.spawnIntervalMin,
        CONFIG.ENDLESS.PHASE1.spawnIntervalMax,
        this._unlockedEnemyTypes
      );
      this._spawner.setEnemyList(this.enemies);
      this._waveEnemiesLeft = 20;
    }
  }

  _loadAttack(num) {
    const atk = CONFIG.ATTACKS[num - 1];
    this.attackNum = num;
    this.waveNum = 1;
    this._currentAttack = atk;
    this._currentWaveIndex = 0;
    this._attackEnemiesLeft = atk.totalEnemies;
    this._spawner.reset(atk.spawnIntervalMin, atk.spawnIntervalMax, atk.roster);
    this._spawner.setEnemyList(this.enemies);
  }

  _bindInput() {
    this._onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this._tryFire();
      }
    };
    window.addEventListener('keydown', this._onKey);
    this._onCanvasClick = () => this._tryFire();
    this.canvas.addEventListener('click', this._onCanvasClick);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKey);
    this.canvas.removeEventListener('click', this._onCanvasClick);
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------
  update(dt) {
    const now = performance.now();

    // Wave pause countdown
    if (this._inWavePause) {
      this._wavePauseTimer -= dt * 1000;
      if (this._wavePauseTimer <= 0) {
        this._inWavePause = false;
        this.waveNum++;
        if (this.mode === 'endless') this._checkEndlessEscalation();
      }
      // Still update existing entities during pause
      this._updateEntities(dt, now);
      return;
    }

    // Spawn
    const maxSim = this.mode === 'campaign'
      ? this._currentAttack.maxSimultaneous
      : this._getEndlessMaxSim();

    const newEnemy = this._spawner.update(maxSim, null);
    if (newEnemy) {
      this.enemies.push(newEnemy);
      if (this.mode === 'campaign') this._attackEnemiesLeft--;
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
        this.points += h.enemy.cfg.killPts;
        this.cumulativePoints += h.enemy.cfg.killPts;
        if (this.mode === 'endless') this._checkEndlessUpgrades();
      }
    }

    // Enemies reaching bottom
    Collision.checkBottomReached(this.enemies, this.player, this.explosions);

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
    this.lives--;

    if (this.lives <= 0) {
      this._endGame(false);
      return;
    }

    // Restart attack from wave 1
    this.player.resetHP();
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
        const atk = this._currentAttack;
        if (atk.pitstopAfter) {
          this.player.resetHP();
          this.onPitstop({
            points: this.points,
            player: this.player,
            attackNum: this.attackNum,
          });
        } else {
          // Attack 5 complete — win
          this._endGame(true);
        }
      }
    } else {
      // Endless — wave complete when enemies cleared and none left to spawn
      if (this.enemies.length === 0 && !this._inWavePause) {
        this._inWavePause = true;
        this._wavePauseTimer = CONFIG.ENDLESS.WAVE_PAUSE;
      }
    }
  }

  _endGame(win) {
    this.onGameOver({
      win,
      kills: this.kills,
      points: this.points,
      mode: this.mode,
      attackNum: this.attackNum,
      waveNum: this.waveNum,
    });
  }

  // ----------------------------------------------------------
  // ENDLESS — upgrades + escalation
  // ----------------------------------------------------------
  _checkEndlessUpgrades() {
    const steps = CONFIG.ENDLESS.UPGRADES;
    while (this._endlessStep < steps.length) {
      const step = steps[this._endlessStep];
      if (this.cumulativePoints >= step.cumulative) {
        this._applyEndlessUpgrade(step);
        this._endlessStep++;
      } else break;
    }
  }

  _applyEndlessUpgrade(step) {
    const p = this.player;
    switch (step.upgrade) {
      case 'mg_double':
        p.upgradeDoubleBarrel('mg');
        break;
      case 'lav_autocannon':
        p.upgradeToLAV();
        break;
      case 'sam':
        p.addWeapon('sam');
        break;
      case 'ac_double':
        p.upgradeDoubleBarrel('autocannon');
        break;
      case 'sam_2rockets': {
        const sam = p.weapons.find(w => w.id === 'sam');
        if (sam) sam.twoRockets = true;
        break;
      }
    }
    if (step.enemyUnlock) {
      this._unlockedEnemyTypes.push(step.enemyUnlock);
      this._spawner.unlock(step.enemyUnlock);
    }
    // Visual notification
    this._upgradeMsg = `UPGRADE: ${step.upgrade.toUpperCase().replace('_', ' ')}`;
    this._upgradeMsgTimer = 3000;
  }

  _checkEndlessEscalation() {
    const P3 = CONFIG.ENDLESS.PHASE3;
    if (this.waveNum < P3.startWave) return;

    const wavesSince = this.waveNum - P3.startWave;
    const newSim = Math.min(
      P3.startSimultaneous + Math.floor(wavesSince / 3) * P3.simultaneousIncrement,
      P3.simultaneousCap
    );
    this._endlessMaxSim = newSim;
  }

  _getEndlessMaxSim() {
    return this._endlessMaxSim || CONFIG.ENDLESS.START_SIMULTANEOUS;
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
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      lives: this.lives,
      kills: this.kills,
      points: this.points,
      vehicleId: this.player.vehicle.id,
      mode: this.mode,
      attackNum: this.attackNum,
      waveNum: this.waveNum,
    });

    // Wave pause overlay
    if (this._inWavePause) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${this.waveNum} CLEAR`, CONFIG.CANVAS.WIDTH / 2, 200);
      ctx.textAlign = 'left';
    }

    // Endless upgrade notification
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
