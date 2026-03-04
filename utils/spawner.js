// ============================================================
// CLOSE THE SKY — spawner.js
// Wave-aware spawner. Reads from WAVES (waves.js).
// Campaign: roster with from/weight/max, counts spawned enemies.
// Arcade: phase1 roster, phase2 sequence+triggered, phase3 procedural.
// ============================================================

class Spawner {
  constructor() {
    this.G = CONFIG.GAME;

    this._lastSpawnTime   = 0;
    this._nextSpawnDelay  = 0;
    this._spawnLockUntil  = 0;
    this._activeEnemies   = [];

    // Shared
    this._intervalMin  = 3000;
    this._intervalMax  = 5000;
    this._spawnCount   = [1];
    this._maxSim       = 3;

    // Campaign state
    this._campaignRoster    = [];
    this._spawnedByType     = {};

    // Arcade state
    this._arcadeMode        = false;
    this._arcadePhase       = 1;
    this._arcadeWave        = 1;
    this._arcadeCumulative  = 0;
    this._arcadeWaveSpawned = 0;
    this._arcadeWaveTotal   = 0;
    this._arcadeSeqIndex    = 0;
    this._arcadeSeqSpawned  = 0;
    this._arcadeRoster      = [];
    this._arcadeSpeedMult   = 1.0;
  }

  // ---- CAMPAIGN ----

  resetCampaign(attackNum) {
    const cfg = WAVES.campaign['attack' + attackNum];
    this._arcadeMode        = false;
    this._intervalMin       = cfg.spawnMin;
    this._intervalMax       = cfg.spawnMax;
    this._spawnCount        = Array.isArray(cfg.spawnCount) ? cfg.spawnCount : [cfg.spawnCount];
    this._maxSim            = cfg.maxSim;
    this._campaignRoster    = cfg.roster;
    this._spawnedByType     = {};
    this._lastSpawnTime     = performance.now();
    this._nextSpawnDelay    = this._randomInterval();
    this._attackStartTime   = performance.now();
  }

  // ---- ARCADE ----

  resetArcade() {
    this._arcadeMode       = true;
    this._arcadePhase      = 1;
    this._arcadeWave       = 1;
    this._arcadeCumulative = 0;
    this._arcadeSpeedMult  = 1.0;
    this._spawnedByType    = {};
    this._loadArcadeWave(1);
  }

  _loadArcadeWave(waveNum) {
    this._arcadeWave        = waveNum;
    this._arcadeWaveSpawned = 0;
    this._arcadeSeqIndex    = 0;
    this._arcadeSeqSpawned  = 0;

    const P3start = WAVES.arcade.phase3.startWave;
    const P2      = WAVES.arcade.phase2;

    if (waveNum <= 5) {
      this._arcadePhase = 1;
      const ph1  = WAVES.arcade.phase1;
      const wIdx = waveNum - 1;
      this._arcadeWaveTotal = ph1.waves[wIdx] ? ph1.waves[wIdx].total : ph1.waves[ph1.waves.length - 1].total;
      this._intervalMin     = ph1.spawnMin;
      this._intervalMax     = ph1.spawnMax;
      this._spawnCount      = Array.isArray(ph1.spawnCount) ? ph1.spawnCount : [ph1.spawnCount];
      this._maxSim          = ph1.maxSim;
      this._arcadeRoster    = ph1.roster;

    } else if (waveNum < P3start) {
      this._arcadePhase = 2;
      const wDef = P2[waveNum - 6];
      this._arcadeWaveTotal = wDef.total;
      this._intervalMin     = wDef.spawnMin;
      this._intervalMax     = wDef.spawnMax;
      this._spawnCount      = Array.isArray(wDef.spawnCount) ? wDef.spawnCount : [wDef.spawnCount];
      this._maxSim          = wDef.maxSim;
      this._arcadeSequence  = wDef.sequence || [];
      this._arcadeTriggered = (wDef.triggered || []).slice();

    } else {
      this._arcadePhase = 3;
      this._loadPhase3Wave(waveNum);
    }

    this._lastSpawnTime  = performance.now();
    this._nextSpawnDelay = this._randomInterval();
  }

