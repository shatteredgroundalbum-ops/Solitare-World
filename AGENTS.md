# AGENTS.md

## Project overview

Solitaire World 3D is a web prototype (Vite + React + TypeScript) of a themed, multi-game solitaire *platform*. The original `Readme` (no extension) contains the product concept for a Unity/URP 3D mobile game; this repo implements the core gameplay + UI on the web so it can run in a browser. There is no backend and no database (progress persists in `localStorage`).

## Cursor Cloud specific instructions

- **Single service.** This is a front-end-only Vite app. Standard commands live in `package.json` / `README.md` (`npm run dev`, `build`, `lint`, `typecheck`, and `check:logic`). The dev server listens on `http://localhost:5173` (configured with `host: true` in `vite.config.ts`).
- **Engine architecture (important).** Every solitaire variant implements the pure `Engine` interface in `src/game/engine.ts` and operates on a generic `GameState` = `{ piles: Record<string, Card[]>, meta }`. Concrete engines live in `src/game/engines/` (`klondike.ts`, `freecell.ts`, `spider.ts`); shared rules are in `src/game/rules.ts`. `src/components/Board.tsx` is a single generic renderer driven by each engine's `layout()`, and `src/components/GameScreen.tsx` holds the one interaction/undo/win loop shared by all games. To add a variant: implement an `Engine`, register it in `src/game/registry.ts` (map its `id`), and it becomes playable in the Library with no UI changes. Prefer adding pure logic + a `check:logic` assertion over ad-hoc component code.
- **`npm run check:logic`** bundles `scripts/logic-check.ts` with esbuild and runs deterministic rule assertions for all engines. It is the fastest way to validate engine changes without the browser; add cases there when touching rules.
- **Interaction model gotcha:** moves are click-to-select-then-click-destination (not drag-and-drop). Double-clicking the top of a column/free cell/waste auto-sends it to a foundation (Klondike/FreeCell). Spider has no double-click auto-move; completed King-to-Ace same-suit runs auto-collect to a foundation inside `applyMove`. Simulate discrete clicks in UI tests, not drags.
- **Persistence:** player stats and per-game mastery are stored in `localStorage` under key `sw3d.stats.v1` (`src/game/stats.ts`). To test a fresh profile, clear that key. Card sizing in `Board.tsx` shrinks automatically for wide layouts (Spider = 10 columns), so avoid hard-coding `--card-w`.
- **Background art** lives in `public/assets/` and is a large (~3 MB) PNG referenced by URL in `src/styles.css` (`/assets/medieval_village_bg.png`). It is committed; regenerate/replace the file in place rather than renaming, since the path is hard-coded in CSS.
