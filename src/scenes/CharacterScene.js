class CharacterScene extends Phaser.Scene {
  constructor() { super('CharacterScene'); }

  create() {
    const W = 800, H = 500;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0D0200);

    this.add.text(W / 2, 32, 'SELECT YOUR HERO', {
      fontSize: '34px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    const characters = [
      { key: 'player',          name: 'Iron Man'      },
      { key: 'player_cap',      name: 'Cap. America'  },
      { key: 'player_thor',     name: 'Thor'          },
      { key: 'player_hulk',     name: 'Hulk'          },
      { key: 'player_widow',    name: 'Black Widow'   },
      { key: 'player_hawkeye',  name: 'Hawkeye'       },
      { key: 'player_spidey',   name: 'Spider-Man'    },
      { key: 'player_panther',  name: 'Black Panther' },
      { key: 'player_witch',    name: 'Scarlet Witch' },
      { key: 'player_strange',  name: 'Dr. Strange'   },
    ];

    const savedKey = localStorage.getItem('zapnhop_character') || 'player';
    this._selectedKey = savedKey;
    this._cards = [];

    const colCenters = [80, 240, 400, 560, 720];
    const rowCenters = [195, 365];

    characters.forEach((char, i) => {
      const cx = colCenters[i % 5];
      const cy = rowCenters[Math.floor(i / 5)];
      const isSelected = char.key === savedKey;

      const card = this.add.rectangle(cx, cy, 120, 130, 0x1A0900)
        .setStrokeStyle(3, isSelected ? 0xFFD700 : 0x444444)
        .setInteractive({ useHandCursor: true });

      this.add.image(cx, cy - 15, char.key).setScale(2);

      const label = this.add.text(cx, cy + 52, char.name, {
        fontSize: '11px', fontFamily: 'Arial Black',
        color: isSelected ? '#FFD700' : '#AAAAAA'
      }).setOrigin(0.5);

      this._cards.push({ char, card, label });

      card.on('pointerover', () => {
        if (char.key !== this._selectedKey) card.setStrokeStyle(3, 0x888888);
      });
      card.on('pointerout', () => {
        if (char.key !== this._selectedKey) card.setStrokeStyle(3, 0x444444);
      });
      card.on('pointerdown', () => {
        this._selectedKey = char.key;
        localStorage.setItem('zapnhop_character', char.key);
        this._cards.forEach(({ char: c, card: cd, label: lb }) => {
          const sel = c.key === char.key;
          cd.setStrokeStyle(3, sel ? 0xFFD700 : 0x444444);
          lb.setColor(sel ? '#FFD700' : '#AAAAAA');
        });
      });
    });

    this._addBtn(W / 2, H - 22, '< BACK TO MENU', '#333333', '#555555',
      () => this.scene.start('MenuScene'));
  }

  _addBtn(x, y, label, bgColor, hoverColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black',
      color: '#ffffff', backgroundColor: bgColor,
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: hoverColor }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: bgColor }));
    btn.on('pointerdown', callback);
  }
}
