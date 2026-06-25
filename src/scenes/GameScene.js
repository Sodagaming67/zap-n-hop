class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.invincible = false;

    // Projectile groups
    this.arrows    = this.physics.add.group();
    this.fireballs = this.physics.add.group();
    this.missiles  = this.physics.add.group();
    this.repulsors = this.physics.add.group();
    this.unibeams  = this.physics.add.group();

    // Inventory
    this.inventory = {
      current: 'missile',
      weapons: {
        missile:   { label: 'MISSILE',  key: '1', ammo: Infinity, cooldown: 200,  lastFired: 0, color: '#ff4444' },
        repulsor:  { label: 'REPULSOR', key: '2', ammo: Infinity, cooldown: 350,  lastFired: 0, color: '#44aaff' },
        unibeam:   { label: 'UNIBEAM',  key: '3', ammo: 15,       cooldown: 700,  lastFired: 0, color: '#ffcc00' },
        smartbomb: { label: 'S-BOMB',   key: '4', ammo: 3,        cooldown: 2000, lastFired: 0, color: '#ff8800' },
      }
    };

    this._buildLevel();
    this._createPlayer();
    this._createEnemies();
    this._setupCollisions();
    this._setupCamera();
    this._setupInput();

    this.time.addEvent({ delay: 1500, loop: true, callback: this._spawnFireball,  callbackScope: this });
    this.time.addEvent({ delay: 6000, loop: true, callback: this._spawnSkyZombie, callbackScope: this });

    this.scene.launch('UIScene', { gameScene: this });
  }

  // ─── Background ────────────────────────────────────────────────────────────

  _createBackground() {
    // Layer 0 — fixed sky gradient (screen-space)
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-30);
    sky.fillStyle(0x0D0200); sky.fillRect(0, 0, 800, 500);
    sky.fillStyle(0x2B0500); sky.fillRect(0, 150, 800, 130);
    sky.fillStyle(0x5C0E00); sky.fillRect(0, 290, 800, 120);
    sky.fillStyle(0x8B1A00); sky.fillRect(0, 400, 800, 100);

    // Layer 1 — far city (scrollFactor 0.2, spans ~2400px world)
    const far = this.add.graphics().setScrollFactor(0.2).setDepth(-20);
    far.fillStyle(0x130404);
    for (let bx = 0; bx < 2400;) {
      const bw = 40 + Math.floor(Math.random() * 60);
      const by = 340 + Math.floor(Math.random() * 90);
      far.fillRect(bx, by, bw, 468 - by);
      bx += bw - 6;
    }

    // Layer 2 — mid city (scrollFactor 0.5, spans ~4500px world)
    const mid = this.add.graphics().setScrollFactor(0.5).setDepth(-15);
    for (let bx = 0; bx < 4500;) {
      const bw = 55 + Math.floor(Math.random() * 70);
      const by = 250 + Math.floor(Math.random() * 110);
      mid.fillStyle(0x1E0800);
      mid.fillRect(bx, by, bw, 468 - by);
      for (let wy = by + 10; wy < 440; wy += 16) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 12) {
          if (Math.random() > 0.55) {
            mid.fillStyle(0x5C1500);
            mid.fillRect(wx, wy, 5, 7);
            mid.fillStyle(0x1E0800);
          }
        }
      }
      bx += bw - 8;
    }

    // Layer 3 — near city (scrollFactor 0.8, spans ~7000px world)
    const near = this.add.graphics().setScrollFactor(0.8).setDepth(-10);
    near.fillStyle(0xFF4400);
    for (let gx = 100; gx < 7200; gx += 320) near.fillEllipse(gx, 445, 220, 55);

    for (let bx = 0; bx < 7000;) {
      const bw = 60 + Math.floor(Math.random() * 90);
      const by = 145 + Math.floor(Math.random() * 175);
      const bh = 468 - by;
      near.fillStyle(0x0A0808);
      near.fillRect(bx, by, bw, bh);
      for (let wy = by + 12; wy < by + bh - 20; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 8; wx += 14) {
          if (Math.random() > 0.45) {
            near.fillStyle(0xFF8C00);
            near.fillRect(wx, wy, 7, 9);
          }
        }
      }
      const fc = Math.max(1, Math.floor(bw / 25));
      for (let f = 0; f < fc; f++) {
        const fx = bx + 12 + f * (bw / fc);
        const fh = 20 + Math.random() * 28;
        near.fillStyle(0xFF4400);
        near.fillPoints([
          { x: fx - 8, y: by }, { x: fx - 3, y: by - fh * 0.6 },
          { x: fx,     y: by - fh },
          { x: fx + 3, y: by - fh * 0.6 }, { x: fx + 8, y: by }
        ], true);
        near.fillStyle(0xFFBB00);
        near.fillPoints([
          { x: fx - 4, y: by }, { x: fx, y: by - fh * 0.65 }, { x: fx + 4, y: by }
        ], true);
      }
      bx += bw - 10;
    }
  }

  // ─── Level ─────────────────────────────────────────────────────────────────

  _buildLevel() {
    this._createBackground();

    const platforms = [
      // Ground — 125 tiles (8000px)
      ...Array.from({ length: 125 }, (_, i) => ({ x: i * 64, y: 468, w: 1 })),

      // SECTOR 1 — intro (0–1800)
      { x: 200,  y: 370, w: 3 }, { x: 450,  y: 300, w: 3 },
      { x: 700,  y: 360, w: 3 }, { x: 950,  y: 280, w: 3 },
      { x: 1150, y: 350, w: 4 }, { x: 1400, y: 260, w: 3 },
      { x: 1600, y: 340, w: 3 },

      // SECTOR 2 — rising (1800–3500)
      { x: 1820, y: 380, w: 3 }, { x: 2020, y: 310, w: 4 },
      { x: 2280, y: 360, w: 3 }, { x: 2480, y: 275, w: 4 },
      { x: 2700, y: 340, w: 3 }, { x: 2900, y: 255, w: 3 },
      { x: 3100, y: 315, w: 4 }, { x: 3320, y: 225, w: 3 },

      // SECTOR 3 — altitude (3500–5500)
      { x: 3520, y: 390, w: 2 }, { x: 3680, y: 310, w: 3 },
      { x: 3880, y: 245, w: 3 }, { x: 4080, y: 185, w: 4 },
      { x: 4330, y: 255, w: 3 }, { x: 4530, y: 195, w: 3 },
      { x: 4730, y: 265, w: 4 }, { x: 4980, y: 205, w: 3 },
      { x: 5180, y: 285, w: 3 }, { x: 5360, y: 165, w: 4 },

      // SECTOR 4 — danger zone (5500–7000)
      { x: 5520, y: 355, w: 2 }, { x: 5680, y: 275, w: 3 },
      { x: 5880, y: 205, w: 2 }, { x: 6020, y: 145, w: 3 },
      { x: 6220, y: 205, w: 2 }, { x: 6370, y: 305, w: 3 },
      { x: 6560, y: 235, w: 2 }, { x: 6710, y: 165, w: 3 },
      { x: 6910, y: 245, w: 3 },

      // SECTOR 5 — final gauntlet (7000–8000)
      { x: 7020, y: 355, w: 4 }, { x: 7270, y: 275, w: 3 },
      { x: 7470, y: 205, w: 3 }, { x: 7680, y: 285, w: 4 },
      { x: 7870, y: 225, w: 3 },
    ];

    this.platforms = this.physics.add.staticGroup();
    platforms.forEach(({ x, y, w }) => {
      for (let i = 0; i < w; i++) this.platforms.create(x + i * 64, y, 'platform').refreshBody();
    });

    // Coins
    const coins = [
      { x: 232, y: 340 }, { x: 296, y: 340 }, { x: 482, y: 270 },
      { x: 732, y: 330 }, { x: 982, y: 250 }, { x: 1432, y: 230 },
      { x: 2052, y: 280 }, { x: 2116, y: 280 }, { x: 2512, y: 245 },
      { x: 2932, y: 225 }, { x: 3132, y: 285 }, { x: 3352, y: 195 },
      { x: 3912, y: 215 }, { x: 4112, y: 155 }, { x: 4176, y: 155 },
      { x: 4562, y: 165 }, { x: 4762, y: 235 }, { x: 5012, y: 175 },
      { x: 5392, y: 135 }, { x: 5456, y: 135 }, { x: 6052, y: 115 },
      { x: 6402, y: 275 }, { x: 6742, y: 135 }, { x: 6942, y: 215 },
      { x: 7052, y: 325 }, { x: 7302, y: 245 }, { x: 7502, y: 175 },
      { x: 7712, y: 255 }, { x: 7902, y: 195 }, { x: 7966, y: 195 },
    ];
    this.coins = this.physics.add.staticGroup();
    coins.forEach(({ x, y }) => this.coins.create(x, y, 'coin'));

    // Stars (rarer, higher points)
    const stars = [
      { x: 264, y: 320 }, { x: 514, y: 250 }, { x: 1464, y: 210 },
      { x: 2180, y: 255 }, { x: 3002, y: 195 }, { x: 3434, y: 165 },
      { x: 4208, y: 125 }, { x: 4644, y: 135 }, { x: 5090, y: 145 },
      { x: 5488, y: 105 }, { x: 6134, y: 85  }, { x: 6484, y: 245 },
      { x: 6824, y: 105 }, { x: 7384, y: 215 }, { x: 7584, y: 145 },
      { x: 7984, y: 165 },
    ];
    this.stars = this.physics.add.staticGroup();
    stars.forEach(({ x, y }) => this.stars.create(x, y, 'star'));

    // End flag
    const flagGfx = this.add.graphics();
    flagGfx.fillStyle(0x888888); flagGfx.fillRect(0, 0, 4, 60);
    flagGfx.fillStyle(0x00FF44); flagGfx.fillRect(4, 4, 18, 12);
    flagGfx.x = 7942; flagGfx.y = 408;
    this.flagZone = this.add.zone(7952, 440, 26, 60).setRectangleDropZone(26, 60);
    this.physics.add.existing(this.flagZone, true);
  }

  // ─── Player ────────────────────────────────────────────────────────────────

  _createPlayer() {
    this.player = this.physics.add.sprite(64, 400, 'player');
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0.1);
    this.physics.world.setBounds(0, 0, 8000, 500);
  }

  // ─── Enemies ───────────────────────────────────────────────────────────────

  _createEnemies() {
    this.enemies = this.physics.add.group();
    const enemyData = [
      // Sector 1
      { x: 450,  y: 430, min: 380,  max: 560  },
      { x: 750,  y: 430, min: 600,  max: 900  },
      { x: 1100, y: 430, min: 950,  max: 1300 },
      { x: 1450, y: 430, min: 1300, max: 1580 },
      // Sector 2
      { x: 2050, y: 430, min: 1900, max: 2200 },
      { x: 2500, y: 430, min: 2350, max: 2660 },
      { x: 2950, y: 430, min: 2800, max: 3100 },
      { x: 3350, y: 430, min: 3200, max: 3500 },
      // Sector 3
      { x: 3750, y: 430, min: 3600, max: 3950 },
      { x: 4200, y: 430, min: 4050, max: 4400 },
      { x: 4700, y: 430, min: 4550, max: 4860 },
      { x: 5100, y: 430, min: 4950, max: 5260 },
      // Sector 4
      { x: 5650, y: 430, min: 5500, max: 5860 },
      { x: 6150, y: 430, min: 6000, max: 6360 },
      { x: 6650, y: 430, min: 6500, max: 6860 },
      // Sector 5 (dense)
      { x: 7100, y: 430, min: 7000, max: 7310 },
      { x: 7400, y: 430, min: 7310, max: 7610 },
      { x: 7700, y: 430, min: 7610, max: 7910 },
    ];
    enemyData.forEach(({ x, y, min, max }) => {
      const e = this.enemies.create(x, y, 'enemy');
      e.setVelocityX(80);
      e.setCollideWorldBounds(true);
      e.patrolMin = min; e.patrolMax = max;
      e.setBounce(0); e.patrolActive = true;
      e.shootTimer = this.time.addEvent({
        delay: 2000 + Math.random() * 1500, loop: true,
        callback: () => this._skeletonShoot(e), callbackScope: this
      });
    });
  }

  // ─── Collisions ────────────────────────────────────────────────────────────

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(this.player, this.coins, (_, coin) => {
      coin.destroy(); this.score += 10;
      this.events.emit('scoreUpdate', this.score);
    });
    this.physics.add.overlap(this.player, this.stars, (_, star) => {
      star.destroy(); this.score += 25;
      this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (this.isGameOver || this.invincible) return;
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

    // Arrow — destroys on platform, hurts player
    this.physics.add.collider(this.arrows, this.platforms, a => a.destroy());
    this.physics.add.overlap(this.player, this.arrows, (_, arrow) => {
      if (this.isGameOver || this.invincible) return;
      arrow.destroy(); this._loseLife();
    });

    // Fireball — destroys on platform, hurts player
    this.physics.add.collider(this.fireballs, this.platforms, fb => fb.destroy());
    this.physics.add.overlap(this.player, this.fireballs, (_, fb) => {
      if (this.isGameOver || this.invincible) return;
      fb.destroy(); this._loseLife();
    });

    // Missile — destroys on platform/enemy
    this.physics.add.collider(this.missiles, this.platforms, m => m.destroy());
    this.physics.add.overlap(this.missiles, this.enemies, (missile, enemy) => {
      missile.destroy();
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 50; this.events.emit('scoreUpdate', this.score);
    });

    // Repulsor — destroys on platform/enemy
    this.physics.add.collider(this.repulsors, this.platforms, r => r.destroy());
    this.physics.add.overlap(this.repulsors, this.enemies, (repulsor, enemy) => {
      repulsor.destroy();
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 30; this.events.emit('scoreUpdate', this.score);
    });

    // Unibeam — destroys on platform, pierces up to 3 enemies
    this.physics.add.collider(this.unibeams, this.platforms, u => u.destroy());
    this.physics.add.overlap(this.unibeams, this.enemies, (beam, enemy) => {
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 75; this.events.emit('scoreUpdate', this.score);
      beam.pierceCount = (beam.pierceCount || 3) - 1;
      if (beam.pierceCount <= 0) beam.destroy();
    });

    this.physics.add.overlap(this.player, this.flagZone, () => {
      if (!this.isGameOver) this._winLevel();
    });
  }

  // ─── Camera & Input ────────────────────────────────────────────────────────

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, 8000, 500);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', left: 'A', right: 'D' });
    this.weaponKeys = this.input.keyboard.addKeys({ w1: '1', w2: '2', w3: '3', w4: '4' });
    this.input.on('pointerdown', this._fireWeapon, this);
  }

  // ─── Update loop ───────────────────────────────────────────────────────────

  update() {
    if (this.isGameOver) return;

    const { left, right, up, space } = this.cursors;
    const onGround = this.player.body.blocked.down;

    if (left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-220); this.player.setFlipX(true);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(220); this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }
    if ((up.isDown || space.isDown || this.wasd.up.isDown) && onGround) {
      this.player.setVelocityY(-550);
    }

    // Weapon switch keys 1–4
    const K = Phaser.Input.Keyboard.JustDown;
    if (K(this.weaponKeys.w1)) this._switchWeapon('missile');
    if (K(this.weaponKeys.w2)) this._switchWeapon('repulsor');
    if (K(this.weaponKeys.w3)) this._switchWeapon('unibeam');
    if (K(this.weaponKeys.w4)) this._switchWeapon('smartbomb');

    // Enemy patrol + sky zombie landing
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.patrolActive) {
        if (e.x >= e.patrolMax) e.setVelocityX(-80);
        if (e.x <= e.patrolMin) e.setVelocityX(80);
      } else if (e.body && e.body.blocked.down) {
        e.patrolActive = true;
        e.patrolMin = Math.max(0, e.x - 120);
        e.patrolMax = Math.min(8000, e.x + 120);
        e.setVelocityX(60);
      }
    });

    // Clean up off-world enemies (zombie fell off edge)
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && e.y > 540) { if (e.shootTimer) e.shootTimer.remove(); e.destroy(); }
    });

    // Clean up projectiles out of bounds
    const OOB = p => !p.active || p.x < -100 || p.x > 8100 || p.y < -150 || p.y > 600;
    [this.missiles, this.repulsors, this.unibeams].forEach(grp => {
      grp.getChildren().slice().forEach(p => { if (OOB(p)) p.destroy(); });
    });
    this.fireballs.getChildren().slice().forEach(fb => { if (fb.active && fb.y > 540) fb.destroy(); });
    this.arrows.getChildren().slice().forEach(a => {
      if (a.active && (a.x < -50 || a.x > this.player.x + 950)) a.destroy();
    });

    if (this.player.y > 520) this._loseLife();
  }

  // ─── Weapon system ─────────────────────────────────────────────────────────

  _switchWeapon(name) {
    this.inventory.current = name;
    this.events.emit('weaponSwitch', this.inventory);
  }

  _fireWeapon(pointer) {
    if (this.isGameOver) return;
    const w = this.inventory.weapons[this.inventory.current];
    const now = this.time.now;
    if (now - w.lastFired < w.cooldown) return;
    if (w.ammo !== Infinity && w.ammo <= 0) return;
    w.lastFired = now;
    if (w.ammo !== Infinity) w.ammo--;
    switch (this.inventory.current) {
      case 'missile':   this._fireMissile(pointer);  break;
      case 'repulsor':  this._fireRepulsor(pointer); break;
      case 'unibeam':   this._fireUnibeam(pointer);  break;
      case 'smartbomb': this._fireSmartBomb();        break;
    }
    this.events.emit('inventoryUpdate', this.inventory);
  }

  _fireMissile(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const m = this.missiles.create(this.player.x, this.player.y - 10, 'missile');
    m.body.setAllowGravity(false);
    m.setVelocityX((dx / d) * 700); m.setVelocityY((dy / d) * 700);
    m.setRotation(Math.atan2(dy, dx));
  }

  _fireRepulsor(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const angle = Math.atan2(dy, dx);
    [-0.25, 0, 0.25].forEach(spread => {
      const a = angle + spread;
      const b = this.repulsors.create(this.player.x, this.player.y - 10, 'repulsor_blast');
      b.body.setAllowGravity(false);
      b.setVelocityX(Math.cos(a) * 550); b.setVelocityY(Math.sin(a) * 550);
    });
  }

  _fireUnibeam(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const b = this.unibeams.create(this.player.x, this.player.y - 5, 'unibeam_bolt');
    b.body.setAllowGravity(false);
    b.setVelocityX((dx / d) * 450); b.setVelocityY((dy / d) * 450);
    b.setRotation(Math.atan2(dy, dx));
    b.pierceCount = 3;
  }

  _fireSmartBomb() {
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(150, 255, 180, 50);
    const left = this.cameras.main.scrollX - 100;
    const right = this.cameras.main.scrollX + 900;
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && e.x >= left && e.x <= right) {
        if (e.shootTimer) e.shootTimer.remove();
        e.destroy(); this.score += 50;
      }
    });
    this.events.emit('scoreUpdate', this.score);
  }

  // ─── Spawners ──────────────────────────────────────────────────────────────

  _spawnFireball() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-300, 300), 20, 7980);
    const fb = this.fireballs.create(x, -20, 'fireball');
    fb.setVelocityY(Phaser.Math.Between(250, 400));
  }

  _spawnSkyZombie() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-350, 350), 50, 7950);
    const z = this.enemies.create(x, -30, 'zombie');
    z.setVelocityY(220); z.setBounce(0);
    z.patrolActive = false; z.patrolMin = 0; z.patrolMax = 0;
  }

  _skeletonShoot(skeleton) {
    if (this.isGameOver || !skeleton.active) return;
    const dir = this.player.x < skeleton.x ? -1 : 1;
    const arrow = this.arrows.create(skeleton.x, skeleton.y - 10, 'arrow');
    arrow.body.setAllowGravity(false);
    arrow.setVelocityX(dir * 350); arrow.setFlipX(dir === -1);
  }

  // ─── Life / Game state ─────────────────────────────────────────────────────

  _loseLife() {
    if (this.isGameOver || this.invincible) return;
    this.lives--;
    this.events.emit('livesUpdate', this.lives);
    if (this.lives <= 0) {
      this._gameOver();
    } else {
      this.player.setPosition(64, 400); this.player.setVelocity(0, 0);
      this.invincible = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(1500, () => { this.invincible = false; this.player.setAlpha(1); });
    }
  }

  _gameOver() {
    this.isGameOver = true; this.physics.pause();
    this.add.text(400, 220, 'GAME OVER', {
      fontSize: '64px', fontFamily: 'Arial Black',
      color: '#ff4444', stroke: '#000', strokeThickness: 8
    }).setScrollFactor(0).setOrigin(0.5);
    this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
  }

  _winLevel() {
    this.isGameOver = true; this.physics.pause();
    this.add.text(400, 220, 'YOU WIN!', {
      fontSize: '64px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000', strokeThickness: 8
    }).setScrollFactor(0).setOrigin(0.5);
    this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
  }
}
