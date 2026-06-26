You are helping the user spin up a brand-new Phaser browser game project from scratch. Work through the four phases below in order. Do not skip phases or combine them — wait for user input at each phase before moving on.

---

## Phase 1 — Collect requirements and suggest repo names

Ask the user these questions in a single message (one block, friendly tone, no jargon):

1. What kind of game do you want to make? (platformer, top-down shooter, puzzle, endless runner, something else?)
2. What's the main character? (robot, wizard, cat, spaceship, anything)
3. What's the main mechanic or twist? (what makes it fun or different?)
4. Any vibe or theme? (spooky, retro pixel, neon sci-fi, cartoon, etc.)

After they answer, generate **6 fun, creative repo name suggestions** — short, lowercase, hyphenated, under 20 chars. Base them on their answers. Use wordplay, alliteration, or mash-ups. Examples of the style: `zap-n-hop`, `neon-crypt-run`, `wobble-wizard`. Show names as a numbered list and ask them to pick one or type their own.

Do not proceed to Phase 2 until the user has chosen a repo name.

---

## Phase 2 — Create the GitHub repo

Once the user picks a repo name (store it as REPO_NAME):

Run this command to create a public GitHub repo under Sodagaming67:

```
gh repo create Sodagaming67/REPO_NAME --public --description "A Phaser browser game"
```

Replace REPO_NAME with the actual chosen name.

If `gh` is not authenticated, tell the user: "Run `gh auth login` in your terminal first, then invoke `/new-game` again."

Confirm success by echoing the repo URL: `https://github.com/Sodagaming67/REPO_NAME`

Do not proceed to Phase 3 until the repo is created successfully.

---

## Phase 3 — Clone and set up the project

### 3a. Clone the repo

```powershell
git clone https://github.com/Sodagaming67/REPO_NAME "c:\Code\Games\REPO_NAME"
```

Change into the directory for all subsequent commands: `c:\Code\Games\REPO_NAME`

### 3b. Create folder structure

```powershell
New-Item -ItemType Directory -Force "c:\Code\Games\REPO_NAME\src\scenes"
New-Item -ItemType Directory -Force "c:\Code\Games\REPO_NAME\assets"
New-Item -ItemType Directory -Force "c:\Code\Games\REPO_NAME\docs"
New-Item -ItemType Directory -Force "c:\Code\Games\REPO_NAME\.claude\commands"
```

### 3c. Write all project files

Write each file below exactly as shown, substituting REPO_NAME and GAME_TITLE (a human-readable title version of the repo name, e.g. "Neon Crypt Run") throughout.

---

**`c:\Code\Games\REPO_NAME\CLAUDE.md`**

```markdown
# GAME_TITLE — Project Rules for Claude

These rules apply to every response in this project. Follow them before the auto-commit fires.

---

## 1. Docs must be updated in the same response as any code change

When you add, change, or remove a feature:

1. Add a new numbered entry to `docs/10-feature-requests.md` (never renumber existing entries).
   - Include: what was asked, status, what was built, files changed, link to design note.
2. Add a matching entry to `docs/09-design-decisions.md` under the current session.
   - Include: what was built, why this approach, alternatives considered.
3. Do this in the **same response** — not a follow-up, not after the commit.

---

## 2. Commit rules

- Do not add a `Co-Authored-By:` trailer to commit messages.
- Git username: Philip Thangiah (Sodagaming67).

---

## 3. Code style

- No comments unless the WHY is non-obvious.
- No new files unless the feature genuinely requires one.
- No error handling for scenarios that can't happen.

---

## 4. Communication style

- User is a beginner — use plain language, avoid jargon.
- Keep responses short and direct.
- No trailing summaries of what was just done.
```

---

**`c:\Code\Games\REPO_NAME\.claude\settings.json`**

```json
{
  "permissions": {
    "allow": [
      "Bash(netstat*)",
      "Bash(taskkill*)",
      "Bash(python*http.server*)",
      "Bash(cmd.exe*start*localhost*)"
    ]
  },
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "shell": "bash",
            "command": "cd \"c:/Code/Games/REPO_NAME\" && git add -A && git diff --cached --quiet || git commit -m \"Auto-save: $(git diff --cached --name-only | tr '\\n' ' ' | sed 's/ $//')\"",
            "statusMessage": "Committing changes..."
          }
        ]
      }
    ]
  }
}
```

---

**`c:\Code\Games\REPO_NAME\.claude\commands\start.md`**

```markdown
Start the local development server for this Phaser game project. Follow these steps in order using Bash:

1. Kill any process already listening on port 8080:
   ```
   PID=$(netstat -ano 2>/dev/null | grep ":8080 " | grep "LISTENING" | awk '{print $5}' | head -1) && [ -n "$PID" ] && taskkill //F //PID $PID 2>/dev/null; true
   ```

2. Wait 1 second for the port to free up.

3. Start a Python HTTP server in the background from the project root:
   ```
   cd "c:/Code/Games/REPO_NAME" && python -m http.server 8080 &
   ```

4. Wait 1 second for the server to start up.

5. Open the game in the default browser:
   ```
   cmd.exe /c start http://localhost:8080
   ```

6. Tell the user: "Server is running at http://localhost:8080 — open your browser if it didn't open automatically."

If Python is not found in step 3, try `python3 -m http.server 8080 &` instead.
```

