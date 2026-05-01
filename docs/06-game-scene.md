# 06 — The Gameplay: `GameScene.js`

**File:** [../src/scenes/GameScene.js](../src/scenes/GameScene.js)

This is the biggest and most important file. Let's go through each part.

---

## Setup in `create()`

```js
create() {
  this.score = 0;
  this.lives = 3;
  this.isGameOver = false;

  this._buildLevel();
  this._createPlayer();
  this._createEnemies();
  this._setupCollisions();
  this._setupCamera();
  this._setupInput();

  this.scene.launch('UIScene', { gameScene: this });
}
```

`this.score`, `this.lives`, `this.isGameOver` are **properties** — variables stored on the scene object so every function in this class can access them.

The underscore `_` at the start of a method name (like `_buildLevel`) is a convention meaning "this is a private helper — only used inside this class." It's not enforced by the language, just a signal to other developers.

The last line launches UIScene and passes `{ gameScene: this }` — this is how UIScene gets a reference to this scene so it can listen for score/lives events.

---

## Building the Level: `_buildLevel()`

### Platforms

```js
const platforms = [
  ...Array.from({ length: 25 }, (_, i) => ({ x: i * 64, y: 468, w: 1 })),
  { x: 200, y: 370, w: 3 },
  { x: 450, y: 300, w: 3 },
  // ...more platforms
];
```

This is an array of objects. Each object describes one platform with `x` (horizontal position), `y` (vertical position), and `w` (width in tiles).

The ground is generated with `Array.from({ length: 25 }, ...)` — this creates 25 ground tiles automatically, side by side, instead of typing them all out manually.

```js
this.platforms = this.physics.add.staticGroup();
platforms.forEach(({ x, y, w }) => {
  for (let i = 0; i < w; i++) {
    this.platforms.create(x + i * 64, y, 'platform').refreshBody();
  }
});
```

- `staticGroup()` — a group of physics objects that **don't move**. Perfect for platforms.
- `.forEach(...)` — loops through every platform in the array and places tiles
- `refreshBody()` — tells the physics engine to recalculate the hitbox after placing it (required for static objects)

### Coins

```js
this.coins = this.physics.add.staticGroup();
coinPositions.forEach(({ x, y }) => this.coins.create(x, y, 'coin'));
```

Same idea — a list of positions, loop through them, place a coin at each one.

### The Finish Flag

```js
this.flagZone = this.add.zone(1700, 300, 20, 60).setRectangleDropZone(20, 60);
this.physics.add.existing(this.flagZone, true);
```

A **zone** is an invisible area. When the player touches it, the level ends. The green rectangle you see is drawn separately with `this.add.graphics()` — it's just decoration. The invisible zone is what actually detects the player.

---

## Creating the Player: `_createPlayer()`

```js
this.player = this.physics.add.sprite(64, 400, 'player');
this.player.setCollideWorldBounds(false);
this.player.setBounce(0.1);
this.physics.world.setBounds(0, 0, 1800, 500);
```

- `physics.add.sprite(x, y, 'textureName')` — creates a physics-enabled game object at position (64, 400)
- `setCollideWorldBounds(false)` — the player can fall off the bottom of the world (which triggers a life loss)
- `setBounce(0.1)` — adds a tiny bounce when landing (10% of impact velocity)
- `world.setBounds(0, 0, 1800, 500)` — the total level is 1800 pixels wide even though the screen is only 800 — this is how scrolling levels work

---

## Creating Enemies: `_createEnemies()`

```js
const enemyData = [
  { x: 350, y: 430, min: 200, max: 500 },
  // ...
];
enemyData.forEach(({ x, y, min, max }) => {
  const e = this.enemies.create(x, y, 'enemy');
  e.setVelocityX(80);
  e.patrolMin = min;
  e.patrolMax = max;
});
```

Each enemy is given:
- A starting position
- A velocity (speed in pixels per second) to the right
- A `patrolMin` and `patrolMax` — the x positions it bounces between

The actual bouncing happens in `update()` (see below).

---

## Setting Up Collisions: `_setupCollisions()`

```js
this.physics.add.collider(this.player, this.platforms);
this.physics.add.collider(this.enemies, this.platforms);
```

