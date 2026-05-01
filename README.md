# Zap-N-Hop

A browser-based kid platformer game built with Phaser.js 3 — inspired by games like ABCya's Monsterland series.

---

## Tech stack

| Layer | Tool | Why |
|-------|------|-----|
| Game engine | **Phaser.js 3** | Purpose-built for 2D browser games, handles physics/sprites/tilemaps out of the box |
| Level design | **Tiled Map Editor** (free) | Visual level editor that exports to Phaser-compatible tilemaps |
| Art / sprites | **Kenney.nl** (free) | High-quality kid-friendly sprite packs, no attribution required |
| Language | **JavaScript** | Runs natively in every browser, no build step needed |
| Hosting | **GitHub Pages** or **itch.io** (both free) | Share a link — kids play instantly, no install |

---

## How to run

No build step needed. Just serve the folder with any static file server:

```bash
# Python (built-in)
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

> Do NOT just double-click index.html — browsers block local file loading for security. Always use a server.

---

## Controls

| Key | Action |
|-----|--------|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Arrow Up / W / Space | Jump |

---

## Gameplay

- Collect gold coins for points (+10 each)
- Stomp enemies by jumping on them (+50 each)
- Reach the green flag at the end of the level to win
- You have 3 lives — falling off the world or touching an enemy costs one

---

## Project structure

```
zap-n-hop/
├── index.html              ← loads Phaser from CDN, chains scene scripts
├── assets/
│   ├── images/             ← sprite sheets, tilesets (add real art here)
│   └── audio/              ← sound effects and music
└── src/
    ├── main.js             ← Phaser game config (size, physics, scene list)
    └── scenes/
        ├── BootScene.js    ← preloads all assets (currently generates placeholders)
        ├── MenuScene.js    ← title screen with PLAY button
        ├── GameScene.js    ← main gameplay: player, platforms, coins, enemies
        └── UIScene.js      ← HUD overlay showing score and lives
```

---

## Adding real sprites (next step)

1. Download a free sprite pack from [kenney.nl](https://kenney.nl/assets) (search "platformer")
2. Drop the images into `assets/images/`
3. In `BootScene.js`, replace the `generateTexture` calls with `this.load.image()` or `this.load.spritesheet()`
4. Update the texture keys used in `GameScene.js` to match

---

## Adding levels

1. Download [Tiled Map Editor](https://www.mapeditor.org/) (free)
2. Build a level using your tileset
3. Export as JSON into `assets/`
4. Load it in `GameScene.js` with `this.make.tilemap()`

---

## Hosting for free

**GitHub Pages**
1. Push this repo to GitHub
2. Go to Settings → Pages → set source to main branch
3. Share the URL — anyone can play in their browser

**itch.io**
1. Zip the project folder
2. Upload to [itch.io](https://itch.io) as an HTML game
3. Set it as public or unlisted

---

## Roadmap / next steps

- [ ] Replace placeholder colored rectangles with real sprites
- [ ] Add sound effects and background music
- [ ] Build more levels with Tiled
- [ ] Add mobile touch controls (Phaser has built-in virtual joystick support)
- [ ] Add an animated character with walk/jump/idle frames
- [ ] Add a high score screen
