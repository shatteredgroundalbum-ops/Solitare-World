# Solitaire World 3D

A web prototype of **Solitaire World 3D** — a themed, multi-game solitaire *platform*: one app containing many solitaire variants under a single progression system, wrapped in the RPG/exploration UI from the concept (player level & XP, gold/gems/energy, per-game mastery, streaks, statistics).

The original concept envisions a Unity (URP) 3D mobile game. This repository is a **web** implementation (Vite + React + TypeScript) so the core gameplay and UI can be developed, run, and demonstrated in a browser.

## What's playable

Three solitaire families share one engine + renderer:

- **Klondike** — Draw 1 and Draw 3
- **FreeCell** — with the standard supermove (free-cell/empty-column) limit
- **Spider** — 1, 2, and 4 suit, with auto-completing King-to-Ace runs

The full concept **Library** (Pyramid, Golf, Yukon, Forty Thieves, etc.) is listed and categorized; unimplemented variants are marked "Coming soon". Player level, per-game mastery, and lifetime statistics persist in `localStorage`.

## Worlds & progression

The variants are tied together into an exploration meta:

- A **living home screen** (drifting clouds, flying birds, waving flag, chimney smoke, slow day/night) with a hierarchical layout: a hero **Continue Adventure** button, a **Now Playing** card, and progression bars (level, world completion, daily/weekly/season/collection).
- A **World Map** where each world maps to a solitaire family (Medieval Kingdom → Klondike, Pirate Isles → Spider, Crystal Caverns → FreeCell, Dragon's Keep → expert). Worlds unlock by level and fill in as you clear stages.
- **Stages** with escalating **difficulty** and **dynamic objectives** (win under 4:00, no hints, few moves, no undo, don't recycle the stock).
- A rich in-game **HUD** (moves, timer, score, combo, objective, mastery, streak) and **animated victories** (confetti + coin burst + objective bonus).
- A **Collection museum** of card backs, tables, trophies, and pets.

## Tech stack

- [Vite](https://vitejs.dev/) (dev server + build)
- React 18 + TypeScript
- No backend — all state is in-memory in the browser

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build
npm run lint       # ESLint
npm run typecheck  # tsc project type-check
```

## How to play

- **Navigate:** Dashboard → Play → pick a variant from the Library. Use the top-left back buttons to return.
- **Draw / deal:** click the stock pile. Klondike flips to the waste (and recycles when empty); Spider deals a card to every column.
- **Move:** click a face-up card to select it (and any valid run beneath it), then click a destination pile.
- **Auto-to-foundation:** double-click the top card of a column/free cell/waste (Klondike & FreeCell).
- **Hint / Undo / Shuffle:** bottom-left controls. Shuffle deals a fresh hand.

## Testing the rules

```bash
npm run check:logic   # deterministic assertions for all engines (no browser)
```

## Project structure

```
src/
  game/
    cards.ts          # card model, deck(s) creation, shuffle
    engine.ts         # generic Engine interface + GameState (piles) model
    rules.ts          # shared stacking/run helpers
    engines/
      klondike.ts     # Klondike Draw 1 / Draw 3
      freecell.ts     # FreeCell (supermove rule)
      spider.ts       # Spider 1/2/4 suit (+ run auto-complete)
    registry.ts       # game registry + categorized library
    stats.ts          # localStorage progression + mastery
  components/
    CardView.tsx      # a single card (face / back)
    Board.tsx         # generic engine-driven table renderer
    GameScreen.tsx    # shared interaction / undo / win loop + HUD
    Dashboard.tsx     # main dashboard
    Library.tsx       # categorized solitaire library
    StatsScreen.tsx   # profile + statistics + mastery
    Chrome.tsx        # player card / resources / icon buttons
  App.tsx             # screen router + stats owner
  styles.css          # theme + layout
scripts/
  logic-check.ts      # engine rule assertions (npm run check:logic)
public/
  assets/             # background art
```
