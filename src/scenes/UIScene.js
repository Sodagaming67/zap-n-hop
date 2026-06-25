class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) { this.gameScene = data.gameScene; }

  create() {
    // Score — top left
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4
    });

    // Lives — top right
    this.livesText = this.add.text(784, 16, 'Lives: 3', {
      fontSize: '24px', fontFamily: 'Arial Black',
      color: '#ff8888', stroke: '#000000', strokeThickness: 4
    }).setOrigin(1, 0);

    // Active weapon label — top center
    this.weaponLabel = this.add.text(400, 14, 'MISSILE', {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: '#ff4444', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0);

    // Inventory bar — bottom of screen
    this._buildInventoryBar();

    // Wire up events
    this.gameScene.events.on('scoreUpdate',    s   => this.scoreText.setText(`Score: ${s}`));
    this.gameScene.events.on('livesUpdate',    l   => this.livesText.setText(`Lives: ${l}`));
    this.gameScene.events.on('weaponSwitch',   inv => this._refresh(inv));
    this.gameScene.events.on('inventoryUpdate',inv => this._refresh(inv));

    this.gameScene.events.on('shutdown', () => this.scene.stop());
    this.gameScene.events.on('destroy',  () => this.scene.stop());

    // Seed initial state
    this._refresh(this.gameScene.inventory);
  }

  _buildInventoryBar() {
    const DEFS = [
      { name: 'missile',   label: 'MISSILE',  subkey: '[1]', color: '#ff5555' },
      { name: 'repulsor',  label: 'REPULSOR', subkey: '[2]', color: '#55aaff' },
      { name: 'unibeam',   label: 'UNIBEAM',  subkey: '[3]', color: '#ffcc00' },
      { name: 'smartbomb', label: 'S-BOMB',   subkey: '[4]', color: '#ff8822' },
    ];

    // Panel backdrop
    this.add.rectangle(400, 478, 484, 42, 0x000000, 0.75)
      .setStrokeStyle(1, 0x333333);

    this.slots = DEFS.map((def, i) => {
      const cx = 162 + i * 122;
      const cy = 478;

      const box = this.add.rectangle(cx, cy, 116, 38, 0x111111, 0.92)
        .setStrokeStyle(2, 0x444444);

      const keyTxt = this.add.text(cx - 52, cy - 14, def.subkey, {
        fontSize: '10px', fontFamily: 'Arial', color: '#777777',
        stroke: '#000', strokeThickness: 2
      });

      const nameTxt = this.add.text(cx + 2, cy - 11, def.label, {
        fontSize: '11px', fontFamily: 'Arial Black', color: def.color,
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 0);

      const ammoTxt = this.add.text(cx, cy + 6, '∞', {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff',
        stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5, 0);

      return { box, keyTxt, nameTxt, ammoTxt, weaponName: def.name, color: def.color };
    });
  }

  _refresh(inv) {
    const w = inv.weapons[inv.current];
    this.weaponLabel.setText(w.label).setColor(w.color);

    this.slots.forEach(slot => {
      const active = slot.weaponName === inv.current;
      const weapon = inv.weapons[slot.weaponName];

      slot.box.setFillStyle(active ? 0x332800 : 0x111111, 0.92);
      slot.box.setStrokeStyle(active ? 3 : 1, active ? 0xFFCC00 : 0x444444);

      const ammo = weapon.ammo;
      const ammoStr = ammo === Infinity ? '∞' : String(ammo);
      const ammoColor = ammo === 0 ? '#ff3333' : (ammo !== Infinity && ammo <= 3) ? '#ffaa00' : '#ffffff';
      slot.ammoTxt.setText(ammoStr).setColor(ammoColor);
    });
  }
}
