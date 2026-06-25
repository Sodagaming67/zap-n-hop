# Zap-N-Hop — Design Decisions Log

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

---

## Earlier Sessions

These features were built before the current conversation. Sourced from `feature-enhancements.md`.

---

### Skeleton Enemies That Shoot Arrows

**What was asked:** "Can you change the red dots to skellatans that shoot arrows?"

**What was built**
Enemy texture redrawn as a 32×48 procedural skeleton (skull, ribcage, limbs, dark eye sockets) in `BootScene`. Each skeleton has `patrolMin`/`patrolMax` bounds and walks back and forth. A looping timer calls `_skeletonShoot()` every ~2 seconds, firing a horizontal arrow in the direction of the player.

**Why this way**
Procedural texture generation in `BootScene` keeps the project as pure JavaScript with no image files — no asset pipeline, no build step, no external art tools. Patrol is a min/max boundary check rather than pathfinding, which is exactly right for a flat platformer where enemies don't navigate complex terrain.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Real PNG sprites | Better looking, but requires art assets and a file loader — not viable yet |
| Phaser animation frames | Would need a sprite atlas; doable later without changing game logic |
| Homing arrows | Too punishing; readable horizontal arrows are fairer to the player |
| Melee-only skeletons | Less interesting; projectiles create lane-management decisions |

---

### Safe Start Zone, Placement Fixes, Fireballs

**What was asked:** "First off theres a skellatan at the end, secondly, you should make the start spot safe. Thirdly, you should put fireballs raining from the sky."

**What was built**
First skeleton moved to x=450 (player spawns at x=64 — 386px of safe space). Last skeleton's patrol capped before the end flag. Fireball spawner fires every 1800ms, picking a random x within the current camera view, dropping from y=−30 with arcade gravity.

**Why this way**
The safe start zone is a fundamental game design principle — players need a moment to orient when they spawn. Fireballs use Phaser's built-in arcade gravity rather than manual y-animation; this is simpler and handles variable frame rates correctly.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Fixed fireball positions | Predictable; randomness within camera view keeps the threat feeling omnipresent |
| Homing fireballs | Too punishing; randomness lets skilled players dodge by watching the sky |
| Wider tutorial section at start | Overkill at this stage; a 386px gap is enough to prevent instant death |

---

### City-on-Fire Parallax Background

**What was asked:** "Can you make the background a city on fire?"

**What was built**
Four-layer parallax background, all drawn with Phaser Graphics in world space:

| Layer | Content | Scroll factor | World width |
|-------|---------|--------------|-------------|
| Sky | Dark red gradient | 0.0 (fixed) | 800px |
| Far buildings | Dark silhouettes, orange window glow | 0.2 | 2400px |
| Mid buildings | Taller silhouettes, more fire detail | 0.5 | 4500px |
| Near buildings | Street-level fire pits and flames | 0.8 | 7000px |

Layer widths calculated: at maximum scroll (7200px), a layer at factor 0.2 shifts by `7200 × 0.2 = 1440px`, so minimum width is `800 + 1440 = 2240px`. Widths used add a safety margin.

**Why this way**
Phaser's `setScrollFactor()` on a world-space object handles the parallax math automatically — no manual update-loop code needed. World-space objects are drawn once at scene creation; screen-space objects drawn every frame would be more expensive.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| TileSprite with tilePositionX | Needs tileable texture images — not viable in a code-only project |
| Screen-space Graphics updated in `update()` | Manual parallax math every frame; `setScrollFactor` is simpler and correct |
| Pre-rendered background image | Ideal for final art; can be swapped in later by replacing Graphics calls with `add.image()` |
| 3D perspective (fake depth via scale) | Significantly more complex, unnecessary for this visual style |

---

### Sky Zombies, Iron Man Character, Missile Shooting

**What was asked:** "Can you make a few zombies sometimes rain from the sky, and can you change the character apearance to Iron Man, and can you make him shoot missiles if the screen is tapped?"

**What was built**
Sky zombie spawner fires every 6 seconds; zombies fall with gravity and begin patrolling ±120px when `body.blocked.down` becomes true. Player texture redrawn as Iron Man (red/gold, arc reactor, repulsor markings). `pointerdown` event fires the active weapon toward the cursor/tap position.

**Why this way**
Sky zombies reuse the existing `enemies` group, patrol system, and all collision handlers — no new code paths. The `patrolActive` flag elegantly represents "hasn't landed yet" without a separate group or state machine. `pointerdown` fires on both mouse click and touchscreen tap, giving mobile compatibility for free.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Sky zombies as a separate group | Duplicate collision setup for no benefit |
| Homing sky zombies | Same reasoning as homing arrows — too punishing |
| Separate touch vs. click handlers | `pointerdown` covers both; no extra code needed |
| Iron Man sprite from PNG | Same no-asset-pipeline reasoning as all other textures |

