class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.score = 0;
    this.isGameOver = false;
    this.invincible = false;
    this.lastCheckpoint = { x: 64, y: 400 };

    this.starWallet = parseInt(localStorage.getItem('zapnhop_stars') || '0');
    this.dotWallet  = parseInt(localStorage.getItem('zapnhop_dots')  || '0');

    const owned = JSON.parse(localStorage.getItem('zapnhop_owned') || '{}');
    const has = id => (owned[id] || 0) > 0;

    // Per-character base stats
    const charKey = localStorage.getItem('zapnhop_character') || 'player';
    const CHAR_STATS = {
      'player':         { speed: 220, jump: 550, hp: 100, invWindow: 1500, ability: 'arsenal'    },
      'player_cap':     { speed: 230, jump: 565, hp: 115, invWindow: 1500, ability: 'shield'     },
      'player_thor':    { speed: 210, jump: 530, hp: 120, invWindow: 1500, ability: 'fly', lives: 2 },
      'player_hulk':    { speed: 170, jump: 730, hp: 150, invWindow: 1500, ability: 'smash'      },
      'player_widow':   { speed: 290, jump: 560, hp: 80,  invWindow: 3500, ability: 'swift'      },
      'player_hawkeye': { speed: 225, jump: 555, hp: 100, invWindow: 1500, ability: 'pierce'     },
      'player_spidey':  { speed: 245, jump: 640, hp: 90,  invWindow: 1500, ability: 'doublejump' },
      'player_panther': { speed: 305, jump: 590, hp: 90,  invWindow: 1500, ability: 'dash'       },
      'player_witch':   { speed: 220, jump: 550, hp: 105, invWindow: 1500, ability: 'hex'        },
      'player_strange': { speed: 220, jump: 550, hp: 100, invWindow: 1500, ability: 'timestop'   },
    };
    const cs = CHAR_STATS[charKey] || CHAR_STATS['player'];
    this.maxHealth    = has('health_upgrade') ? cs.hp + 25 : cs.hp;
    this.health       = this.maxHealth;
    this._moveSpeed   = has('speed_boost') ? cs.speed + 45 : cs.speed;
    this._jumpForce   = cs.jump;
    this._invWindow   = cs.invWindow;
    this._charAbility = cs.ability;
    this._startShield = has('iron_shield');
    this.lives        = cs.lives || 3;

    // Ability tracking state
    this._jumpHeld       = false;
    this._jumpCount      = 0;
    this._wasOnGround    = true;
    this._peakFallVel    = 0;
    this._abilityLastUsed = 0;

    ['health_upgrade', 'speed_boost', 'unibeam_plus', 'extra_sbomb', 'iron_shield'].forEach(id => {
      if (owned[id] > 0) owned[id]--;
      if (owned[id] <= 0) delete owned[id];
    });
    localStorage.setItem('zapnhop_owned', JSON.stringify(owned));

    // Projectile / object groups
    this.arrows      = this.physics.add.group();
    this.fireballs   = this.physics.add.group();
    this.missiles    = this.physics.add.group();
    this.repulsors   = this.physics.add.group();
    this.unibeams    = this.physics.add.group();
    this.copBullets  = this.physics.add.group();
    this.capShields  = this.physics.add.group();
    this.planes      = this.physics.add.group();
    this.balloons    = this.physics.add.group();
    this.debrisGroup = this.physics.add.group();

    this.inventory = {
      current: 'missile',
      weapons: {
        missile:   { label: 'MISSILE',  key: '1', ammo: Infinity,               cooldown: 200,  lastFired: 0, color: '#ff4444' },
        repulsor:  { label: 'REPULSOR', key: '2', ammo: Infinity,               cooldown: 350,  lastFired: 0, color: '#44aaff' },
        unibeam:   { label: 'UNIBEAM',  key: '3', ammo: has('unibeam_plus') ? 20 : 15, cooldown: 700, lastFired: 0, color: '#ffcc00' },
        smartbomb: { label: 'S-BOMB',   key: '4', ammo: has('extra_sbomb')  ? 4  : 3,  cooldown: 2000, lastFired: 0, color: '#ff8800' },
      }
    };

    this._buildLevel();
    this._createPlayer();
    this._createEnemies();
    this._createCops();
    this._setupCollisions();
    this._setupCamera();
    this._setupInput();

    if (this._startShield) {
      this.invincible = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(3000, () => {
        if (!this.isGameOver) { this.invincible = false; this.player.setAlpha(1); }
      });
    }

    // Scarlet Witch passive: auto hex bolts
    if (this._charAbility === 'hex') {
      this.time.addEvent({ delay: 2500, loop: true, callback: this._fireHexBolt, callbackScope: this });
    }

    this.events.emit('livesUpdate', this.lives);

    this.time.addEvent({ delay: 900,   loop: true, callback: this._spawnFireball,  callbackScope: this });
    this.time.addEvent({ delay: 3500,  loop: true, callback: this._spawnSkyZombie, callbackScope: this });
    this.time.addEvent({ delay: 2800,  loop: true, callback: this._spawnDebris,    callbackScope: this });
    this.time.addEvent({ delay: 11000, loop: true, callback: this._spawnPlane,     callbackScope: this });
    this.time.addEvent({ delay: 17000, loop: true, callback: this._spawnBalloon,   callbackScope: this });

    this.scene.launch('UIScene', { gameScene: this });
  }

  // ─── Background ────────────────────────────────────────────────────────────

  _createBackground() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-30);
    sky.fillStyle(0x0D0200); sky.fillRect(0, 0, 800, 500);
    sky.fillStyle(0x2B0500); sky.fillRect(0, 150, 800, 130);
    sky.fillStyle(0x5C0E00); sky.fillRect(0, 290, 800, 120);
    sky.fillStyle(0x8B1A00); sky.fillRect(0, 400, 800, 100);

    const far = this.add.graphics().setScrollFactor(0.2).setDepth(-20);
    far.fillStyle(0x130404);
    for (let bx = 0; bx < 2400;) {
      const bw = 40 + Math.floor(Math.random() * 60);
      const by = 340 + Math.floor(Math.random() * 90);
      far.fillRect(bx, by, bw, 468 - by);
      bx += bw - 6;
    }

    const mid = this.add.graphics().setScrollFactor(0.5).setDepth(-15);
    for (let bx = 0; bx < 4500;) {
      const bw = 55 + Math.floor(Math.random() * 70);
      const by = 250 + Math.floor(Math.random() * 110);
      mid.fillStyle(0x1E0800);
      mid.fillRect(bx, by, bw, 468 - by);
      for (let wy = by + 10; wy < 440; wy += 16) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 12) {
          if (Math.random() > 0.55) {
            mid.fillStyle(0x5C1500); mid.fillRect(wx, wy, 5, 7);
            mid.fillStyle(0x1E0800);
          }
        }
      }
      bx += bw - 8;
    }

    const near = this.add.graphics().setScrollFactor(0.8).setDepth(-10);
    near.fillStyle(0xFF4400);
    for (let gx = 100; gx < 7200; gx += 320) near.fillEllipse(gx, 445, 220, 55);
    for (let bx = 0; bx < 7000;) {
      const bw = 60 + Math.floor(Math.random() * 90);
      const by = 145 + Math.floor(Math.random() * 175);
      const bh = 468 - by;
      near.fillStyle(0x0A0808); near.fillRect(bx, by, bw, bh);
      for (let wy = by + 12; wy < by + bh - 20; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 8; wx += 14) {
          if (Math.random() > 0.45) { near.fillStyle(0xFF8C00); near.fillRect(wx, wy, 7, 9); }
        }
      }
      const fc = Math.max(1, Math.floor(bw / 25));
      for (let f = 0; f < fc; f++) {
        const fx = bx + 12 + f * (bw / fc);
        const fh = 20 + Math.random() * 28;
        near.fillStyle(0xFF4400);
        near.fillPoints([{ x: fx-8, y: by }, { x: fx-3, y: by-fh*0.6 }, { x: fx, y: by-fh }, { x: fx+3, y: by-fh*0.6 }, { x: fx+8, y: by }], true);
        near.fillStyle(0xFFBB00);
        near.fillPoints([{ x: fx-4, y: by }, { x: fx, y: by-fh*0.65 }, { x: fx+4, y: by }], true);
      }
      bx += bw - 10;
    }
  }

  // ─── Level ─────────────────────────────────────────────────────────────────

  _buildLevel() {
    this._createBackground();

    const platforms = [
      ...Array.from({ length: 125 }, (_, i) => ({ x: i * 64, y: 468, w: 1 })),
      { x: 200,  y: 370, w: 3 }, { x: 450,  y: 300, w: 3 },
      { x: 700,  y: 360, w: 3 }, { x: 950,  y: 280, w: 3 },
      { x: 1150, y: 350, w: 4 }, { x: 1400, y: 260, w: 3 },
      { x: 1600, y: 340, w: 3 },
      { x: 1820, y: 380, w: 3 }, { x: 2020, y: 310, w: 4 },
      { x: 2280, y: 360, w: 3 }, { x: 2480, y: 275, w: 4 },
      { x: 2700, y: 340, w: 3 }, { x: 2900, y: 255, w: 3 },
      { x: 3100, y: 315, w: 4 }, { x: 3320, y: 225, w: 3 },
      { x: 3520, y: 390, w: 2 }, { x: 3680, y: 310, w: 3 },
      { x: 3880, y: 245, w: 3 }, { x: 4080, y: 185, w: 4 },
      { x: 4330, y: 255, w: 3 }, { x: 4530, y: 195, w: 3 },
      { x: 4730, y: 265, w: 4 }, { x: 4980, y: 205, w: 3 },
      { x: 5180, y: 285, w: 3 }, { x: 5360, y: 165, w: 4 },
      { x: 5520, y: 355, w: 2 }, { x: 5680, y: 275, w: 3 },
      { x: 5880, y: 205, w: 2 }, { x: 6020, y: 145, w: 3 },
      { x: 6220, y: 205, w: 2 }, { x: 6370, y: 305, w: 3 },
      { x: 6560, y: 235, w: 2 }, { x: 6710, y: 165, w: 3 },
      { x: 6910, y: 245, w: 3 },
      { x: 7020, y: 355, w: 4 }, { x: 7270, y: 275, w: 3 },
      { x: 7470, y: 205, w: 3 }, { x: 7680, y: 285, w: 4 },
      { x: 7870, y: 225, w: 3 },
    ];
    this.platforms = this.physics.add.staticGroup();
    platforms.forEach(({ x, y, w }) => {
      for (let i = 0; i < w; i++) this.platforms.create(x + i * 64, y, 'platform').refreshBody();
    });

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

    const checkpointData = [
      { x: 1720, y: 435 }, { x: 3450, y: 435 },
      { x: 5460, y: 435 }, { x: 6980, y: 435 },
    ];
    this.checkpoints = this.physics.add.staticGroup();
    checkpointData.forEach(({ x, y }) => {
      const cp = this.checkpoints.create(x, y, 'checkpoint');
      cp.activated = false;
    });

    const regenData = [
      { x: 900, y: 440 }, { x: 2700, y: 440 },
      { x: 5000, y: 440 }, { x: 7050, y: 440 },
    ];
    this.healthRegens = this.physics.add.staticGroup();
    regenData.forEach(({ x, y }) => this.healthRegens.create(x, y, 'healthregen'));

    const flagGfx = this.add.graphics();
    flagGfx.fillStyle(0x888888); flagGfx.fillRect(0, 0, 4, 60);
    flagGfx.fillStyle(0x00FF44); flagGfx.fillRect(4, 4, 18, 12);
    flagGfx.x = 7942; flagGfx.y = 408;
    this.flagZone = this.add.zone(7952, 440, 26, 60).setRectangleDropZone(26, 60);
    this.physics.add.existing(this.flagZone, true);
  }

  // ─── Player ────────────────────────────────────────────────────────────────

  _createPlayer() {
    const charKey = localStorage.getItem('zapnhop_character') || 'player';
    this.player = this.physics.add.sprite(64, 400, charKey);
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0.1);
    this.physics.world.setBounds(0, 0, 8000, 500);
  }

  // ─── Enemies ───────────────────────────────────────────────────────────────

  _createEnemies() {
    this.enemies = this.physics.add.group();

    // Ground skeletons
    const enemyData = [
      { x: 450,  y: 430, min: 380,  max: 560  },
      { x: 590,  y: 430, min: 510,  max: 690  },
      { x: 750,  y: 430, min: 600,  max: 900  },
      { x: 920,  y: 430, min: 830,  max: 1020 },
      { x: 1100, y: 430, min: 950,  max: 1300 },
      { x: 1275, y: 430, min: 1170, max: 1390 },
      { x: 1450, y: 430, min: 1300, max: 1580 },
      { x: 1800, y: 430, min: 1700, max: 1950 },
      { x: 2050, y: 430, min: 1900, max: 2200 },
      { x: 2320, y: 430, min: 2200, max: 2460 },
      { x: 2500, y: 430, min: 2350, max: 2660 },
      { x: 2730, y: 430, min: 2620, max: 2870 },
      { x: 2950, y: 430, min: 2800, max: 3100 },
      { x: 3160, y: 430, min: 3010, max: 3280 },
      { x: 3350, y: 430, min: 3200, max: 3500 },
      { x: 3560, y: 430, min: 3400, max: 3720 },
      { x: 3750, y: 430, min: 3600, max: 3950 },
      { x: 3970, y: 430, min: 3820, max: 4120 },
      { x: 4200, y: 430, min: 4050, max: 4400 },
      { x: 4470, y: 430, min: 4320, max: 4610 },
      { x: 4700, y: 430, min: 4550, max: 4860 },
      { x: 4920, y: 430, min: 4770, max: 5060 },
      { x: 5100, y: 430, min: 4950, max: 5260 },
      { x: 5360, y: 430, min: 5230, max: 5500 },
      { x: 5650, y: 430, min: 5500, max: 5860 },
      { x: 5900, y: 430, min: 5760, max: 6020 },
      { x: 6150, y: 430, min: 6000, max: 6360 },
      { x: 6410, y: 430, min: 6260, max: 6560 },
      { x: 6650, y: 430, min: 6500, max: 6860 },
      { x: 6880, y: 430, min: 6730, max: 7040 },
      { x: 7100, y: 430, min: 7000, max: 7310 },
      { x: 7250, y: 430, min: 7170, max: 7370 },
      { x: 7400, y: 430, min: 7310, max: 7610 },
      { x: 7700, y: 430, min: 7610, max: 7910 },
      { x: 7950, y: 430, min: 7830, max: 7990 },
    ];
    enemyData.forEach(({ x, y, min, max }) => {
      const e = this.enemies.create(x, y, 'enemy');
      e.setVelocityX(80); e.patrolSpeed = 80;
      e.setCollideWorldBounds(true);
      e.patrolMin = min; e.patrolMax = max;
      e.setBounce(0); e.patrolActive = true;
      e.copHealth = 3;
      e.shootTimer = this.time.addEvent({
        delay: 2000 + Math.random() * 1500, loop: true,
        callback: () => this._skeletonShoot(e), callbackScope: this
      });
    });

    // Extra ground zombies — dense street-level coverage
    const groundZombieData = [
      { x: 625,  y: 430, min: 575,  max: 735  },
      { x: 900,  y: 430, min: 840,  max: 1000 },
      { x: 1280, y: 430, min: 1210, max: 1380 },
      { x: 1650, y: 430, min: 1590, max: 1840 },
      { x: 1840, y: 430, min: 1760, max: 1960 },
      { x: 2180, y: 430, min: 2100, max: 2280 },
      { x: 2280, y: 430, min: 2210, max: 2340 },
      { x: 2720, y: 430, min: 2650, max: 2830 },
      { x: 3150, y: 430, min: 3080, max: 3260 },
      { x: 3540, y: 430, min: 3470, max: 3660 },
      { x: 3960, y: 430, min: 3860, max: 4090 },
      { x: 4450, y: 430, min: 4410, max: 4540 },
      { x: 4890, y: 430, min: 4820, max: 5000 },
      { x: 5250, y: 430, min: 5170, max: 5360 },
      { x: 5380, y: 430, min: 5275, max: 5490 },
      { x: 5780, y: 430, min: 5680, max: 5880 },
      { x: 5950, y: 430, min: 5870, max: 5990 },
      { x: 6290, y: 430, min: 6210, max: 6370 },
      { x: 6440, y: 430, min: 6370, max: 6495 },
      { x: 6790, y: 430, min: 6730, max: 6880 },
      { x: 6930, y: 430, min: 6870, max: 7000 },
      { x: 7250, y: 430, min: 7180, max: 7320 },
      { x: 7570, y: 430, min: 7490, max: 7660 },
      { x: 7870, y: 430, min: 7800, max: 7960 },
    ];
    groundZombieData.forEach(({ x, y, min, max }) => {
      const z = this.enemies.create(x, y, 'zombie');
      z.setVelocityX(70); z.patrolSpeed = 70;
      z.setCollideWorldBounds(true);
      z.patrolMin = min; z.patrolMax = max;
      z.setBounce(0); z.patrolActive = true;
      z.copHealth = 3;
      z.shootTimer = null;
    });

    // Platform zombies
    const platformZombieData = [
      { x: 514,  y: 260, min: 460,  max: 570,  speed: 55 },
      { x: 1246, y: 310, min: 1160, max: 1330, speed: 55 },
      { x: 2084, y: 270, min: 2030, max: 2200, speed: 60 },
      { x: 2764, y: 300, min: 2710, max: 2820, speed: 60 },
      { x: 3944, y: 205, min: 3890, max: 4000, speed: 65 },
      { x: 4794, y: 225, min: 4740, max: 4910, speed: 65 },
      { x: 5744, y: 235, min: 5690, max: 5800, speed: 70 },
      { x: 6434, y: 265, min: 6380, max: 6490, speed: 70 },
      { x: 7334, y: 235, min: 7280, max: 7390, speed: 75 },
      { x: 7744, y: 245, min: 7690, max: 7860, speed: 75 },
      { x: 764,  y: 320, min: 710,  max: 828,  speed: 55 },
      { x: 1014, y: 240, min: 960,  max: 1078, speed: 55 },
      { x: 2964, y: 215, min: 2910, max: 3028, speed: 60 },
      { x: 3164, y: 275, min: 3110, max: 3292, speed: 60 },
      { x: 4394, y: 215, min: 4340, max: 4458, speed: 65 },
      { x: 5244, y: 245, min: 5190, max: 5308, speed: 65 },
      { x: 5912, y: 165, min: 5890, max: 5944, speed: 70 },
      { x: 6592, y: 195, min: 6570, max: 6624, speed: 70 },
      { x: 7534, y: 165, min: 7480, max: 7594, speed: 75 },
      { x: 7808, y: 245, min: 7740, max: 7872, speed: 75 },
    ];
    platformZombieData.forEach(({ x, y, min, max, speed }) => {
      const z = this.enemies.create(x, y, 'zombie');
      z.setVelocityX(speed); z.patrolSpeed = speed;
      z.setCollideWorldBounds(true);
      z.patrolMin = min; z.patrolMax = max;
      z.setBounce(0); z.patrolActive = true;
      z.copHealth = 3;
      z.shootTimer = null;
    });
  }

  // ─── Collisions ────────────────────────────────────────────────────────────

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(this.player, this.coins, (_, coin) => {
      coin.destroy(); this.score += 10;
      this.dotWallet++;
      localStorage.setItem('zapnhop_dots', this.dotWallet);
      this.events.emit('scoreUpdate', this.score);
      this.events.emit('currencyUpdate', this.starWallet, this.dotWallet);
    });
    this.physics.add.overlap(this.player, this.stars, (_, star) => {
      star.destroy(); this.score += 25;
      this.starWallet++;
      localStorage.setItem('zapnhop_stars', this.starWallet);
      this.events.emit('scoreUpdate', this.score);
      this.events.emit('currencyUpdate', this.starWallet, this.dotWallet);
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
        this._takeDamage(30);
      }
    });

    this.physics.add.collider(this.arrows, this.platforms, a => a.destroy());
    this.physics.add.overlap(this.player, this.arrows, (_, arrow) => {
      if (this.isGameOver || this.invincible) return;
      arrow.destroy(); this._takeDamage(20);
    });

    this.physics.add.collider(this.fireballs, this.platforms, fb => this._explodeFireball(fb));
    this.physics.add.overlap(this.player, this.fireballs, (_, fb) => {
      if (this.isGameOver || this.invincible) return;
      fb.destroy(); this._takeDamage(25);
    });

    this.physics.add.overlap(this.player, this.checkpoints, (_, cp) => {
      if (!cp.activated) {
        cp.activated = true;
        cp.setTexture('checkpoint_active'); cp.refreshBody();
        this.lastCheckpoint = { x: cp.x, y: 400 };
        this.cameras.main.flash(200, 255, 215, 0);
      }
    });

    this.physics.add.overlap(this.player, this.healthRegens, (_, pkg) => {
      pkg.destroy(); this._heal(35);
    });

    this.physics.add.collider(this.missiles, this.platforms, m => m.destroy());
    this.physics.add.overlap(this.missiles, this.enemies, (missile, enemy) => {
      missile.destroy();
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 50; this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.collider(this.repulsors, this.platforms, r => r.destroy());
    this.physics.add.overlap(this.repulsors, this.enemies, (repulsor, enemy) => {
      repulsor.destroy();
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 30; this.events.emit('scoreUpdate', this.score);
    });

    this.physics.add.collider(this.unibeams, this.platforms, u => u.destroy());
    this.physics.add.overlap(this.unibeams, this.enemies, (beam, enemy) => {
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 75; this.events.emit('scoreUpdate', this.score);
      beam.pierceCount = (beam.pierceCount || 3) - 1;
      if (beam.pierceCount <= 0) beam.destroy();
    });

    // Cap shield — bounces off platforms, passes through enemies
    this.physics.add.collider(this.capShields, this.platforms, (shield) => {
      if (!shield.active) return;
      shield.bounces = (shield.bounces || 0) + 1;
      if (shield.bounces >= 4) shield.destroy();
    });
    this.physics.add.overlap(this.capShields, this.enemies, (shield, enemy) => {
      if (!shield.active || !enemy.active) return;
      if (enemy.shootTimer) enemy.shootTimer.remove();
      enemy.destroy();
      this.score += 60; this.events.emit('scoreUpdate', this.score);
    });

    // Cop bullets — takes 3 hits to kill (barely damages)
    this.physics.add.collider(this.copBullets, this.platforms, b => b.destroy());
    this.physics.add.overlap(this.copBullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.copHealth = (enemy.copHealth || 3) - 1;
      if (enemy.copHealth <= 0) {
        if (enemy.shootTimer) enemy.shootTimer.remove();
        enemy.destroy();
        this.score += 15; this.events.emit('scoreUpdate', this.score);
      }
    });

    // Debris — smash on landing, hurt player on contact
    this.physics.add.collider(this.debrisGroup, this.platforms, (debris) => {
      if (!debris.active) return;
      const ix = debris.x;
      this.cameras.main.shake(160, 0.012);
      this.enemies.getChildren().slice().forEach(e => {
        if (e.active && Math.abs(e.x - ix) < 90) {
          if (e.shootTimer) e.shootTimer.remove();
          e.destroy(); this.score += 20;
        }
      });
      this.events.emit('scoreUpdate', this.score);
      debris.destroy();
    });
    this.physics.add.overlap(this.player, this.debrisGroup, (_, debris) => {
      if (this.isGameOver || this.invincible) return;
      debris.destroy(); this._takeDamage(30);
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
    this.cursors   = this.input.keyboard.createCursorKeys();
    this.wasd      = this.input.keyboard.addKeys({ up: 'W', left: 'A', right: 'D' });
    this.weaponKeys = this.input.keyboard.addKeys({ w1: '1', w2: '2', w3: '3', w4: '4' });
    this.abilityKey = this.input.keyboard.addKey('E');
    this.input.on('pointerdown', this._fireWeapon, this);
  }

  // ─── Update loop ───────────────────────────────────────────────────────────

  update() {
    if (this.isGameOver) return;

    const { left, right, up, space } = this.cursors;
    const onGround = this.player.body.blocked.down;

    // Movement
    if (left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-this._moveSpeed); this.player.setFlipX(true);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(this._moveSpeed); this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump / flight
    const jumpNow = up.isDown || space.isDown || this.wasd.up.isDown;
    const jumpJustPressed = jumpNow && !this._jumpHeld;
    this._jumpHeld = jumpNow;

    if (onGround) this._jumpCount = 0;

    if (jumpNow && onGround) {
      this.player.setVelocityY(-this._jumpForce);
      this._jumpCount = 1;
    } else if (jumpJustPressed && !onGround && this._charAbility === 'doublejump' && this._jumpCount === 1) {
      // Spider-Man double jump
      this.player.setVelocityY(-Math.round(this._jumpForce * 0.85));
      this._jumpCount = 2;
    }

    // Thor: hold jump in air → near-zero gravity (hover / fly)
    if (this._charAbility === 'fly') {
      this.player.body.setGravityY(jumpNow && !onGround ? -570 : 0);
    }

    // Hulk: track peak fall speed; trigger ground smash on hard landing
    if (!onGround) {
      this._peakFallVel = Math.max(this._peakFallVel, this.player.body.velocity.y);
    }
    if (onGround && !this._wasOnGround && this._charAbility === 'smash' && this._peakFallVel > 380) {
      this.cameras.main.shake(300, 0.022);
      const ix = this.player.x;
      this.enemies.getChildren().slice().forEach(e => {
        if (e.active && Math.abs(e.x - ix) < 160) {
          if (e.shootTimer) e.shootTimer.remove();
          e.destroy(); this.score += 35;
        }
      });
      this.events.emit('scoreUpdate', this.score);
    }
    if (onGround) this._peakFallVel = 0;
    this._wasOnGround = onGround;

    if (this.player.y < 4) {
      this.player.y = 4;
      if (this.player.body.velocity.y < 0) this.player.body.velocity.y = 0;
    }

    // Weapon switch keys 1–4
    const K = Phaser.Input.Keyboard.JustDown;
    if (K(this.weaponKeys.w1)) this._switchWeapon('missile');
    if (K(this.weaponKeys.w2)) this._switchWeapon('repulsor');
    if (K(this.weaponKeys.w3)) this._switchWeapon('unibeam');
    if (K(this.weaponKeys.w4)) this._switchWeapon('smartbomb');

    // E key: Black Panther dash or Dr. Strange time stop
    if (K(this.abilityKey)) this._useSpecialAbility();

    // Enemy patrol + sky zombie landing
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.patrolActive) {
        const spd = e.patrolSpeed || 80;
        if (e.x >= e.patrolMax) e.setVelocityX(-spd);
        if (e.x <= e.patrolMin) e.setVelocityX(spd);
      } else if (e.body && e.body.blocked.down) {
        e.patrolActive = true;
        e.patrolSpeed = 60;
        e.patrolMin = Math.max(0, e.x - 120);
        e.patrolMax = Math.min(8000, e.x + 120);
        e.setVelocityX(60);
      }
    });

    // Clean up off-world enemies
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && e.y > 540) { if (e.shootTimer) e.shootTimer.remove(); e.destroy(); }
    });

    // Clean up projectiles out of bounds
    const OOB = p => !p.active || p.x < -100 || p.x > 8100 || p.y < -150 || p.y > 600;
    [this.missiles, this.repulsors, this.unibeams, this.copBullets, this.capShields].forEach(grp => {
      grp.getChildren().slice().forEach(p => { if (OOB(p)) p.destroy(); });
    });
    this.fireballs.getChildren().slice().forEach(fb => { if (fb.active && fb.y > 540) fb.destroy(); });
    this.debrisGroup.getChildren().slice().forEach(d => { if (d.active && d.y > 540) d.destroy(); });
    this.arrows.getChildren().slice().forEach(a => {
      if (a.active && (a.x < -50 || a.x > this.player.x + 950)) a.destroy();
    });
    const camL = this.cameras.main.scrollX - 200;
    const camR = this.cameras.main.scrollX + 1000;
    this.planes.getChildren().slice().forEach(p => {
      if (p.active && (p.x < camL || p.x > camR)) p.destroy();
    });
    this.balloons.getChildren().slice().forEach(b => {
      if (b.active && (b.x < camL || b.x > camR)) b.destroy();
    });

    if (this.player.y > 520) this._playerDied();
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
      case 'missile':
        if (this._charAbility === 'shield')  this._throwCapShield(pointer);
        else if (this._charAbility === 'pierce') this._firePierceArrow(pointer);
        else this._fireMissile(pointer);
        break;
      case 'repulsor':  this._fireRepulsor(pointer); break;
      case 'unibeam':   this._fireUnibeam(pointer);  break;
      case 'smartbomb': this._fireSmartBomb();        break;
    }
    this.events.emit('inventoryUpdate', this.inventory);
  }

  _fireMissile(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const m = this.missiles.create(this.player.x, this.player.y - 10, 'missile');
    m.body.setAllowGravity(false);
    m.setVelocityX((dx/d)*700); m.setVelocityY((dy/d)*700);
    m.setRotation(Math.atan2(dy, dx));
  }

  _fireRepulsor(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const angle = Math.atan2(dy, dx);
    [-0.25, 0, 0.25].forEach(spread => {
      const a = angle + spread;
      const b = this.repulsors.create(this.player.x, this.player.y - 10, 'repulsor_blast');
      b.body.setAllowGravity(false);
      b.setVelocityX(Math.cos(a)*550); b.setVelocityY(Math.sin(a)*550);
    });
  }

  _fireUnibeam(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const b = this.unibeams.create(this.player.x, this.player.y - 5, 'unibeam_bolt');
    b.body.setAllowGravity(false);
    b.setVelocityX((dx/d)*450); b.setVelocityY((dy/d)*450);
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

  // Cap shield — weapon 1 for Captain America
  _throwCapShield(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const s = this.capShields.create(this.player.x, this.player.y - 10, 'cap_shield');
    s.body.setAllowGravity(false);
    s.setBounce(1); s.setCollideWorldBounds(true);
    s.setVelocityX((dx/d)*560); s.setVelocityY((dy/d)*560);
    s.bounces = 0;
    this.time.delayedCall(4000, () => { if (s.active) s.destroy(); });
  }

  // Hawkeye pierce arrow — weapon 1 for Hawkeye (uses unibeam group for pierce logic)
  _firePierceArrow(pointer) {
    const dx = pointer.worldX - this.player.x, dy = pointer.worldY - this.player.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const a = this.unibeams.create(this.player.x, this.player.y - 10, 'arrow');
    a.body.setAllowGravity(false);
    a.setVelocityX((dx/d)*700); a.setVelocityY((dy/d)*700);
    a.setRotation(Math.atan2(dy, dx));
    a.pierceCount = 3;
  }

  // Scarlet Witch passive — auto-targeting hex bolt
  _fireHexBolt() {
    if (this.isGameOver) return;
    let nearest = null, nearestDist = 520;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (dist < nearestDist) { nearest = e; nearestDist = dist; }
    });
    if (!nearest) return;
    const dx = nearest.x - this.player.x, dy = nearest.y - this.player.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const b = this.repulsors.create(this.player.x, this.player.y - 10, 'repulsor_blast');
    b.setTint(0xFF44FF);
    b.body.setAllowGravity(false);
    b.setVelocityX((dx/d)*420); b.setVelocityY((dy/d)*420);
  }

  // E key ability: Black Panther dash or Dr. Strange time stop
  _useSpecialAbility() {
    if (this.isGameOver) return;
    const now = this.time.now;

    if (this._charAbility === 'dash') {
      if (now - this._abilityLastUsed < 1000) return;
      this._abilityLastUsed = now;
      const dir = this.player.flipX ? -1 : 1;
      this.player.setVelocityX(dir * 960);
      this.invincible = true; this.player.setAlpha(0.5);
      this.time.delayedCall(280, () => {
        if (!this.isGameOver) { this.invincible = false; this.player.setAlpha(1); }
      });
    }

    if (this._charAbility === 'timestop') {
      if (now - this._abilityLastUsed < 20000) return;
      this._abilityLastUsed = now;
      this.cameras.main.flash(200, 60, 0, 200);
      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        e._origSpeed = e.patrolSpeed;
        e.patrolSpeed = Math.max(8, Math.floor((e.patrolSpeed || 80) * 0.15));
        e.setVelocityX(e.body.velocity.x * 0.15);
      });
      this.time.delayedCall(4000, () => {
        this.enemies.getChildren().forEach(e => {
          if (e.active && e._origSpeed !== undefined) {
            e.patrolSpeed = e._origSpeed;
            delete e._origSpeed;
          }
        });
      });
    }
  }

  // ─── Spawners ──────────────────────────────────────────────────────────────

  _explodeFireball(fb) {
    const x = fb.x, y = fb.y;
    fb.destroy();
    const gfx = this.add.graphics();
    gfx.fillStyle(0xFF6600, 0.75); gfx.fillCircle(0, 0, 16);
    gfx.fillStyle(0xFFCC00, 0.9);  gfx.fillCircle(0, 0, 10);
    gfx.fillStyle(0xFFFFFF, 1);    gfx.fillCircle(0, 0, 5);
    gfx.setPosition(x, y);
    this.tweens.add({
      targets: gfx, scaleX: 2.4, scaleY: 2.4, alpha: 0,
      duration: 340, ease: 'Power2',
      onComplete: () => gfx.destroy()
    });
  }

  _spawnFireball() {
    if (this.isGameOver) return;
    const count = Math.random() < 0.35 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-300, 300), 20, 7980);
      const fb = this.fireballs.create(x, -20, 'fireball');
      fb.setVelocityY(Phaser.Math.Between(250, 400));
    }
  }

  _spawnSkyZombie() {
    if (this.isGameOver) return;
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-350, 350), 50, 7950);
      const z = this.enemies.create(x, -30 - i * 80, 'zombie');
      z.setVelocityY(220); z.setBounce(0);
      z.patrolActive = false; z.patrolMin = 0; z.patrolMax = 0;
      z.copHealth = 3;
    }
  }

  _skeletonShoot(skeleton) {
    if (this.isGameOver || !skeleton.active) return;
    const dir = this.player.x < skeleton.x ? -1 : 1;
    const arrow = this.arrows.create(skeleton.x, skeleton.y - 10, 'arrow');
    arrow.body.setAllowGravity(false);
    arrow.setVelocityX(dir * 350); arrow.setFlipX(dir === -1);
  }

  // ─── Life / Game state ─────────────────────────────────────────────────────

  _takeDamage(amount) {
    if (this.isGameOver || this.invincible) return;
    this.health = Math.max(0, this.health - amount);
    this.events.emit('healthUpdate', this.health, this.maxHealth);
    if (this.health <= 0) {
      this._playerDied();
    } else {
      this.invincible = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(this._invWindow, () => {
        if (!this.isGameOver) { this.invincible = false; this.player.setAlpha(1); }
      });
    }
  }

  _playerDied() {
    if (this.isGameOver) return;
    this.lives--;
    this.events.emit('livesUpdate', this.lives);
    if (this.lives <= 0) {
      this._gameOver();
      return;
    }
    this.cameras.main.flash(400, 180, 0, 0);
    this.health = this.maxHealth;
    this.events.emit('healthUpdate', this.health, this.maxHealth);
    this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
    this.player.setVelocity(0, 0);
    this.invincible = true;
    this.player.setAlpha(0.5);
    this.time.delayedCall(this._invWindow, () => {
      if (!this.isGameOver) { this.invincible = false; this.player.setAlpha(1); }
    });
  }

  _heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.events.emit('healthUpdate', this.health, this.maxHealth);
    this.cameras.main.flash(150, 0, 180, 50);
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

  // ─── Cops ──────────────────────────────────────────────────────────────────

  _createCops() {
    this.cops = this.physics.add.group();
    // 6 cops in unorganized positions — clustered in some areas, absent in others
    const positions = [640, 1580, 1920, 3800, 5500, 6750];
    positions.forEach((x, i) => {
      const cop = this.cops.create(x, 430, 'cop');
      cop.body.setAllowGravity(false);
      cop.setImmovable(true);
      cop.shootTimer = this.time.addEvent({
        delay: 2600 + i * 220, loop: true,
        callback: () => this._copShoot(cop), callbackScope: this
      });
    });
  }

  _copShoot(cop) {
    if (this.isGameOver || !cop.active) return;
    let nearest = null, nearestDist = 450;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const dist = Math.abs(e.x - cop.x);
      if (dist < nearestDist) { nearest = e; nearestDist = dist; }
    });
    if (!nearest) return;
    const dir = nearest.x > cop.x ? 1 : -1;
    cop.setFlipX(dir === -1);
    const b = this.copBullets.create(cop.x + dir * 16, cop.y - 8, 'cop_bullet');
    b.body.setAllowGravity(false);
    b.setVelocityX(dir * 520);
    b.setFlipX(dir === -1);
  }

  // ─── Sky objects ───────────────────────────────────────────────────────────

  _spawnPlane() {
    if (this.isGameOver) return;
    const camX = this.cameras.main.scrollX;
    const fromLeft = Math.random() > 0.5;
    const p = this.planes.create(fromLeft ? camX - 90 : camX + 890, Phaser.Math.Between(45, 95), 'plane');
    p.body.setAllowGravity(false);
    p.setVelocityX(fromLeft ? 340 : -340);
    if (!fromLeft) p.setFlipX(true);
  }

  _spawnBalloon() {
    if (this.isGameOver) return;
    const camX = this.cameras.main.scrollX;
    const fromLeft = Math.random() > 0.5;
    const b = this.balloons.create(fromLeft ? camX - 50 : camX + 850, Phaser.Math.Between(20, 75), 'balloon');
    b.body.setAllowGravity(false);
    b.setVelocityX(fromLeft ? 65 : -65);
  }

  _spawnDebris() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-400, 400), 20, 7980);
    const d = this.debrisGroup.create(x, -30, 'debris');
    d.setVelocityY(Phaser.Math.Between(300, 500));
    d.setVelocityX(Phaser.Math.Between(-60, 60));
    d.setAngularVelocity(Phaser.Math.Between(-130, 130));
  }
}
