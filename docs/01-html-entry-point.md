# 01 — The Entry Point: `index.html`

**File:** [../index.html](../index.html)

---

## What is index.html?

When you type `http://localhost:8080` in your browser, the very first file the browser looks for is `index.html`. Think of it as the front door of the game — everything starts here.

---

## Walking Through the File

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Zap-N-Hop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
```

- `<!DOCTYPE html>` — tells the browser "this is a web page"
- `<head>` — contains setup info that the user doesn't directly see
- The `<style>` block is CSS — it sets the background to dark navy (`#1a1a2e`) and centers the game canvas on screen

---

```html
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
```

This line downloads the **Phaser game engine** from the internet. A CDN (Content Delivery Network) is just a fast server that hosts popular libraries so you don't need to download and store them yourself.

Phaser is a huge toolbox — tens of thousands of lines of code written by other developers that handles physics, drawing, input, audio, and more. You're standing on their shoulders.

---

```html
  <script src="src/scenes/BootScene.js"></script>
  <script src="src/scenes/MenuScene.js"></script>
  <script src="src/scenes/GameScene.js"></script>
  <script src="src/scenes/UIScene.js"></script>
  <script src="src/main.js"></script>
</body>
```

These lines load **your** code files, one by one, in order.

**Order matters here.** Notice that `main.js` is last. That's because `main.js` uses the scenes (BootScene, MenuScene, etc.), so those need to be loaded first. If you put `main.js` first, it would try to use scenes that don't exist yet — and crash.

---

## Why Not Just Open the File Directly?

If you double-click `index.html`, the browser won't load the game properly. Browsers have a security rule: a web page can't load files from your computer unless it's going through a server. The `python -m http.server` or `npx serve` command creates a tiny local server that satisfies this rule.

---

## Summary

- `index.html` is the starting point
- It loads the Phaser library, then your code files
- Order of `<script>` tags matters
- You need a local server to run it (not just double-click)