---

### Advanced Weapon Inventory and Extended Level

**What was asked:** "Can you make iron man have an advanced inventory, can you also add a lot more layers, make stuff more realistic, and extend the level by a TON"

**What was built**
Four-weapon inventory: Missile (infinite ammo), Repulsor (3-way spread, infinite), Unibeam (piercing, 15 ammo), Smartbomb (AOE, 3 charges). Switched with keys 1–4. World expanded to 8000×500px across 5 sectors. 18 ground skeletons, 41 elevated platform tiles, 30 coins, 16 stars. Weapon state in `this.inventory` object with dispatcher pattern in `_fireWeapon()`.

**Why this way**
The dispatcher pattern (`_fireWeapon` checks cooldown/ammo, delegates to `_fireMissile`, etc.) is the simplest way to add new weapons: add a key to `this.inventory.weapons` and one new method. No class hierarchy, no weapon objects — everything stays in one file.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Class-based weapon system | Heavy for 4 weapons; dispatcher is sufficient at this scale |
| Weapon pickups in the level | Requires level design guaranteeing access; static inventory is simpler |
| Tiled editor JSON tilemaps | Right long-term choice; needs new tooling and workflow — deferred |
| Procedural level generation | Hard to balance; manual placement allows deliberate difficulty pacing |

---

---

## Session 1 — Combat, Health, and Level Feel

---

### Platform Zombies

**What was asked:** "Add zombies on random platforms."

**What was built**
Ten zombies placed directly on elevated platforms at scene creation (2 per sector). Each patrols only within its platform's width. Patrol speed increases per sector (55 → 75 px/s). No shoot timer — purely melee.

**Why this way**

- **Created at scene start, not spawned dynamically.** Dynamic spawning risks zombies missing the platform and falling to the ground. Pre-placed zombies are always exactly where intended.
- **No shoot timer.** Three enemy types, three distinct threats: skeletons shoot from the ground, sky zombies fall from above, platform zombies patrol elevated areas. Giving all three the same shoot behaviour removes the distinction.
- **Speed increases per sector.** Matches the existing skeleton difficulty curve rather than creating random spikes.
- **Spawn at platform_y − 40, let physics settle.** Slightly above the surface; gravity and the platform collider handle exact placement. Safer than guessing the exact landing pixel.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Dynamic spawning near player | Unpredictable density; clusters or empty sectors are both bad |
| Platform zombies with shoot timers | Too much elevated ranged fire; makes platforming sections unfair |
| New zombie texture for platform type | Reuse existing zombie sprite — already visually distinct from skeletons |
| `patrolActive = false` (fall-and-activate) | One pixel off and they'd fall to the ground instead of their intended platform |

---

### Health System (Health Bar, One Life, Enemy Damage)

**What was asked:** "Have a health bar and only one life where enemies can't one-shot you."

**What was built**
Replaced 3-lives system with 100 HP. Bar in top-right HUD changes green → orange → red. Damage values: arrow = 20 HP, fireball = 25 HP, enemy contact = 30 HP. Death (HP = 0) triggers `_playerDied()` which respawns at last checkpoint with full HP and 1.5s invincibility. Default respawn point is the level start.

**Why this way**

- **100 HP.** Round number, easy to track mentally. Worst single hit (30) is 30% of max — players can survive three consecutive worst-case hits.
- **These specific damage values.** Three sources, three different numbers, making each threat feel distinct. All below 100 guarantees the "can't one-shot" requirement.
- **Full HP on respawn.** Partial HP was considered. Rejected because a low-HP respawn near enemies leads to immediate re-death — frustrating, not challenging.
- **"One life" = health bar + checkpoints, not permadeath.** The request paired "one life" with "multiple checkpoints." Interpreted as: no lives reserve, just the bar. Checkpoints are the safety net. This matches how modern platformers (Hollow Knight, etc.) handle it.
- **Start position as default respawn.** Rather than hard game-over before the first checkpoint, the level start acts as an implicit checkpoint zero.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep lives AND add HP bar | Two parallel "how close to death am I" systems — confusing |
| True permadeath | Too punishing in a game with constant fireball rain and 28 enemies |
| Partial HP on checkpoint respawn (50%) | Leads to immediate re-death near enemies; worse experience |
| Health regenerating over time | Removes strategic value of the health regen pickups |

---

### Health Regen Pickups

**What was asked:** "Put in a few health regen areas."

**What was built**
4 green glowing orb pickups at ground level (x ≈ 900, 2700, 5000, 7050). Each restores +35 HP and disappears. Green camera flash confirms collection.

**Why this way**

