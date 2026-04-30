class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) { this.gameScene = data.gameScene; }

  create() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4
    });

    this.livesText = this.add.text(784, 16, 'Lives: 3', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ff8888',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(1, 0);

    this.gameScene.events.on('scoreUpdate', s => this.scoreText.setText(`Score: ${s}`));
    this.gameScene.events.on('livesUpdate', l => this.livesText.setText(`Lives: ${l}`));

    this.gameScene.events.on('shutdown', () => this.scene.stop());
    this.gameScene.events.on('destroy', () => this.scene.stop());
  }
}
