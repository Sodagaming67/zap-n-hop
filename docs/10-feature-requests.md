# Zap-N-Hop — Feature Requests Log

Every feature ask is recorded here in the order it was made.
Each entry links to the relevant section in [09-design-decisions.md](09-design-decisions.md) for the full reasoning.

---

## Request #1 — Platforms

**Asked:** Add platforms to the game.
**Status:** ✓ Done
**What was built:** Platforms already existed in the original codebase (41 platform tiles across 5 sectors). This request was interpreted as making platforms a more meaningful part of gameplay — achieved through Request #2 (placing enemies on them).
**Design note:** → [Session 1 — Platform Zombies](09-design-decisions.md)

---

## Request #2 — Zombies on Random Platforms

**Asked:** Add zombies on random platforms.
**Status:** ✓ Done
**What was built:** 10 zombies placed on elevated platforms at creation time (2 per sector). Each zombie patrols only within the width of its platform. Patrol speed increases per sector (55 → 75 px/s). They use the existing zombie sprite and join the shared `enemies` group.
**Files changed:** `src/scenes/GameScene.js` (`_createEnemies`)
**Design note:** → [Session 1 — Platform Zombies](09-design-decisions.md)

---

## Request #3 — Health Bar

**Asked:** Have a health bar.
**Status:** ✓ Done
**What was built:** A 165px wide bar in the top-right of the HUD. Starts green, turns orange below 60%, turns red below 30%. Shows exact HP as "75/100" text inside the bar. Updates via a `healthUpdate` event emitted by GameScene.
**Files changed:** `src/scenes/UIScene.js`, `src/scenes/GameScene.js` (`_takeDamage`, `_heal`)
**Design note:** → [Session 1 — Health Bar / One Life](09-design-decisions.md)

---

## Request #4 — Only One Life

**Asked:** Only one life.
**Status:** ✓ Done
**What was built:** The 3-lives system was removed. There is no lives counter. Death (HP = 0) respawns the player at the last activated checkpoint with full HP. The start of the level acts as the default respawn point if no checkpoint has been touched.
**Files changed:** `src/scenes/GameScene.js` (`_playerDied`), `src/scenes/UIScene.js`
**Design note:** → [Session 1 — Health Bar / One Life](09-design-decisions.md)

---

## Request #5 — Enemies Can't One-Shot

**Asked:** Enemies can't one-shot you.
**Status:** ✓ Done
**What was built:** All enemy damage was capped below 100 HP. Arrow = 20 HP, fireball = 25 HP, enemy body contact = 30 HP. The highest single hit leaves the player with 70 HP remaining.
**Files changed:** `src/scenes/GameScene.js` (`_setupCollisions`)
**Design note:** → [Session 1 — Health Bar / One Life](09-design-decisions.md)

---

## Request #6 — Health Regen Areas

**Asked:** Put in a few health regen areas.
**Status:** ✓ Done
**What was built:** 4 green glowing orb pickups placed at ground level, roughly one per sector (x ≈ 900, 2700, 5000, 7050). Each restores +35 HP on collection and disappears. A brief green camera flash confirms the pickup.
**Files changed:** `src/scenes/BootScene.js` (new `healthregen` texture), `src/scenes/GameScene.js` (`_buildLevel`, `_setupCollisions`, `_heal`)
**Design note:** → [Session 1 — Health Regen Areas](09-design-decisions.md)

---

## Request #7 — Multiple Checkpoints

**Asked:** Multiple checkpoints.
**Status:** ✓ Done
**What was built:** 4 flag pole objects placed at each sector boundary (x ≈ 1720, 3450, 5460, 6980). Inactive flags are grey; touching one turns it gold and saves the respawn position. A gold camera flash confirms activation. On death, the player respawns at the last activated checkpoint with full HP.
**Files changed:** `src/scenes/BootScene.js` (new `checkpoint` / `checkpoint_active` textures), `src/scenes/GameScene.js` (`_buildLevel`, `_setupCollisions`, `_playerDied`)
**Design note:** → [Session 1 — Checkpoints](09-design-decisions.md)

