# Zap-N-Hop — Design Decisions Log

This is a living document. Every time a feature is added or changed, a new entry goes here.

The goal is to capture **why** a decision was made, not just **what** was built. That way, if you come back later and want to swap out a technology or rethink an approach, you have the full context of what was considered at the time.

---

## How to Read This

Each entry has four parts:

- **What was asked for** — the original request
- **What was built** — a plain description of the implementation
- **Why this way** — the reasoning behind the specific choices made
- **What was ruled out** — alternatives that were considered and rejected, and why

---

---

## Session 1 — Combat, Health, and Level Feel

### Feature: Platform Zombies

**What was asked for**
> "Add zombies on random platforms."

**What was built**
Ten zombies were placed directly on elevated platforms, two per sector. They patrol only within their platform's width. Patrol speed increases per sector (55 → 75 px/s). They use the existing `zombie` texture and share the same `enemies` physics group as ground skeletons and sky zombies.

**Why this way**

- **Placed at creation time, not spawned dynamically.** Spawning them during gameplay like sky zombies would mean they could fall onto platforms unpredictably. Pre-placing them guarantees they're always where you expect.
- **No shoot timer.** Ground skeletons shoot arrows. Sky zombies fall. Platform zombies just patrol — three enemy types, three distinct threat signatures.
- **Increasing speed per sector.** The game already has a 5-sector difficulty curve for skeletons. Matching that curve keeps the feel consistent rather than having a random difficulty spike in the middle of the level.
- **Calculated y position (platform_y − 40).** Placing them slightly above the platform surface and letting physics settle them is safer than guessing the exact pixel. If the number is slightly wrong, gravity corrects it.
- **Reuse the `zombie` texture.** There was no new art added. Players can already distinguish platform zombies from skeletons visually (green vs white) without a brand new sprite.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Spawn dynamically on random platforms near the player | Hard to control density; they could cluster or leave entire sectors empty |
| Give platform zombies a shoot timer like skeletons | Too much ranged fire from elevated positions would make the game unfair |
| New texture for platform zombies | No artist; procedural textures take time; the existing zombie sprite is distinct enough |
| `patrolActive = false` (fall-and-activate like sky zombies) | If they spawned even one pixel off-centre they'd fall to the ground instead of landing on the platform |

---

### Feature: Health Bar / One Life / Enemies Can't One-Shot

**What was asked for**
> "Have a health bar and only one life where enemies can't one-shot you."

**What was built**
The three-lives system was removed entirely. Players now have 100 HP displayed as a bar in the top-right corner. Damage values: arrow = 20 HP, fireball = 25 HP, enemy contact = 30 HP. When HP hits zero the player respawns at the last checkpoint with full HP restored.

**Why this way**

- **100 HP.** Round number, easy to mentally track. The highest single hit (30 HP) is exactly 30% of max — you can survive three worst-case hits, which feels fair.
- **These specific damage values.** The constraint was "can't one-shot." Setting each damage type below 100 guaranteed that. The spread (20 / 25 / 30) makes the three threat types feel distinct: arrows are the least scary, contact is the most.
- **Full HP on checkpoint respawn.** Restoring partial HP (e.g. 50%) was considered. It was rejected because players would frequently die again immediately after respawning near a cluster of enemies, which feels punishing. Full HP gives a clean restart at each checkpoint.
- **"One life" means health bar + checkpoints, not literal permadeath.** The request said "one life" alongside "multiple checkpoints." The interpretation was that checkpoints act as the safety net — you don't accumulate extra lives, you just have the bar. This matches how modern games like Hollow Knight handle it.
- **`lastCheckpoint` defaults to start position.** Rather than making death before the first checkpoint trigger a hard game over, the start of the level acts as an implicit checkpoint. More forgiving for a beginner game.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep lives counter AND add health bar | Two "how close to death am I" systems is confusing; consolidated into one |
| True permadeath (game over on first death) | Too punishing for a game with fireballs raining constantly and platform zombies |
| Partial HP restore on checkpoint (e.g. 50%) | Leads to low-HP respawns near enemies; worse player experience |
| Respawn at start of level, not at checkpoint | Makes checkpoints meaningless |
| Health that regenerates over time automatically | Removes the strategic value of health regen pickups |

