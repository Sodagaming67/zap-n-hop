# Zap-N-Hop: Design Decisions & Feature Log

A living document tracking every feature request, the implementation approach chosen, alternatives considered, and the reasoning behind each decision. Update this file whenever a new feature is added.

---

## How to Use This Document

Each section corresponds to one user feature request, numbered in the order it was asked. For each feature you'll find:
- **What was asked** — the original request
- **What was built** — how it was implemented
- **Why this approach** — the core reasoning
- **Alternatives considered** — other ways it could have been done, and why they were ruled out

---

## Feature Requests (Chronological)

---

### #1 — Replace Red Dot Enemies with Skeletons That Shoot Arrows

**What was asked:** "Can you change the red dots to skellatans that shoot arrows?"

**What was built:**
- Skeletons drawn procedurally in `BootScene.preload()` using `this.make.graphics()` — a 32×48 pixel character with white skull, ribcage, limbs, and dark eye sockets
- `enemy` texture key replaces the previous red circle
- Each skeleton has a `patrolMin`/`patrolMax` range — it walks back and forth and flips direction at the boundary
- Arrow shooting: skeletons call `_skeletonShoot()` on a timer (~2s interval). Arrows are fired horizontally toward the player (direction determined by comparing x positions)
- Arrow texture: 24×8 brown horizontal rectangle with an arrowhead triangle

**Why this approach:**
Procedural texture generation in `BootScene` keeps the project as pure JavaScript with no image files. This matters because the game currently has no asset pipeline — there's no build step, no sprite sheet, no art files. Everything is drawn with the Phaser Graphics API at boot time. This makes it easy to iterate on appearance by changing numbers in code rather than editing images in an external tool.

The patrol system uses a simple min/max boundary check rather than pathfinding or state machines, which is appropriate for a flat 2D platformer where enemies don't need to navigate complex terrain.

**Alternatives considered:**
- **Real sprite sheets (PNG files)** — would look far better visually, but requires an artist or asset license, and adds file management complexity. Ruled out for now; a future art pass could swap texture keys without changing game logic.
- **Phaser animations (sprite atlas + frame cycling)** — would give walking/shooting animations. Currently the skeleton is a single static frame. Could be added later without changing the collision/shooting logic.
- **Homing arrows** — considered but ruled out. Homing projectiles on the first enemy type would make the game too hard early on. Straight horizontal arrows are readable and fair.
- **Melee-only skeletons** — simpler but less interesting. Projectile enemies force the player to pay attention to lane threats, which is better game design for a platformer.

---

### #2 — Fix Skeleton Placement, Safe Start Zone, Fireballs from Sky

**What was asked:** "First off theres a skellatan at the end, secondly, you should make the start spot safe. Thirdly, you should put fireballs raining from the sky."

**What was built:**
- **Safe start zone**: Moved the first skeleton from x=200 to x=450 with patrol min=380. Player spawns at x=64, so there's a gap of ~316px of safe space.
- **No skeleton at flag**: The flag (level end) is near x=1700. The last skeleton's `patrolMax` was capped at x=1580 to keep it clear of the goal.
- **Fireballs raining**: A repeating Phaser timer fires every 1800ms, picking a random x within the camera's current view. A fireball texture (24×24 orange/red circle with inner glow) is spawned at y=-30 and falls with gravity. On hitting a platform or the player, it deals damage and is destroyed.

**Why this approach:**
The safe start zone is a game design principle — players need a moment to orient themselves when they first spawn or respawn. Putting an enemy right at spawn creates frustration rather than challenge.

Fireballs use Phaser's built-in arcade gravity rather than manually animating y-position each frame. This is simpler and automatically handles variable frame rates.

**Alternatives considered:**
- **Fireballs from fixed positions** — more predictable but less dynamic. Random x within the camera view keeps the threat feeling omnipresent without requiring the player to memorize patterns.
- **Fireballs that track the player** — too punishing; ruled out. The randomness means skilled players can dodge by watching the sky.
- **Wider safe zone with a tutorial section** — a better long-term choice, but overkill at this stage of development. The current gap is enough to prevent instant death.

---

### #3 — City-on-Fire Parallax Background

**What was asked:** "Can you make the background a city on fire?"

**What was built:**
A 4-layer parallax background, all drawn procedurally with Phaser Graphics objects placed in world space:

| Layer | Content | Scroll Factor | Width |
|-------|---------|--------------|-------|
| Sky | Dark red gradient with smoke clouds | 0.0 (fixed) | 800px |
| Far buildings | Dark silhouettes, orange fire glow in windows | 0.2 | 2400px |
| Mid buildings | Taller silhouettes with more fire detail | 0.5 | 4500px |
| Near rubble | Street-level debris and fire pits | 0.8 | 7000px |

**Why this approach:**
Phaser's `setScrollFactor()` on a world-space object tells the camera how much to scroll it relative to the world. A factor of 0 = fixed to screen; 1.0 = moves with the world; 0.5 = moves at half speed, creating the illusion of depth.

