# Zap-N-Hop — Feature Requests Log

Every feature ask is recorded here in the order it was made, across all sessions.
Each entry links to [09-design-decisions.md](09-design-decisions.md) for the full reasoning behind the implementation.

---

## How to Read This

- Entries are numbered in the order they were asked — never renumbered
- "Session" labels mark which conversation the request came from
- "Files changed" is a quick pointer for finding the relevant code
- When a request is later revised, a follow-up entry is added (not the original edited)

---

---

## Earlier Sessions

---

### #1 — Skeleton Enemies That Shoot Arrows

**Asked:** "Can you change the red dots to skellatans that shoot arrows?"
**Status:** ✓ Done
**What was built:** Enemy texture redrawn as a 32×48 skeleton (skull, ribcage, limbs). Each skeleton patrols a defined min/max range. A looping timer calls `_skeletonShoot()` every ~2 seconds, firing a horizontal arrow toward the player.
**Files changed:** `src/scenes/BootScene.js`, `src/scenes/GameScene.js` (`_createEnemies`, `_skeletonShoot`)
**Design note:** → [Earlier Sessions — Skeleton Enemies](09-design-decisions.md)

---

### #2 — Safe Start Zone, Placement Fixes, Fireballs from the Sky

**Asked:** "First off theres a skellatan at the end, secondly, you should make the start spot safe. Thirdly, you should put fireballs raining from the sky."
**Status:** ✓ Done
**What was built:** First skeleton moved to x=450 (player spawns at x=64). Last skeleton's patrol capped before the end flag. Fireball spawner added — every 1800ms a fireball drops from a random x within the camera view, falls with gravity, and damages the player or destroys on platform hit.
**Files changed:** `src/scenes/GameScene.js` (`enemyData`, `_spawnFireball`)
**Design note:** → [Earlier Sessions — Safe Start + Fireballs](09-design-decisions.md)

---

### #3 — City-on-Fire Parallax Background

**Asked:** "Can you make the background a city on fire?"
**Status:** ✓ Done
**What was built:** Four-layer parallax background drawn entirely in code. Fixed sky gradient (scroll factor 0), far building silhouettes (0.2), mid buildings with window glow (0.5), near buildings with fire pits and flames (0.8). Layer widths calculated to never run out at maximum camera scroll.
**Files changed:** `src/scenes/GameScene.js` (`_createBackground`)
**Design note:** → [Earlier Sessions — Parallax Background](09-design-decisions.md)

---

### #4 — Sky Zombies, Iron Man Character, Missile Shooting

**Asked:** "Can you make a few zombies sometimes rain from the sky, and can you change the character apearance to Iron Man, and can you make him shoot missiles if the screen is tapped?"
**Status:** ✓ Done
**What was built:** Sky zombie spawner fires every 6 seconds; zombies fall with gravity, patrol ±120px on landing. Player texture redrawn as Iron Man (red/gold, arc reactor, repulsor hands). `pointerdown` event fires missiles toward the click/tap position.
**Files changed:** `src/scenes/BootScene.js`, `src/scenes/GameScene.js` (`_spawnSkyZombie`, input setup)
**Design note:** → [Earlier Sessions — Sky Zombies + Iron Man + Missiles](09-design-decisions.md)

---

### #5 — Advanced Weapon Inventory and Extended Level

**Asked:** "Can you make iron man have an advanced inventory, can you also add a lot more layers, make stuff more realistic, and extend the level by a TON"
**Status:** ✓ Done
**What was built:** Four-weapon inventory (Missile, Repulsor 3-way, Unibeam piercing beam, Smartbomb AOE), switched with keys 1–4. World expanded to 8000×500px across 5 sectors. 18 ground skeletons, 41 elevated platform tiles, 30 coins, 16 stars.
**Files changed:** `src/scenes/GameScene.js` (inventory system, `_buildLevel`, all fire methods), `src/scenes/UIScene.js` (inventory bar)
**Design note:** → [Earlier Sessions — Advanced Inventory + Extended Level](09-design-decisions.md)

---

---

## Current Session

---

### #6 — Platform Zombies

