# Zap-N-Hop — How the Whole Game Works

This folder contains step-by-step explanations of every part of the game.
Read them in order — each one builds on the last.

---

## Reading Order

| File | What You'll Learn |
|------|-------------------|
| [01-html-entry-point.md](01-html-entry-point.md) | How the browser starts the game |
| [02-main-js-game-config.md](02-main-js-game-config.md) | How the game engine is set up |
| [03-scenes-what-they-are.md](03-scenes-what-they-are.md) | What scenes are and why we use them |
| [04-boot-scene.md](04-boot-scene.md) | How placeholder art is created in code |
| [05-menu-scene.md](05-menu-scene.md) | How the title screen and buttons work |
| [06-game-scene.md](06-game-scene.md) | The main gameplay — the biggest file |
| [07-ui-scene.md](07-ui-scene.md) | How the score and lives display works |
| [08-key-concepts.md](08-key-concepts.md) | The big ideas behind all of it |
| [09-design-decisions.md](09-design-decisions.md) | Why each feature was built the way it was — and what was ruled out |
| [10-feature-requests.md](10-feature-requests.md) | Every feature request made, numbered and linked to the design decisions |

---

## The Big Picture (One Diagram)

```
Browser opens index.html
        |
        | loads Phaser library + your 5 JS files
        v
     main.js  ← starts the Phaser game engine
        |
        v
   BootScene  ← draws placeholder art, then hands off
        |
        v
   MenuScene  ← shows the title + PLAY button
        |  (player clicks PLAY)
        v
   GameScene  ← the actual game loop runs here
        +----> UIScene runs at the same time (score/lives HUD)
```

---

## Key Vocabulary

- **Engine** — a library that handles the hard stuff (drawing, physics, input) so you don't have to write it yourself
- **Scene** — one "screen" of the game (menu, gameplay, game over, etc.)
- **Sprite** — a game object that can move, collide, and be drawn on screen
- **Physics** — the engine simulating gravity, movement, and collisions
- **Game loop** — code that runs 60 times per second to update everything
- **Event** — a message sent between parts of the code ("score changed!", "player died!")