The layer widths were calculated carefully: at maximum camera scroll (worldWidth 8000 - viewWidth 800 = 7200px scrollX), each layer must extend far enough that it doesn't run out. For scrollFactor 0.2, the camera moves the layer by `7200 * 0.2 = 1440px`, so the layer must be at least `800 + 1440 = 2240px`. The actual widths used (2400, 4500, 7000) add margin.

**Alternatives considered:**
- **TileSprite with tilePositionX** — Phaser's TileSprite can repeat a texture and scroll it by updating `tilePositionX` each frame. This would require pre-baked tileable texture images, which we don't have in this code-only project.
- **Screen-space Graphics updated every frame** — could work, but would require manual parallax math in `update()`. Using world-space with `setScrollFactor` means Phaser handles the math automatically — simpler and less error-prone.
- **Pre-rendered background image** — ideal for final art quality, but not viable in a no-asset pipeline. Could be swapped in later by replacing the Graphics calls with `this.add.image()`.
- **3D perspective background (fake depth using scale)** — used in some platformers but significantly more complex to implement and overkill for this style.

---

### #4 — Sky Zombies, Iron Man Character, Missile Shooting

**What was asked:** "Can you make a few zombies sometimes rain from the sky, and can you change the character apearance to Iron Man, and can you make him shoot missiles if the screen is tapped?"

**What was built:**
- **Sky zombies**: A timer spawns zombies at random x positions above the camera view every ~6 seconds (max 3 active at once). They fall with gravity. When `body.blocked.down` is true and `patrolActive === false`, the zombie just landed — it sets a patrol range of ±120px from its landing x and begins patrolling like a normal enemy.
- **Iron Man**: `player` texture redrawn as a 32×48 figure with gold/red color scheme — red torso, gold faceplate, arc reactor chest circle, gold boots and gloves, repulsor hand markings.
- **Missile shooting on tap**: Phaser pointer input (`this.input.on('pointerdown')`) fires the currently selected weapon. Missiles are 24×8 red/orange rectangles that travel horizontally, deal damage on contact with enemies, and are destroyed on hit or leaving the world.

**Why this approach:**
Sky zombies reuse the existing enemy group, patrol system, and collision/overlap handlers — no new code paths needed. The `patrolActive` flag elegantly handles the "hasn't landed yet" state without a separate group or state machine.

Using Phaser's pointer events for shooting means it works with both mouse clicks and touchscreen taps, making the game playable on mobile browsers without any extra code.

**Alternatives considered:**
- **Sky zombies as a separate group** — would require duplicate collision setup. Reusing the enemy group was simpler and kept combat balanced (same damage, same scoring).
- **Sky zombies with homing behavior** — considered but ruled out (same reasoning as homing arrows — too punishing).
- **Iron Man sprite from an image file** — much better looking, but same reason as always: no asset pipeline yet.
- **Separate touch and click handlers** — Phaser's `pointerdown` fires on both. No need to handle them separately.

---

### #5 — Advanced Weapon Inventory, More Platforms, Extended Level

**What was asked:** "Can you make iron man have an advanced inventory, can you also add a lot more layers, make stuff more realistic, and extend the level by a TON"

**What was built:**
- **4-weapon inventory system**:
  - `missile` — single projectile, infinite ammo, short cooldown
  - `repulsor` — 3-way spread shot, infinite ammo, longer cooldown (arc reactor-themed)
  - `unibeam` — piercing gold beam, limited ammo (15), fast cooldown
  - `smartbomb` — AOE explosion around player, limited charges (3)
  - Switched via keys 1/2/3/4; weapon state stored in `this.inventory` object
- **Extended level**: World expanded to 8000×500px (was ~1800px). 5 platform sectors with varied heights and gaps. 18 ground skeletons spread across the level. More coin and star pickups.
- **Health system**: Replaced the old 3-lives system with `health`/`maxHealth` HP. Default 100 HP, damage dealt per hit varies by enemy type. HP bar in UIScene changes color green→orange→red.
- **Checkpoints**: Gray checkpoint poles become gold when stepped on. `lastCheckpoint` stores the respawn x/y. On death, player respawns at last checkpoint with brief invincibility.
- **Invincibility frames**: `this.invincible` flag; player blinks at 0.5 alpha for 1.5 seconds after respawning to prevent instant re-damage.

**Why this approach:**
The inventory uses a dispatcher pattern: `_fireWeapon()` checks cooldown and ammo, then calls `_fireMissile()`, `_fireRepulsor()`, etc. Each weapon is a pure function that creates projectiles — no class hierarchy, no weapon objects with methods. This is simple to add new weapons to: just add a key to `this.inventory.weapons` and a new `_fireX()` method.

HP over lives is a better fit for a longer level — lives would require frequent checkpointing and careful balance. HP allows more granular tuning (skeleton arrow = 10 damage, fireball = 20 damage, zombie = 15 damage) and gives players a sense of their current risk state.

