/**
 * API Service for Shadow of the Endless Forest
 * Handles all communication with the backend
 */

const API_BASE_URL = 'http://localhost:8000/api/game';

class GameAPI {
  /**
   * Start a new game session
   */
  async startGame() {
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  /**
   * Register a hit on an enemy
   */
  async registerHit(kills, hitsOnCurrentEnemy, enemiesCount) {
    try {
      const response = await fetch(`${API_BASE_URL}/hit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kills,
          hits_on_current_enemy: hitsOnCurrentEnemy,
          enemies_count: enemiesCount,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error registering hit:', error);
      throw error;
    }
  }

  /**
   * Check if new enemy should spawn
   */
  async checkEnemySpawn(currentTime, lastSpawnTime, enemiesCount) {
    try {
      const response = await fetch(`${API_BASE_URL}/spawn-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_time: currentTime,
          last_spawn_time: lastSpawnTime,
          enemies_count: enemiesCount,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking enemy spawn:', error);
      throw error;
    }
  }

  /**
   * Check weapon unlock status
   */
  async checkWeaponUnlock(kills) {
    try {
      const response = await fetch(`${API_BASE_URL}/weapon-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kills,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking weapon unlock:', error);
      throw error;
    }
  }

  /**
   * Apply damage to player
   */
  async applyDamage(currentHealth, damage) {
    try {
      const response = await fetch(`${API_BASE_URL}/damage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_health: currentHealth,
          damage,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error applying damage:', error);
      throw error;
    }
  }

  /**
   * Calculate final score
   */
  async calculateScore(kills, survivalTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kills,
          survival_time: survivalTime,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error calculating score:', error);
      throw error;
    }
  }

  /**
   * Get game configuration
   */
  async getConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/config`);
      return await response.json();
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  }
}

export default new GameAPI();