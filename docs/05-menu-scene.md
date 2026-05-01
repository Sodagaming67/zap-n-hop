# 05 — The Title Screen: `MenuScene.js`

**File:** [../src/scenes/MenuScene.js](../src/scenes/MenuScene.js)

---

## What MenuScene Does

Shows the game title, a PLAY button, and instructions at the bottom. Waits for the player to click PLAY, then starts the game.

---

## Getting the Screen Size

```js
const { width, height } = this.scale;
```

This is a shorthand way of writing:
```js
const width = this.scale.width;   // 800
const height = this.scale.height; // 500
```

Using `width` and `height` instead of hardcoding `800` and `500` means if you ever change the screen size in `main.js`, the menu automatically adjusts.

---

## Adding the Title Text

```js
this.add.text(width / 2, height / 3, 'ZAP-N-HOP', {
  fontSize: '64px',
  fontFamily: 'Arial Black',
  color: '#FFD700',
  stroke: '#000000',
  strokeThickness: 8
}).setOrigin(0.5);
```

- `this.add.text(x, y, 'content', styleObject)` — places text on screen
- `width / 2` = 400, which is the horizontal centre of the screen
- `height / 3` ≈ 167, which is in the upper third of the screen
- `setOrigin(0.5)` — by default, text is anchored from its top-left corner. Setting origin to `0.5` makes it anchor from its centre, so it stays centred even if the text is long or short.

---

## The PLAY Button

```js
const startBtn = this.add.text(width / 2, height / 2 + 40, 'PLAY', {
  fontSize: '40px',
  fontFamily: 'Arial Black',
  color: '#ffffff',
  backgroundColor: '#44aa44',
  padding: { x: 30, y: 10 }
}).setOrigin(0.5).setInteractive({ useHandCursor: true });
```

`setInteractive()` is what turns a piece of text into a button — it tells Phaser "this object should respond to mouse events." The `useHandCursor: true` makes the mouse cursor turn into a hand pointer when hovering over it (like a link on a webpage).

---

## Hover and Click Effects

```js
startBtn.on('pointerover', () => startBtn.setStyle({ color: '#FFD700' }));
startBtn.on('pointerout',  () => startBtn.setStyle({ color: '#ffffff' }));
startBtn.on('pointerdown', () => this.scene.start('GameScene'));
```

`.on('eventName', function)` means "when this event happens, run this function."

- `pointerover` — mouse moves onto the button → turn text gold
- `pointerout` — mouse moves off the button → turn text back to white
- `pointerdown` — mouse clicks the button → start the game

The `() => ...` syntax is called an **arrow function**. It's a short way of writing a function. These are small functions that only run when the event fires.

---

## Instructions Text at the Bottom

```js
this.add.text(width / 2, height - 40, 'Arrow keys or WASD to move  |  Space / Up to jump', {
  fontSize: '16px',
  color: '#aaaaaa'
}).setOrigin(0.5);
```

`height - 40` places the text 40 pixels from the bottom of the screen. `#aaaaaa` is a medium grey.

---

## Summary

- `this.add.text()` places text on screen at an x, y position
- `setOrigin(0.5)` centres the text on its anchor point
- `setInteractive()` makes an object respond to mouse events
- `.on('eventName', function)` listens for events like hover and click
- `this.scene.start('GameScene')` switches to the gameplay scene
