const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, UIScene]
};

new Phaser.Game(config);
