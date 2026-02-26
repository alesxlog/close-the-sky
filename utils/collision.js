// ============================================================
// CLOSE THE SKY — collision.js
// Projectile vs enemy + SAM system
// ============================================================

const Collision = {

  // Check all projectiles against all enemies
  // Returns array of { enemy, explosion } for resolved hits
  check(projectiles, enemies, explosions) {
    const results = [];

    for (let pi = projectiles.length - 1; pi >= 0; pi--) {
      const proj = projectiles[pi];
      if (proj.dead) continue;

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const enemy = enemies[ei];
        if (enemy.dead || enemy.reachedBottom) continue;

        if (this._overlaps(proj, enemy)) {
          // Get damage with falloff if applicable
          const dmg = proj.getDamage
            ? proj.getDamage(enemy.y)
            : proj.damage;

          const killed = enemy.takeDamage(dmg);
          proj.dead = true;

          if (killed) {
            explosions.push(new Explosion(enemy.x, enemy.y));
            results.push({ enemy, killed: true });
          } else {
            results.push({ enemy, killed: false });
          }
          break; // one projectile hits one enemy
        }
      }
    }

    return results;
  },

  // SAM system — autonomous firing
  // Returns array of new Rocket instances to add to projectiles
  updateSAM(player, enemies, samState, now) {
    const rockets = [];
    if (!player.hasWeapon('sam')) return rockets;

    const SAM_CFG = CONFIG.WEAPONS.SAM;
    const radarR = SAM_CFG.radarRadius;

    // Find valid radar targets in range
    const targets = enemies.filter(e =>
      !e.dead &&
      !e.reachedBottom &&
      e.cfg.radarTarget &&
      this._distTo(player, e) <= radarR
    );

    if (targets.length === 0) {
      samState.lockTarget = null;
      samState.lockTimer = 0;
      return rockets;
    }

    // Pick closest target
    const target = targets.reduce((a, b) =>
      this._distTo(player, a) < this._distTo(player, b) ? a : b
    );

    // Use per-enemy lock delay (Kh-101 has longer delay)
    const lockDelay = target.cfg.radarLockDelay || SAM_CFG.lockOnDelay;

    if (samState.lockTarget !== target) {
      samState.lockTarget = target;
      samState.lockTimer = 0;
    }

    samState.lockTimer += 16; // approx ms per frame

    if (samState.lockTimer >= lockDelay && now >= samState.cooldownUntil) {
      // Check weapon — twoRockets upgrade
      const samWeapon = player.weapons.find(w => w.id === 'sam');
      const twoRockets = samWeapon && samWeapon.twoRockets;

      // Kh-101 flare decoy
      if (target.type === 'kh101' && !target.hasBeenFired) {
        target.hasBeenFired = true;
        // First rocket is lost — fire a dummy that self-destructs
        const dummy = new Rocket(player.x, player.y - 48, target);
        dummy._flareDecoy = true;
        rockets.push(dummy);
        if (twoRockets) {
          // Second rocket actually hits
          rockets.push(new Rocket(player.x, player.y - 48, target));
        }
      } else {
        rockets.push(new Rocket(player.x, player.y - 48, target));
        if (twoRockets && targets.length > 1) {
          // Second rocket to second target
          const target2 = targets.find(t => t !== target);
          rockets.push(new Rocket(player.x, player.y - 48, target2));
        } else if (twoRockets) {
          rockets.push(new Rocket(player.x, player.y - 48, target));
        }
      }

      samState.lockTimer = 0;
      samState.cooldownUntil = now + SAM_CFG.cooldown;
    }

    return rockets;
  },

  // Check if enemy reached bottom — deal damage to player
  checkBottomReached(enemies, player, explosions) {
    for (const e of enemies) {
      if (e.reachedBottom && !e._bottomProcessed) {
        e._bottomProcessed = true;
        explosions.push(new Explosion(e.x, CONFIG.CANVAS.PLAY_BOTTOM));
        player.takeDamage(1);
      }
    }
  },

  // ---- PRIVATE ----

  _overlaps(proj, enemy) {
    const b = enemy.getBounds();
    const pr = (proj.width || 8) / 2;
    return (
      proj.x + pr > b.left &&
      proj.x - pr < b.right &&
      proj.y + pr > b.top &&
      proj.y - pr < b.bottom
    );
  },

  _distTo(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
};