- **Consumable pickup, not a standing regen zone.** A zone you stand in was considered. Rejected because enemies fire constantly — standing still to heal is not a real option. A pickup you grab while moving is practical.
- **+35 HP.** One-third of max health. Meaningful recovery without being a full restore. Two pickups gets you back near full.
- **Ground level.** Health should reward forward progress, not require platform detours.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Standing regen zones | Not practical under fire; adds complex per-tick "is player inside zone" logic |
| Passive time-based regen | Removes player agency — health should be something you hunt for |
| Full HP restore on pickup | Too powerful; undermines the checkpoint-respawn HP design |
| Pickups on platforms | Makes health harder to collect; ground-level keeps it accessible |

---

### Checkpoints

**What was asked:** "Multiple checkpoints."

**What was built**
4 flag poles at sector boundaries (x ≈ 1720, 3450, 5460, 6980). Touching one changes the flag grey → gold, flashes the camera gold, and saves `lastCheckpoint = { x: cp.x, y: 400 }`. On death, player teleports to `lastCheckpoint` with full HP.

**Why this way**

- **One per sector boundary.** Sector boundaries are the natural points where difficulty steps up. A checkpoint just before that step is the most valuable placement.
- **Grey → gold visual feedback.** Without the colour change, players wouldn't know whether touching the flag registered.
- **Spawn at fixed y = 400, not the flag's exact y.** The flag's y is exactly at ground level. Using the exact y risks spawning inside ground geometry depending on floating point. y = 400 is safely above ground and physics will always land the player correctly.
- **Not persisted to localStorage.** Checkpoints are per-run state — loading a checkpoint from a previous session would make no sense. They reset every run.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Persist checkpoints to localStorage | Per-run state; stale checkpoints between sessions make no sense |
| Respawn at exact flag y | Floating-point risk of clipping into geometry; fixed y = 400 is always safe |
| Checkpoint restores only 50% HP | More frustrating; see Health System reasoning |

---

---

## Session 2 — Economy and Shops

---

### Item Shop and Currency System

**What was asked:** "Add a special item shop in the menu that players can use to buy items with stars and dots."

**What was built**
Two currencies: Stars (from star pickups) and Dots (from coin/dot pickups), both persisted in `localStorage`. New `ShopScene` with 5 items split between the two currencies. Currency visible in menu and in-game HUD below the HP bar.

**Why this way**

- **localStorage.** No server needed. Synchronous, readable in DevTools, one-line reads and writes. Enough for a local browser game.
- **Stars = premium, Dots = common.** Stars already had higher point value (+25 vs +10). The currency hierarchy matches the pickup hierarchy.
- **Keep coin texture, call them "Dots" in shop context.** Renaming 16 coin placements + collision handlers everywhere would be risky refactoring for just a label. Same visual, different name in the shop layer.
- **`zapnhop_` prefix on all keys.** Prevents collisions if localStorage has data from other tools in the same browser origin.
- **`currencyUpdate` event from GameScene → UIScene.** Consistent with the `scoreUpdate` / `healthUpdate` pattern already in the codebase. UIScene always receives pushed data — never reads from GameScene directly.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| IndexedDB | Async API; far too complex for simple integer storage |
| Score as currency | Score is an achievement (never goes down); currency gets spent — merging breaks both |
| Single unified currency | Two currencies create interesting spending decisions; which is rarer? |
| UIScene reading localStorage directly | Breaks the established event-driven pattern |

---

### Currency Visibility (HUD + Menu)

**What was asked:** "Can you also make the stars and dots visible."

**What was built**
`★ X` and `● X` counters below the HP bar in UIScene (update live via `currencyUpdate` event). Menu shows wallet from localStorage on each load.

**Why this way**
Placed below the HP bar — same corner, same eye-movement — so players only need to glance to one region for all run-state information. Menu reads from localStorage directly because the menu doesn't run alongside GameScene (no shared event bus).

---

### Premium Shop

**What was asked:** "...make a money shop in the menu where you can buy custom items with real money."

**What was built**
`PremiumShopScene` with 5 items and real dollar prices. Clicking BUY opens a modal honestly explaining payment is not configured. Separate `zapnhop_premium` localStorage key reserved for future integration.

**Why this way**

- **UI mockup, not a working checkout.** Real payments require a payment processor, HTTPS, and server-side validation. None of that infrastructure exists. A mockup shows the intent without creating a broken or misleading flow.
- **Separate localStorage key.** If payments are added later, the server can write to `zapnhop_premium` directly without touching the consumable item system.
- **Distinct purple/gold visual identity.** Players need to immediately distinguish "spend in-game currency" from "spend real money" — colour is the fastest signal.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Fake checkout that "completes" | Misleading — players may expect the items to work |
| Combine with item shop | Different payment systems, different persistence logic; better separated |
| Stripe.js integration | Requires server-side signature verification; not viable without a backend |
| Hide until payments are configured | User asked for it now; an honest mockup is better than nothing |

