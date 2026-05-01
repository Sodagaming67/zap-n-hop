# 02 — Starting the Engine: `main.js`

**File:** [../src/main.js](../src/main.js)

---

## The Whole File

```js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, UIScene]
};

new Phaser.Game(config);
```

Small file, but important. Let's go line by line.

---

## What is `const config = { ... }`?

This creates an **object** — a container that holds a bunch of named settings.

Think of it like filling out a form:

| Setting | Value | What it means |
|---------|-------|---------------|
| `type` | `Phaser.AUTO` | Let Phaser pick the best renderer for this browser |
| `width` | `800` | Game canvas is 800 pixels wide |
| `height` | `500` | Game canvas is 500 pixels tall |
| `backgroundColor` | `'#1a1a2e'` | Dark navy background color |

---

## Physics Settings

```js
physics: {
  default: 'arcade',
  arcade: { gravity: { y: 600 }, debug: false }
}
```

- `'arcade'` physics is the simplest kind — good for platformers. Things move, fall, and collide with rectangular hitboxes.
- `gravity: { y: 600 }` means everything falls downward at a speed of 600 units per second squared — like real gravity, but you can tune it.
- `debug: false` — if you set this to `true`, you'd see the invisible collision boxes drawn in red. Useful when debugging!

**Try it:** Change `debug: false` to `debug: true`, refresh the browser, and you'll see the physics boxes around every object.

---

## The Scene List

```js
scene: [BootScene, MenuScene, GameScene, UIScene]
```

This is an array (a list) of all the scenes in the game. Phaser starts with the first one (`BootScene`) and then your code tells it when to move to the next.

---

## Turning the Engine On

```js
new Phaser.Game(config);
```

This one line creates the game. It's like pressing the power button — Phaser reads your config, creates the canvas on the page, starts the first scene, and begins the game loop.

The word `new` means "create a fresh copy of this thing." `Phaser.Game` is the main class (blueprint) that Phaser provides.

---

## Summary

- `main.js` configures and starts the game engine
- The config object sets screen size, physics, and the scene list
- `new Phaser.Game(config)` is what actually starts everything
- Gravity is just a number — you can change it to make the game feel floaty or heavy
