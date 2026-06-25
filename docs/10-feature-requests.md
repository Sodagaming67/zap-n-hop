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

### #20 — More Fireballs and Sky Zombies

**Asked:** "Can you add a bit more fire balls and zombies"
**Status:** ✓ Done
**What was built:** Fireball spawn interval reduced from 1500ms to 900ms. 35% chance each spawn drops 2 fireballs at once. Sky zombie spawn interval reduced from 6000ms to 3500ms. 30% chance each spawn drops 2 sky zombies at once (staggered 80px apart). 10 additional platform zombies added across all 5 sectors, filling previously empty elevated platforms (total 20 platform zombies).
**Files changed:** `src/scenes/GameScene.js` (`_spawnFireball`, `_spawnSkyZombie`, `_createEnemies`, timer delays in `create`)
**Design note:** → [Session 5 — More Fireballs and Zombies](09-design-decisions.md)

---

### #22 — Cops, Planes, Hot Air Balloons, and Debris

**Asked:** "Can you add cops on the street shooting enemies, and planes, hot air baloons and debret on fire in the sky occasionally smashing to the ground?"
**Status:** ✓ Done
**What was built:**
- **Cops**: 10 police NPCs placed at ground level across the level (x≈550 to x≈7550). Each scans for the nearest enemy within 450px every ~2.6 seconds and fires a yellow cop bullet at it. Cop bullets destroy enemies on contact. Cops are invulnerable and friendly to the player.
- **Planes**: spawn every 11 seconds, fly across the sky (y=45–95) at 340px/s left or right, and auto-despawn when off-camera.
- **Hot air balloons**: spawn every 17 seconds, drift across the sky (y=20–75) at 65px/s, and auto-despawn when off-camera.
- **Debris on fire**: spawn every 2.8 seconds near the player, fall with spin and slight horizontal drift. On hitting a platform they shake the camera, destroy enemies within 90px, and disappear. Direct hit on the player deals 30 HP damage.

**Files changed:** `src/scenes/BootScene.js` (5 new textures), `src/scenes/GameScene.js` (`_createCops`, `_copShoot`, `_spawnPlane`, `_spawnBalloon`, `_spawnDebris`, new groups/timers/collisions/cleanup)
**Design note:** → [Session 5 — Cops, Planes, Balloons, Debris](09-design-decisions.md)

---

### #21 — Avengers Character Select Menu

**Asked:** "can you add a character menu with all the Avengers"
**Status:** ✓ Done
**What was built:** New `CharacterScene` with a 5×2 grid of 10 Avengers heroes. Each hero is a procedurally drawn 32×48 texture. Clicking a card highlights it gold and saves the choice to localStorage. The selected character loads automatically when you start a run. A "CHARACTERS" button added to the main menu.

| Hero | Key Feature |
|------|------------|
| Iron Man | red/gold, arc reactor (existing) |
| Captain America | blue suit, white star, red stripe |
| Thor | dark blue armor, silver wings, gold belt, Mjolnir |
| Hulk | green body, purple pants, angry red eyes |
| Black Widow | black suit, red hourglass belt detail |
| Hawkeye | purple suit, dark mask, bow on back |
| Spider-Man | red/blue split, white web eyes |
| Black Panther | near-black suit, purple claw marks |
| Scarlet Witch | deep red, magenta crown, glowing hands |
| Doctor Strange | blue suit, red cloak, green Eye of Agamotto |

**Files changed:** `src/scenes/CharacterScene.js` (new), `src/scenes/BootScene.js` (9 new textures), `src/scenes/MenuScene.js` (button added), `src/scenes/GameScene.js` (load selected character), `src/main.js`, `index.html`
**Design note:** → [Session 5 — Avengers Character Select](09-design-decisions.md)

---

### #23 — Less Cops, More Zombies, 3-Lives System, Cop Damage Nerf, Hero Powers, Character Info Panel

**Asked:** "Can you put less cops, more zombies at the bottom of the map, and have it so even if you have checkpoints, you lose the game if you die three times. Can you also have it where the cops do barely any damage and are in a more unorganized position. Lastly, can you give the superheros different powers. For example thor can fly, and can you give info on them in the main menu."
**Status:** ✓ Done
**What was built:**