---

### Shop Exits

**What was asked:** "Also make exits on all the shops."

**What was built**
EXIT button bottom-right in both shops calls `scene.start('MenuScene')`. Premium shop purchase modal has its own CLOSE button.

**Why this way**
`scene.start` fully replaces the scene stack with MenuScene. `scene.stop` would try to resume whatever was behind the shop in the scene stack — not guaranteed to be MenuScene if the stack order ever changes.

---

---

## Session 3 — Consumable Items

---

### Items Not Permanent

**What was asked:** "Can you make the items not permanent."

**What was built**
`zapnhop_owned` changed from array `['health_upgrade']` to count object `{ health_upgrade: 2 }`. Buying increments count. At game start: snapshot `has()` function checks counts, effects applied, then all counts decremented by 1 and saved. Zero-count keys deleted.

**Why this way**

- **Count object over array.** Counting duplicates in an array (`arr.filter(x => x === id).length`) is clunky. Object lookup is O(1) and trivially incrementable.
- **Consume at game START, not game END.** Game end can be skipped (browser close, crash). Game start is always guaranteed. Consuming at start means the item was used, full stop.
- **`has()` snapshot before the consume loop.** `has` evaluates before counts are decremented, so this run's effects still read `true` even though storage has already been updated.
- **Delete zero-count keys.** Keeps storage clean; `owned[id] || 0` handles missing keys gracefully anyway.
- **BUY always available.** No "OWNED" lock-out — consumables can be stacked. Stack `x2 ready` badge shows how many runs you've pre-bought.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep permanent | User explicitly asked to change this |
| Time-based expiry | Complex, frustrating if you forget to play, not intuitive |
| Consume at win/game-over only | Unreliable — browser close skips those screens |
| Array with duplicate IDs for stacking | Counting duplicates is clunky vs. `owned[id]` |

---

---

## Session 4 — Documentation and Maintenance

---

### Living Design Document

**What was asked:** "i want you to save all my feature asks so far and the design choices you made to implement it in a .md file under docs... why you implemented a feature in a certain way and what other options did you consider and rule out in the process is helpful to retroactively look into all the choices and decide if a better technology or framework choice might work better"

**What was built**
`docs/09-design-decisions.md` (this file) and `docs/10-feature-requests.md`. The split keeps concerns separate: 10 is a quick index you can scan, 09 is the detailed reasoning you go deep on.

**Why a Markdown file in `docs/`**
Version-controlled alongside the code. When a feature changes, the doc and the code change in the same commit — they can never drift apart. Notion/Google Docs are richer but not in git history. GitHub Wiki is close but stored separately from the working tree.

---

### Merge and Maintenance Process

**What was asked:** "can you merge all the previous feature asks in feature-enhancements.md into these two files? i also want these regularly maintained after every iteration — how would we do that? do we add it to the commit rule?"

**What was built**
`feature-enhancements.md` content merged into both docs. Old file deleted. `CLAUDE.md` created with a standing project rule.

**Why CLAUDE.md, not the commit hook**
The stop hook in `.claude/settings.json` runs a bash `git commit` command — it can't trigger Claude to write prose. The hook fires *after* Claude has already stopped responding. `CLAUDE.md` is loaded into every conversation at the start, so Claude reads the rule and knows to update the docs *before* finishing a response and before the auto-commit fires. The rule and the code change travel in the same commit automatically.

---

---

---

## Session 5 — More Enemies + Avengers Select

---

### Cops, Planes, Hot Air Balloons, and Debris on Fire

**What was asked:** "Can you add cops on the street shooting enemies, and planes, hot air balloons and debris on fire in the sky occasionally smashing to the ground?"

**What was built**
Four independent systems each driven by a timer or spawner:
- **Cops** (`_createCops`, `_copShoot`): 10 static police NPCs at y=430 spread across the level. Each has its own shoot timer staggered by 180ms to prevent all-at-once volleys. `_copShoot` iterates `this.enemies` to find the nearest target within 450px and fires a yellow cop bullet horizontally. Cops flip their sprite to face the direction of fire.
- **Planes** (`_spawnPlane`): Spawned every 11 seconds, spawn off the visible camera edge, fly at 340px/s, and are cleaned up when they exit the other camera edge. Randomly come from left or right.
- **Hot air balloons** (`_spawnBalloon`): Same pattern but slower (65px/s), every 17 seconds.
- **Debris** (`_spawnDebris`): Every 2.8 seconds a burning chunk spawns above the player, falls with gravity, spins using `setAngularVelocity`, and has a platform collider that causes a camera shake and AOE enemy clear on impact.

