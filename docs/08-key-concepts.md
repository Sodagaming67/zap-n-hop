# 08 — Key Programming Concepts in This Game

This file explains the big ideas used throughout the code — things that show up in almost every JavaScript project, not just games.

---

## 1. Variables

A variable is a named box that holds a value.

```js
const width = 800;       // const = never changes
let score = 0;           // let = can change later
score = score + 10;      // update it
```

- `const` — use when the value never changes
- `let` — use when the value will change over time

---

## 2. Objects `{ }`

An object groups related values together under one name.

```js
const platform = { x: 200, y: 370, w: 3 };
console.log(platform.x);  // → 200
```

Instead of three separate variables (`platformX`, `platformY`, `platformW`), you have one object with three **properties**.

Objects can also hold functions (called **methods**):
```js
const player = {
  x: 64,
  jump: function() { this.velocityY = -550; }
};
player.jump();
```

---

## 3. Arrays `[ ]`

An array is a list of values.

```js
const coins = [
  { x: 232, y: 340 },
  { x: 296, y: 340 },
  { x: 360, y: 340 },
];

coins[0]  // → { x: 232, y: 340 }  (first item, index starts at 0)
coins.length  // → 3
```

Arrays are used throughout this game to hold lists of platforms, coins, and enemies.

---

## 4. Loops

Loops run the same code multiple times — once for each item in a list.

```js
coins.forEach(coin => {
  this.coins.create(coin.x, coin.y, 'coin');
});
```

`forEach` goes through every item in the array and runs the function for each one. Without loops, you'd need to write a separate `create()` call for every single coin.

---

## 5. Functions and Arrow Functions

A function is a reusable block of code.

```js
// regular function
function addTen(number) {
  return number + 10;
}

// arrow function (shorter syntax, same idea)
const addTen = (number) => number + 10;

addTen(5);  // → 15
```

Arrow functions (`=>`) are used a lot in this game for short, one-time callbacks:
```js
startBtn.on('pointerdown', () => this.scene.start('GameScene'));
```

---

## 6. Classes

A class is a **blueprint** for creating objects. All four scenes are classes.

```js
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');  // call the parent class setup
  }

  create() {
    // ...
  }
}
```

- `class` defines the blueprint
- `extends Phaser.Scene` means MenuScene *inherits* all of Phaser.Scene's features (like `this.add.text`, `this.physics`, etc.)
- `constructor()` runs when you first create the object
- `this` refers to the current instance of the class

When Phaser runs `new MenuScene()`, it creates one object from this blueprint.

---

## 7. Events (the Pub/Sub Pattern)

Events let different parts of code talk to each other without being directly connected.

```js
// in GameScene — send a message
this.events.emit('scoreUpdate', 150);

// in UIScene — listen for that message
this.gameScene.events.on('scoreUpdate', (newScore) => {
  this.scoreText.setText(`Score: ${newScore}`);
});
```

Think of it like a radio broadcast: GameScene transmits a signal, UIScene has its radio tuned to that frequency. They don't need to know each other's internals — just the signal name.

This is called the **Publisher/Subscriber pattern** (pub/sub). It keeps code loosely connected, so changes in one place don't break the other.

---

## 8. The Game Loop

The most important concept in any game:

```
while (game is running) {
  check input
  update positions
  check collisions
  draw everything
  wait for next frame
}
```

In Phaser, this is your `update()` method. It runs approximately 60 times per second. Everything that moves or responds to input lives here.

The key insight: **the game doesn't react to things, it checks everything 60 times per second**. Is the left key pressed *right now*? Is the player touching an enemy *right now*? Each frame is a fresh check.

---

## 9. Coordinates (x, y)

In screen coordinates, `(0, 0)` is the **top-left** corner:
- X increases going **right**
- Y increases going **down**

```
(0,0) ----→ x increases
  |
  ↓
  y increases
```

This is the opposite of maths class (where Y goes up). It trips up a lot of beginners.

So to move something up, you set a **negative** Y velocity:
```js
this.player.setVelocityY(-550);  // negative = upward
```

---

## 10. Hex Colours

Colours in code are written in **hexadecimal** (base 16). Each colour has three components: Red, Green, Blue.

```
#FFD700
  ^^       FF = 255 red  (max red)
    ^^     D7 = 215 green (high green)
      ^^   00 = 0 blue   (no blue)
→ result: gold
```

In Phaser, colours are written as `0xFFD700` (with `0x` prefix instead of `#`). The value is the same — just a different notation.

You can use any hex colour picker website (search "hex color picker") to find the code for any colour you want.

---

## Where to Go From Here

Now that you understand this codebase, some good next steps:

1. **Change values** — tweak gravity, player speed, jump height, and see what happens
2. **Add a new coin** — add `{ x: 100, y: 200 }` to the `coinPositions` array
3. **Change colours** — swap `0x44ff44` (player green) for any hex colour you like
4. **Add a platform** — add `{ x: 300, y: 200, w: 2 }` to the `platforms` array in `_buildLevel()`

Making small changes and seeing the result is the fastest way to learn.
