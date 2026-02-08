"""
Game Router - Handles all game-related endpoints
Manages game state, enemy spawning, weapon unlocks, and scoring
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
import math

router = APIRouter()

# Pydantic models for request/response
class GameState(BaseModel):
    """Current game state"""
    player_health: int = 100
    kills: int = 0
    survival_time: float = 0
    current_weapon: str = "Hands"
    enemies_count: int = 3
    hits_on_current_enemy: int = 0
    game_over: bool = False
    score: int = 0
    last_spawn_time: float = 0

class EnemySpawnRequest(BaseModel):
    """Request to check if new enemy should spawn"""
    current_time: float
    last_spawn_time: float
    enemies_count: int

class HitRequest(BaseModel):
    """Request when player hits an enemy"""
    kills: int
    hits_on_current_enemy: int
    enemies_count: int

class WeaponUnlockRequest(BaseModel):
    """Request to check weapon unlock"""
    kills: int

class DamageRequest(BaseModel):
    """Request when player takes damage"""
    current_health: int
    damage: int

class ScoreRequest(BaseModel):
    """Request to calculate final score"""
    kills: int
    survival_time: float

# Game constants
WEAPON_TIERS = {
    0: "Hands",
    10: "Knife",
    50: "Big Knife (Talvaar)"
}

HITS_TO_KILL = 2
SPAWN_INTERVAL = 10  # seconds
INITIAL_ENEMIES = 3

# In-memory game sessions (in production, use Redis or database)
game_sessions = {}

@router.post("/start")
async def start_game():
    """
    Initialize a new game session
    Returns initial game state
    """
    session_id = str(int(time.time() * 1000))
    
    initial_state = GameState(
        player_health=100,
        kills=0,
        survival_time=0,
        current_weapon="Hands",
        enemies_count=INITIAL_ENEMIES,
        hits_on_current_enemy=0,
        game_over=False,
        score=0,
        last_spawn_time=time.time()
    )
    
    game_sessions[session_id] = initial_state.dict()
    
    return {
        "session_id": session_id,
        "game_state": initial_state.dict(),
        "message": "Game started! Survive the endless forest!"
    }

@router.post("/hit")
async def register_hit(hit_request: HitRequest):
    """
    Register a hit on enemy
    Returns updated kill count and enemy status
    """
    hits = hit_request.hits_on_current_enemy + 1
    kills = hit_request.kills
    enemies_count = hit_request.enemies_count
    
    enemy_killed = False
    
    # Check if enemy is killed (5 hits)
    if hits >= HITS_TO_KILL:
        kills += 1
        enemies_count -= 1
        hits = 0
        enemy_killed = True
    
    # Check weapon unlock
    weapon = get_current_weapon(kills)
    
    return {
        "kills": kills,
        "hits_on_current_enemy": hits,
        "enemies_count": max(enemies_count, 0),
        "enemy_killed": enemy_killed,
        "current_weapon": weapon,
        "message": f"Enemy killed! Total kills: {kills}" if enemy_killed else "Hit registered!"
    }

@router.post("/spawn-check")
async def check_enemy_spawn(spawn_request: EnemySpawnRequest):
    """
    Check if new enemy should spawn (every 5 seconds)
    Returns spawn decision and updated enemy count
    """
    time_elapsed = spawn_request.current_time - spawn_request.last_spawn_time
    
    should_spawn = time_elapsed >= SPAWN_INTERVAL
    new_enemies_count = spawn_request.enemies_count
    new_last_spawn_time = spawn_request.last_spawn_time
    
    if should_spawn:
        new_enemies_count += 1
        new_last_spawn_time = spawn_request.current_time
    
    return {
        "should_spawn": should_spawn,
        "enemies_count": new_enemies_count,
        "last_spawn_time": new_last_spawn_time,
        "time_until_next_spawn": max(0, SPAWN_INTERVAL - time_elapsed)
    }

@router.post("/weapon-check")
async def check_weapon_unlock(weapon_request: WeaponUnlockRequest):
    """
    Check current weapon based on kills
    Returns current weapon tier
    """
    weapon = get_current_weapon(weapon_request.kills)
    
    # Calculate kills needed for next weapon
    next_tier = None
    kills_needed = None
    
    for tier_kills in sorted(WEAPON_TIERS.keys()):
        if tier_kills > weapon_request.kills:
            next_tier = WEAPON_TIERS[tier_kills]
            kills_needed = tier_kills - weapon_request.kills
            break
    
    return {
        "current_weapon": weapon,
        "next_weapon": next_tier,
        "kills_needed_for_next": kills_needed,
        "all_weapons": WEAPON_TIERS
    }

@router.post("/damage")
async def apply_damage(damage_request: DamageRequest):
    """
    Apply damage to player
    Returns updated health and game over status
    """
    new_health = max(0, damage_request.current_health - damage_request.damage)
    game_over = new_health <= 0
    
    return {
        "player_health": new_health,
        "game_over": game_over,
        "message": "Game Over! You have been defeated." if game_over else "Damage taken!"
    }

@router.post("/score")
async def calculate_score(score_request: ScoreRequest):
    """
    Calculate final score
    Score = kills + survival time (in seconds)
    """
    # Round survival time to nearest second
    survival_seconds = int(score_request.survival_time)
    total_score = score_request.kills + survival_seconds
    
    return {
        "kills": score_request.kills,
        "survival_time": survival_seconds,
        "total_score": total_score,
        "message": f"Final Score: {total_score} (Kills: {score_request.kills} + Time: {survival_seconds}s)"
    }

@router.get("/config")
async def get_game_config():
    """
    Get game configuration constants
    """
    return {
        "weapon_tiers": WEAPON_TIERS,
        "hits_to_kill": HITS_TO_KILL,
        "spawn_interval": SPAWN_INTERVAL,
        "initial_enemies": INITIAL_ENEMIES,
        "initial_health": 100
    }

# Helper functions
def get_current_weapon(kills: int) -> str:
    """
    Determine current weapon based on kill count
    
    Args:
        kills: Total number of kills
    
    Returns:
        Current weapon name
    """
    weapon = "Hands"
    
    for tier_kills in sorted(WEAPON_TIERS.keys(), reverse=True):
        if kills >= tier_kills:
            weapon = WEAPON_TIERS[tier_kills]
            break
    
    return weapon