/**
 * Main Game Component - Shadow of the Endless Forest
 * Handles game loop, rendering, and state management
 */

import React, { useEffect, useRef, useState } from 'react';
import gameAPI from '../../services/gameAPI';
import { FaHandRock } from 'react-icons/fa';
import { GiCrossedSwords, GiBroadsword } from 'react-icons/gi';
import '../styles/Game.css';
/**
 * Main Game Component - Shadow of the Endless Forest
 * Handles game loop, rendering, and state management
 */

const ENEMY_SPAWN_INTERVAL = 2; // seconds
// const ENEMY_SPAWN_INTERVAL = Math.max(0.5, 3 - localGameState.current.kills * 0.05);


const Game = () => {
  // Canvas reference
  const canvasRef = useRef(null);

  // Game state
  const [gameState, setGameState] = useState({
    playerHealth: 100,
    kills: 0,
    survivalTime: 0,
    currentWeapon: 'Hands',
    enemiesCount: 3,
    hitsOnCurrentEnemy: 0,
    gameOver: false,
    score: 0,
    gameStarted: false,
    isPaused: false,
    isWon: false,
  });

  // Game objects
  const gameObjects = useRef({
    player: { x: 400, y: 300, radius: 20, speed: 5 },
    enemies: [],
    bullets: [],
    lastSpawnTime: Date.now() / 1000,
    startTime: Date.now() / 1000,
    keys: {},
    mouseX: 0,
    mouseY: 0,
    lastDamageTime: 0,
    hitFeedback: [], // Array to store hit feedback text
  });

  // Local game state for immediate updates
  const localGameState = useRef({
    kills: 0,
    hitsOnCurrentEnemy: 0,
    playerHealth: 100,
    currentWeapon: 'Hands',
  });

  // Joystick state for mobile
  const joystickState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  // Animation frame reference
  const animationRef = useRef(null);

  // Win condition constant
  const WIN_KILLS = 100;

  /**
   * Get current weapon based on kills (client-side)
   */
  const getCurrentWeapon = (kills) => {
    if (kills >= 50) return 'Big Knife (Talvaar)';
    if (kills >= 10) return 'Knife';
    return 'Hands';
  };

  /**
   * Get weapon damage based on current weapon
   */
  const getWeaponDamage = (weapon) => {
    switch (weapon) {
      case 'Big Knife (Talvaar)':
        return 3; // 3 damage per hit (kills in ~2 hits)
      case 'Knife':
        return 2; // 2 damage per hit (kills in ~3 hits)
      case 'Hands':
      default:
        return 1; // 1 damage per hit (kills in 5 hits)
    }
  };

  /**
   * Get weapon icon component
   */
  const getWeaponIcon = (weapon) => {
    switch (weapon) {
      case 'Big Knife (Talvaar)':
        return GiBroadsword;
      case 'Knife':
        return GiCrossedSwords;
      case 'Hands':
      default:
        return FaHandRock;
    }
  };

  /**
   * Initialize game
   */
  const startGame = async () => {
    try {
      const response = await gameAPI.startGame();

      // Reset all state
      localGameState.current = {
        kills: 0,
        hitsOnCurrentEnemy: 0,
        playerHealth: 100,
        currentWeapon: 'Hands',
      };

      setGameState({
        playerHealth: 100,
        kills: 0,
        survivalTime: 0,
        currentWeapon: 'Hands',
        enemiesCount: 3,
        hitsOnCurrentEnemy: 0,
        gameOver: false,
        score: 0,
        gameStarted: true,
        isPaused: false,
        isWon: false,
      });

      // Initialize enemies
      gameObjects.current.enemies = [];
      for (let i = 0; i < 3; i++) {
        spawnEnemy();
      }

      gameObjects.current.startTime = Date.now() / 1000;
      gameObjects.current.lastSpawnTime = Date.now() / 1000;
      gameObjects.current.bullets = [];
      gameObjects.current.lastDamageTime = 0;
      gameObjects.current.hitFeedback = [];

      // Reset player position
      gameObjects.current.player = { x: 400, y: 300, radius: 20, speed: 5 };

    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  /**
   * Pause/Resume game
   */
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  /**
   * Stop game (go back to start screen)
   */
  const stopGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setGameState({
      playerHealth: 100,
      kills: 0,
      survivalTime: 0,
      currentWeapon: 'Hands',
      enemiesCount: 3,
      hitsOnCurrentEnemy: 0,
      gameOver: false,
      score: 0,
      gameStarted: false,
      isPaused: false,
      isWon: false,
    });

    // Clear game objects
    gameObjects.current.enemies = [];
    gameObjects.current.bullets = [];
    gameObjects.current.hitFeedback = [];
  };

  /**
   * Handle joystick touch start (left side of screen)
   */
  const handleJoystickStart = (e) => {
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Only activate if touch is on left half of screen
    if (touch.clientX < rect.left + rect.width / 2) {
      joystickState.current.active = true;
      joystickState.current.startX = touch.clientX;
      joystickState.current.startY = touch.clientY;
      joystickState.current.currentX = touch.clientX;
      joystickState.current.currentY = touch.clientY;
    }
  };

  /**
   * Handle joystick touch move
   */
  const handleJoystickMove = (e) => {
    if (!joystickState.current.active) return;

    const touch = Array.from(e.touches).find(t =>
      Math.abs(t.clientX - joystickState.current.startX) < 200 &&
      Math.abs(t.clientY - joystickState.current.startY) < 200
    );

    if (touch) {
      joystickState.current.currentX = touch.clientX;
      joystickState.current.currentY = touch.clientY;

      // Calculate delta
      const deltaX = touch.clientX - joystickState.current.startX;
      const deltaY = touch.clientY - joystickState.current.startY;

      // Limit to max radius of 50px
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 50;

      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        joystickState.current.deltaX = Math.cos(angle) * maxDistance;
        joystickState.current.deltaY = Math.sin(angle) * maxDistance;
      } else {
        joystickState.current.deltaX = deltaX;
        joystickState.current.deltaY = deltaY;
      }
    }
  };

  /**
   * Handle joystick touch end
   */
  const handleJoystickEnd = (e) => {
    // Check if the joystick touch is still active
    const stillActive = Array.from(e.touches).some(t =>
      Math.abs(t.clientX - joystickState.current.startX) < 200 &&
      Math.abs(t.clientY - joystickState.current.startY) < 200
    );

    if (!stillActive) {
      joystickState.current.active = false;
      joystickState.current.deltaX = 0;
      joystickState.current.deltaY = 0;
    }
  };

  /**
   * Handle shooting touch (right side of screen)
   */
  const handleShootTouch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Check each touch
    for (let touch of e.touches) {
      // Only shoot if touch is on right half of screen
      if (touch.clientX > rect.left + rect.width / 2) {
        // Calculate canvas-relative coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (touch.clientX - rect.left) * scaleX;
        const canvasY = (touch.clientY - rect.top) * scaleY;

        // Update mouse position for shooting
        gameObjects.current.mouseX = canvasX;
        gameObjects.current.mouseY = canvasY;

        // Shoot
        shootBullet();
        break; // Only shoot once per touch event
      }
    }
  };

  /**
   * Spawn a new enemy at random position
   */
  const spawnEnemy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Random position on edge of canvas
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
      case 0: // Top
        x = Math.random() * canvas.width;
        y = -20;
        break;
      case 1: // Right
        x = canvas.width + 20;
        y = Math.random() * canvas.height;
        break;
      case 2: // Bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
        break;
      case 3: // Left
        x = -20;
        y = Math.random() * canvas.height;
        break;
    }

    gameObjects.current.enemies.push({
      x,
      y,
      radius: 15,
      speed: 1.5,
      health: 5,
      color: '#8B0000',
    });
  };

  /**
   * Shoot bullet towards mouse position (canvas-relative)
   */
  const shootBullet = () => {
    const { player, mouseX, mouseY } = gameObjects.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate direction using canvas-relative coordinates
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const bullet = {
      x: player.x,
      y: player.y,
      radius: 5,
      speedX: (dx / distance) * 10,
      speedY: (dy / distance) * 10,
      color: '#FFD700',
    };

    gameObjects.current.bullets.push(bullet);
  };

  /**
   * Main game loop
   */
  const gameLoop = async () => {
    if (gameState.gameOver || !gameState.gameStarted || gameState.isPaused || gameState.isWon) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { player, enemies, bullets, keys } = gameObjects.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw forest background
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some trees (decorative)
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = '#0d1f0d';
      ctx.fillRect(i * 80, 0, 30, canvas.height);
    }

    // Update player position (keyboard + joystick)
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Apply joystick movement (mobile)
    if (joystickState.current.active) {
      const sensitivity = 0.15; // Adjust for smoother/faster movement
      player.x += joystickState.current.deltaX * sensitivity;
      player.y += joystickState.current.deltaY * sensitivity;
    }

    // Keep player in bounds
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Draw player
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.speedX;
      bullet.y += bullet.speedY;

      // Remove bullets out of bounds
      if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
        bullets.splice(i, 1);
        continue;
      }

      // Draw bullet
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Check collision with enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const dist = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);

        if (dist < bullet.radius + enemy.radius) {
          // Remove bullet
          bullets.splice(i, 1);

          // Initialize health if not exists
          if (!enemy.health) {
            enemy.health = 5;
          }

          // Get weapon damage
          const damage = getWeaponDamage(localGameState.current.currentWeapon);

          // Decrease enemy health by weapon damage
          enemy.health -= damage;

          // Add hit feedback showing damage
          gameObjects.current.hitFeedback.push({
            x: enemy.x,
            y: enemy.y - 20,
            text: `-${damage} HP`,
            alpha: 1,
            createdAt: Date.now(),
            color: damage > 1 ? '#FF6347' : '#FFFFFF',
          });

          // Visual feedback - flash enemy (different color based on damage)
          const flashColor = damage === 3 ? '#FF0000' : damage === 2 ? '#FF4500' : '#FF6347';
          enemy.color = flashColor;
          setTimeout(() => {
            if (enemy) enemy.color = '#8B0000';
          }, 100);

          // Check if enemy is dead
          if (enemy.health <= 0) {
            // Health gain on kill (10 HP per kill, max 100)
            const healthGain = 10;
            const oldHealth = localGameState.current.playerHealth;
            localGameState.current.playerHealth = Math.min(100, localGameState.current.playerHealth + healthGain);
            const actualGain = localGameState.current.playerHealth - oldHealth;

            if (actualGain > 0) {
              // Show health gain feedback
              gameObjects.current.hitFeedback.push({
                x: player.x,
                y: player.y - 30,
                text: `+${actualGain} HP`,
                alpha: 1,
                createdAt: Date.now(),
                color: '#00FF00',
                large: true,
              });
            }

            // Add kill feedback
            gameObjects.current.hitFeedback.push({
              x: enemy.x,
              y: enemy.y - 30,
              text: 'KILL +1',
              alpha: 1,
              createdAt: Date.now(),
              color: '#FFD700',
            });

            // Remove enemy
            enemies.splice(j, 1);

            // Increment kills
            localGameState.current.kills += 1;

            // Check win condition
            if (localGameState.current.kills >= WIN_KILLS) {
              // Player won!
              gameObjects.current.hitFeedback.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                text: 'YOU WON! 🎉',
                alpha: 1,
                createdAt: Date.now(),
                color: '#FFD700',
                large: true,
              });

              setGameState(prev => ({
                ...prev,
                isWon: true,
                kills: localGameState.current.kills,
              }));

              // End game after short delay to show message
              setTimeout(() => {
                endGame(true);
              }, 2000);

              return;
            }

            // Update weapon
            // Update weapon
            // Update weapon
            const newWeapon = getCurrentWeapon(localGameState.current.kills);
            if (newWeapon !== localGameState.current.currentWeapon) {
              // Weapon unlocked!
              gameObjects.current.hitFeedback.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                text: `${newWeapon} UNLOCKED!`,
                alpha: 1,
                createdAt: Date.now(),
                color: '#00FF00',
                large: true,
              });

              // Spawn extra enemies based on weapon
              if (newWeapon === 'Knife') {
                for (let i = 0; i < 3; i++) spawnEnemy();
              } else if (newWeapon === 'Big Knife (Talvaar)') {
                for (let i = 0; i < 5; i++) spawnEnemy();
              }
            }
            localGameState.current.currentWeapon = newWeapon;



            // Update React state (including health)
            setGameState(prev => ({
              ...prev,
              kills: localGameState.current.kills,
              currentWeapon: newWeapon,
              playerHealth: localGameState.current.playerHealth,
            }));
          }

          break;
        }
      }
    }

    // Update and draw enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      // Initialize health if not exists
      if (!enemy.health) {
        enemy.health = 5;
      }

      // Move towards player
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
      }

      // Draw enemy
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw enemy health bar
      const healthBarWidth = 30;
      const healthBarHeight = 4;
      const healthBarX = enemy.x - healthBarWidth / 2;
      const healthBarY = enemy.y - enemy.radius - 10;

      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      // Health fill
      const healthPercent = enemy.health / 5;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      // Check collision with player
      const distToPlayer = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);

      if (distToPlayer < enemy.radius + player.radius) {
        // Player takes damage (every 1 second)
        const currentTime = Date.now() / 1000;
        if (currentTime - gameObjects.current.lastDamageTime > 1) {
          gameObjects.current.lastDamageTime = currentTime;

          // Apply damage client-side
          localGameState.current.playerHealth = Math.max(0, localGameState.current.playerHealth - 10);

          // Update React state
          setGameState(prev => ({
            ...prev,
            playerHealth: localGameState.current.playerHealth,
            gameOver: localGameState.current.playerHealth <= 0,
          }));

          // Check game over
          if (localGameState.current.playerHealth <= 0) {
            endGame();
          }
        }
      }
    }

  


    // Check for enemy spawning (every 5 seconds)
    const currentTime = Date.now() / 1000;
    if (currentTime - gameObjects.current.lastSpawnTime >= ENEMY_SPAWN_INTERVAL) {
      spawnEnemy();
      gameObjects.current.lastSpawnTime = currentTime;
    }

    // Update survival time
    const survivalTime = currentTime - gameObjects.current.startTime;
    setGameState(prev => ({
      ...prev,
      survivalTime: Math.floor(survivalTime),
    }));

    // Draw and update hit feedback
    const { hitFeedback } = gameObjects.current;
    for (let i = hitFeedback.length - 1; i >= 0; i--) {
      const feedback = hitFeedback[i];
      const age = Date.now() - feedback.createdAt;

      // Remove old feedback (after 1 second)
      if (age > 1000) {
        hitFeedback.splice(i, 1);
        continue;
      }

      // Fade out
      feedback.alpha = 1 - (age / 1000);
      feedback.y -= 1; // Float upward

      // Draw feedback
      ctx.save();
      ctx.globalAlpha = feedback.alpha;
      ctx.fillStyle = feedback.color || '#FFFFFF';
      ctx.font = feedback.large ? 'bold 24px Arial' : 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(feedback.text, feedback.x, feedback.y);
      ctx.fillText(feedback.text, feedback.x, feedback.y);
      ctx.restore();
    }

    // Continue game loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  /**
   * End game and calculate score
   */
  const endGame = async (isWin = false) => {
    try {
      const response = await gameAPI.calculateScore(
        localGameState.current.kills,
        gameState.survivalTime
      );

      setGameState(prev => ({
        ...prev,
        score: response.total_score,
        gameOver: !isWin,
        isWon: isWin,
      }));

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } catch (error) {
      console.error('Error calculating score:', error);
      // Fallback to local calculation
      const score = localGameState.current.kills + gameState.survivalTime;
      setGameState(prev => ({
        ...prev,
        score: score,
        gameOver: !isWin,
        isWon: isWin,
      }));

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  /**
   * Event handlers
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      gameObjects.current.keys[e.key] = true;
    };

    const handleKeyUp = (e) => {
      gameObjects.current.keys[e.key] = false;
    };

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Calculate canvas-relative coordinates accounting for canvas scaling
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      gameObjects.current.mouseX = (e.clientX - rect.left) * scaleX;
      gameObjects.current.mouseY = (e.clientY - rect.top) * scaleY;
    };

    const handleClick = () => {
      if (gameState.gameStarted && !gameState.gameOver) {
        shootBullet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);

      // Touch events for mobile
      canvas.addEventListener('touchstart', handleJoystickStart, { passive: true });
      canvas.addEventListener('touchmove', handleJoystickMove, { passive: true });
      canvas.addEventListener('touchend', handleJoystickEnd, { passive: true });
      canvas.addEventListener('touchstart', handleShootTouch, { passive: true });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleJoystickStart);
        canvas.removeEventListener('touchmove', handleJoystickMove);
        canvas.removeEventListener('touchend', handleJoystickEnd);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  /**
   * Start game loop when game starts
   */
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused && !gameState.isWon) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.isWon]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🌲 Shadow of the Endless Forest 🌲</h1>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Health:</span>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{ width: `${gameState.playerHealth}%` }}
            ></div>
          </div>
          <span className="stat-value">{gameState.playerHealth}/100</span>
        </div>

        <div className="stat">
          <span className="stat-label">Kills:</span>
          <span className="stat-value">{gameState.kills}</span>
        </div>

        <div className="stat weapon-stat">
          <span className="stat-label">Weapon:</span>
          <span className="stat-value weapon">
            {React.createElement(getWeaponIcon(gameState.currentWeapon), {
              className: 'weapon-icon',
              size: 24
            })}
            {gameState.currentWeapon}
          </span>
        </div>

        <div className="stat">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{gameState.survivalTime}s</span>
        </div>

        <div className="stat">
          <span className="stat-label">Enemies:</span>
          <span className="stat-value">{gameObjects.current.enemies.length}</span>
        </div>
      </div>

      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
        />

        {/* Game Control Buttons */}
        {gameState.gameStarted && !gameState.gameOver && !gameState.isWon && (
          <div className="game-control-buttons">
            <button className="btn-pause" onClick={togglePause}>
              {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button className="btn-stop" onClick={stopGame}>
              ⏹️ Stop
            </button>
          </div>
        )}

        {/* Mobile Joystick Visualization */}
        {gameState.gameStarted && !gameState.gameOver && !gameState.isWon && joystickState.current.active && (
          <div
            className="joystick-base"
            style={{
              left: `${joystickState.current.startX}px`,
              top: `${joystickState.current.startY}px`,
            }}
          >
            <div
              className="joystick-stick"
              style={{
                transform: `translate(${joystickState.current.deltaX}px, ${joystickState.current.deltaY}px)`,
              }}
            />
          </div>
        )}


        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div className="game-overlay">
            <div className="pause-screen">
              <h2>⏸️ PAUSED</h2>
              <button className="btn-resume" onClick={togglePause}>
                ▶️ Resume Game
              </button>
              <button className="btn-quit" onClick={stopGame}>
                ⏹️ Quit to Menu
              </button>
            </div>
          </div>
        )}

        {!gameState.gameStarted && (
          <div className="game-overlay">
            <div className="start-screen">
              <h2>Welcome to the Endless Forest</h2>
              <p>Survive as long as you can!</p>
              <ul>
                <li><strong>Desktop:</strong> WASD/Arrows + Click to shoot</li>
                <li><strong>Mobile:</strong> Touch left side to move, right side to shoot</li>
                <li><strong>5 HITS</strong> to kill each enemy</li>
                <li>New enemy spawns every 5 seconds</li>
                <li>Enemies deal damage on contact</li>
                <li><strong>+10 HP</strong> per kill!</li>
                <li className="win-condition">🏆 Get <strong>100 KILLS</strong> to WIN!</li>
              </ul>
              <button className="btn-start" onClick={startGame}>
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Win Screen */}
        {gameState.isWon && (
          <div className="game-overlay">
            <div className="win-screen">
              <h2>🎉 YOU WON! 🎉</h2>
              <div className="final-stats">
                <p className="victory-text">Congratulations!</p>
                <p>Kills: {gameState.kills}</p>
                <p>Survival Time: {gameState.survivalTime}s</p>
                <p className="final-score">Final Score: {gameState.score}</p>
              </div>
              <button className="btn-restart" onClick={startGame}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameState.gameOver && !gameState.isWon && (
          <div className="game-overlay">
            <div className="game-over-screen">
              <h2>Game Over</h2>
              <div className="final-stats">
                <p>Kills: {gameState.kills}</p>
                <p>Survival Time: {gameState.survivalTime}s</p>
                <p className="final-score">Final Score: {gameState.score}</p>
              </div>
              <button className="btn-restart" onClick={startGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="control-info">
          <h3>Controls</h3>
          <p><strong>Movement:</strong> W, A, S, D or Arrow Keys</p>
          <p><strong>Attack:</strong> Click Mouse</p>
        </div>

        <div className="weapon-progression">
          <h3>Weapon Progression</h3>
          <p>👊 0-9 kills: Hands (1 damage/hit)</p>
          <p>🗡️ 10 kills: Knife (2 damage/hit)</p>
          <p>⚔️ 50 kills: Big Knife (3 damage/hit)</p>
          <p className="health-gain">💚 +10 HP per kill!</p>
        </div>
      </div>
    </div>
  );
};

export default Game;