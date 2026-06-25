class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.arrows = this.physics.add.group();
    this.fireballs = this.physics.add.group();
    this.missiles = this.physics.add.group();

    this._buildLevel();
    this._createPlayer();
    this._createEnemies();
    this._setupCollisions();
    this._setupCamera();
    this._setupInput();

    this.time.addEvent({ delay: 1500, loop: true, callback: this._spawnFireball, callbackScope: this });
    this.time.addEvent({ delay: 6000, loop: true, callback: this._spawnSkyZombie, callbackScope: this });

    this.scene.launch('UIScene', { gameScene: this });
  }

  _createBackground() {
    const bg = this.add.graphics().setDepth(-10);

    // Fiery sky — dark at top, orange-red near ground
    bg.fillStyle(0x0D0200);
    bg.fillRect(0, 0, 1800, 500);
    bg.fillStyle(0x2B0500);
    bg.fillRect(0, 160, 1800, 120);
    bg.fillStyle(0x5C0E00);
    bg.fillRect(0, 300, 1800, 100);
    bg.fillStyle(0x8B1A00);
    bg.fillRect(0, 380, 1800, 88);

    // Distant fire glow on the horizon
    bg.fillStyle(0xFF4400);
    [180, 480, 750, 1050, 1350, 1650].forEach(gx => {
      bg.fillEllipse(gx, 445, 220, 55);
    });

    // Buildings: [x, topY, width]
    const buildings = [
      [0, 295, 75], [65, 215, 65], [120, 255, 90], [200, 165, 75],
      [265, 235, 85], [340, 275, 65], [395, 190, 110], [495, 245, 75],
      [560, 185, 70], [620, 265, 95], [705, 200, 80], [775, 275, 65],
      [830, 155, 120], [940, 235, 80], [1010, 210, 75], [1075, 280, 90],
      [1155, 170, 100], [1245, 250, 65], [1300, 200, 110], [1400, 260, 80],
      [1470, 180, 90], [1550, 240, 70], [1610, 210, 100], [1700, 290, 100],
    ];

    buildings.forEach(([bx, by, bw]) => {
      const bh = 468 - by;

      // Silhouette
      bg.fillStyle(0x0A0808);
      bg.fillRect(bx, by, bw, bh);

      // Orange-lit windows
      for (let wy = by + 12; wy < by + bh - 20; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 8; wx += 14) {
          if (Math.random() > 0.45) {
            bg.fillStyle(0xFF8C00);
            bg.fillRect(wx, wy, 7, 9);
          }
        }
      }

      // Flames at rooftop
      const flameCount = Math.max(1, Math.floor(bw / 25));
      for (let f = 0; f < flameCount; f++) {
        const fx = bx + 12 + f * (bw / flameCount);
        const fh = 20 + Math.random() * 28;

        bg.fillStyle(0xFF4400);
        bg.fillPoints([
          { x: fx - 8, y: by },
          { x: fx - 3, y: by - fh * 0.6 },
          { x: fx,     y: by - fh },
          { x: fx + 3, y: by - fh * 0.6 },
          { x: fx + 8, y: by }
        ], true);

        bg.fillStyle(0xFFBB00);
        bg.fillPoints([
          { x: fx - 4, y: by },
          { x: fx,     y: by - fh * 0.65 },
          { x: fx + 4, y: by }
        ], true);
      }
    });
  }

  _buildLevel() {
    this._createBackground();
    const platforms = [
      // ground
      ...Array.from({ length: 25 }, (_, i) => ({ x: i * 64, y: 468, w: 1 })),
      // floating platforms
      { x: 200, y: 370, w: 3 },
      { x: 450, y: 300, w: 3 },
      { x: 700, y: 360, w: 3 },
      { x: 950, y: 280, w: 3 },
      { x: 1150, y: 350, w: 4 },
      { x: 1400, y: 260, w: 3 },
      { x: 1600, y: 340, w: 3 },
    ];

    this.platforms = this.physics.add.staticGroup();
    platforms.forEach(({ x, y, w }) => {
      for (let i = 0; i < w; i++) {
        this.platforms.create(x + i * 64, y, 'platform').refreshBody();
      }
    });

    // coins
    const coinPositions = [
      { x: 232, y: 340 }, { x: 296, y: 340 }, { x: 360, y: 340 },
      { x: 482, y: 270 }, { x: 546, y: 270 },
      { x: 732, y: 330 }, { x: 796, y: 330 },
      { x: 982, y: 250 }, { x: 1046, y: 250 },
      { x: 1432, y: 230 }, { x: 1496, y: 230 },
    ];
    this.coins = this.physics.add.staticGroup();
    coinPositions.forEach(({ x, y }) => this.coins.create(x, y, 'coin'));

    // stars
    const starPositions = [
      { x: 264, y: 320 }, { x: 328, y: 320 },
      { x: 514, y: 250 },
      { x: 764, y: 310 },
      { x: 1014, y: 230 }, { x: 1078, y: 230 },
      { x: 1182, y: 320 }, { x: 1246, y: 320 },
      { x: 1464, y: 210 },
    ];
    this.stars = this.physics.add.staticGroup();
    starPositions.forEach(({ x, y }) => this.stars.create(x, y, 'star'));

    // level end flag (simple colored rectangle)
    const flagGfx = this.add.graphics();
    flagGfx.fillStyle(0x00ff00);
    flagGfx.fillRect(0, 0, 20, 60);
    this.flagZone = this.add.zone(1700, 300, 20, 60).setRectangleDropZone(20, 60);
    this.physics.add.existing(this.flagZone, true);
  }

  _createPlayer() {
    this.player = this.physics.add.sprite(64, 400, 'player');
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0.1);
    this.physics.world.setBounds(0, 0, 1800, 500);
  }

  _createEnemies() {
    this.enemies = this.physics.add.group();
    const enemyData = [
      { x: 450, y: 430, min: 380, max: 560 },
      { x: 750, y: 430, min: 600, max: 900 },
      { x: 1100, y: 430, min: 950, max: 1300 },
      { x: 1450, y: 430, min: 1300, max: 1580 },
    ];
    enemyData.forEach(({ x, y, min, max }) => {
      const e = this.enemies.create(x, y, 'enemy');
      e.setVelocityX(80);
      e.setCollideWorldBounds(true);
      e.patrolMin = min;
      e.patrolMax = max;
      e.setBounce(0);
      e.patrolActive = true;
      e.shootTimer = this.time.addEvent({
        delay: 2000 + Math.random() * 1500,
        loop: true,
        callback: () => this._skeletonShoot(e),
        callbackScope: this
      });
    });
  }

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
      this.score += 10;
      this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.overlap(this.player, this.stars, (player, star) => {
      star.destroy();
      this.score += 25;
      this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (this.isGameOver) return;
      const stomped = player.body.velocity.y > 0 && player.y < enemy.y - 10;
      if (stomped) {
        if (enemy.shootTimer) enemy.shootTimer.remove();
        enemy.destroy();
        player.setVelocityY(-300);
        this.score += 50;
        this.events.emit('scoreUpdate', this.score);
      } else {
        this._loseLife();
      }
    });

    this.physics.add.collider(this.arrows, this.platforms, (arrow) => arrow.destroy());

    this.physics.add.collider(this.missiles, this.platforms, (missile) => missile.destroy());
    this.physics.add.overlap(this.missiles, this.enemies, (missile, enemy) => {
      missile.destroy();
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 50;
      this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.collider(this.fireballs, this.platforms, (fb) => fb.destroy());
    this.physics.add.overlap(this.player, this.fireballs, (player, fb) => {
      if (this.isGameOver) return;
      fb.destroy();
      this._loseLife();
    });

    this.physics.add.overlap(this.player, this.arrows, (player, arrow) => {
      if (this.isGameOver) return;
      arrow.destroy();
      this._loseLife();
    });

    this.physics.add.overlap(this.player, this.flagZone, () => {
      if (!this.isGameOver) this._winLevel();
    });
  }

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, 1800, 500);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', left: 'A', right: 'D' });
    this.input.on('pointerdown', this._fireMissile, this);
  }

  update() {
    if (this.isGameOver) return;

    const { left, right, up, space } = this.cursors;
    const onGround = this.player.body.blocked.down;

    if (left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if ((up.isDown || space.isDown || this.wasd.up.isDown) && onGround) {
      this.player.setVelocityY(-550);
    }

    // enemy patrol + sky zombie landing detection
    this.enemies.getChildren().forEach(e => {
      if (e.patrolActive) {
        if (e.x >= e.patrolMax) e.setVelocityX(-80);
        if (e.x <= e.patrolMin) e.setVelocityX(80);
      } else if (e.body && e.body.blocked.down) {
        e.patrolActive = true;
        e.patrolMin = Math.max(0, e.x - 120);
        e.patrolMax = Math.min(1800, e.x + 120);
        e.setVelocityX(60);
      }
    });

    // clean up fallen fireballs
    this.fireballs.getChildren().slice().forEach(fb => {
      if (fb.y > 520) fb.destroy();
    });

    // clean up off-screen arrows and missiles
    this.arrows.getChildren().slice().forEach(arrow => {
      if (arrow.x < -50 || arrow.x > 1850) arrow.destroy();
    });
    this.missiles.getChildren().slice().forEach(m => {
      if (m.x < -50 || m.x > 1850 || m.y < -100 || m.y > 560) m.destroy();
    });

    // fell off world
    if (this.player.y > 520) this._loseLife();
  }

  _spawnFireball() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-300, 300), 20, 1780);
    const fb = this.fireballs.create(x, -20, 'fireball');
    fb.setVelocityY(Phaser.Math.Between(250, 400));
  }

  _fireMissile(pointer) {
    if (this.isGameOver) return;
    const dx = pointer.worldX - this.player.x;
    const dy = pointer.worldY - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const m = this.missiles.create(this.player.x, this.player.y - 10, 'missile');
    m.body.setAllowGravity(false);
    m.setVelocityX((dx / dist) * 700);
    m.setVelocityY((dy / dist) * 700);
    m.setRotation(Math.atan2(dy, dx));
  }

  _spawnSkyZombie() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-350, 350), 50, 1750);
    const z = this.enemies.create(x, -30, 'zombie');
    z.setVelocityY(220);
    z.setBounce(0);
    z.patrolActive = false;
    z.patrolMin = 0;
    z.patrolMax = 0;
  }

  _skeletonShoot(skeleton) {
    if (this.isGameOver || !skeleton.active) return;
    const dir = this.player.x < skeleton.x ? -1 : 1;
    const arrow = this.arrows.create(skeleton.x, skeleton.y - 10, 'arrow');
    arrow.body.setAllowGravity(false);
    arrow.setVelocityX(dir * 350);
    arrow.setFlipX(dir === -1);
  }

  _loseLife() {
    this.lives -= 1;
    this.events.emit('livesUpdate', this.lives);
    if (this.lives <= 0) {
      this._gameOver();
    } else {
      this.player.setPosition(64, 400);
      this.player.setVelocity(0, 0);
    }
  }

  _gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.add.text(400, 220, 'GAME OVER', {
      fontSize: '64px', fontFamily: 'Arial Black',
      color: '#ff4444', stroke: '#000', strokeThickness: 8
    }).setScrollFactor(0).setOrigin(0.5);
    this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
  }

  _winLevel() {
    this.isGameOver = true;
    this.physics.pause();
    this.add.text(400, 220, 'YOU WIN!', {
      fontSize: '64px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000', strokeThickness: 8
    }).setScrollFactor(0).setOrigin(0.5);
    this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
  }
}