---

### Feature: Health Regen Areas

**What was asked for**
> "Put in a few health regen areas."

**What was built**
Four green glowing orb pickups placed at ground level across the level (roughly one per sector). Each gives +35 HP on collection and disappears. A brief green camera flash plays on pickup.

**Why this way**

- **Consumable pickups, not persistent zones.** A zone you stand in to regen over time was considered (like a fountain). Rejected because the game has constant enemy fire — standing still to heal is not a real option. A pickup you grab and keep moving is more practical.
- **+35 HP per pickup.** Roughly one-third of max health. Meaningful without being a full restore. Two pickups gets you back to almost full if you've taken damage.
- **Ground level placement.** Placed where the player naturally passes through rather than requiring a platform detour. Health should feel like a reward for exploration, not an obstacle.
- **Procedurally drawn green orb in BootScene.** No real art assets. The glowing cross design inside the orb reads clearly as "healing" without needing a heart or plus symbol.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Standing regen zones | Not practical under constant fire; adds complex "is player inside zone" tick logic |
| Regen tied to time (passive over the whole run) | Removes any decision from the player |
| Full HP restore on pickup | Too powerful; negates the checkpoint-respawn health design |
| Placing them on platforms | Makes them harder to collect; health should be accessible |

---

### Feature: Multiple Checkpoints

**What was asked for**
> "Multiple checkpoints."

**What was built**
Four checkpoint flag poles placed at each sector boundary (x ≈ 1720, 3450, 5460, 6980). Each is a static physics object. When the player overlaps it, the flag texture changes from grey to gold, a gold camera flash plays, and the respawn position is saved to `this.lastCheckpoint`. On death, the player teleports to `lastCheckpoint` and HP is fully restored.

**Why this way**

- **One per sector boundary.** Sector boundaries are natural breakpoints where the game gets harder. A checkpoint right before that difficulty step is the most useful placement.
- **Flag graphic (inactive → active).** Visual feedback that the checkpoint was registered. Without the colour change, players wouldn't know if touching it worked.
- **Save only x, spawn at y = 400.** Rather than saving the exact y position of the flag, the player always spawns at y = 400 (above ground). This avoids precision problems where a slightly wrong y could clip the player into geometry.
- **`this.lastCheckpoint` as a plain object on the scene.** No localStorage for checkpoints — they reset every run. Checkpoints are progress markers within a single run, not cross-session state.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Persist checkpoints to localStorage | Checkpoints are per-run state; loading an old checkpoint in a new session makes no sense |
| Unlimited checkpoints (activate anywhere) | No spatial control over where the player respawns; could lead to spawning in dangerous spots |
| Save exact flag y position | Risk of spawning inside geometry or mid-air; fixed y = 400 is always safe |
| Checkpoint restores 50% HP only | More frustrating; see health bar reasoning above |

---

---

## Session 2 — Economy and Shops

### Feature: Item Shop + Currency System

**What was asked for**
> "Add a special item shop in the menu that players can use to buy items with stars and dots. Make the stars and dots visible."

**What was built**
Two new currencies tracked in `localStorage`: Stars (`zapnhop_stars`) and Dots (`zapnhop_dots`). Stars come from collecting the existing star pickups (+1 per star). Dots come from collecting coins (+1 per coin). Both show in the in-game HUD (below the HP bar) and on the menu. A new `ShopScene` offers five items split between the two currencies.

**Why this way**

