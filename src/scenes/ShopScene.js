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

    this.add.text(400, 92, 'Spend Stars and Dots collected in-game to unlock permanent upgrades', {
      fontSize: '12px', fontFamily: 'Arial', color: '#777777'
    }).setOrigin(0.5);

    // Currency panel
    this.add.rectangle(400, 122, 340, 34, 0x1A0900).setStrokeStyle(1, 0x555555);
    const { stars, dots } = this._getCurrencies();
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
      { id: 'health_upgrade', name: 'Health Upgrade',  desc: '+25 Max HP every run',             cost: 10, currency: 'dots'  },
      { id: 'speed_boost',    name: 'Speed Boost',      desc: 'Move 20% faster every run',        cost: 15, currency: 'dots'  },
      { id: 'unibeam_plus',   name: 'Unibeam+',         desc: '+5 Unibeam ammo every run',        cost: 5,  currency: 'stars' },
      { id: 'extra_sbomb',    name: 'Extra S-Bomb',      desc: '+1 Smartbomb charge every run',    cost: 8,  currency: 'stars' },
      { id: 'iron_shield',    name: 'Iron Shield',       desc: 'Start each run with 3s invincibility', cost: 12, currency: 'stars' },
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
      owned: JSON.parse(localStorage.getItem('zapnhop_owned') || '[]'),
    };
  }

  _buildItemRow(item, y) {
    const { stars, dots, owned } = this._getCurrencies();
    const isOwned = owned.includes(item.id);
    const sym = item.currency === 'stars' ? '★' : '●';
    const symColor = item.currency === 'stars' ? '#FFD700' : '#44AAFF';
    const balance = item.currency === 'stars' ? stars : dots;
    const canAfford = balance >= item.cost;

    // Row background
    this.add.rectangle(395, y, 726, 50, isOwned ? 0x0D1F0D : 0x1A0900, 0.95)
      .setStrokeStyle(1, isOwned ? 0x2A4A2A : 0x2E2200);

    // Item name
    this.add.text(40, y - 10, item.name, {
      fontSize: '15px', fontFamily: 'Arial Black',
      color: isOwned ? '#66FF88' : '#FFFFFF', stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0);

    // Description
    this.add.text(40, y + 9, item.desc, {
      fontSize: '11px', fontFamily: 'Arial', color: '#888888'
    }).setOrigin(0, 0);

    // Cost display
    this.add.text(557, y, `${sym}  ${item.cost}`, {
      fontSize: '18px', fontFamily: 'Arial Black',
      color: isOwned ? '#444444' : (canAfford ? symColor : '#993333'),
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    if (isOwned) {
      this.add.rectangle(688, y, 110, 34, 0x0A2A0A).setStrokeStyle(2, 0x44AA44);
      this.add.text(688, y, 'OWNED', {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#44FF88',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 0.5);
    } else {
      this._addButton(688, y, 'BUY', 0x334411, 0xAACC00, '#CCFF00', '#FFFF44',
        () => this._buyItem(item), 110, 34);
    }
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
    if (owned.includes(item.id)) { this._showMsg('Already owned!', '#FFAA00'); return; }

    const balance = item.currency === 'stars' ? stars : dots;
    if (balance < item.cost) {
      this._showMsg(`Not enough ${item.currency}! Need ${item.cost} — collect more in-game.`, '#FF4444');
      return;
    }

    localStorage.setItem(`zapnhop_${item.currency}`, balance - item.cost);
    owned.push(item.id);
    localStorage.setItem('zapnhop_owned', JSON.stringify(owned));
    this._showMsg('Purchased! Refreshing...', '#00FF88');
    this.time.delayedCall(1200, () => this.scene.restart());
  }

  _showMsg(text, color) {
    this.msgText.setText(text).setColor(color);
    this.time.delayedCall(3500, () => { if (this.msgText?.active) this.msgText.setText(''); });
  }
}
