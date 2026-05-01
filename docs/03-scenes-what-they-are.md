# 03 — What Are Scenes?

---

## The Analogy: Scenes Are Like Slides

Think of your game like a PowerPoint presentation. Each slide is a **scene**:

```
Slide 1: Boot (loading screen)
Slide 2: Menu (title screen)
Slide 3: Game (actual gameplay)
Slide 4: UIScene (runs on top of the game slide)
```

Only one scene (or a few) run at a time. When you click PLAY, the menu scene stops and the game scene starts.

---

## How a Scene Is Structured

Every scene in this game follows the same pattern:

```js
class MenuScene extends Phaser.Scene {

  constructor() {
    super('MenuScene');   // gives this scene a name
  }

  create() {
    // runs ONCE when the scene starts
    // set up objects, text, buttons, etc.
  }

  update() {
    // runs 60 times per second while the scene is active
    // check input, move things, detect collisions
  }
}
```

- `constructor` — runs when the scene is first created. You give it a name so other scenes can refer to it.
- `create()` — your setup code. Runs once when the scene becomes active.
- `update()` — the game loop. Runs over and over. This is where movement and input go.

Not every scene needs an `update()`. MenuScene doesn't have one because nothing moves — it just waits for a click.

---

## The Three Special Methods Phaser Gives You

| Method | When it runs | What to put here |
|--------|-------------|------------------|
| `preload()` | Before `create()`, used for loading files | Load images, audio, tilemaps |
| `create()` | Once when scene starts | Spawn objects, set up collisions |
| `update()` | Every frame (~60x per second) | Input, movement, game logic |

BootScene uses `preload()` to generate textures. GameScene uses `create()` and `update()`.

---

## Switching Between Scenes

```js
this.scene.start('GameScene');   // stop this scene, start GameScene
this.scene.launch('UIScene');    // start UIScene without stopping this one
this.scene.stop();               // stop this scene
```

- `start` — replaces the current scene with a new one
- `launch` — runs a second scene alongside the current one (used for the HUD)

---

## Why Split Into Scenes?

You could technically put everything in one big file, but it gets messy fast. Scenes keep things organised:

- The menu code doesn't need to know anything about gameplay
- The HUD code doesn't need to know how platforms are built
- If something breaks in the menu, you look in MenuScene — not in 1000 lines of mixed code

This is a general principle in programming called **separation of concerns** — keep unrelated things apart.

---

## Summary

- Scenes are like separate screens or rooms in the game
- Each one has `create()` (setup) and optionally `update()` (game loop)
- `this.scene.start()` moves to a new scene
- `this.scene.launch()` runs two scenes at the same time