**Colliders** make two objects physically block each other. Without these lines, the player and enemies would fall straight through the platforms.

### Collecting Coins

```js
this.physics.add.overlap(this.player, this.coins, (player, coin) => {
  coin.destroy();
  this.score += 10;
  this.events.emit('scoreUpdate', this.score);
});
```

**Overlap** is like a collider but they pass through each other — it just triggers a function. When the player touches a coin:
1. `coin.destroy()` — removes the coin from the game
2. `this.score += 10` — adds 10 to the score
3. `this.events.emit('scoreUpdate', this.score)` — sends a message to UIScene so it updates the display

### Stomping vs Getting Hit by Enemies

```js
this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
  const stomped = player.body.velocity.y > 0 && player.y < enemy.y - 10;
  if (stomped) {
    enemy.destroy();
    player.setVelocityY(-300);
    this.score += 50;
  } else {
    this._loseLife();
  }
});
```

This is the stomp detection. The condition `player.body.velocity.y > 0` means the player is moving **downward**. And `player.y < enemy.y - 10` means the player is **above** the enemy. Both must be true to count as a stomp. Otherwise the player loses a life.

---

## The Game Loop: `update()`

```js
update() {
  if (this.isGameOver) return;

  const onGround = this.player.body.blocked.down;

  // left/right movement
  if (left.isDown || this.wasd.left.isDown) {
    this.player.setVelocityX(-200);
  } else if (right.isDown || this.wasd.right.isDown) {
    this.player.setVelocityX(200);
  } else {
    this.player.setVelocityX(0);  // stop when no key is pressed
  }

  // jumping — only if on the ground
  if ((up.isDown || space.isDown || this.wasd.up.isDown) && onGround) {
    this.player.setVelocityY(-550);
  }
```

- `this.player.body.blocked.down` is `true` when the player is standing on something. This prevents double-jumping.
- Velocity is in pixels per second. Negative Y velocity = moving upward (because in screen coordinates, Y increases downward).
- Setting X velocity to `0` when no key is pressed means the player stops instantly. You could change this to gradually slow down for a smoother feel.

### Enemy Patrol

```js
this.enemies.getChildren().forEach(e => {
  if (e.x >= e.patrolMax) e.setVelocityX(-80);
  if (e.x <= e.patrolMin) e.setVelocityX(80);
});
```

Every frame, each enemy checks: "Have I reached my right boundary? If yes, turn left. Have I reached my left boundary? If yes, turn right." Simple but effective.

### Falling Off the World

```js
if (this.player.y > 520) this._loseLife();
```

If the player's Y position is greater than 520 (below the bottom of the level), they've fallen off.

---

## Losing a Life: `_loseLife()`

```js
_loseLife() {
  this.lives -= 1;
  this.events.emit('livesUpdate', this.lives);
  if (this.lives <= 0) {
    this._gameOver();
  } else {
    this.player.setPosition(64, 400);  // respawn at start
    this.player.setVelocity(0, 0);     // stop all movement
  }
}
```

If lives reach zero → game over. Otherwise → respawn the player at the starting position.

---

## Game Over and Win

```js
_gameOver() {
  this.isGameOver = true;
  this.physics.pause();   // freeze everything
  this.add.text(400, 220, 'GAME OVER', { ... }).setScrollFactor(0);
  this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
}
```

- `this.physics.pause()` — stops all physics, effectively freezing the game
- `setScrollFactor(0)` — makes the text stay fixed on screen even though the camera scrolls
- `time.delayedCall(2500, ...)` — waits 2500 milliseconds (2.5 seconds) then runs the function. This gives the player time to read "GAME OVER" before going back to the menu.

`_winLevel()` works the same way but shows "YOU WIN!" in gold.

---

## Summary

- `_buildLevel()` places platforms, coins, and the flag using arrays of positions
- `_createPlayer()` spawns the player sprite with physics
- `_createEnemies()` spawns enemies with patrol ranges
- `_setupCollisions()` defines what happens when objects touch
- `update()` runs 60x/sec: reads input, moves the player, patrols enemies
- Events (`this.events.emit`) are how GameScene talks to UIScene