**Why this way**
Cops use the existing `this.enemies` group — no changes to the enemy system. The cop bullet (`copBullets` group) has its own overlap with enemies and a platform collider, exactly mirroring how arrows and missiles work. Cops have `setAllowGravity(false)` so they don't need a platform collider to stay in place. Planes and balloons use the physics group + camera-relative cleanup (not world-bounds cleanup) because they spawn relative to the camera position, not absolute world x.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Cops that patrol/move | Static NPCs are much simpler and still feel alive |
| Cops that die from enemy contact | Adds cop health state; user asked for cops that shoot enemies, not a survival system |
| Planes that drop bombs | No request for plane mechanics; adds projectile group complexity for minimal gameplay value |
| Balloons that can be shot down | Same reasoning — visual enrichment, not a gameplay mechanic |
| Debris AOE that hurts the player too | Kept off — debris already deals direct contact damage; AOE on landing would be double-punishing |

---

### More Fireballs and Sky Zombies

**What was asked:** "Can you add a bit more fire balls and zombies"

**What was built**
Fireball timer reduced from 1500ms to 900ms (40% faster). Added a 35% chance to drop 2 fireballs per tick instead of 1. Sky zombie timer reduced from 6000ms to 3500ms. Added a 30% chance to drop 2 sky zombies per tick (staggered 80px vertically). Added 10 more platform zombies across all sectors, filling elevated platforms that previously had none — total platform zombie count went from 10 to 20.

**Why this way**
The existing spawn code was easy to extend: a `count` variable with a random threshold requires minimal changes and keeps the logic readable. Staggering double zombies vertically (80px apart) avoids them spawning on top of each other and clipping. The timers use Phaser's built-in event loop so no external state is needed.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Higher base spawn rate with no doubles | Doubles feel more dramatic and punishing without just feeling like lag |
| Triples or more | Too punishing with no AOE weapon ready; doubles are already a major threat |
| Spawning only when player is in specific sectors | Over-engineered; random spawning near the player is simpler and fair |

---

### Avengers Character Select Menu

**What was asked:** "can you add a character menu with all the Avengers"

**What was built**
A new `CharacterScene` with a 5×2 card grid of 10 Avengers. Each hero has a unique procedurally drawn 32×48 texture in `BootScene`. Clicking a card saves the texture key to `localStorage` under `zapnhop_character`. `GameScene._createPlayer()` reads that key and spawns the player with the chosen texture. All characters share the same 32×48 hitbox and identical gameplay — cosmetic only.

**Why this way**
Procedural textures in `BootScene` keep the zero-asset philosophy intact — no PNG files, no asset loader changes. Cosmetic-only differentiation avoids the need to rebalance weapons, damage, or speed for 10 different characters. `localStorage` persistence means your choice survives between sessions without any server.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Unique abilities per hero | Adds significant balancing work; user asked for a character menu, not a class system |
| Real image assets | Would require an art pipeline and file hosting; inconsistent with current zero-asset approach |
| Character unlocks (earn with stars) | Adds lock/unlock logic; user didn't ask for a progression gate |
| Separate stat profiles (Hulk is slower but tankier) | Too much rebalancing work for a cosmetic request |

---

---

## Session 6 — Hero Powers, Lives System, Cop Nerf

---

### Less Cops, More Ground Zombies, 3-Lives System, Cop Damage Nerf, Hero Powers, Character Info Panel

**What was asked:** "Can you put less cops, more zombies at the bottom of the map, and have it so even if you have checkpoints, you lose the game if you die three times. Can you also have it where the cops do barely any damage and are in a more unorganized position. Lastly, can you give the superheros different powers. For example thor can fly, and can you give info on them in the main menu."

**What was built**

Six independent changes across four files:

1. **Fewer cops, unorganized positions** — reduced from 10 to 6 cops at positions [640, 1580, 1920, 3800, 5500, 6750]. Two are close together near the start (640, 1580) and two slightly clustered at the end, with a large mid-map gap. This gives an irregular feel vs. every-800px even spacing.

2. **More ground zombies** — 8 new zombies at y=430 (street level) added across mid and late sectors, slotted into the gaps between existing skeletons. They use the `zombie` texture and have `copHealth = 3`.

3. **3-lives system** — `this.lives = 3` in `create()`. `_playerDied()` decrements lives and fires `livesUpdate` event before deciding to respawn or show GAME OVER. Checkpoints are unchanged — they still save respawn position, but they no longer guarantee survival past 3 deaths. UIScene renders 3 heart icons (♥) in red/grey.

4. **copHealth (cop damage nerf)** — every enemy created (including sky zombies) gets `copHealth = 3`. The cop bullet overlap decrements it and only destroys the enemy when it hits zero (15 pts). Player weapons (`missiles`, `repulsors`, `unibeams`, cap shield) still use `enemy.destroy()` directly — one-shot, unchanged.

