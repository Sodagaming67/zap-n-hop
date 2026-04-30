# Zap-N-Hop

A browser-based kid platformer game built with Phaser.js 3.

## How to run

No build step needed. Just serve the folder with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

## Controls

| Key | Action |
|-----|--------|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Arrow Up / W / Space | Jump |

## Gameplay

- Collect gold coins for points (+10 each)
- Stomp enemies by jumping on them (+50 each)
- Reach the green flag at the end to win
- You have 3 lives — falling off the world or touching an enemy costs one

## Project structure

```
zap-n-hop/
├── index.html
├── assets/
│   ├── images/    # sprite sheets, tilesets
│   └── audio/     # sound effects, music
└── src/
    ├── main.js
    └── scenes/
        ├── BootScene.js   # asset loading
        ├── MenuScene.js   # title screen
        ├── GameScene.js   # main gameplay
        └── UIScene.js     # HUD overlay
```

## Next steps

- Replace placeholder rectangles with real sprites (try kenney.nl for free assets)
- Add more levels
- Add sound effects
- Add mobile touch controls
