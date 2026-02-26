// ============================================================
// CLOSE THE SKY — spawner.js
// Handles enemy spawn timing, X positioning, fairness rules
// ============================================================

class Spawner {
  constructor() {
    this.G = CONFIG.GAME;
    this._lastSpawnTime = 0;
    this._nextSpawnDelay = 0;
    this._spawnLockUntil = 0;
    this._activeEnemies = []; // reference — set externally
    this._unlockedTypes = ['geran1', 'geran2'];
    this._attackStartTime = 0;
  }

  // Called when a new attack/wave begins
  reset(intervalMin, intervalMax, unlockedTypes) {
    this._intervalMin = intervalMin;
    this._intervalMax = intervalMax;
    this._unlockedTypes = unlockedTypes || ['geran1', 'geran2'];
    this._lastSpawnTime = performance.now();
    this._nextSpawnDelay = this._randomInterval();
    this._attackStartTime = performance.now();
  }

  // Called after car is destroyed
  triggerSpawnLock() {
    this._spawnLockUntil = performance.now() + this.G.SPAWN_LOCK_AFTER_DEATH;
  }

  // Set reference to active enemy array (for simultaneous count checks)
  setEnemyList(list) {
    this._activeEnemies = list;
  }

  // Unlock a new enemy type
  unlock(type) {
    if (!this._unlockedTypes.includes(type)) {
      this._unlockedTypes.push(type);
    }
  }

  // Main update — returns a new enemy instance or null
  update(maxSimultaneous, roster) {
    const now = performance.now();

    // Spawn lock active
    if (now < this._spawnLockUntil) return null;

    // Too many enemies on screen
    if (this._activeEnemies.length >= maxSimultaneous) return null;

    // Not time yet
    if (now - this._lastSpawnTime < this._nextSpawnDelay) return null;

    // Pick a valid enemy type from roster ∩ unlocked
    const available = (roster || this._unlockedTypes).filter(t =>
      this._unlockedTypes.includes(t) && this._canSpawn(t, now)
    );
    if (available.length === 0) return null;

    const type = available[Math.floor(Math.random() * available.length)];
    const x = this._spawnX(type);

    this._lastSpawnTime = now;
    this._nextSpawnDelay = this._randomInterval();

    return createEnemy(type, x);
  }

  // ---- PRIVATE ----

  _canSpawn(type, now) {
    // No high-tier in first 15s of attack
    const sinceStart = now - this._attackStartTime;
    const isHighTier = ['kalibr', 'kh101'].includes(type);
    if (isHighTier && sinceStart < this.G.NO_HIGHTIER_FIRST) return false;

    // Max 2 simultaneous high-tier (Kh-555+)
    const highTierTypes = ['kh555', 'kalibr', 'kh101'];
    if (highTierTypes.includes(type)) {
      const highTierCount = this._activeEnemies.filter(e =>
        highTierTypes.includes(e.type)
      ).length;
      if (highTierCount >= this.G.MAX_SIMULTANEOUS_HIGHTIER) return false;
    }

    // Max 2 simultaneous Kh-101
    if (type === 'kh101') {
      const kh101Count = this._activeEnemies.filter(e => e.type === 'kh101').length;
      if (kh101Count >= this.G.MAX_SIMULTANEOUS_KH101) return false;
    }

    return true;
  }

  _spawnX(type) {
    const cfg = CONFIG.ENEMIES[type.toUpperCase()];
    const min = cfg.spawnXMin;
    const max = cfg.spawnXMax;
    return min + Math.random() * (max - min);
  }

  _randomInterval() {
    return this._intervalMin + Math.random() * (this._intervalMax - this._intervalMin);
  }
}
