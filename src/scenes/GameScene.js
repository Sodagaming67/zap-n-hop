class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

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

  _buildLevel() {
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
      { x: 350, y: 430, min: 200, max: 500 },
      { x: 750, y: 430, min: 600, max: 900 },
      { x: 1100, y: 430, min: 950, max: 1300 },
      { x: 1500, y: 430, min: 1350, max: 1700 },
    ];
    enemyData.forEach(({ x, y, min, max }) => {
      const e = this.enemies.create(x, y, 'enemy');
      e.setVelocityX(80);
      e.setCollideWorldBounds(true);
      e.patrolMin = min;
      e.patrolMax = max;
      e.setBounce(0);
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
        enemy.destroy();
        player.setVelocityY(-300);
        this.score += 50;
        this.events.emit('scoreUpdate', this.score);
      } else {
        this._loseLife();
      }
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

    // enemy patrol
    this.enemies.getChildren().forEach(e => {
      if (e.x >= e.patrolMax) e.setVelocityX(-80);
      if (e.x <= e.patrolMin) e.setVelocityX(80);
    });

    // fell off world
    if (this.player.y > 520) this._loseLife();
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