5. **Per-character CHAR_STATS + abilities** — a lookup table in `create()` maps each character texture key to `{ speed, jump, hp, invWindow, ability }`. The `ability` string routes behavior throughout `update()`, `_fireWeapon()`, and a new `_useSpecialAbility()` method:
   - **Iron Man** (`arsenal`): default path, all 4 weapons.
   - **Cap. America** (`shield`): weapon 1 routes to `_throwCapShield()` — a physics sprite with `setBounce(1)` and `setCollideWorldBounds(true)`. Bounce counter destroys at 4. Enemy overlap destroys enemy but NOT the shield (pass-through). Self-destructs after 4s as fallback.
   - **Thor** (`fly`): `player.body.setGravityY(-570)` while jump is held in air. Net gravity = ~40 (near-float). Reset to 0 otherwise so normal gravity applies when grounded.
   - **Hulk** (`smash`): `_peakFallVel` tracked each frame while `!onGround`. On landing (`onGround && !_wasOnGround`), if peak > 380, AOE destroy all enemies within 160px + camera shake. Velocity is already 0 by the time landing is detected, so tracking peak separately is necessary.
   - **Black Widow** (`swift`): `invWindow` in CHAR_STATS is 3500ms instead of 1500ms — the `_takeDamage()` method reads `this._invWindow` (not a hardcoded value), so this is the only change needed.
   - **Hawkeye** (`pierce`): weapon 1 routes to `_firePierceArrow()` — fires into `this.unibeams` group (which already has 3-hit pierce collision logic). Arrow texture used instead of unibeam_bolt.
   - **Spider-Man** (`doublejump`): tracks `_jumpHeld` (previous frame) for JustDown detection. When in air, `_jumpCount === 1`, and jump was just pressed: second jump at 85% force. `_jumpCount` prevents infinite jumping.
   - **Black Panther** (`dash`): E key triggers `_useSpecialAbility()` → `setVelocityX(±960)` in movement direction + 280ms invincibility. 1-second cooldown via `_abilityLastUsed` timestamp.
   - **Scarlet Witch** (`hex`): `time.addEvent` with `delay: 2500, loop: true` in `create()` calls `_fireHexBolt()`. Finds nearest enemy within 520px, fires a repulsor with `setTint(0xFF44FF)` (magenta) toward it. Reuses `this.repulsors` group — same collision logic with no extra setup.
   - **Doctor Strange** (`timestop`): E key → iterates enemies, caches `e._origSpeed = e.patrolSpeed`, sets `patrolSpeed` to 15% of original. `delayedCall(4000)` restores all speeds. 20-second cooldown. Flash effect at activation.

6. **Character info panel in CharacterScene** — a dark rectangle below the card grid shows the selected hero's name, ability name, stat line (HP / Speed / Jump), and a one-sentence ability description. Seeded on load with the saved character; updates on every card click.

**Why this way**

- **`copHealth` on the enemy object, not a Map** — keeps all enemy state on the sprite itself; works with Phaser's overlap callbacks which only receive the two overlapping objects.
- **Reusing `this.unibeams` for Hawkeye** — the pierce collision logic (decrement `pierceCount`, destroy only at 0) is already correct for arrows; no second group or duplicate collider needed.
- **Reusing `this.repulsors` for Scarlet Witch** — same reasoning; the repulsor collision (destroy on enemy hit, 1 enemy per shot) is exactly what hex bolts need. Visual distinction via `setTint`.
- **`_jumpHeld` for Spider-Man** — Phaser's `JustDown` helper doesn't work cleanly when you need to suppress the repeat-frame detection that normal jump uses (`isDown && onGround`). Manually tracking previous frame state handles it in one variable.
- **CHAR_STATS in `create()` not a global** — keeps it close to where it's used; no risk of other scenes accidentally reading or modifying it.
- **Lives display as hearts in UIScene, not a counter** — more visual and immediately readable than "Lives: 2"; consistent with the aesthetic of the game.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Cop bullets do zero damage | Still wanted them to eventually kill enemies — just slowly. 3 hits is a nerf, not a nullification. |
| Per-enemy copHealth in a separate Map | Object property is simpler and lives with the sprite until it's destroyed. |
| Separate projectile groups for each ability | Existing groups already have the right collision behavior; reusing avoids 3+ extra collider registrations. |
| Thor ability as a speed boost instead of flight | Flight is more iconic for Thor and technically more interesting (gravity manipulation). |
| Hulk smash detecting velocity at the moment of impact | Velocity is 0 by the time `update()` sees the landing frame — peak tracking is required. |
| Cap shield ricocheting off enemies | Cleaner feel to pass through and keep bouncing; enemies are destroyed on overlap, not reflected. |
| Info panel as a separate tooltip/popup | Inline panel is simpler and always visible — no hover/click to dismiss flow needed. |