- **`localStorage` for persistence.** No server, no account system. localStorage is synchronous, well-supported, and simple enough to read and write in a single line. A beginner can open DevTools and see exactly what's stored.
- **Stars = premium currency, Dots = common currency.** Stars already had higher point value (+25 vs +10). Making them the premium shop currency matches that hierarchy — rarer to earn, used for more impactful items.
- **Coins renamed "Dots" in shop context only.** The in-game pickups are still called "coins" in the code. The shop and HUD call them "Dots." This avoided renaming every reference in the game (16 coin placements, collision handlers, etc.) while still matching the requested name.
- **`zapnhop_` prefix on all keys.** Namespacing prevents collisions if localStorage contains data from other games or tools in the same browser origin.
- **Event-driven HUD updates.** When a star or coin is collected, GameScene emits a `currencyUpdate` event. UIScene listens and updates the counter text. This is the same pattern already used for `scoreUpdate` and `healthUpdate` — consistent, no direct scene coupling.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| IndexedDB for storage | Asynchronous API, much more complex for simple integer storage |
| Score as currency | Score is an achievement (goes up, never down). Currency gets spent. Merging them breaks both mental models |
| Single unified currency | Two currencies add shop strategy — spend rare stars for power, spend common dots for utility |
| Fetch from a backend | No server; backend adds deployment complexity and is out of scope |
| UIScene reading localStorage directly | Breaks the event-driven pattern already established in the codebase |

---

### Feature: Premium Shop (Real Money)

**What was asked for**
> "A money shop in the menu where you can buy custom items with real money."

**What was built**
A `PremiumShopScene` with five items displaying real dollar prices. Clicking BUY opens a modal that honestly states "Payment integration not yet configured." The shop has its own purple/gold visual identity distinct from the item shop.

**Why this way**

- **UI mockup only, no payment processing.** Real payments require a payment processor (Stripe, PayPal, etc.), HTTPS, a backend to verify transactions, and compliance with platform terms. None of that is present in a local file-served HTML game. A mockup shows the intent without creating a broken or misleading checkout flow.
- **Separate `zapnhop_premium` localStorage key.** Kept separate from `zapnhop_owned` (consumable items). If payment processing is added later, the premium items can be verified and populated server-side without touching the consumable item system.
- **Distinct visual style (purple vs orange).** Players need to immediately understand these are two different shops with different rules. Colour is the fastest signal.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Fake checkout form that "completes" | Misleading; players might expect items to work |
| Combining with item shop | Different payment systems, different item persistence logic; better separated |
| Stripe.js integration | Requires backend, HTTPS, Stripe account — infrastructure that doesn't exist yet |
| Hiding the premium shop until payments are set up | User asked for it now; mockup is better than nothing |

---

### Feature: Exits on All Shops

**What was asked for**
> "Make exits on all the shops."

**What was built**
Both `ShopScene` and `PremiumShopScene` have an EXIT button in the bottom-right corner that calls `this.scene.start('MenuScene')`. The premium shop purchase modal also has a CLOSE button.

**Why this way**

- **`scene.start` not `scene.stop`.** `stop` pauses the scene and returns to whatever was behind it in the stack. `start` fully replaces the running scene with MenuScene, which is the intended destination. Using `stop` could lead to returning to a partially-initialised state if the scene was launched rather than started.
- **Bottom-right corner.** Convention from most game menus — the "back/exit" action is bottom-right, the primary action (BUY) is inline with each item. Reduces accidental exits.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Back button (browser back) | Doesn't work in Phaser; scenes don't use URL routing |
| `scene.stop()` | Would try to resume behind the scene in the stack, which isn't MenuScene |
| Keyboard shortcut (Escape to exit) | Didn't add it to keep scope small; could be added later |

---

---

## Session 3 — Consumable Items

### Feature: Items Not Permanent

**What was asked for**
> "Can you make the items not permanent."

**What was built**
`zapnhop_owned` changed from an array of owned IDs (`['health_upgrade', 'iron_shield']`) to a count object (`{ health_upgrade: 2, iron_shield: 1 }`). Buying an item increments its count. At the start of every run, GameScene checks which items have count > 0, applies their effects, then decrements each count by 1 before the game begins.

**Why this way**