- **Fewer cops, irregular positions**: Reduced from 10 to 6 cops. New positions: [640, 1580, 1920, 3800, 5500, 6750] — two clustered near the start, a gap in the mid-game, then two spread at the end. Feels unorganized instead of evenly distributed.
- **More ground zombies**: Added 8 new zombie enemies at street level (y=430) at x=625, 1650, 2280, 4450, 5380, 5950, 6440, 6930 — filling gaps between existing skeletons.
- **3-lives system**: Player now has 3 lives (`this.lives`). Dying (fall off or HP=0) decrements lives. Checkpoints still save respawn position, but at 0 lives the game stops and shows GAME OVER. UIScene shows 3 hearts (♥) — red when alive, grey when lost.
- **Cops barely damage enemies** (`copHealth`): Every enemy spawned gets `copHealth = 3`. Cop bullets decrement it; only kill and award 15pts when `copHealth <= 0`. Player weapons still one-shot (unchanged).
- **Hero-specific powers** (per-character `CHAR_STATS` + `_charAbility` routing):

| Hero | Stat highlights | Ability |
|------|----------------|---------|
| Iron Man | HP 100, Speed 220 | Full Arsenal (all 4 weapons, default) |
| Cap. America | HP 115, Speed 230 | Shield Throw — weapon 1 launches bouncing cap_shield (4 bounces, passes through enemies) |
| Thor | HP 120 | Flight — hold jump in air for near-zero gravity hover |
| Hulk | HP 150, Jump 730 | Ground Smash — hard landing AOE blast (160px radius) + camera shake |
| Black Widow | Speed 290, invWindow 3500ms | Swift Recovery — 3.5s invincibility after taking damage |
| Hawkeye | – | Pierce Shot — weapon 1 fires an arrow through 3 enemies |
| Spider-Man | Jump 640 | Double Jump — press jump a second time mid-air |
| Black Panther | Speed 305 | Vibranium Dash — press E to dash with brief i-frames |
| Scarlet Witch | – | Auto Hex — fires magenta bolt at nearest enemy every 2.5s |
| Doctor Strange | – | Time Stop — press E to slow all enemies to 20% speed for 4s (20s cooldown) |

- **Character info panel**: Clicking a character in CharacterScene now shows their stats (HP, Speed, Jump) and ability description in a panel below the card grid.

**Files changed:** `src/scenes/GameScene.js` (full rewrite — CHAR_STATS, lives, copHealth, new zombies, fewer cops, all abilities, new methods), `src/scenes/UIScene.js` (3 hearts lives display), `src/scenes/CharacterScene.js` (info panel), `src/scenes/BootScene.js` (cap_shield texture, added in prior response)
**Design note:** → [Session 6 — Hero Powers, Lives System, Cop Nerf](09-design-decisions.md)

---

### #24 — More Ground Zombies, Rename to "Apocalips Run", Fireball Explosions

**Asked:** "Can you add a lot more zombies at the bottom, rename the game to 'Apocalips Run', and add small explosions when fireballs hit the ground?"
**Status:** ✓ Done
**What was built:**
- **More ground zombies**: Ground zombie count increased from 8 to 24 — filling every gap between existing skeletons across the full 8000px map. The street is now continuously packed.
- **Rename**: Game title changed to "APOCALIPS RUN" in the main menu and browser tab.
- **Fireball explosions**: Fireballs no longer silently disappear on platform hit. `_explodeFireball()` creates a concentric-circle Graphics object (orange outer, yellow mid, white core) at the impact point and tweens it to 2.4× scale + alpha 0 over 340ms.

**Files changed:** `src/scenes/GameScene.js` (`groundZombieData` expanded, `_explodeFireball` method added, fireball collider updated), `src/scenes/MenuScene.js` (title text), `index.html` (title tag)
**Design note:** → [Session 6 — More Zombies, Rename, Fireball Explosions](09-design-decisions.md)

---

### #25 — Title Spelling Fix and More Skeletons

**Asked:** "Can you spell the title correctly and add more skeletons"
**Status:** ✓ Done
**What was built:** Title corrected to "APOCALYPSE RUN" in the menu and browser tab. Skeleton count increased from 18 to 35 — added 17 new skeletons filling every gap between existing ones, so the street has near-continuous skeleton coverage across the full 8000px map.
**Files changed:** `src/scenes/GameScene.js` (`enemyData`), `src/scenes/MenuScene.js`, `index.html`
**Design note:** → [Session 6 — Title Fix and More Skeletons](09-design-decisions.md)

---

### #26 — Thor Gets 2 Lives, Screen Ceiling for All Characters

