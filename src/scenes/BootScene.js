class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // placeholder graphics until real assets are added
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // player (32x48 green rectangle)
    g.fillStyle(0x44ff44);
    g.fillRect(0, 0, 32, 48);
    g.generateTexture('player', 32, 48);
    g.clear();

    // platform tile (64x16 brown)
    g.fillStyle(0x8B5E3C);
    g.fillRect(0, 0, 64, 16);
    g.generateTexture('platform', 64, 16);
    g.clear();

    // coin (16x16 yellow circle)
    g.fillStyle(0xFFD700);
    g.fillCircle(8, 8, 8);
    g.generateTexture('coin', 16, 16);
    g.clear();

    // enemy (32x32 red rectangle)
    g.fillStyle(0xff4444);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('enemy', 32, 32);
    g.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