---

**`c:\Code\Games\REPO_NAME\docs\09-design-decisions.md`**

```markdown
# GAME_TITLE — Design Decisions Log

This is a living document. Every time a feature is added or changed, a new entry goes here **in the same response as the code change** — before the auto-commit fires.

The goal is to capture **why** a decision was made, not just **what** was built. That way, if you come back later and want to swap out a technology or rethink an approach, you have the full context of what was considered at the time.

---

## How to Read This

Each feature entry has four parts:

- **What was asked** — the original request, quoted where possible
- **What was built** — a plain description of the implementation
- **Why this way** — the reasoning behind the specific choices made
- **What was ruled out** — alternatives that were considered and rejected, and why

See [10-feature-requests.md](10-feature-requests.md) for a quick numbered index of every request with file references.

---

## Session 1 — Project Setup

### Initial Project Scaffold

**What was asked:** Set up a new Phaser game project called GAME_TITLE.
**What was built:** Basic Phaser 3 project structure with BootScene, MenuScene, GameScene, and UIScene. Python HTTP server for local development. Auto-commit stop hook.
**Why this way:** Phaser 3 is a well-documented, beginner-friendly game framework. Python's built-in HTTP server requires no installation. The scene structure separates concerns cleanly.
**What was ruled out:** Node/npm dev server — adds complexity; Webpack/Vite — overkill for a small project starting out.
```

---

**`c:\Code\Games\REPO_NAME\docs\10-feature-requests.md`**

```markdown
# GAME_TITLE — Feature Requests Log

Every feature ask is recorded here in the order it was made, across all sessions.
Each entry links to [09-design-decisions.md](09-design-decisions.md) for the full reasoning behind the implementation.

---

## How to Read This

- Entries are numbered in the order they were asked — never renumbered
- "Session" labels mark which conversation the request came from
- "Files changed" is a quick pointer for finding the relevant code
- When a request is later revised, a follow-up entry is added (not the original edited)

---

## Session 1 — Project Setup

### #1 — Initial Project Scaffold

**Asked:** "Create a new Phaser game project called GAME_TITLE"
**Status:** ✓ Done
**What was built:** Phaser 3 project with four scenes (Boot, Menu, Game, UI), index.html entry point, Python dev server, CLAUDE.md rules, auto-commit hook, and docs.
**Files changed:** `index.html`, `src/main.js`, `src/scenes/BootScene.js`, `src/scenes/MenuScene.js`, `src/scenes/GameScene.js`, `src/scenes/UIScene.js`
**Design note:** → [Session 1 — Initial Project Scaffold](09-design-decisions.md)
```

---

**`c:\Code\Games\REPO_NAME\.gitignore`**

```
node_modules/
*.DS_Store
Thumbs.db
```

---

**`c:\Code\Games\REPO_NAME\README.md`**

```markdown
# GAME_TITLE

A browser game built with [Phaser 3](https://phaser.io/).

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.
```

---

**`c:\Code\Games\REPO_NAME\index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GAME_TITLE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script src="src/scenes/BootScene.js"></script>
  <script src="src/scenes/MenuScene.js"></script>
  <script src="src/scenes/GameScene.js"></script>
  <script src="src/scenes/UIScene.js"></script>
  <script src="src/main.js"></script>
</body>
</html>
```

---

**`c:\Code\Games\REPO_NAME\src\main.js`**

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

---

**`c:\Code\Games\REPO_NAME\src\scenes\BootScene.js`**

```js
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {}

  create() {
    this.scene.start('MenuScene');
  }
}
```

---

**`c:\Code\Games\REPO_NAME\src\scenes\MenuScene.js`**

```js
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.text(cx, cy - 60, 'GAME_TITLE', {
      fontSize: '48px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const startText = this.add.text(cx, cy + 40, 'Press SPACE to Start', {
      fontSize: '22px', fill: '#aaaaaa'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText, alpha: 0, duration: 700, yoyo: true, repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }
}
```

---

**`c:\Code\Games\REPO_NAME\src\scenes\GameScene.js`**

```js
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.add.text(400, 250, 'Game Scene — build here!', {
      fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
```

---

**`c:\Code\Games\REPO_NAME\src\scenes\UIScene.js`**

```js
class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {}
}
```

---

### 3d. Initial git commit

```powershell
Set-Location "c:\Code\Games\REPO_NAME"
git add -A
git commit -m "Initial scaffold: Phaser 3 project setup for GAME_TITLE"
git push origin main
```

If `main` branch doesn't exist yet, use `git push -u origin main`.

---

## Phase 4 — Hand off to the user

Tell the user exactly this (fill in REPO_NAME and the GitHub URL):

---

Your new game **GAME_TITLE** is ready at:
`https://github.com/Sodagaming67/REPO_NAME`

It's cloned locally at `c:\Code\Games\REPO_NAME`.

**To start building it:**
1. In VS Code, open the folder `c:\Code\Games\REPO_NAME`  
2. Or in Claude Code desktop, switch the working directory to that folder  
3. Then just start asking me to add features — everything is wired up the same way as Zap-N-Hop

---

Do not do anything else after Phase 4. The user must switch repos themselves.