---

### More Ground Zombies, Rename, Fireball Explosions

**What was asked:** "Can you add a lot more zombies at the bottom, rename the game to 'Apocalips Run', and add small explosions when fireballs hit the ground?"

**What was built**
- `groundZombieData` expanded from 8 to 24 entries, placing zombies at every gap between existing skeletons. Every ~250–350px of street now has at least one enemy.
- Title changed to `APOCALIPS RUN` in `MenuScene.js` and `<title>` in `index.html`. Font size nudged from 64px to 52px so the longer name fits on one line.
- `_explodeFireball(fb)` replaces the old `fb => fb.destroy()` inline. Creates a `Graphics` object at impact, draws 3 concentric circles (orange/yellow/white), then tweens `scale` to 2.4 and `alpha` to 0 over 340ms before destroying itself.

**Why this way**
- **Graphics tween for explosion** — no new texture needed, no particle emitter setup. A `Graphics` object created at the point of impact, tweened, and destroyed is 12 lines and zero assets. Particle emitters are more realistic but require a texture key and emitter config.
- **Tween scale+alpha together** — scaling up while fading out reads as an outward burst. Just fading would look like it vanishes; just scaling would look like it grows forever.
- **24 ground zombies instead of a spawn system** — pre-placed enemies stay in their patrol zones and don't pile up. A dynamic spawn system would cause clustering near the player and feel unfair.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Particle emitter for explosion | Requires texture + emitter config; tween on Graphics is simpler with same visual result |
| Explosion that damages the player | Fireballs already deal contact damage before landing — double punishment isn't fun |
| Dynamic zombie spawn at street level | Would cluster near player; fixed patrol zones are predictable and fairer |
| Keeping old name | User asked to rename it |

---

### Title Spelling Fix and More Skeletons

**What was asked:** "Can you spell the title correctly and add more skeletons"

**What was built**
"Apocalips" corrected to "Apocalypse" in `MenuScene.js` and `index.html`. `enemyData` in `_createEnemies()` expanded from 18 to 35 skeletons by inserting one new entry between every existing pair — filling every ~300–600px gap on the street. Each new skeleton has its own `patrolMin`/`patrolMax` range that doesn't overlap with adjacent skeletons.

**Why this way**
Same fixed patrol zone approach as existing skeletons — predictable, fair, and no extra state needed. Filling gaps rather than clustering gives even street coverage across all sectors.

---

### Thor 2 Lives + Screen Ceiling

**What was asked:** "Can thor only have two lives and not be able to jump higher than the screen. Can the other characters also not be able to jump that high"

**What was built**
Added `lives: 2` to Thor's entry in `CHAR_STATS`. Changed `this.lives = 3` to `this.lives = cs.lives || 3` — other characters default to 3 since their entries have no `lives` field. Added a ceiling clamp in `update()`: if `player.y < 4`, snap Y to 4 and zero upward velocity. This applies to every character.

**Why this way**
- **`lives` in CHAR_STATS, not a separate if-check** — keeps all per-character data in one place. Adding a second character with different lives in the future is just adding a field.
- **Ceiling clamp in update, not via world bounds** — `setCollideWorldBounds(true)` would also block the bottom edge, preventing the fall-off-screen death trigger at y > 520. Manual Y clamp handles only the top.
- **y < 4 not y < 0** — gives a 4px buffer so the player sprite doesn't clip into the very top edge before the velocity is zeroed.

---

### Scary Main Menu

**What was asked:** "Can you make the main menu look scary like the actual game"

**What was built**
Three-layer procedural city backdrop (far silhouettes → mid buildings with orange windows → near buildings). Animated `Graphics` objects with `fillTriangle` draw flames on every near rooftop; each is tweened to flicker (`scaleY` + `scaleX` + `alpha`) on a random interval. 20 ember particles (`fillRect` 1–3px) are spawned with staggered `delayedCall` delays and tween upward with drift, calling themselves recursively on `onComplete` to loop indefinitely. Title layered three times (dark shadow, mid shadow, bright orange) to simulate a fire glow, then alpha-pulsed via tween. Buttons kept in the same positions for usability but restyled with dark red backgrounds and fire-colored labels.

**Why this way**
- **No new textures** — everything drawn procedurally, consistent with the zero-asset philosophy.
- **Recursive `onComplete` instead of `repeat: -1`** for embers — allows repositioning each ember at a new random x before it starts again, which `repeat` alone can't do cleanly.
- **Layered text for glow** — Phaser Text has no built-in glow shader; stacking 3 slightly offset text objects (dark, mid, bright) achieves the same visual at zero cost.
- **Same button positions** — muscle memory from previous playthroughs is preserved; only the colors changed.

---

### More Sky Objects, Details, Weapon Bar Iron Man Only