**Asked:** "Can thor only have two lives and not be able to jump higher than the screen. Can the other characters also not be able to jump that high"
**Status:** ✓ Done
**What was built:** Added `lives: 2` to Thor's CHAR_STATS entry; `this.lives` now reads from the stat instead of being hardcoded to 3. Added a ceiling clamp in `update()` — if the player's Y goes above 4px, position is reset to 4 and upward velocity zeroed. Applies to every character.
**Files changed:** `src/scenes/GameScene.js` (CHAR_STATS, lives assignment, update ceiling clamp)
**Design note:** → [Session 6 — Thor Lives + Screen Ceiling](09-design-decisions.md)

---

### #27 — Scary Main Menu Matching Game Aesthetic

**Asked:** "Can you make the main menu look scary like the actual game"
**Status:** ✓ Done
**What was built:** Full `MenuScene` visual overhaul. Background is now a three-layer burning city (far silhouettes, mid buildings with glowing orange windows, near buildings with bright orange windows). Animated fire triangles flicker on every near-building rooftop using tweens. 20 floating ember particles drift upward and loop. Title changed from gold to fire-red with a layered shadow for a glow effect and a slow alpha pulse. Buttons restyled to dark red/fire color palette. Currency panel and instructions match the dark aesthetic.
**Files changed:** `src/scenes/MenuScene.js` (full rewrite)
**Design note:** → [Session 6 — Scary Menu](09-design-decisions.md)

---

### #28 — More Sky Objects, More Details, Weapon Bar Iron Man Only

**Asked:** "Can you put more objects in the sky, more details, and can you get rid of the weapons arsenal bar for every character except iron man"
**Status:** ✓ Done
**What was built:**
- **More sky objects**: Added helicopters (new `helicopter` texture, spawn every 9s, fly slower than planes), bird flocks (4–8 stroke-based V shapes per flock, every 13s, pure graphics no texture), dark smoke clouds (rolling multi-circle graphics that drift and fade, every 19s). Planes now spawn every 5.5s (was 11s) and 25% chance of a pair. Balloons every 8s (was 17s) with 30% chance of a pair.
- **More detail**: Smoke clouds rolling through the sky add atmospheric depth. Helicopter adds a mid-speed object between fast planes and slow balloons.
- **Weapon bar hidden for non-Iron Man**: UIScene checks `_charAbility === 'arsenal'` — only builds the inventory bar and weapon label if true. All other heroes get a clean HUD without the weapon slots.

**Files changed:** `src/scenes/BootScene.js` (helicopter texture), `src/scenes/GameScene.js` (new group, timer changes, 3 new spawner methods, OOB cleanup), `src/scenes/UIScene.js` (conditional inventory bar)
**Design note:** → [Session 6 — Sky Objects + Weapon Bar](09-design-decisions.md)

---

### #29 — Character Select After Press Play

**Asked:** "Can you move the character selection menu so you can select the character after you press play"
**Status:** ✓ Done
**What was built:** PLAY in the main menu now launches CharacterScene instead of GameScene. CharacterScene gained a "START GAME >" button (right side) and a "< BACK" button (left side) replacing the single centred back button. The redundant CHARACTERS button was removed from the main menu; remaining buttons (ITEM SHOP, PREMIUM SHOP) shifted to fill the space.
**Files changed:** `src/scenes/MenuScene.js`, `src/scenes/CharacterScene.js`
**Design note:** → [Session 6 — Play Flow](09-design-decisions.md)

---

### #30 — Hulk Smash Radius Reduced

**Asked:** "Can you slightly lower the hulks stomp radius"
**Status:** ✓ Done
**What was built:** Ground smash AOE radius reduced from 160px to 110px.
**Files changed:** `src/scenes/GameScene.js` (Hulk smash overlap check)

---

### #31 — Lava Pools at Ground Level

**Asked:** "Can you add lavapools at the bottom of the map"
**Status:** ✓ Done
**What was built:** 15 lava pool sprites placed across the street (y=459) at irregular intervals spanning the full 8000px map. Each pool pulses between 78% and 100% alpha on a staggered cycle. Walking through one deals 20 HP damage and triggers the normal invincibility window (so you take one hit every ~1.5 seconds while standing in lava, not every frame). Pools are slightly different widths (scale 0.9–1.3) for visual variety.
**Files changed:** `src/scenes/BootScene.js` (lavapool texture), `src/scenes/GameScene.js` (`_buildLevel` lava group + tweens, `_setupCollisions` overlap)
**Design note:** → [Session 6 — Lava Pools](09-design-decisions.md)

---

## How to Update This File

When a new feature is added:

1. Add a new `## Request #N` section at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `09-design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
