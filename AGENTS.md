# AGENTS.md

## Project overview

Solitaire World 3D is a web prototype (Vite + React + TypeScript) of a themed Klondike solitaire game. The original `Readme` (no extension) contains the product concept for a Unity/URP 3D mobile game; this repo implements the core gameplay + UI on the web so it can run in a browser. There is no backend and no database.

## Cursor Cloud specific instructions

- **Single service.** This is a front-end-only Vite app. Standard commands live in `package.json` / `README.md` (`npm run dev`, `build`, `lint`, `typecheck`). The dev server listens on `http://localhost:5173` (configured with `host: true` in `vite.config.ts`).
- **Game logic is pure and framework-agnostic.** All Klondike rules live in `src/game/klondike.ts` (pure functions returning new `GameState`); `src/App.tsx` only orchestrates state/UI. Prefer adding/adjusting rules there and unit-testable helpers rather than in components.
- **Interaction model gotcha:** moves are click-to-select-then-click-destination (not drag-and-drop). Double-clicking the top of the waste or a tableau column auto-sends it to a foundation. Keep this in mind when writing UI tests — simulate discrete clicks, not drags.
- **Background art** lives in `public/assets/` and is a large (~3 MB) PNG referenced by URL in `src/styles.css` (`/assets/medieval_village_bg.png`). It is committed to the repo; regenerate/replace the file in place rather than renaming, since the path is hard-coded in CSS.
