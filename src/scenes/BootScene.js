class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // placeholder graphics until real assets are added
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Iron Man player (32x48)
    g.fillStyle(0xCC0000);
    g.fillRect(5, 0, 22, 14);      // helmet
    g.fillRect(3, 14, 26, 20);     // torso
    g.fillRect(4, 34, 11, 14);     // left leg
    g.fillRect(17, 34, 11, 14);    // right leg
    g.fillRect(0, 15, 3, 17);      // left arm
    g.fillRect(29, 15, 3, 17);     // right arm
    g.fillStyle(0xFFCC00);
    g.fillRect(5, 5, 22, 4);       // visor
    g.fillRect(3, 14, 26, 3);      // shoulder band
    g.fillRect(4, 44, 11, 4);      // left boot
    g.fillRect(17, 44, 11, 4);     // right boot
    g.fillRect(0, 29, 3, 3);       // left repulsor
    g.fillRect(29, 29, 3, 3);      // right repulsor
    g.fillStyle(0x0099FF);
    g.fillCircle(16, 26, 5);       // arc reactor
    g.fillStyle(0xAADDFF);
    g.fillCircle(16, 26, 2);       // arc reactor core
    g.generateTexture('player', 32, 48);
    g.clear();

    // platform tile (64x16 with highlight/shadow/crack detail)
    g.fillStyle(0x8B5E3C);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0xAA7A52);
    g.fillRect(0, 0, 64, 3);   // top highlight
    g.fillStyle(0x5A3A1A);
    g.fillRect(0, 13, 64, 3);  // bottom shadow
    g.fillStyle(0x7A4E2C);
    g.fillRect(16, 3, 1, 10);  // vertical crack
    g.fillRect(48, 3, 1, 10);
    g.generateTexture('platform', 64, 16);
    g.clear();

    // coin (16x16 yellow circle)
    g.fillStyle(0xFFD700);
    g.fillCircle(8, 8, 8);
    g.generateTexture('coin', 16, 16);
    g.clear();

    // skeleton enemy (32x48)
    g.fillStyle(0xE8E8E8);
    g.fillCircle(16, 8, 7);       // skull
    g.fillRect(10, 16, 12, 16);   // torso
    g.fillRect(2, 17, 8, 3);      // left arm
    g.fillRect(22, 17, 8, 3);     // right arm
    g.fillRect(10, 33, 5, 15);    // left leg
    g.fillRect(17, 33, 5, 15);    // right leg
    g.fillStyle(0x222222);
    g.fillCircle(12, 7, 2);       // left eye socket
    g.fillCircle(20, 7, 2);       // right eye socket
    g.generateTexture('enemy', 32, 48);
    g.clear();

    // zombie (32x48) — green skin, outstretched arms, tattered rags
    g.fillStyle(0x6B8F4E);
    g.fillCircle(16, 8, 7);        // head
    g.fillRect(0, 16, 9, 5);       // left arm (outstretched)
    g.fillRect(23, 16, 9, 5);      // right arm (outstretched)
    g.fillStyle(0xFF2200);
    g.fillCircle(12, 7, 2);        // left eye
    g.fillCircle(20, 7, 2);        // right eye
    g.fillStyle(0x4A3A2A);
    g.fillRect(9, 16, 14, 18);     // tattered shirt
    g.fillStyle(0x2A2A4A);
    g.fillRect(9, 34, 6, 14);      // left leg
    g.fillRect(17, 34, 6, 14);     // right leg
    g.generateTexture('zombie', 32, 48);
    g.clear();

    // fireball (24x24 orange/yellow circle)
    g.fillStyle(0xFF6600);
    g.fillCircle(12, 12, 12);
    g.fillStyle(0xFFCC00);
    g.fillCircle(12, 12, 6);
    g.generateTexture('fireball', 24, 24);
    g.clear();

    // arrow (24x8 brown projectile pointing right)
    g.fillStyle(0x8B4513);
    g.fillRect(0, 3, 18, 2);
    g.fillPoints([{ x: 16, y: 1 }, { x: 24, y: 4 }, { x: 16, y: 7 }], true);
    g.generateTexture('arrow', 24, 8);
    g.clear();

    // repulsor blast (18x18 blue energy orb)
    g.fillStyle(0x0044FF);
    g.fillCircle(9, 9, 9);
    g.fillStyle(0x44AAFF);
    g.fillCircle(9, 9, 5);
    g.fillStyle(0xCCEEFF);
    g.fillCircle(9, 9, 2);
    g.generateTexture('repulsor_blast', 18, 18);
    g.clear();

    // unibeam bolt (48x8 gold/white beam)
    g.fillStyle(0xFFAA00);
    g.fillRect(0, 0, 48, 8);
    g.fillStyle(0xFFDD44);
    g.fillRect(0, 1, 48, 6);
    g.fillStyle(0xFFFFCC);
    g.fillRect(0, 2, 48, 4);
    g.fillStyle(0xFFFFFF);
    g.fillRect(0, 3, 48, 2);
    g.generateTexture('unibeam_bolt', 48, 8);
    g.clear();

    // missile (24x8) — red body, gold nose, orange exhaust
    g.fillStyle(0xCC0000);
    g.fillRect(2, 2, 15, 4);
    g.fillStyle(0xFFCC00);
    g.fillPoints([{ x: 15, y: 1 }, { x: 23, y: 4 }, { x: 15, y: 7 }], true);
    g.fillStyle(0xFF6600);
    g.fillRect(0, 3, 3, 2);
    g.generateTexture('missile', 24, 8);
    g.clear();

    // star (16x16 white 5-pointed star)
    g.fillStyle(0xFFFFFF);
    const starPoints = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? 8 : 3.5;
      starPoints.push({ x: 8 + r * Math.cos(angle), y: 8 + r * Math.sin(angle) });
    }
    g.fillPoints(starPoints, true);
    g.generateTexture('star', 16, 16);
    g.clear();

    // checkpoint flag — inactive (gray) (28x48)
    g.fillStyle(0x666666);
    g.fillRect(12, 0, 4, 48);
    g.fillStyle(0xAAAAAA);
    g.fillRect(16, 4, 14, 10);
    g.fillRect(16, 14, 14, 1);
    g.generateTexture('checkpoint', 28, 48);
    g.clear();

    // checkpoint flag — active (gold) (28x48)
    g.fillStyle(0x666666);
    g.fillRect(12, 0, 4, 48);
    g.fillStyle(0xFFD700);
    g.fillRect(16, 4, 14, 10);
    g.fillStyle(0xFF8800);
    g.fillRect(16, 14, 14, 1);
    g.fillCircle(23, 9, 3);
    g.generateTexture('checkpoint_active', 28, 48);
    g.clear();

    // health regen orb (24x24 green glowing cross)
    g.fillStyle(0x004400);
    g.fillCircle(12, 12, 12);
    g.fillStyle(0x00AA22);
    g.fillCircle(12, 12, 9);
    g.fillStyle(0x00FF44);
    g.fillRect(5, 9, 14, 6);
    g.fillRect(9, 5, 6, 14);
    g.fillStyle(0xAAFFBB);
    g.fillRect(7, 11, 10, 2);
    g.fillRect(11, 7, 2, 10);
    g.generateTexture('healthregen', 24, 24);
    g.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
