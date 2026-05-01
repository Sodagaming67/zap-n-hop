# 07 — The HUD: `UIScene.js`

**File:** [../src/scenes/UIScene.js](../src/scenes/UIScene.js)

---

## What is a HUD?

HUD stands for **Heads-Up Display** — the score, lives, health bar, or any info overlaid on the game screen. Think of any game you've played: the numbers in the corner that don't scroll away when you move.

---

## The Whole File

```js
class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) { this.gameScene = data.gameScene; }

  create() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4
    });

    this.livesText = this.add.text(784, 16, 'Lives: 3', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ff8888',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(1, 0);

    this.gameScene.events.on('scoreUpdate', s => this.scoreText.setText(`Score: ${s}`));
    this.gameScene.events.on('livesUpdate', l => this.livesText.setText(`Lives: ${l}`));

    this.gameScene.events.on('shutdown', () => this.scene.stop());
    this.gameScene.events.on('destroy',  () => this.scene.stop());
  }
}
```

---

## `init()` — Receiving Data From Another Scene

```js
init(data) { this.gameScene = data.gameScene; }
```

`init()` is a special Phaser method that runs before `create()`. It receives any data passed when the scene was launched.

Back in GameScene, the scene was launched like this:
```js
this.scene.launch('UIScene', { gameScene: this });
```

That `{ gameScene: this }` object is the `data` parameter here. So `this.gameScene` now holds a direct reference to the running GameScene. UIScene needs this so it can listen to GameScene's events.

---

## Placing the Text

```js
this.scoreText = this.add.text(16, 16, 'Score: 0', { ... });
```
Score text is at position (16, 16) — top-left corner, with a small 16px margin.

```js
this.livesText = this.add.text(784, 16, 'Lives: 3', { ... }).setOrigin(1, 0);
```
Lives text is at x=784 — near the right edge of the 800px screen. `setOrigin(1, 0)` anchors it from its **top-right** corner, so it stays flush with the right edge even if the text gets longer (e.g. "Lives: 10").

---

## Listening for Events

```js
this.gameScene.events.on('scoreUpdate', s => this.scoreText.setText(`Score: ${s}`));
this.gameScene.events.on('livesUpdate', l => this.livesText.setText(`Lives: ${l}`));
```

This is the event system at work. UIScene doesn't check the score every frame — instead it **listens** and only updates when told to.

- Whenever GameScene runs `this.events.emit('scoreUpdate', this.score)`, UIScene's listener fires and calls `setText()` with the new score value.
- The backtick strings `` `Score: ${s}` `` are called **template literals** — they let you embed a variable directly inside a string using `${}`.

---

## Cleaning Up

```js
this.gameScene.events.on('shutdown', () => this.scene.stop());
this.gameScene.events.on('destroy',  () => this.scene.stop());
```

When GameScene ends (e.g. going back to the menu), UIScene needs to stop too. Without this, the HUD would keep running in the background as a ghost scene. These listeners make sure UIScene stops whenever GameScene does.

---

## Why a Separate Scene for the HUD?

You might wonder: why not just put the score text inside GameScene?

The camera in GameScene scrolls with the player. Any text added there would scroll off screen. You'd need to use `setScrollFactor(0)` on every HUD element.

By putting the HUD in its own scene (which has no camera movement), all its text automatically stays fixed on screen — no extra work needed. It's a cleaner separation too: gameplay logic lives in GameScene, display logic lives in UIScene.

---

## Summary

- UIScene runs alongside GameScene as an overlay
- It receives a reference to GameScene via `init(data)`
- It listens for `'scoreUpdate'` and `'livesUpdate'` events to update the display
- Separating the HUD into its own scene keeps it fixed on screen without any extra code
