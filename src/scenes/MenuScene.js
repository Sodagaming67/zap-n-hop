class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 3, 'ZAP-N-HOP', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    const startBtn = this.add.text(width / 2, height / 2 + 40, 'PLAY', {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#44aa44',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setStyle({ color: '#FFD700' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(width / 2, height - 40, 'Arrow keys or WASD to move  |  Space / Up to jump', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }
}
