# 04 — Loading Assets: `BootScene.js`

**File:** [../src/scenes/BootScene.js](../src/scenes/BootScene.js)

---

## What Does BootScene Do?

In a real game, BootScene would load image files, sound files, and fonts from the `assets/` folder. Here, since we don't have real art yet, it **draws simple shapes in code** and saves them as textures (reusable images).

It runs once, very fast, then immediately jumps to the Menu.

---

## Drawing Placeholder Art

```js
preload() {
  const g = this.make.graphics({ x: 0, y: 0, add: false });
```

`this.make.graphics()` creates an invisible drawing canvas. The `add: false` means "don't put this on screen — I just need it as a drawing tool."

---

### The Player

```js
g.fillStyle(0x44ff44);      // set colour to green (hex colour)
g.fillRect(0, 0, 32, 48);   // draw a rectangle: x, y, width, height
g.generateTexture('player', 32, 48);  // save it as a reusable image named 'player'
g.clear();                  // wipe the canvas for the next drawing
```

- Colours are written as `0x` followed by a hex colour code. `0x44ff44` is a bright green. You can use any hex colour from a colour picker website.
- `generateTexture('player', ...)` saves this drawing with the name `'player'`. Later, any code that says `'player'` gets this green rectangle.

---

### Platform, Coin, Enemy

The same pattern repeats for each asset:

```js
// platform — brown rectangle
g.fillStyle(0x8B5E3C);
g.fillRect(0, 0, 64, 16);
g.generateTexture('platform', 64, 16);
g.clear();

// coin — gold circle
g.fillStyle(0xFFD700);
g.fillCircle(8, 8, 8);   // x, y, radius
g.generateTexture('coin', 16, 16);
g.clear();

// enemy — red rectangle
g.fillStyle(0xff4444);
g.fillRect(0, 0, 32, 32);
g.generateTexture('enemy', 32, 32);
g.destroy();  // done with the drawing tool, remove it
```

---

## Handing Off to the Menu

```js
create() {
  this.scene.start('MenuScene');
}
```

After `preload()` finishes, `create()` runs automatically. Here it just immediately moves to the next scene. Nothing else to do.

---

## When You Add Real Art

When you're ready to use real sprite images instead of rectangles, you'd replace all the `generateTexture` calls with image loads:

```js
// instead of drawing a green rectangle:
this.load.image('player', 'assets/images/player.png');

// instead of drawing a gold circle:
this.load.image('coin', 'assets/images/coin.png');
```

The rest of the game code doesn't need to change — it still just uses the name `'player'` or `'coin'`. That's the beauty of this pattern.

---

## Summary

- BootScene uses `preload()` to set up game assets before anything else runs
- Right now it draws shapes in code as stand-ins for real images
- It names each texture so the rest of the game can reference them by name
- When you want real art, just swap out the `generateTexture` calls for `load.image()` calls
