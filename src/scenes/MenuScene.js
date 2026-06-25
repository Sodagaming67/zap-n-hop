class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = 800, H = 500;

    // Sky — dark gradient bands top to bottom
    const sky = this.add.graphics();
    sky.fillStyle(0x030001); sky.fillRect(0, 0,   W, 80);
    sky.fillStyle(0x0E0103); sky.fillRect(0, 80,  W, 80);
    sky.fillStyle(0x280500); sky.fillRect(0, 160, W, 80);
    sky.fillStyle(0x4A0900); sky.fillRect(0, 240, W, 80);
    sky.fillStyle(0x721400); sky.fillRect(0, 320, W, 80);
    sky.fillStyle(0x9C1E00); sky.fillRect(0, 400, W, 100);

    // Far buildings — pure silhouettes
    const bfar = this.add.graphics();
    bfar.fillStyle(0x0D0202);
    [
      [0,315,55,185], [50,285,60,215], [105,305,45,195], [145,265,70,235],
      [210,295,50,205], [255,268,65,232], [315,288,55,212], [365,252,75,248],
      [435,272,60,228], [490,248,80,252], [565,278,55,222], [615,258,70,242],
      [680,282,50,218], [725,262,52,238], [775,288,25,212],
    ].forEach(([x, y, w, h]) => bfar.fillRect(x, y, w, h));

    // Mid buildings — dark with glowing orange windows
    const bmid = this.add.graphics();
    [
      [0,205,90,295],   [85,222,70,278],  [150,188,100,312],
      [255,215,80,285], [330,198,95,302], [430,212,85,288],
      [515,188,100,312],[620,202,85,298], [710,222,90,278],
    ].forEach(([x, y, w, h]) => {
      bmid.fillStyle(0x130404); bmid.fillRect(x, y, w, h);
      for (let wy = y + 18; wy < y + h - 35; wy += 24) {
        for (let wx = x + 8; wx < x + w - 8; wx += 20) {
          if (Math.random() > 0.42) {
            bmid.fillStyle(0xBB3300); bmid.fillRect(wx, wy, 9, 12);
            bmid.fillStyle(0xFF7700); bmid.fillRect(wx + 2, wy + 1, 5, 9);
          }
        }
      }
    });

    // Near buildings — darkest, tallest, most prominent windows
    const bnear = this.add.graphics();
    [
      [-5,158,95,342],   [85,178,88,322],  [168,142,108,358],
      [280,168,88,332],  [372,148,112,352],[488,162,98,338],
      [592,142,112,358], [708,162,97,338],
    ].forEach(([x, y, w, h]) => {
      bnear.fillStyle(0x0A0202); bnear.fillRect(x, y, w, h);
      for (let wy = y + 22; wy < y + h - 45; wy += 30) {
        for (let wx = x + 10; wx < x + w - 10; wx += 24) {
          if (Math.random() > 0.38) {
            bnear.fillStyle(0xFF4400); bnear.fillRect(wx, wy, 11, 15);
            bnear.fillStyle(0xFFAA00); bnear.fillRect(wx + 2, wy + 2, 7, 11);
          }
        }
      }
    });

    // Ground / street
    const gnd = this.add.graphics();
    gnd.fillStyle(0x090101); gnd.fillRect(0, 462, W, 38);
    [[70,462,38,14],[225,462,52,16],[415,462,44,14],[594,462,50,16],[724,462,38,14]]
      .forEach(([x, y, w, h]) => { gnd.fillStyle(0xFF3300); gnd.fillEllipse(x, y, w, h); });

    // Animated fire on near building rooftops
    [
      [43,158],[129,178],[222,142],[324,168],[428,148],[537,162],[648,142],[757,162],
    ].forEach(([fx, fy]) => {
      const f = this.add.graphics();
      f.setPosition(fx, fy);
      f.fillStyle(0xFF3300, 0.85); f.fillTriangle(-16, 0, 0, -38, 16, 0);
      f.fillStyle(0xFF7700, 0.90); f.fillTriangle(-10, 0, 0, -27, 10, 0);
      f.fillStyle(0xFFDD00, 0.95); f.fillTriangle(-5,  0, 0, -14, 5,  0);
      this.tweens.add({
        targets: f,
        scaleY: { from: 0.80, to: 1.20 },
        scaleX: { from: 0.88, to: 1.12 },
        alpha:  { from: 0.70, to: 1.00 },
        duration: 85 + Math.floor(Math.random() * 120),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Math.floor(Math.random() * 350),
      });
    });

    // Floating embers that drift upward and repeat
    const spawnEmber = (ember) => {
      ember.setPosition(Math.random() * W, 220 + Math.random() * 220);
      ember.setAlpha(0.85);
      this.tweens.add({
        targets: ember,
        y: ember.y - (70 + Math.random() * 130),
        x: ember.x + (Math.random() * 50 - 25),
        alpha: 0,
        duration: 1800 + Math.random() * 2800,
        onComplete: () => spawnEmber(ember),
      });
    };
    for (let i = 0; i < 20; i++) {
      const e = this.add.graphics();
      const sz = 1 + Math.floor(Math.random() * 3);
      e.fillStyle(0xFF5500, 0.85); e.fillRect(0, 0, sz, sz);
      this.time.delayedCall(Math.random() * 4000, () => spawnEmber(e));
    }

    // Title — layered shadow then main for fire-glow effect
    this.add.text(W / 2 + 5, 88, 'APOCALYPSE RUN', {
      fontSize: '52px', fontFamily: 'Arial Black', color: '#330000',
    }).setOrigin(0.5);
    this.add.text(W / 2 + 2, 85, 'APOCALYPSE RUN', {
      fontSize: '52px', fontFamily: 'Arial Black', color: '#880000',
    }).setOrigin(0.5);
    const title = this.add.text(W / 2, 82, 'APOCALYPSE RUN', {
      fontSize: '52px', fontFamily: 'Arial Black',
      color: '#FF4400', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title,
      alpha: { from: 0.82, to: 1.0 },
      duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Currency panel
    const stars = parseInt(localStorage.getItem('zapnhop_stars') || '0');
    const dots  = parseInt(localStorage.getItem('zapnhop_dots')  || '0');
    this.add.rectangle(W / 2, 145, 320, 34, 0x100000, 0.90).setStrokeStyle(1, 0x881100);
    this.add.text(226, 145, `★  ${stars} Stars`, {
      fontSize: '17px', fontFamily: 'Arial Black',
      color: '#FF8800', stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);
    this.add.text(420, 145, `●  ${dots} Dots`, {
      fontSize: '17px', fontFamily: 'Arial Black',
      color: '#FF5500', stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);

    // Buttons — dark red / fire theme
    this._addBtn(W / 2, 200, 'PLAY',         '#550000', '#881100', '#FF4400', () => this.scene.start('CharacterScene'));
    this._addBtn(W / 2, 300, 'ITEM SHOP',    '#331100', '#552200', '#FF8800', () => this.scene.start('ShopScene'));
    this._addBtn(W / 2, 400, 'PREMIUM SHOP', '#220033', '#440066', '#CC55FF', () => this.scene.start('PremiumShopScene'));

    // Instructions
    this.add.text(W / 2, H - 20, 'Arrow keys / WASD to move  ·  Space to jump  ·  Click to shoot', {
      fontSize: '13px', fontFamily: 'Arial', color: '#773322'
    }).setOrigin(0.5);
  }

  _addBtn(x, y, label, bgColor, hoverColor, textColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '36px', fontFamily: 'Arial Black',
      color: textColor, backgroundColor: bgColor,
      padding: { x: 28, y: 10 },
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: hoverColor }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: bgColor }));
    btn.on('pointerdown', callback);
  }
}
