class PremiumShopScene extends Phaser.Scene {
  constructor() { super('PremiumShopScene'); }

  create() {
    // Background — deep purple premium feel
    this.add.rectangle(400, 250, 800, 500, 0x080016);
    const border = this.add.graphics();
    border.lineStyle(3, 0xFFD700);
    border.strokeRect(18, 18, 764, 464);
    border.lineStyle(1, 0xFFD700, 0.25);
    border.strokeRect(24, 24, 752, 452);

    // Corner star decorations
    const corners = [[32, 32], [768, 32], [32, 468], [768, 468]];
    corners.forEach(([cx, cy]) => {
      this.add.text(cx, cy, '★', {
        fontSize: '14px', fontFamily: 'Arial', color: '#FFD700'
      }).setOrigin(0.5);
    });

    // Title
    this.add.text(400, 52, '★  PREMIUM SHOP  ★', {
      fontSize: '36px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(400, 92, 'Exclusive upgrades — support the developer with real money', {
      fontSize: '12px', fontFamily: 'Arial', color: '#9966CC'
    }).setOrigin(0.5);

    // Separator
    const line = this.add.graphics();
    line.lineStyle(1, 0x441166, 1);
    line.lineBetween(40, 114, 760, 114);

    // Items
    const items = [
      { id: 'gold_armor',   name: 'Gold Armor Skin',   desc: 'Gleaming golden player appearance each run',  price: '$0.99' },
      { id: 'rocket_boost', name: 'Rocket Missiles',    desc: 'Player missiles travel 2x as fast',           price: '$1.99' },
      { id: 'double_stars', name: 'Star Doubler',        desc: 'Earn 2x stars every time you play',          price: '$2.99' },
      { id: 'mega_bomb',    name: 'Mega Smartbomb',      desc: 'Triple blast radius on every Smartbomb',     price: '$1.99' },
      { id: 'vip_bundle',   name: 'VIP Bundle',          desc: 'All 4 premium upgrades at a discount',       price: '$9.99' },
    ];
    items.forEach((item, i) => this._buildItemRow(item, 148 + i * 56));

    // Notice
    this.add.text(400, 432, '! Payment system not yet configured — contact the developer to purchase !', {
      fontSize: '11px', fontFamily: 'Arial', color: '#443355'
    }).setOrigin(0.5);

    // EXIT button
    this._addButton(710, 460, 'EXIT', 0x1A0033, 0x8833AA, '#CC88FF', '#FFFFFF',
      () => this.scene.start('MenuScene'));
  }

  _buildItemRow(item, y) {
    const owned = JSON.parse(localStorage.getItem('zapnhop_premium') || '[]');
    const isPurchased = owned.includes(item.id);

    // Row background
    this.add.rectangle(395, y, 726, 50, isPurchased ? 0x0A0A22 : 0x110025, 0.95)
      .setStrokeStyle(1, isPurchased ? 0x3333AA : 0x330066);

    // Item name
    this.add.text(40, y - 10, item.name, {
      fontSize: '15px', fontFamily: 'Arial Black',
      color: isPurchased ? '#8899FF' : '#EEE8FF', stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0);

    // Description
    this.add.text(40, y + 9, item.desc, {
      fontSize: '11px', fontFamily: 'Arial', color: '#665577'
    }).setOrigin(0, 0);

    // Price
    this.add.text(557, y, item.price, {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: isPurchased ? '#444466' : '#FFD700', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    if (isPurchased) {
      this.add.rectangle(688, y, 110, 34, 0x111133).setStrokeStyle(2, 0x4444BB);
      this.add.text(688, y, 'OWNED', {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#7788FF',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 0.5);
    } else {
      this._addButton(688, y, 'BUY', 0x2A1800, 0xFFAA00, '#FFD700', '#FFFFFF',
        () => this._showPurchaseModal(item), 110, 34);
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

  _showPurchaseModal(item) {
    const objs = [];
    const closeModal = () => objs.forEach(o => { if (o?.active) o.destroy(); });

    const overlay = this.add.rectangle(400, 250, 800, 500, 0x000000, 0.80).setInteractive();
    const panel   = this.add.rectangle(400, 245, 470, 240, 0x0A0020).setStrokeStyle(3, 0xFFD700);
    const topLine = this.add.graphics();
    topLine.lineStyle(1, 0x441188);
    topLine.lineBetween(175, 213, 625, 213);

    const title = this.add.text(400, 170, `Purchase: ${item.name}`, {
      fontSize: '19px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    const price = this.add.text(400, 238, item.price, {
      fontSize: '48px', fontFamily: 'Arial Black',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    const note1 = this.add.text(400, 288, 'Payment processing is not yet set up for this game.', {
      fontSize: '13px', fontFamily: 'Arial', color: '#9977BB'
    }).setOrigin(0.5);
    const note2 = this.add.text(400, 307, 'Contact the developer to arrange your purchase.', {
      fontSize: '13px', fontFamily: 'Arial', color: '#9977BB'
    }).setOrigin(0.5);

    const [closeBg, closeTxt] = this._addButton(
      400, 345, 'CLOSE', 0x330000, 0xAA2222, '#FF6666', '#FF9999', closeModal, 140, 38
    );

    objs.push(overlay, panel, topLine, title, price, note1, note2, closeBg, closeTxt);
  }
}