  _loadPhase3Wave(waveNum) {
    const P3  = WAVES.arcade.phase3;
    const rel = waveNum - P3.startWave;

    this._arcadeWaveTotal = Math.min(
      P3.total.cap,
      P3.total.start + Math.floor(rel / P3.total.every) * P3.total.increment
    );
    this._maxSim = Math.min(
      P3.maxSim.cap,
      P3.maxSim.start + Math.floor(rel / P3.maxSim.every) * P3.maxSim.increment
    );
    this._intervalMin = Math.max(
      P3.spawnMin.floor,
      P3.spawnMin.start - Math.floor(rel / P3.spawnMin.every) * P3.spawnMin.decrement
    );
    this._intervalMax = Math.max(
      P3.spawnMax.floor,
      P3.spawnMax.start - Math.floor(rel / P3.spawnMax.every) * P3.spawnMax.decrement
    );
    this._spawnCount = rel >= 10 ? P3.spawnCount.cap : P3.spawnCount.start;
    this._arcadeSpeedMult = Math.min(
      P3.speedMultiplier.cap,
      P3.speedMultiplier.start + Math.floor(rel / P3.speedMultiplier.every) * P3.speedMultiplier.increment
    );
    this._phase3HighTierRatio = Math.min(
      P3.highTierRatio.cap,
      P3.highTierRatio.start + Math.floor(rel / P3.highTierRatio.every) * P3.highTierRatio.increment
    );
    this._arcadeRoster = P3.roster;
  }

  // ---- SHARED ----

  triggerSpawnLock() {
    this._spawnLockUntil = performance.now() + WAVES.spawnLockAfterDeath;
  }

  setEnemyList(list) {
    this._activeEnemies = list;
  }

  isWaveComplete() {
    if (!this._arcadeMode) return false;
    return this._arcadeWaveSpawned >= this._arcadeWaveTotal;
  }

  nextWave() {
    this._loadArcadeWave(this._arcadeWave + 1);
  }

  getArcadeWave() {
    return this._arcadeWave;
  }

  // Main update — returns array of new enemy instances
  update(totalSpawnedThisAttack) {
    const now = performance.now();

    if (now < this._spawnLockUntil)                       return [];
    if (this._activeEnemies.length >= this._maxSim)       return [];
    if (now - this._lastSpawnTime < this._nextSpawnDelay) return [];

    this._lastSpawnTime  = now;
    this._nextSpawnDelay = this._randomInterval();

    if (this._arcadeMode) return this._spawnArcadeBatch();
    return this._spawnCampaignBatch(totalSpawnedThisAttack);
  }

  // ---- CAMPAIGN SPAWNING ----

  _spawnCampaignBatch(totalSpawned) {
    const batch  = [];
    const count  = this._pickSpawnCount();
    const slots  = this._maxSim - this._activeEnemies.length;
    const actual = Math.min(count, slots);

    for (let i = 0; i < actual; i++) {
      const type = this._pickCampaignType(totalSpawned + batch.length);
      if (!type) break;
      const enemy = this._makeEnemy(type);
      if (enemy) {
        batch.push(enemy);
        this._spawnedByType[type] = (this._spawnedByType[type] || 0) + 1;
      }
    }
    return batch;
  }

  _pickCampaignType(spawnedSoFar) {
    const available = this._campaignRoster.filter(r => {
      if (r.from > spawnedSoFar) return false;
      if (r.max !== undefined && (this._spawnedByType[r.type] || 0) >= r.max) return false;
      if (!this._canSpawn(r.type)) return false;
      return true;
    });
    if (available.length === 0) return null;
    return this._weightedPick(available);
  }

  // ---- ARCADE SPAWNING ----

  _spawnArcadeBatch() {
    if (this._arcadePhase === 1) return this._spawnPhase1Batch();
    if (this._arcadePhase === 2) return this._spawnPhase2Batch();
    if (this._arcadePhase === 3) return this._spawnPhase3Batch();
    return [];
  }

  _spawnPhase1Batch() {
    const batch  = [];
    const count  = this._pickSpawnCount();
    const slots  = this._maxSim - this._activeEnemies.length;
    const actual = Math.min(count, slots);

    for (let i = 0; i < actual; i++) {
      if (this._arcadeWaveSpawned >= this._arcadeWaveTotal) break;
      const available = this._arcadeRoster.filter(r => {
        if (r.from > this._arcadeCumulative) return false;
        if (r.max !== undefined && (this._spawnedByType[r.type] || 0) >= r.max) return false;
        return this._canSpawn(r.type);
      });
      if (available.length === 0) break;
      const type  = this._weightedPick(available);
      const enemy = this._makeEnemy(type);
      if (enemy) {
        batch.push(enemy);
        this._arcadeWaveSpawned++;
        this._arcadeCumulative++;
        this._spawnedByType[type] = (this._spawnedByType[type] || 0) + 1;
      }
    }
    return batch;
  }

