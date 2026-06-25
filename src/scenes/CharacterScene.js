class CharacterScene extends Phaser.Scene {
  constructor() { super('CharacterScene'); }

  create() {
    const W = 800, H = 500;

    // Info data for the panel
    const INFO = {
      'player':         { hp: 100, speed: 220, jump: 550, ability: 'Full Arsenal',     desc: 'Access to all 4 weapons — missile, repulsor, unibeam, smartbomb.' },
      'player_cap':     { hp: 115, speed: 230, jump: 565, ability: 'Shield Throw',     desc: 'Click [1] to hurl Cap\'s shield. It bounces off walls and passes through up to 4 enemies.' },
      'player_thor':    { hp: 120, speed: 210, jump: 530, ability: 'Flight',           desc: 'Hold jump while airborne to hover. Near-zero gravity while the key is held.' },
      'player_hulk':    { hp: 150, speed: 170, jump: 730, ability: 'Ground Smash',     desc: 'Fall from height and land to trigger a shockwave that destroys enemies within 160px.' },
      'player_widow':   { hp: 80,  speed: 290, jump: 560, ability: 'Swift Recovery',   desc: '3.5s invincibility after taking damage — over twice the standard window.' },
      'player_hawkeye': { hp: 100, speed: 225, jump: 555, ability: 'Pierce Shot',      desc: 'Click [1] to fire an arrow that passes through up to 3 enemies in a straight line.' },
      'player_spidey':  { hp: 90,  speed: 245, jump: 640, ability: 'Double Jump',      desc: 'Press jump a second time in the air for a second boost.' },
      'player_panther': { hp: 90,  speed: 305, jump: 590, ability: 'Vibranium Dash',   desc: 'Press [E] to dash with brief i-frames. 1-second cooldown.' },
      'player_witch':   { hp: 105, speed: 220, jump: 550, ability: 'Auto Hex',         desc: 'Automatically fires a magic bolt at the nearest enemy every 2.5 seconds.' },
      'player_strange': { hp: 100, speed: 220, jump: 550, ability: 'Time Stop',        desc: 'Press [E] to slow all enemies to 20% speed for 4 seconds. 20-second cooldown.' },
    };

    this.add.rectangle(W / 2, H / 2, W, H, 0x0D0200);

    this.add.text(W / 2, 24, 'SELECT YOUR HERO', {
      fontSize: '30px', fontFamily: 'Arial Black',
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
    const rowCenters = [163, 295];

    characters.forEach((char, i) => {
      const cx = colCenters[i % 5];
      const cy = rowCenters[Math.floor(i / 5)];
      const isSelected = char.key === savedKey;

      const card = this.add.rectangle(cx, cy, 120, 110, 0x1A0900)
        .setStrokeStyle(3, isSelected ? 0xFFD700 : 0x444444)
        .setInteractive({ useHandCursor: true });

      this.add.image(cx, cy - 18, char.key).setScale(2);

      const label = this.add.text(cx, cy + 38, char.name, {
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
        this._showInfo(char, INFO[char.key]);
      });
    });

    // Info panel — below the grid
    this.add.rectangle(W / 2, 390, 774, 76, 0x0A0500)
      .setStrokeStyle(1, 0x333333);

    this._infoName = this.add.text(20, 362, '', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    });
    this._infoStats = this.add.text(W - 20, 362, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#AAAAAA',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(1, 0);
    this._infoDesc = this.add.text(20, 382, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#DDDDDD',
      stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: 760 }
    });

    // Seed panel with selected character
    const initChar = characters.find(c => c.key === savedKey) || characters[0];
    this._showInfo(initChar, INFO[savedKey] || INFO['player']);

    this._addBtn(200, H - 16, '< BACK',      '#333333', '#555555', () => this.scene.start('MenuScene'));
    this._addBtn(600, H - 16, 'START GAME >', '#226600', '#44AA00', () => this.scene.start('GameScene'));
  }

  _showInfo(char, info) {
    this._infoName.setText(`${char.name}  —  ${info.ability}`);
    this._infoStats.setText(`HP: ${info.hp}  |  Speed: ${info.speed}  |  Jump: ${info.jump}`);
    this._infoDesc.setText(info.desc);
  }

  _addBtn(x, y, label, bgColor, hoverColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: '#ffffff', backgroundColor: bgColor,
      padding: { x: 20, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: hoverColor }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: bgColor }));
    btn.on('pointerdown', callback);
  }
}
