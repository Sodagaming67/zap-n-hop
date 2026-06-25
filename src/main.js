const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#0D0200',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [BootScene, MenuScene, ShopScene, PremiumShopScene, CharacterScene, GameScene, UIScene]
};

new Phaser.Game(config);
