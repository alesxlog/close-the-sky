// ============================================================
// CLOSE THE SKY — gameScene.js
// Shared game loop for Campaign and Arcade modes.
// Pause overlay extracted to PauseScene.
// ============================================================

class GameScene {
  constructor(canvas, ctx, mode, onGameOver, onPitstop, onPause, waveNum = null, savedLoadout = null) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.mode = mode;           // 'campaign' | 'arcade'
    this.onGameOver = onGameOver;
    this.onPitstop = onPitstop; // campaign only
    this.onPause = onPause;     // triggers PauseScene
    this.arcadeWaveNum = waveNum; // For starting Arcade at specific wave
    this.savedLoadout = savedLoadout; // Saved vehicle and weapons

    // Systems
    this._bg = CityBackground.get();
    this._hud = new HUD();
    this._spawner = new Spawner();

    // Game state
    this.player = new Player('truck');
    this.player.addWeapon('mg');
    
    // Apply saved loadout if provided (for JOIN NATO functionality)
    if (this.savedLoadout) {
      this._applySavedLoadout();
    }

    this.enemies = [];
    this.projectiles = [];
    this.explosions = [];

    this.lives = CONFIG.GAME.LIVES;
    this.kills = 0;
    this.killsByType   = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this.spawnedByType = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };

    this.points = 0;
    this.cumulativePoints = 0;
    this.timeElapsed = 0; // ms

    // Attack / wave tracking
    this.attackNum = 1;
    this.waveNum = 1;
    this._waveStarted = false;
    this._attackEnemiesLeft = 0;

    // Weapon cooldowns
    this._cooldowns = { 
      mg: (typeof TUNING !== 'undefined' ? TUNING.MG_COOLDOWN : 500), 
      autocannon: (typeof TUNING !== 'undefined' ? TUNING.AUTOCANNON_COOLDOWN : 300) 
    };

    // SAM state
    this._samState = { 
      lockTarget: null, 
      lockTimer: (typeof TUNING !== 'undefined' ? TUNING.SAM_LOCK_DELAY : 300), 
      cooldownUntil: 0 
    };

    // Timers
    this._spawnLocked = false;
    this._wavePauseTimer = 0;
    this._inWavePause = false;

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
      
      // Start at specific wave if provided (for JOIN NATO)
      if (this.arcadeWaveNum) {
        this.waveNum = this.arcadeWaveNum;
        this._spawner.loadArcadeWave(this.arcadeWaveNum);
      }
    }
  }

  _applySavedLoadout() {
    if (!this.savedLoadout) return;
    
    // Apply vehicle
    if (this.savedLoadout.vehicle) {
      this.player = new Player(this.savedLoadout.vehicle);
    }
    
    // Apply weapons
    if (this.savedLoadout.weapons) {
      this.savedLoadout.weapons.forEach(weapon => {
        this.player.addWeapon(weapon);
      });
    }
    
    // Apply upgrades
    if (this.savedLoadout.upgrades) {
      this.savedLoadout.upgrades.forEach(upgrade => {
        this.player.applyUpgrade(upgrade);
      });
    }
  }

  _getNatoLoadout() {
    // Get saved NATO loadout from localStorage
    const saved = localStorage.getItem('natoLoadout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse NATO loadout:', e);
        return null;
      }
    }
    return null;
  }

  _loadAttack(num) {
    const atk = WAVES.campaign['attack' + num];
    this.attackNum = num;
    this.waveNum = 1;
    this._attackEnemiesLeft = atk.total;
    this._spawnedThisAttack = 0;
    this._gameEnded = false;
    this.spawnedByType = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this.killsByType   = { geran1: 0, geran2: 0, geran3: 0, kh555: 0, kalibr: 0, kh101: 0 };
    this._spawner.resetCampaign(num);
    this._spawner.setEnemyList(this.enemies);
  }

  _bindInput() {
    this._onKey = (e) => {
      if (e.code === 'Escape') {
        this.onPause();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this._tryFire();
      }
    };
    window.addEventListener('keydown', this._onKey);
    this._onCanvasClick = (e) => {
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
    const now = performance.now();

    this.timeElapsed += dt * 1000;

    // Wave pause countdown
    if (this._inWavePause) {
      this._wavePauseTimer -= dt * 1000;
      // Safety check for NaN
      if (isNaN(this._wavePauseTimer)) {
        this._wavePauseTimer = 4000;
      }
      if (this._wavePauseTimer <= 0) {
        this._inWavePause = false;
        this.waveNum++;
        if (this.mode === 'arcade') {
          this._spawner.nextWave();
          this._waveStarted = true; // Start the next wave
        }
      }
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
      if (this._attackEnemiesLeft <= 0 && this.enemies.length === 0) {
        const atkMeta = WAVES.campaign['attack' + this.attackNum];
        if (atkMeta.pitstopAfter) {
          if (this._gameEnded) return;
          this._gameEnded = true;
          this.player.resetHP();

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

          setTimeout(() => this.onPitstop(aarData), 1500);

        } else {
          if (!this._gameEnded) {
            this._gameEnded = true;
            setTimeout(() => this._endGame(true), 1500);
          }
        }
      }
    } else {
      if (this._spawner.isWaveComplete() && this.enemies.length === 0 && !this._inWavePause) {
        this._waveStarted = false;
        this._inWavePause = true;
        this._wavePauseTimer = WAVES.arcade.WAVE_PAUSE || 4000; // Ensure it's a number
      }
    }
  }

  _endGame(win, restart = false, exit = false) {
    // Extract player loadout data for JOIN NATO functionality
    const playerLoadout = this._extractPlayerLoadout();
    
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
      // Player loadout data for JOIN NATO
      playerVehicle: playerLoadout.vehicle,
      playerWeapons: playerLoadout.weapons,
      playerUpgrades: playerLoadout.upgrades,
    });
  }

  _extractPlayerLoadout() {
    // Extract current player loadout from game state
    const loadout = {
      vehicle: this.player.type || 'truck',
      weapons: this.player.weapons ? this.player.weapons.map(w => w.type) : ['mg'],
      upgrades: this.player.upgrades || []
    };
    return loadout;
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