**What was asked:** "Can you put more objects in the sky, more details, and can you get rid of the weapons arsenal bar for every character except iron man"

**What was built**
Three new sky systems + doubled existing spawn rates + UIScene conditional rendering.

- **Helicopters**: New `helicopter` texture (72×30) in BootScene. Spawns via `_spawnHelicopter()` every 9s. Moves at 180px/s — slower than planes (340) but faster than balloons (65). Visual only; no damage.
- **Bird flocks**: `_spawnBirdFlock()` creates 4–8 `Graphics` objects, each drawing a V-stroke (`lineTo`). Tweened across the sky and destroyed on complete. No texture, no physics group needed.
- **Smoke clouds**: `_spawnSmokeCloud()` creates a multi-circle `Graphics` (4 overlapping fillCircle calls) that drifts across and fades out over 18–28 seconds. Adds atmospheric depth at no physics cost.
- **Spawn rate doubles**: Planes 11s→5.5s, balloons 17s→8s. Both have a chance to spawn in pairs.
- **Weapon bar gated on `arsenal`**: UIScene reads `this.gameScene._charAbility` in `create()`. Only if `'arsenal'`: build the inventory panel, create the weapon label, wire the weapon events, seed the initial weapon state. Other characters get a clean HUD with no weapon clutter.

**Why this way**
- **Graphics objects for birds and clouds** — no texture needed; both are simple enough to draw inline. Creating textures for them would be unnecessary overhead.
- **Recursive `onComplete` for birds** — they're one-shot, not looping, so `repeat: -1` isn't appropriate. They cross the screen once and destroy themselves.
- **Checking `_charAbility` not `charKey`** — if a new character with full arsenal was ever added, it would automatically get the bar; checking the key string would need manual updating.

---

### Character Select Moved Into Play Flow

**What was asked:** "Can you move the character selection menu so you can select the character after you press play"

**What was built**
PLAY → CharacterScene → GameScene. CharacterScene now has two bottom buttons: "< BACK" (left, → MenuScene) and "START GAME >" (right, → GameScene). The CHARACTERS button was removed from the main menu — it's now redundant since character selection is always on the path to playing.

**Why this way**
- **CharacterScene as the gate** — the most natural place to confirm your hero before the run starts. Selecting a character and immediately pressing START GAME is a single focused action.
- **Removing CHARACTERS from menu** — keeping it would create two paths to the same screen with different purposes (browse vs. play), which is confusing. Three menu items (PLAY, ITEM SHOP, PREMIUM SHOP) is cleaner than four.
- **Two-button layout** — BACK on the left and START on the right follows standard UI convention (cancel left, confirm right).

---

## Technology Stack

| Layer | Technology | Why chosen |
|-------|-----------|-----------|
| Game engine | Phaser.js 3 (CDN) | Mature, well-documented, browser-native, free; no install |
| Language | Vanilla JS (ES6) | No build step; open a file, edit it, reload the browser |
| Physics | Phaser Arcade Physics | Built-in; fast AABB collisions; sufficient for a 2D platformer |
| Graphics | Phaser Graphics API (procedural) | Zero external art files; every pixel is editable code |
| Persistence | localStorage | Synchronous; visible in DevTools; zero infrastructure |
| Dev server | Python `http.server` | Built-in on most machines; no npm required |
| Version control | Git + auto-commit stop hook | History stays clean automatically after every Claude response |

---

## Open Questions / Future Decisions

These are known compromises worth revisiting. Each row is a deliberate "good enough for now" that has a better long-term answer.

| Area | Current approach | Better long-term approach |
|------|-----------------|--------------------------|
| **Graphics** | Procedural Phaser Graphics (shapes + rectangles) | Real sprite sheets (PNG / texture atlas) |
| **Level design** | Hardcoded platform arrays in JavaScript | Tiled editor JSON tilemaps loaded by Phaser |
| **Animations** | Single static texture per character | Sprite atlas + Phaser animation frame sequences |
| **Audio** | None | Phaser Audio with Web Audio API; sound effects + music |
| **Payment** | UI mockup only | Stripe or similar with server-side validation |
| **Save data** | Plaintext localStorage (editable in DevTools) | Server-side saves, or signed/encrypted localStorage |
| **Mobile controls** | Tap to shoot only | On-screen virtual joystick + fire buttons |
| **Enemy AI** | Simple patrol + shoot at fixed interval | Behaviour trees or FSM for reactive, smarter enemies |
| **Premium items** | `zapnhop_premium` key reserved but never written | Written server-side after successful payment verification |
| **Item economy balance** | No cap on stars/dots; prices fixed forever | Soft cap, or prices that scale with purchase history |
| **Checkpoint spawn y** | Hardcoded y = 400 for all checkpoints | Nearest safe ground y calculated per checkpoint |