**Alternatives considered:**
- **Class-based weapon system** (`new Missile()`, `new Repulsor()`, etc.) — cleaner for a large game, but heavy for 4 weapons. The dispatcher pattern is sufficient and keeps everything in one file.
- **Weapon pickups instead of inventory** — could be more dynamic but would require level design to guarantee the player finds weapons they need.
- **Tilemap-based level (Tiled editor)** — the right choice for a production game. Tiled exports JSON tilemaps; Phaser has a built-in tilemap loader. This would allow visual level design without touching code. Ruled out because it would require installing Tiled and setting up a new workflow — too big a change mid-development.
- **Procedural level generation** — interesting for replayability but complex to balance and debug. Manual platform placement allows deliberate difficulty pacing.
- **Separate lives counter** — kept simpler by going HP-only. Could add an "extra life" shop item later that restores full HP.

---

### #6 — Currency, Item Shop, Premium Shop

**What was built** (emerged organically from the inventory and economy requests):
- **Two-currency system**: Stars (★) earned by collecting star pickups; Dots (●) earned by performance (kills, distance)
- **Item Shop** (`ShopScene`): 5 consumable items purchasable with stars or dots. Items last one run.
- **Premium Shop** (`PremiumShopScene`): 5 premium items with real-money prices shown. UI is complete but payment backend is not yet implemented.
- **localStorage persistence**: `zapnhop_stars`, `zapnhop_dots`, `zapnhop_owned` (consumable stack counts), `zapnhop_premium` (owned premium items)

**Why this approach:**
Two currencies create more interesting spending decisions than one — players must choose between skill-based rewards (stars, harder to get) and performance rewards (dots, more automatic). Consumables lasting one run means players must actively shop between runs, creating a meta-game loop without permanent power creep.

localStorage is the simplest persistence layer for a browser game with no backend. Data survives browser restarts and is human-readable in DevTools.

**Alternatives considered:**
- **Single currency** — simpler, but removes the interesting choice between currencies. Ruled out in favor of dual currencies.
- **Permanent upgrades (e.g., +5 max HP forever)** — would make the game trivially easy after a few runs. Consumables keep every run feeling balanced.
- **IndexedDB instead of localStorage** — more powerful (async, larger storage, structured data), but overkill for a handful of integer values. localStorage is synchronous and simple for this use case.
- **Server-side save data** — required for real anti-cheat and cross-device sync, but needs a backend. Not viable at this stage.
- **Real payment integration (Stripe, etc.)** — the right choice eventually for the premium shop. Deliberately deferred since it requires server-side validation to be secure.

---

### #7 — Design Decisions Living Document

**What was asked:** "i want you to save all my feature asks so far and the design choices you made to implement it in a .md file under docs so this can be a living document that constantly gets updated. why you implemented a feature in a certain way and what other options did you consider and rule out in the process is helpful to retroactively look into all the choices and decide if a better technology or framework choice might work better"

**What was built:** This file (`docs/design-decisions.md`).

**Why this approach:**
A Markdown file in the `docs/` folder is version-controlled alongside the code, so the design rationale and the code that implements it are always in sync. When a feature is changed, both the code and this doc can be updated in the same commit.

**Alternatives considered:**
- **Notion / Google Docs** — collaborative and rich, but not version-controlled with the code. Design drift becomes invisible.
- **Comments in code** — too scattered. One centralized doc lets you see all decisions at once and compare tradeoffs across features.
- **GitHub Wiki** — co-located with the repo but stored separately from the code; not in the same git history. A file in `docs/` stays in sync automatically.

---

## Open Questions / Future Decisions

These are areas where the current implementation is a known compromise and a better approach may be worth revisiting:

| Area | Current Approach | Better Long-term Approach |
|------|-----------------|--------------------------|
| Graphics | Procedural Phaser Graphics | Real sprite sheets (PNG/atlas) |
| Level design | Hardcoded platform arrays in JS | Tiled editor JSON tilemaps |
| Animations | Single static texture per character | Sprite atlas + Phaser animation frames |
| Payment | UI only, no real payment | Stripe or similar with server validation |
| Save data | localStorage | Server-side or at minimum signed localStorage |
| Audio | None | Phaser audio with Web Audio API |
| Mobile controls | Tap to shoot only | On-screen virtual joystick + buttons |
| Enemy AI | Simple patrol + shoot | Behavior trees or FSM for smarter enemies |

---

## Technology Stack Summary

| Layer | Technology | Why Chosen |
|-------|-----------|-----------|
| Game engine | Phaser.js 3 | Mature, well-documented, browser-native, free |
| Language | Vanilla JavaScript (ES6) | No build step, works directly in browser |
| Physics | Phaser Arcade Physics | Built-in, fast, sufficient for 2D platformer |
| Graphics | Phaser Graphics API (procedural) | No external art files needed during development |
| Persistence | localStorage | Zero infrastructure, enough for a browser game |
| Dev server | Python `http.server` | Built-in on most machines, no npm required |
| Version control | Git | Standard; auto-commit hook keeps history clean |

---

*Last updated: 2026-06-25 — covers features #1 through #7.*
