class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    // Background
    this.add.rectangle(400, 250, 800, 500, 0x0D0200);
    const border = this.add.graphics();
    border.lineStyle(3, 0xFF8800);
    border.strokeRect(18, 18, 764, 464);
    border.lineStyle(1, 0xFF8800, 0.25);
    border.strokeRect(24, 24, 752, 452);

    // Title
    this.add.text(400, 52, 'ITEM SHOP', {
      fontSize: '38px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 92, 'Items last ONE run — stock up before you play!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#888888'
    }).setOrigin(0.5);

    // Currency panel
    const { stars, dots } = this._getCurrencies();
    this.add.rectangle(400, 122, 340, 34, 0x1A0900).setStrokeStyle(1, 0x555555);
    this.add.text(248, 122, `★  ${stars} Stars`, {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);
    this.add.text(415, 122, `●  ${dots} Dots`, {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#44AAFF',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);

    // Item rows
    const items = [
      { id: 'health_upgrade', name: 'Health Upgrade',  desc: '+25 Max HP for one run',              cost: 10, currency: 'dots'  },
      { id: 'speed_boost',    name: 'Speed Boost',      desc: 'Move 20% faster for one run',         cost: 15, currency: 'dots'  },
      { id: 'unibeam_plus',   name: 'Unibeam+',         desc: '+5 Unibeam ammo for one run',         cost: 5,  currency: 'stars' },
      { id: 'extra_sbomb',    name: 'Extra S-Bomb',      desc: '+1 Smartbomb charge for one run',     cost: 8,  currency: 'stars' },
      { id: 'iron_shield',    name: 'Iron Shield',       desc: 'Start with 3s invincibility, one run',cost: 12, currency: 'stars' },
    ];
    items.forEach((item, i) => this._buildItemRow(item, 162 + i * 54));

    // Feedback message
    this.msgText = this.add.text(290, 460, '', {
      fontSize: '16px', fontFamily: 'Arial Black',
      color: '#00FF88', stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5);

    // EXIT button
    this._addButton(710, 460, 'EXIT', 0x440000, 0xAA2222, '#FF6666', '#FF9999',
      () => this.scene.start('MenuScene'));
  }

  _getCurrencies() {
    return {
      stars: parseInt(localStorage.getItem('zapnhop_stars') || '0'),
      dots:  parseInt(localStorage.getItem('zapnhop_dots')  || '0'),
      owned: JSON.parse(localStorage.getItem('zapnhop_owned') || '{}'),
    };
  }

  _buildItemRow(item, y) {
    const { stars, dots, owned } = this._getCurrencies();
    const count    = owned[item.id] || 0;
    const sym      = item.currency === 'stars' ? '★' : '●';
    const symColor = item.currency === 'stars' ? '#FFD700' : '#44AAFF';
    const balance  = item.currency === 'stars' ? stars : dots;
    const canAfford = balance >= item.cost;

    // Row tint — highlight rows that have items in bag
    this.add.rectangle(395, y, 726, 50, count > 0 ? 0x1A1500 : 0x1A0900, 0.95)
      .setStrokeStyle(1, count > 0 ? 0x4A3A00 : 0x2E2200);

    // Item name
    this.add.text(40, y - 10, item.name, {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0);

    // Description
    this.add.text(40, y + 9, item.desc, {
      fontSize: '11px', fontFamily: 'Arial', color: '#888888'
    }).setOrigin(0, 0);

    // Cost
    this.add.text(518, y, `${sym}  ${item.cost}`, {
      fontSize: '18px', fontFamily: 'Arial Black',
      color: canAfford ? symColor : '#993333',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // "In bag" count badge — only shown when count > 0
    if (count > 0) {
      this.add.rectangle(607, y, 68, 26, 0x2A2200).setStrokeStyle(1, 0x886600);
      this.add.text(607, y, `x${count} ready`, {
        fontSize: '11px', fontFamily: 'Arial Black', color: '#FFCC00',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 0.5);
    }

    // BUY button — always available
    this._addButton(700, y, 'BUY', 0x334411, 0xAACC00, '#CCFF00', '#FFFF44',
      () => this._buyItem(item), 90, 34);
  }

  _addButton(x, y, label, fill, stroke, color, hoverColor, callback, w = 122, h = 36) {
    const bg = this.add.rectangle(x, y, w, h, fill)
      .setStrokeStyle(2, stroke).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    [bg, txt].forEach(o => {
      o.on('pointerover',  () => { bg.setFillStyle(stroke);  txt.setColor(hoverColor); });
      o.on('pointerout',   () => { bg.setFillStyle(fill);    txt.setColor(color); });
      o.on('pointerdown', callback);
    });
    return [bg, txt];
  }

  _buyItem(item) {
    const { stars, dots, owned } = this._getCurrencies();
    const balance = item.currency === 'stars' ? stars : dots;

    if (balance < item.cost) {
      this._showMsg(`Not enough ${item.currency}! Need ${item.cost} — collect more in-game.`, '#FF4444');
      return;
    }

    localStorage.setItem(`zapnhop_${item.currency}`, balance - item.cost);
    owned[item.id] = (owned[item.id] || 0) + 1;
    localStorage.setItem('zapnhop_owned', JSON.stringify(owned));
    this._showMsg(`Purchased! You have ${owned[item.id]}x for your next run.`, '#00FF88');
    this.time.delayedCall(1200, () => this.scene.restart());
  }

  _showMsg(text, color) {
    this.msgText.setText(text).setColor(color);
    this.time.delayedCall(3500, () => { if (this.msgText?.active) this.msgText.setText(''); });
  }
}