- **Count object over array.** An array with duplicates (`['speed_boost', 'speed_boost']`) would work, but counting duplicates requires `filter().length` every time. An object gives O(1) reads, clean JSON, and trivial increment/decrement.
- **Consume at game START, not game END.** Game end (win screen, game over) can be skipped if the browser is closed. Start is always guaranteed. If the item was in your bag when you launched a run, it's fair to deduct it immediately.
- **`has()` snapshot before consume loop.** `const has = id => (owned[id] || 0) > 0` is evaluated before the loop that decrements counts. This means the item check still returns `true` for this run even though storage has already been decremented. If the check happened after consuming, every item would read as `false`.
- **Delete zero-count entries.** Keeping `{ speed_boost: 0 }` in storage is noise. Deleting empty keys keeps the JSON small and avoids the `|| 0` fallback ever reading stale zeros as meaningful data.
- **BUY button always available.** With permanent items, a second purchase of the same item was prevented with a "OWNED" block. Consumables can be bought in stacks, so there's no lock-out — just a cost gate.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep as permanent | User explicitly asked to change this |
| Time-based expiry (items expire after 24h) | Complex, frustrating if you forget to play, not intuitive |
| Items that expire at game over only (not at win) | Inconsistent — winning should also consume the items you used |
| Consume at win/game-over screen | Unreliable if browser is closed; `_gameOver` and `_winLevel` are both dead-end screens |
| Array with duplicates for stacking | Counting duplicates (`arr.filter(x => x === id).length`) is clunky versus `obj[id]` |

---

---

## Technology Choices (Cross-Cutting)

These are decisions that affect the whole project, not a single feature.

### Game Engine: Phaser 3

**Why Phaser 3**
Phaser 3 is the most widely documented browser game framework. It has built-in arcade physics (gravity, collisions, static groups) that eliminates hundreds of lines of manual vector math. The CDN version (`phaser.min.js`) means zero build tooling — open `index.html` in a browser and it works.

**What was ruled out**

| Option | Why not chosen |
|--------|---------------|
| Three.js | 3D; overkill for a 2D platformer; much steeper learning curve |
| Babylon.js | Same as above |
| Unity (WebGL export) | Requires installing Unity, learning C#, and a lengthy export pipeline |
| Vanilla Canvas 2D | Would require writing physics, collision detection, and a game loop from scratch |
| Godot (HTML5 export) | Good engine but requires GDScript, a separate IDE, and exports produce large bundles |
| p5.js | Great for creative coding but no built-in physics or sprite/scene management |

### No Build System

**Why no webpack/Vite/Rollup**
The game is a single HTML file loading five JS files with `<script>` tags. No transpilation, no bundling, no `node_modules`. A beginner can open any file, edit it, and reload the browser to see the change instantly. The cost is no tree-shaking and no TypeScript — acceptable at this project scale.

### Procedural Art in BootScene

**Why draw everything in code rather than using image files**
No external assets means the game is fully self-contained. Any pixel is readable and editable in the same codebase. The trade-off is that the sprites are very simple (rectangles and circles), but for a learning project that's a feature, not a bug.

### localStorage for Persistence

**Why not cookies, IndexedDB, or a server**
localStorage is synchronous, requires no API, and is visible in browser DevTools. For simple integer/object storage in a local game, it's the right tool. The main limitation is origin-isolation — if the game is ever hosted on a domain, the saved data is tied to that domain. For a local file that's fine.

---

## Open Questions / Things to Revisit

These are decisions that were made under time or scope constraints and might be worth changing later:

1. **Premium shop has no payment backend.** If real monetisation is ever added, the architecture will need a server to verify purchases before writing to localStorage (otherwise anyone can fake ownership by editing DevTools).

2. **`zapnhop_owned` consumes ALL item types at run start, even ones you don't have.** The loop iterates all five IDs regardless. It checks `if (owned[id] > 0)` before decrementing, so items you don't own are unaffected — but the loop is slightly wasteful. Not a performance issue now, but worth noting if the item list grows.

3. **Checkpoint x-position hardcoded to `cp.x`, y hardcoded to `400`.** If the level is redesigned with platforms near x=1720 or the world height changes, spawn position might feel off. A more robust approach would store the nearest safe ground y relative to each checkpoint.

4. **No item preview in the shop.** Players see a description but there's no way to see what the game looks like with the item active before buying. This could be a tooltip or a short animation.

5. **Stars and Dots never have a cap.** You can accumulate thousands. If the shop items are cheap relative to collection rates, the economy becomes trivial quickly. Consider a soft cap or increasing prices over time.
