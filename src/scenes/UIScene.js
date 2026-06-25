class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) { this.gameScene = data.gameScene; }

  create() {
    // Score — top left
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4
    });

    // Health bar — top right
    this.add.text(597, 26, 'HP', {
      fontSize: '16px', fontFamily: 'Arial Black',
      color: '#ff4444', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5);
    this.add.rectangle(701, 26, 165, 18, 0x440000).setOrigin(0.5, 0.5);
    this.hpBar = this.add.rectangle(619, 26, 165, 18, 0x00cc44).setOrigin(0, 0.5);
    this.hpText = this.add.text(701, 26, '100/100', {
      fontSize: '11px', fontFamily: 'Arial Black',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Star and dot wallet counts — below HP bar
    this.add.text(619, 46, '★', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.starText = this.add.text(634, 46, '0', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.add.text(676, 46, '●', {
      fontSize: '13px', fontFamily: 'Arial', color: '#44AAFF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.dotText = this.add.text(691, 46, '0', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#44AAFF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Weapon bar and label only shown for Iron Man (full arsenal)
    const isArsenal = this.gameScene._charAbility === 'arsenal';
    this.weaponLabel = null;
    this.slots = [];
    if (isArsenal) {
      this.weaponLabel = this.add.text(400, 14, 'MISSILE', {
        fontSize: '20px', fontFamily: 'Arial Black',
        color: '#ff4444', stroke: '#000000', strokeThickness: 4
      }).setOrigin(0.5, 0);
      this._buildInventoryBar();
    }

    // Lives hearts — bottom-left below score
    this.livesIcons = [];
    for (let i = 0; i < 3; i++) {
      this.livesIcons.push(this.add.text(16 + i * 22, 46, '♥', {
        fontSize: '20px', fontFamily: 'Arial', color: '#ff4444',
        stroke: '#000000', strokeThickness: 3
      }));
    }

    // Wire up events
    this.gameScene.events.on('scoreUpdate',    s   => this.scoreText.setText(`Score: ${s}`));
    this.gameScene.events.on('livesUpdate', (lives) => {
      this.livesIcons.forEach((t, i) => t.setColor(i < lives ? '#ff4444' : '#444444'));
    });
    this.gameScene.events.on('healthUpdate', (hp, maxHp) => {
      const pct = hp / maxHp;
      this.hpBar.setSize(165 * pct, 18);
      this.hpBar.setFillStyle(pct > 0.6 ? 0x00cc44 : pct > 0.3 ? 0xffaa00 : 0xff2200);
      this.hpText.setText(`${hp}/${maxHp}`);
    });
    this.gameScene.events.on('currencyUpdate', (stars, dots) => {
      this.starText.setText(String(stars));
      this.dotText.setText(String(dots));
    });
    this.gameScene.events.on('weaponSwitch',   inv => { if (isArsenal) this._refresh(inv); });
    this.gameScene.events.on('inventoryUpdate',inv => { if (isArsenal) this._refresh(inv); });

    this.gameScene.events.on('shutdown', () => this.scene.stop());
    this.gameScene.events.on('destroy',  () => this.scene.stop());

    // Seed initial state
    if (isArsenal) this._refresh(this.gameScene.inventory);
    this.starText.setText(String(this.gameScene.starWallet));
    this.dotText.setText(String(this.gameScene.dotWallet));
    this.livesIcons.forEach((t, i) => t.setColor(i < this.gameScene.lives ? '#ff4444' : '#444444'));
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
    if (!this.weaponLabel) return;
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
