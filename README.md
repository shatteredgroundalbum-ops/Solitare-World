# Solitaire World 3D

A web prototype of **Solitaire World 3D** — an exploration-themed solitaire game. This prototype implements a fully playable **Klondike** table wrapped in the RPG/exploration UI from the concept (player level & XP, gold/gems/energy, daily quests, location progression, stars, chests, win streak).

The original concept envisions a Unity (URP) 3D mobile game. This repository is a **web** implementation (Vite + React + TypeScript) so the core gameplay and UI can be developed, run, and demonstrated in a browser.

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

## How to play (Klondike)

- **Draw:** click the stock pile (top-right) to flip cards to the waste. When the stock is empty, clicking it recycles the waste.
- **Move:** click a face-up card to select it (and any valid run beneath it), then click a destination column or foundation.
- **Auto-to-foundation:** double-click the top card of the waste or a column to send it to a foundation automatically.
- **Foundations:** build up by suit from Ace to King. Clear all four to win.
- **Tableau:** build down in alternating colors; empty columns accept a King.
- **Hint / Undo / Shuffle:** bottom-left controls. Shuffle deals a fresh hand.

## Project structure

```
src/
  game/
    cards.ts       # card model, deck creation, shuffle
    klondike.ts    # game state, move validation, hints, win detection
  components/
    CardView.tsx   # a single card (face / back)
    Hud.tsx        # top bar + side panels (RPG chrome)
  App.tsx          # game orchestration + table layout
  styles.css       # theme + layout
public/
  assets/          # background art
```