  _spawnPhase2Batch() {
    const batch = [];
    const slots = this._maxSim - this._activeEnemies.length;
    let   added = 0;

    // Triggered enemies — fire at specific wave-enemy counts
    if (this._arcadeTriggered) {
      for (let i = this._arcadeTriggered.length - 1; i >= 0; i--) {
        const t = this._arcadeTriggered[i];
        if (this._arcadeWaveSpawned >= t.spawnAt && added < slots) {
          const enemy = this._makeEnemy(t.type);
          if (enemy) {
            batch.push(enemy);
            added++;
            this._arcadeWaveSpawned++;
            this._arcadeCumulative++;
          }
          this._arcadeTriggered.splice(i, 1);
        }
      }
    }

    // Sequence groups
    const count  = this._pickSpawnCount();
    const actual = Math.min(count, slots - added);

    for (let i = 0; i < actual; i++) {
      if (this._arcadeWaveSpawned >= this._arcadeWaveTotal) break;

      while (
        this._arcadeSeqIndex < this._arcadeSequence.length &&
        this._arcadeSeqSpawned >= this._arcadeSequence[this._arcadeSeqIndex].count
      ) {
        this._arcadeSeqIndex++;
        this._arcadeSeqSpawned = 0;
      }
      if (this._arcadeSeqIndex >= this._arcadeSequence.length) break;

      const group = this._arcadeSequence[this._arcadeSeqIndex];
      const type  = group.types[Math.floor(Math.random() * group.types.length)];
      if (!this._canSpawn(type)) continue;

      const enemy = this._makeEnemy(type);
      if (enemy) {
        batch.push(enemy);
        this._arcadeSeqSpawned++;
        this._arcadeWaveSpawned++;
        this._arcadeCumulative++;
      }
    }
    return batch;
  }

  _spawnPhase3Batch() {
    const batch      = [];
    const count      = this._pickSpawnCount();
    const slots      = this._maxSim - this._activeEnemies.length;
    const actual     = Math.min(count, slots);
    const P3         = WAVES.arcade.phase3;
    const highTiers  = ['kh555', 'kalibr', 'kh101'];
    const htOnScreen = this._activeEnemies.filter(e => highTiers.includes(e.type)).length;

    for (let i = 0; i < actual; i++) {
      if (this._arcadeWaveSpawned >= this._arcadeWaveTotal) break;

      const wantHighTier = Math.random() < this._phase3HighTierRatio &&
                           htOnScreen < WAVES.maxSimHighTier;

      let available = P3.roster.filter(r => {
        const isHT = highTiers.includes(r.type);
        if (wantHighTier !== isHT) return false;
        return this._canSpawn(r.type);
      });
      if (available.length === 0) {
        available = P3.roster.filter(r => this._canSpawn(r.type));
      }
      if (available.length === 0) break;

      const type  = this._weightedPick(available);
      const enemy = this._makeEnemy(type);
      if (enemy) {
        if (this._arcadeSpeedMult !== 1.0) enemy.speedMult = this._arcadeSpeedMult;
        batch.push(enemy);
        this._arcadeWaveSpawned++;
        this._arcadeCumulative++;
      }
    }
    return batch;
  }

  // ---- HELPERS ----

  _canSpawn(type) {
    const highTierTypes = ['kh555', 'kalibr', 'kh101'];
    if (highTierTypes.includes(type)) {
      const count = this._activeEnemies.filter(e => highTierTypes.includes(e.type)).length;
      if (count >= WAVES.maxSimHighTier) return false;
    }
    if (type === 'kh101') {
      const count = this._activeEnemies.filter(e => e.type === 'kh101').length;
      if (count >= WAVES.maxSimKh101) return false;
    }
    return true;
  }

  _weightedPick(roster) {
    const total = roster.reduce((sum, r) => sum + (r.weight || 1), 0);
    let   rand  = Math.random() * total;
    for (const r of roster) {
      rand -= (r.weight || 1);
      if (rand <= 0) return r.type;
    }
    return roster[roster.length - 1].type;
  }

  _pickSpawnCount() {
    const arr = Array.isArray(this._spawnCount) ? this._spawnCount : [this._spawnCount];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _makeEnemy(type) {
    const cfg = CONFIG.ENEMIES[type.toUpperCase()];
    const x   = cfg.spawnXMin + Math.random() * (cfg.spawnXMax - cfg.spawnXMin);
    return createEnemy(type, x);
  }

  _randomInterval() {
    return this._intervalMin + Math.random() * (this._intervalMax - this._intervalMin);
  }
}
