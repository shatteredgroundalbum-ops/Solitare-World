import { Card } from './cards'

export type PileKind = 'stock' | 'waste' | 'free' | 'foundation' | 'tableau'
export type Fan = 'none' | 'down' | 'right'

export interface CardSlot {
  pileId: string
  kind: PileKind
  fan: Fan
}

export type Slot = CardSlot | { spacer: true }

export interface LayoutRow {
  slots: Slot[]
}

export interface MoveRef {
  pileId: string
  cardIndex: number
}

export interface Hint {
  from: MoveRef
  toPileId: string
}

export interface GameState {
  piles: Record<string, Card[]>
  meta: Record<string, number>
}

export interface Engine {
  id: string
  name: string
  family: string
  instruction: string
  /** Create a fresh, dealt game. */
  create(): GameState
  /** Row/slot arrangement used by the generic renderer. */
  layout(s: GameState): LayoutRow[]
  /** Can the run beginning at `ref` be picked up as a group? */
  canPickUp(s: GameState, ref: MoveRef): boolean
  /** Is moving the run at `from` onto pile `toPileId` legal? */
  canMove(s: GameState, from: MoveRef, toPileId: string): boolean
  /** Apply a (validated) move, returning a new state. */
  applyMove(s: GameState, from: MoveRef, toPileId: string): GameState
  /** Handle a click on a pile background (stock draw / spider deal). */
  clickPile(s: GameState, pileId: string): GameState | null
  /** Destination pile for a double-click auto move, or null. */
  autoTarget(s: GameState, from: MoveRef): string | null
  isWon(s: GameState): boolean
  hint(s: GameState): Hint | null
}

export function cloneState(s: GameState): GameState {
  const piles: Record<string, Card[]> = {}
  for (const key of Object.keys(s.piles)) {
    piles[key] = s.piles[key].map((c) => ({ ...c }))
  }
  return { piles, meta: { ...s.meta } }
}

export function top(pile: Card[]): Card | undefined {
  return pile.length ? pile[pile.length - 1] : undefined
}

export function isCardSlot(slot: Slot): slot is CardSlot {
  return (slot as CardSlot).pileId !== undefined
}
