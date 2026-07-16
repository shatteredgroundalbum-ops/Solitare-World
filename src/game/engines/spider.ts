import { Card, Suit, makeDecks, shuffle } from '../cards'
import { Engine, GameState, Hint, LayoutRow, MoveRef, cloneState, top } from '../engine'
import { isSameSuitRun } from '../rules'

const FOUNDATIONS = ['fnd0', 'fnd1', 'fnd2', 'fnd3', 'fnd4', 'fnd5', 'fnd6', 'fnd7']
const TABLEAU = Array.from({ length: 10 }, (_, i) => `tab${i}`)

const SUIT_SETS: Record<number, Suit[]> = {
  1: ['spades'],
  2: ['spades', 'hearts'],
  4: ['spades', 'hearts', 'clubs', 'diamonds'],
}

function createSpider(suitCount: number): GameState {
  const deck = shuffle(makeDecks(2, SUIT_SETS[suitCount]))
  const piles: Record<string, Card[]> = { stock: [] }
  FOUNDATIONS.forEach((f) => (piles[f] = []))
  TABLEAU.forEach((t) => (piles[t] = []))

  let pos = 0
  for (let col = 0; col < 10; col++) {
    const count = col < 4 ? 6 : 5
    for (let i = 0; i < count; i++) {
      const faceUp = i === count - 1
      piles[TABLEAU[col]].push({ ...deck[pos++], faceUp })
    }
  }
  piles.stock = deck.slice(pos).map((c) => ({ ...c, faceUp: false }))
  return { piles, meta: { suitCount } }
}

function movingRun(s: GameState, from: MoveRef): Card[] | null {
  if (!from.pileId.startsWith('tab')) return null
  const run = s.piles[from.pileId].slice(from.cardIndex)
  return isSameSuitRun(run) ? run : null
}

// Move any completed King-to-Ace, single-suit run at a column tail to a foundation.
function collectCompleted(next: GameState): void {
  for (const t of TABLEAU) {
    const col = next.piles[t]
    if (col.length < 13) continue
    const tail = col.slice(-13)
    const complete =
      tail[0].rank === 13 &&
      tail.every((c, i) => c.faceUp && c.rank === 13 - i && c.suit === tail[0].suit)
    if (complete) {
      const empty = FOUNDATIONS.find((f) => next.piles[f].length === 0)
      if (!empty) continue
      next.piles[empty] = col.splice(col.length - 13).map((c) => ({ ...c, faceUp: true }))
      if (col.length && !top(col)!.faceUp) top(col)!.faceUp = true
    }
  }
}

function canMove(s: GameState, from: MoveRef, toPileId: string): boolean {
  if (!toPileId.startsWith('tab') || toPileId === from.pileId) return false
  const run = movingRun(s, from)
  if (!run) return false
  const destTop = top(s.piles[toPileId])
  if (!destTop) return true // any run may go to an empty column
  return run[0].rank === destTop.rank - 1
}

function applyMove(s: GameState, from: MoveRef, toPileId: string): GameState {
  const next = cloneState(s)
  const run = movingRun(next, from)
  if (!run) return s
  next.piles[from.pileId].splice(from.cardIndex)
  const src = next.piles[from.pileId]
  if (src.length && !top(src)!.faceUp) top(src)!.faceUp = true
  next.piles[toPileId].push(...run)
  collectCompleted(next)
  return next
}

function clickPile(s: GameState, pileId: string): GameState | null {
  if (pileId !== 'stock' || s.piles.stock.length === 0) return null
  if (TABLEAU.some((t) => s.piles[t].length === 0)) return null // no dealing onto empty columns
  const next = cloneState(s)
  for (const t of TABLEAU) {
    const card = next.piles.stock.pop()
    if (!card) break
    card.faceUp = true
    next.piles[t].push(card)
  }
  collectCompleted(next)
  return next
}

function sources(s: GameState): MoveRef[] {
  const refs: MoveRef[] = []
  TABLEAU.forEach((t) => {
    const col = s.piles[t]
    for (let i = 0; i < col.length; i++) {
      if (col[i].faceUp && movingRun(s, { pileId: t, cardIndex: i })) {
        refs.push({ pileId: t, cardIndex: i })
      }
    }
  })
  return refs
}

function hint(s: GameState): Hint | null {
  const srcs = sources(s)
  // Prefer moves that continue a same-suit sequence.
  for (const from of srcs) {
    const head = s.piles[from.pileId][from.cardIndex]
    for (const t of TABLEAU) {
      if (t === from.pileId) continue
      const destTop = top(s.piles[t])
      if (destTop && destTop.suit === head.suit && canMove(s, from, t)) {
        return { from, toPileId: t }
      }
    }
  }
  // Any legal, non-trivial move.
  for (const from of srcs) {
    for (const t of TABLEAU) {
      if (canMove(s, from, t)) {
        if (from.cardIndex === 0 && s.piles[t].length === 0) continue
        return { from, toPileId: t }
      }
    }
  }
  return null
}

function isWon(s: GameState): boolean {
  return FOUNDATIONS.reduce((sum, f) => sum + s.piles[f].length, 0) === 104
}

function layout(): LayoutRow[] {
  return [
    {
      slots: [
        ...FOUNDATIONS.map((id) => ({ pileId: id, kind: 'foundation' as const, fan: 'none' as const })),
        { spacer: true },
        { pileId: 'stock', kind: 'stock' as const, fan: 'none' as const },
      ],
    },
    {
      slots: TABLEAU.map((id) => ({ pileId: id, kind: 'tableau' as const, fan: 'down' as const })),
    },
  ]
}

function makeEngine(id: string, name: string, suitCount: number): Engine {
  return {
    id,
    name,
    family: 'Spider',
    instruction: 'Build descending same-suit runs from King to Ace to clear the board.',
    create: () => createSpider(suitCount),
    layout,
    canPickUp: (s, ref) => movingRun(s, ref) !== null,
    canMove,
    applyMove,
    clickPile,
    autoTarget: () => null,
    isWon,
    hint,
  }
}

export const spider1 = makeEngine('spider-1', 'Spider (1 Suit)', 1)
export const spider2 = makeEngine('spider-2', 'Spider (2 Suit)', 2)
export const spider4 = makeEngine('spider-4', 'Spider (4 Suit)', 4)
