class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = 800, H = 500;

    // Title
    this.add.text(W / 2, 78, 'APOCALIPS RUN', {
      fontSize: '52px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5);

    // Currency wallet display
    const stars = parseInt(localStorage.getItem('zapnhop_stars') || '0');
    const dots  = parseInt(localStorage.getItem('zapnhop_dots')  || '0');
    this.add.rectangle(W / 2, 145, 360, 38, 0x1A0900).setStrokeStyle(1, 0x555555);
    this.add.text(240, 145, `★  ${stars} Stars`, {
      fontSize: '18px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);
    this.add.text(424, 145, `●  ${dots} Dots`, {
      fontSize: '18px', fontFamily: 'Arial Black',
      color: '#44AAFF', stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);

    // Buttons
    this._addBtn(W / 2, 200, 'PLAY',             '#44aa44', '#66dd66', () => this.scene.start('GameScene'));
    this._addBtn(W / 2, 268, 'CHARACTERS',        '#004488', '#0066CC', () => this.scene.start('CharacterScene'));
    this._addBtn(W / 2, 336, 'ITEM SHOP',         '#885500', '#BB8800', () => this.scene.start('ShopScene'));
    this._addBtn(W / 2, 404, 'PREMIUM SHOP',      '#330055', '#7722AA', () => this.scene.start('PremiumShopScene'));

    // Instructions
    this.add.text(W / 2, H - 38, 'Arrow keys or WASD to move  |  Space / Up to jump  |  Click to shoot', {
      fontSize: '14px', fontFamily: 'Arial', color: '#666666'
    }).setOrigin(0.5);
  }

  _addBtn(x, y, label, bgColor, hoverColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '36px', fontFamily: 'Arial Black',
      color: '#ffffff', backgroundColor: bgColor,
      padding: { x: 28, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: hoverColor }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: bgColor }));
    btn.on('pointerdown', callback);
  }
}