---

## Request #8 — Item Shop (Stars and Dots)

**Asked:** Add a special item shop in the menu that players can use to buy items with stars and dots.
**Status:** ✓ Done
**What was built:** A new `ShopScene` reachable from the menu. Five items available — some cost Stars (from collecting star pickups), some cost Dots (from collecting coin pickups). Balances persist to `localStorage` and survive between sessions.

| Item | Effect per run | Cost |
|------|---------------|------|
| Health Upgrade | +25 Max HP | 10 Dots |
| Speed Boost | Move 20% faster | 15 Dots |
| Unibeam+ | +5 Unibeam ammo | 5 Stars |
| Extra S-Bomb | +1 Smartbomb charge | 8 Stars |
| Iron Shield | Start with 3s invincibility | 12 Stars |

**Files changed:** `src/scenes/ShopScene.js` (new), `src/scenes/GameScene.js`, `src/scenes/MenuScene.js`, `src/main.js`, `index.html`
**Design note:** → [Session 2 — Item Shop + Currency System](09-design-decisions.md)

---

## Request #9 — Stars and Dots Visible

**Asked:** Make the stars and dots visible.
**Status:** ✓ Done
**What was built:**
- In-game HUD (UIScene): a `★ X` and `● X` display appears below the HP bar in the top-right corner. Updates live as you collect items.
- Main menu (MenuScene): wallet balances shown in a panel below the title, re-read from localStorage each time the menu loads.
**Files changed:** `src/scenes/UIScene.js`, `src/scenes/MenuScene.js`
**Design note:** → [Session 2 — Item Shop + Currency System](09-design-decisions.md)

---

## Request #10 — Money Shop (Real Money)

**Asked:** Make a money shop in the menu where you can buy custom items with real money.
**Status:** ✓ Done (UI mockup)
**What was built:** A `PremiumShopScene` with five items and real dollar price tags. Clicking BUY opens a modal that honestly explains payment processing is not yet configured. A separate `zapnhop_premium` localStorage key is reserved for when payments are integrated.

| Item | Price |
|------|-------|
| Gold Armor Skin | $0.99 |
| Rocket Missiles | $1.99 |
| Star Doubler | $2.99 |
| Mega Smartbomb | $1.99 |
| VIP Bundle | $9.99 |

**Files changed:** `src/scenes/PremiumShopScene.js` (new), `src/scenes/MenuScene.js`, `src/main.js`, `index.html`
**Design note:** → [Session 2 — Premium Shop](09-design-decisions.md)

---

## Request #11 — Exits on All Shops

**Asked:** Make exits on all the shops.
**Status:** ✓ Done
**What was built:** Both `ShopScene` and `PremiumShopScene` have an EXIT button in the bottom-right corner that returns to `MenuScene`. The premium shop purchase modal also has a CLOSE button that dismisses the modal without leaving the shop.
**Files changed:** `src/scenes/ShopScene.js`, `src/scenes/PremiumShopScene.js`
**Design note:** → [Session 2 — Exits on All Shops](09-design-decisions.md)

---

## Request #12 — Items Not Permanent

**Asked:** Can you make the items not permanent.
**Status:** ✓ Done
**What was built:** Items are now consumable — they last for one run and are gone. `zapnhop_owned` changed from an array of owned IDs to a count object (e.g. `{ speed_boost: 2, iron_shield: 1 }`). Buying an item increments its count. At the start of every run, GameScene applies the effects and immediately decrements all counts by 1. The shop always shows the BUY button and displays a `x2 ready` badge when you have stock queued up.
**Files changed:** `src/scenes/ShopScene.js`, `src/scenes/GameScene.js`
**Design note:** → [Session 3 — Items Not Permanent](09-design-decisions.md)

---

## How to Update This File

When a new feature is added:

1. Add a new `## Request #N` section at the bottom of this file
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `09-design-decisions.md` under the right session heading with the full why/alternatives reasoning
4. Update the session heading in `09-design-decisions.md` if it's a new conversation
