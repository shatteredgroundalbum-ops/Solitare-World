import { Card, color, makeDeck, shuffle } from './cards'

export interface GameState {
  stock: Card[]
  waste: Card[]
  foundations: Card[][] // 4 piles, index 0..3
  tableau: Card[][] // 7 columns
}

export type PileRef =
  | { type: 'stock' }
  | { type: 'waste' }
  | { type: 'foundation'; index: number }
  | { type: 'tableau'; index: number }

export interface Selection {
  pile: PileRef
  cardIndex: number // index within the source pile of the first moving card
}

export function dealNewGame(): GameState {
  const deck = shuffle(makeDeck())
  const tableau: Card[][] = [[], [], [], [], [], [], []]
  let pos = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[pos++] }
      card.faceUp = row === col
      tableau[col].push(card)
    }
  }
  const stock = deck.slice(pos).map((c) => ({ ...c, faceUp: false }))
  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  }
}

function clone(state: GameState): GameState {
  return {
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: state.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: state.tableau.map((p) => p.map((c) => ({ ...c }))),
  }
}

function topOf(pile: Card[]): Card | undefined {
  return pile.length ? pile[pile.length - 1] : undefined
}

export function canDropOnFoundation(moving: Card, foundationTop: Card | undefined): boolean {
  if (!foundationTop) return moving.rank === 1
  return moving.suit === foundationTop.suit && moving.rank === foundationTop.rank + 1
}

export function canDropOnTableau(moving: Card, tableauTop: Card | undefined): boolean {
  if (!tableauTop) return moving.rank === 13
  return color(moving.suit) !== color(tableauTop.suit) && moving.rank === tableauTop.rank - 1
}

// Returns the moving stack of cards given a selection, or null if invalid.
function movingCards(state: GameState, sel: Selection): Card[] | null {
  const { pile, cardIndex } = sel
  switch (pile.type) {
    case 'waste': {
      if (cardIndex !== state.waste.length - 1) return null
      const c = state.waste[cardIndex]
      return c ? [c] : null
    }
    case 'foundation': {
      const f = state.foundations[pile.index]
      if (cardIndex !== f.length - 1) return null
      const c = f[cardIndex]
      return c ? [c] : null
    }
    case 'tableau': {
      const col = state.tableau[pile.index]
      const run = col.slice(cardIndex)
      if (!run.length) return null
      if (run.some((c) => !c.faceUp)) return null
      // The run must be an ordered, alternating-color descending sequence.
      for (let i = 1; i < run.length; i++) {
        if (!canDropOnTableau(run[i], run[i - 1])) return null
      }
      return run
    }
    default:
      return null
  }
}

function removeMoving(state: GameState, sel: Selection): void {
  const { pile, cardIndex } = sel
  if (pile.type === 'waste') {
    state.waste.splice(cardIndex)
  } else if (pile.type === 'foundation') {
    state.foundations[pile.index].splice(cardIndex)
  } else if (pile.type === 'tableau') {
    state.tableau[pile.index].splice(cardIndex)
    const col = state.tableau[pile.index]
    const top = topOf(col)
    if (top && !top.faceUp) top.faceUp = true
  }
}

export function canMove(state: GameState, sel: Selection, dest: PileRef): boolean {
  const moving = movingCards(state, sel)
  if (!moving) return false
  const head = moving[0]
  if (dest.type === 'foundation') {
    if (moving.length !== 1) return false
    return canDropOnFoundation(head, topOf(state.foundations[dest.index]))
  }
  if (dest.type === 'tableau') {
    // Disallow no-op move onto the same pile.
    if (sel.pile.type === 'tableau' && sel.pile.index === dest.index) return false
    return canDropOnTableau(head, topOf(state.tableau[dest.index]))
  }
  return false
}

export function applyMove(state: GameState, sel: Selection, dest: PileRef): GameState {
  const next = clone(state)
  const moving = movingCards(next, sel)
  if (!moving) return state
  removeMoving(next, sel)
  if (dest.type === 'foundation') {
    next.foundations[dest.index].push(...moving.map((c) => ({ ...c, faceUp: true })))
  } else if (dest.type === 'tableau') {
    next.tableau[dest.index].push(...moving.map((c) => ({ ...c, faceUp: true })))
  }
  return next
}

// Draw from stock to waste. If stock empty, recycle waste back to stock.
export function drawFromStock(state: GameState): GameState {
  const next = clone(state)
  if (next.stock.length > 0) {
    const card = next.stock.pop()!
    card.faceUp = true
    next.waste.push(card)
  } else if (next.waste.length > 0) {
    next.stock = next.waste.reverse().map((c) => ({ ...c, faceUp: false }))
    next.waste = []
  }
  return next
}

// Find a foundation index that accepts the given card, or -1.
export function foundationTargetFor(state: GameState, card: Card): number {
  for (let i = 0; i < state.foundations.length; i++) {
    if (canDropOnFoundation(card, topOf(state.foundations[i]))) return i
  }
  return -1
}

export function isWon(state: GameState): boolean {
  return state.foundations.reduce((sum, p) => sum + p.length, 0) === 52
}

export interface HintMove {
  from: Selection
  to: PileRef
}

// Find a useful move for the hint button. Prefers foundation moves.
export function findHint(state: GameState): HintMove | null {
  const sources: Selection[] = []
  if (state.waste.length) {
    sources.push({ pile: { type: 'waste' }, cardIndex: state.waste.length - 1 })
  }
  state.tableau.forEach((col, index) => {
    const firstFaceUp = col.findIndex((c) => c.faceUp)
    if (firstFaceUp >= 0) {
      for (let i = firstFaceUp; i < col.length; i++) {
        sources.push({ pile: { type: 'tableau', index }, cardIndex: i })
      }
    }
  })

  // Prefer foundation moves first.
  for (const from of sources) {
    for (let f = 0; f < 4; f++) {
      if (canMove(state, from, { type: 'foundation', index: f })) {
        return { from, to: { type: 'foundation', index: f } }
      }
    }
  }
  // Then tableau moves that expose something useful.
  for (const from of sources) {
    for (let t = 0; t < 7; t++) {
      if (canMove(state, from, { type: 'tableau', index: t })) {
        // Skip pointless king-shuffles between empty columns.
        if (from.pile.type === 'tableau') {
          if (from.cardIndex === 0 && state.tableau[t].length === 0) continue
        }
        return { from, to: { type: 'tableau', index: t } }
      }
    }
  }
  return null
}