**Asked:** "Can you add platforms, add zombies on random platforms..."
**Status:** ✓ Done
**What was built:** 10 zombies placed on elevated platforms at scene creation (2 per sector). Each patrols within its platform's width. Patrol speed increases per sector (55 → 75 px/s). No shoot timer — platform zombies are purely melee threats.
**Files changed:** `src/scenes/GameScene.js` (`_createEnemies`)
**Design note:** → [Session 1 — Platform Zombies](09-design-decisions.md)
**Note on "add platforms":** Platforms already existed (41 tiles across 5 sectors). The request was interpreted as making platforms more meaningful, achieved via zombie placement.

---

### #7 — Health Bar

**Asked:** "...have a health bar..."
**Status:** ✓ Done
**What was built:** 165px wide bar in the top-right HUD. Starts green, turns orange below 60 HP, turns red below 30 HP. Shows exact HP as "75/100" text inside the bar. Updates via a `healthUpdate` event.
**Files changed:** `src/scenes/UIScene.js`, `src/scenes/GameScene.js` (`_takeDamage`, `_heal`)
**Design note:** → [Session 1 — Health System](09-design-decisions.md)

---

### #8 — One Life with Checkpoint Respawning

**Asked:** "...only one life..."
**Status:** ✓ Done
**What was built:** The 3-lives system removed entirely. HP hits zero → player respawns at the last activated checkpoint with full HP restored and 1.5s invincibility. Default respawn is the start of the level if no checkpoint has been touched.
**Files changed:** `src/scenes/GameScene.js` (`_playerDied`, `create`)
**Design note:** → [Session 1 — Health System](09-design-decisions.md)

---

### #9 — Enemies Deal Partial Damage (No One-Shots)

**Asked:** "...where enemies can't one-shot you..."
**Status:** ✓ Done
**What was built:** All damage values capped below 100 HP: arrow = 20 HP, fireball = 25 HP, enemy body contact = 30 HP. The worst single hit leaves the player at 70 HP.
**Files changed:** `src/scenes/GameScene.js` (`_setupCollisions`)
**Design note:** → [Session 1 — Health System](09-design-decisions.md)

---

### #10 — Health Regen Pickups

**Asked:** "...put in a few health regen areas..."
**Status:** ✓ Done
**What was built:** 4 green glowing orb pickups at ground level (x ≈ 900, 2700, 5000, 7050). Each restores +35 HP on collection and disappears. A brief green camera flash confirms the pickup.
**Files changed:** `src/scenes/BootScene.js` (new `healthregen` texture), `src/scenes/GameScene.js` (`_buildLevel`, `_setupCollisions`, `_heal`)
**Design note:** → [Session 1 — Health Regen](09-design-decisions.md)

---

### #11 — Checkpoints

**Asked:** "...multiple checkpoints..."
**Status:** ✓ Done
**What was built:** 4 flag pole objects at each sector boundary (x ≈ 1720, 3450, 5460, 6980). Inactive flags are grey. Touching one turns it gold, fires a gold camera flash, and saves the respawn position. On death, player teleports to the last gold flag with full HP.
**Files changed:** `src/scenes/BootScene.js` (new `checkpoint`/`checkpoint_active` textures), `src/scenes/GameScene.js` (`_buildLevel`, `_setupCollisions`, `_playerDied`)
**Design note:** → [Session 1 — Checkpoints](09-design-decisions.md)

---

### #12 — Item Shop with Stars and Dots Currency

**Asked:** "Add a special item shop in the menu that players can use to buy items with stars and dots."
**Status:** ✓ Done
**What was built:** New `ShopScene`. Stars earned from star pickups, Dots from coin pickups — both persisted to localStorage. Five items:

| Item | Effect | Cost |
|------|--------|------|
| Health Upgrade | +25 Max HP for one run | 10 Dots |
| Speed Boost | Move 20% faster for one run | 15 Dots |
| Unibeam+ | +5 Unibeam ammo for one run | 5 Stars |
| Extra S-Bomb | +1 Smartbomb charge for one run | 8 Stars |
| Iron Shield | 3s starting invincibility for one run | 12 Stars |

