import { Card, color } from './cards'

/** A card may stack on a foundation of the same suit, one rank higher. */
export function canStackFoundation(moving: Card, foundationTop: Card | undefined): boolean {
  if (!foundationTop) return moving.rank === 1
  return moving.suit === foundationTop.suit && moving.rank === foundationTop.rank + 1
}

/** Klondike/FreeCell tableau: build down, alternating colors. Empty accepts a King. */
export function canStackAltColor(moving: Card, tableauTop: Card | undefined): boolean {
  if (!tableauTop) return moving.rank === 13
  return color(moving.suit) !== color(tableauTop.suit) && moving.rank === tableauTop.rank - 1
}

/** A run is a face-up, descending, alternating-color sequence. */
export function isAltColorRun(run: Card[]): boolean {
  for (let i = 0; i < run.length; i++) {
    if (!run[i].faceUp) return false
    if (i > 0 && !canStackAltColor(run[i], run[i - 1])) return false
  }
  return run.length > 0
}

/** A run is a face-up, same-suit, strictly descending sequence (Spider). */
export function isSameSuitRun(run: Card[]): boolean {
  for (let i = 0; i < run.length; i++) {
    if (!run[i].faceUp) return false
    if (i > 0 && !(run[i].suit === run[i - 1].suit && run[i].rank === run[i - 1].rank - 1)) {
      return false
    }
  }
  return run.length > 0
}
