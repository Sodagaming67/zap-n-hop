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
    g.clear();

    // Captain America (32x48) — blue suit, white star, red accent
    g.fillStyle(0x003399);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0xCC0000);
    g.fillRect(3, 24, 26, 4);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.fillStyle(0xFFFFFF);
    g.fillRect(6, 5, 20, 4);
    const capStar = [];
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI / 5) - Math.PI / 2; const r = i % 2 === 0 ? 5 : 2; capStar.push({ x: 16 + r * Math.cos(a), y: 20 + r * Math.sin(a) }); }
    g.fillPoints(capStar, true);
    g.generateTexture('player_cap', 32, 48);
    g.clear();

    // Thor (32x48) — dark blue armor, silver helmet wings, red cape arms, gold belt
    g.fillStyle(0x1A3A8A);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillStyle(0xCC2200);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0xAAAAAA);
    g.fillRect(5, 0, 22, 4);
    g.fillRect(5, 0, 4, 12);
    g.fillRect(23, 0, 4, 12);
    g.fillStyle(0xFFDD00);
    g.fillRect(8, 5, 16, 5);
    g.fillRect(3, 30, 26, 4);
    g.fillStyle(0x333333);
    g.fillRect(17, 33, 13, 6);
    g.generateTexture('player_thor', 32, 48);
    g.clear();

    // Hulk (32x48) — green body, purple pants, angry red eyes
    g.fillStyle(0x228B22);
    g.fillCircle(16, 8, 8);
    g.fillRect(2, 14, 28, 20);
    g.fillRect(0, 15, 2, 17);
    g.fillRect(30, 15, 2, 17);
    g.fillStyle(0x6622AA);
    g.fillRect(3, 34, 12, 14);
    g.fillRect(17, 34, 12, 14);
    g.fillStyle(0xFF0000);
    g.fillRect(9, 5, 5, 3);
    g.fillRect(18, 5, 5, 3);
    g.generateTexture('player_hulk', 32, 48);
    g.clear();

    // Black Widow (32x48) — black suit, red hourglass belt
    g.fillStyle(0x111111);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0xCC0000);
    g.fillRect(13, 19, 6, 3);
    g.fillRect(13, 26, 6, 3);
    g.fillRect(15, 21, 2, 6);
    g.fillStyle(0x222222);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.generateTexture('player_widow', 32, 48);
    g.clear();

    // Hawkeye (32x48) — purple suit, darker mask, bow on back
    g.fillStyle(0x441188);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0x220066);
    g.fillRect(5, 5, 22, 4);
    g.fillStyle(0xCC8800);
    g.fillRect(3, 30, 26, 4);
    g.fillStyle(0x8B5E3C);
    g.fillRect(28, 8, 3, 22);
    g.fillStyle(0x441188);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.generateTexture('player_hawkeye', 32, 48);
    g.clear();

    // Spider-Man (32x48) — red head/torso/arms, blue legs, white eyes
    g.fillStyle(0xCC0000);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0x0033CC);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.fillStyle(0xFFFFFF);
    g.fillEllipse(11, 7, 8, 6);
    g.fillEllipse(21, 7, 8, 6);
    g.fillStyle(0xAA0000);
    g.fillRect(3, 20, 26, 1);
    g.fillRect(3, 26, 26, 1);
    g.generateTexture('player_spidey', 32, 48);
    g.clear();

    // Black Panther (32x48) — near-black suit, purple visor and claw marks
    g.fillStyle(0x0A0A0A);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0x8800CC);
    g.fillRect(5, 5, 22, 3);
    g.fillRect(3, 24, 26, 2);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.fillStyle(0x5500AA);
    g.fillRect(10, 17, 1, 7);
    g.fillRect(13, 16, 1, 8);
    g.fillRect(16, 15, 1, 9);
    g.fillRect(19, 16, 1, 8);
    g.fillRect(22, 17, 1, 7);
    g.generateTexture('player_panther', 32, 48);
    g.clear();

    // Scarlet Witch (32x48) — deep red costume, magenta crown, glowing hands
    g.fillStyle(0x880022);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillRect(0, 15, 3, 17);
    g.fillRect(29, 15, 3, 17);
    g.fillStyle(0xFF2288);
    g.fillRect(10, 0, 12, 4);
    g.fillRect(12, 4, 2, 4);
    g.fillRect(18, 4, 2, 4);
    g.fillRect(0, 27, 3, 4);
    g.fillRect(29, 27, 3, 4);
    g.fillStyle(0xFFAACC);
    g.fillRect(5, 5, 22, 4);
    g.fillStyle(0xCC0044);
    g.fillRect(4, 44, 11, 4);
    g.fillRect(17, 44, 11, 4);
    g.generateTexture('player_witch', 32, 48);
    g.clear();

    // Doctor Strange (32x48) — blue suit, red cloak, green Eye of Agamotto
    g.fillStyle(0x1A3A8A);
    g.fillCircle(16, 8, 7);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillStyle(0xCC0000);
    g.fillRect(0, 14, 3, 20);
    g.fillRect(29, 14, 3, 20);
    g.fillRect(3, 32, 26, 14);
    g.fillStyle(0xAABBDD);
    g.fillRect(6, 5, 20, 4);
    g.fillStyle(0x00CC44);
    g.fillCircle(16, 20, 4);
    g.fillStyle(0x00FF88);
    g.fillCircle(16, 20, 2);
    g.generateTexture('player_strange', 32, 48);
    g.clear();

    // Cop (32x48) — blue uniform, police hat, gold badge, gun
    g.fillStyle(0xFFCC99);
    g.fillCircle(16, 9, 7);
    g.fillStyle(0x001A7A);
    g.fillRect(8, 0, 16, 8);
    g.fillRect(4, 7, 24, 3);
    g.fillStyle(0x1133CC);
    g.fillRect(3, 14, 26, 20);
    g.fillRect(0, 15, 3, 15);
    g.fillRect(29, 15, 3, 15);
    g.fillStyle(0x222244);
    g.fillRect(4, 34, 11, 14);
    g.fillRect(17, 34, 11, 14);
    g.fillStyle(0x111111);
    g.fillRect(4, 44, 12, 4);
    g.fillRect(17, 44, 12, 4);
    g.fillStyle(0xFFCC00);
    g.fillCircle(12, 22, 3);
    g.fillStyle(0x666666);
    g.fillRect(27, 22, 5, 3);
    g.generateTexture('cop', 32, 48);
    g.clear();

    // Cop bullet (14x4) — yellow shell trace
    g.fillStyle(0xFFDD00);
    g.fillRect(0, 1, 14, 2);
    g.fillStyle(0xFFFFAA);
    g.fillRect(0, 1, 4, 2);
    g.generateTexture('cop_bullet', 14, 4);
    g.clear();

    // Plane (80x28) — silver fuselage, wings, blue cockpit, facing right
    g.fillStyle(0xCCCCCC);
    g.fillRect(0, 10, 66, 8);
    g.fillPoints([{ x: 66, y: 10 }, { x: 80, y: 14 }, { x: 66, y: 18 }], true);
    g.fillStyle(0xAAAAAA);
    g.fillRect(20, 4, 28, 6);
    g.fillRect(20, 18, 28, 6);
    g.fillStyle(0x999999);
    g.fillRect(0, 5, 14, 5);
    g.fillRect(0, 18, 14, 5);
    g.fillStyle(0x2244CC);
    g.fillRect(52, 11, 12, 6);
    g.fillStyle(0xAADDFF);
    g.fillRect(53, 11, 6, 3);
    g.generateTexture('plane', 80, 28);
    g.clear();

    // Hot air balloon (36x64) — red/yellow envelope, brown basket
    g.fillStyle(0xCC1111);
    g.fillEllipse(18, 24, 32, 40);
    g.fillStyle(0xFFCC00);
    g.fillEllipse(18, 10, 24, 20);
    g.fillStyle(0xFF6600);
    g.fillRect(3, 22, 30, 6);
    g.fillStyle(0x8B5E3C);
    g.fillRect(10, 50, 16, 10);
    g.fillStyle(0xAA7A52);
    g.fillRect(9, 49, 18, 3);
    g.fillStyle(0x999999);
    g.fillRect(14, 43, 1, 8);
    g.fillRect(21, 43, 1, 8);
    g.generateTexture('balloon', 36, 64);
    g.clear();

    // Debris on fire (32x32) — burning concrete chunk
    g.fillStyle(0x555555);
    g.fillRect(6, 6, 20, 20);
    g.fillRect(0, 12, 8, 10);
    g.fillRect(24, 8, 8, 12);
    g.fillStyle(0xFF4400);
    g.fillRect(0, 0, 32, 7);
    g.fillRect(0, 0, 7, 20);
    g.fillRect(25, 0, 7, 20);
    g.fillStyle(0xFF9900);
    g.fillRect(2, 0, 28, 4);
    g.fillRect(2, 0, 4, 12);
    g.fillRect(26, 0, 4, 12);
    g.fillStyle(0xFFEE44);
    g.fillRect(10, 0, 12, 2);
    g.generateTexture('debris', 32, 32);
    g.clear();

    // Cap Shield (22x22) — concentric circles: blue, red, white, blue star
    g.fillStyle(0x003399);
    g.fillCircle(11, 11, 11);
    g.fillStyle(0xCC0000);
    g.fillCircle(11, 11, 8);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(11, 11, 5);
    g.fillStyle(0x003399);
    g.fillCircle(11, 11, 2);
    g.generateTexture('cap_shield', 22, 22);

    g.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