**Files changed:** `src/scenes/ShopScene.js` (new), `src/scenes/GameScene.js`, `src/scenes/MenuScene.js`, `src/main.js`, `index.html`
**Design note:** → [Session 2 — Item Shop + Currency](09-design-decisions.md)

---

### #13 — Stars and Dots Visible

**Asked:** "Can you also make the stars and dots visible."
**Status:** ✓ Done
**What was built:** `★ X` and `● X` counters added below the HP bar in the in-game HUD. Update live as pickups are collected. Menu also shows wallet balance in a panel below the title, read from localStorage on each visit.
**Files changed:** `src/scenes/UIScene.js`, `src/scenes/MenuScene.js`
**Design note:** → [Session 2 — Currency Visibility](09-design-decisions.md)

---

### #14 — Premium Shop (Real Money)

**Asked:** "...make a money shop in the menu where you can buy custom items with real money."
**Status:** ✓ Done (UI mockup — no payment backend)
**What was built:** `PremiumShopScene` with five items and dollar price tags. Clicking BUY opens a modal explaining payment isn't configured yet. Distinct purple/gold visual identity. Separate `zapnhop_premium` localStorage key reserved for future integration.
**Files changed:** `src/scenes/PremiumShopScene.js` (new), `src/scenes/MenuScene.js`, `src/main.js`, `index.html`
**Design note:** → [Session 2 — Premium Shop](09-design-decisions.md)

---

### #15 — Exits on All Shops

**Asked:** "Also make exits on all the shops."
**Status:** ✓ Done
**What was built:** EXIT button bottom-right in both shops returns to `MenuScene`. Purchase modal in premium shop has its own CLOSE button.
**Files changed:** `src/scenes/ShopScene.js`, `src/scenes/PremiumShopScene.js`
**Design note:** → [Session 2 — Shop Exits](09-design-decisions.md)

---

### #16 — Items Consumable (Not Permanent)

**Asked:** "Can you make the items not permanent."
**Status:** ✓ Done
**What was built:** `zapnhop_owned` changed from an array of IDs to a count object (`{ speed_boost: 2 }`). Buying increments the count. At game start, effects are applied then all counts are decremented by 1 and saved. BUY button always shows; rows display `x2 ready` badge when stocked.
**Files changed:** `src/scenes/ShopScene.js`, `src/scenes/GameScene.js`
**Design note:** → [Session 3 — Consumable Items](09-design-decisions.md)

---

### #17 — Design Decisions Living Document

**Asked:** "i want you to save all my feature asks so far and the design choices you made to implement it in a .md file under docs... why you implemented a feature in a certain way and what other options did you consider and rule out in the process is helpful to retroactively look into all the choices and decide if a better technology or framework choice might work better"
**Status:** ✓ Done
**What was built:** `docs/09-design-decisions.md` — organises every feature by session with four sections each: what was asked, what was built, why this approach, and alternatives considered.
**Files changed:** `docs/09-design-decisions.md` (new)
**Design note:** → [Session 4 — Documentation](09-design-decisions.md)

---

### #18 — Numbered Feature Request Log

**Asked:** "i also want all my ideas i asked saved in a numbered order and correspond to each feature enhancement"
**Status:** ✓ Done
**What was built:** This file (`docs/10-feature-requests.md`) — every request numbered in chronological order with status, what was built, files changed, and a link to the design reasoning.
**Files changed:** `docs/10-feature-requests.md` (new)

---

### #19 — Merge Feature Log and Set Up Auto-Maintenance

**Asked:** "can you merge all the previous feature asks in feature-enhancements.md into these two files? i also want these regularly maintained after every iteration — how would we do that? do we add it to the commit rule?"
**Status:** ✓ Done
**What was built:** Content from `docs/feature-enhancements.md` merged into this file and into `09-design-decisions.md`. Old file deleted. `CLAUDE.md` created with a standing rule that docs must be updated as part of every feature implementation — before the auto-commit fires.
**Files changed:** `docs/09-design-decisions.md`, `docs/10-feature-requests.md`, `CLAUDE.md` (new), `docs/feature-enhancements.md` (deleted)
**Design note:** → [Session 4 — Documentation](09-design-decisions.md)

---

## How to Update This File

When a new feature is added:

1. Add a new `## Request #N` section at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `09-design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
