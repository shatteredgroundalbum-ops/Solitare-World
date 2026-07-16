import { Card, makeDecks, shuffle } from '../cards'
import {
  Engine,
  GameState,
  Hint,
  LayoutRow,
  MoveRef,
  cloneState,
  top,
} from '../engine'
import { canStackAltColor, canStackFoundation, isAltColorRun } from '../rules'

const FOUNDATIONS = ['fnd0', 'fnd1', 'fnd2', 'fnd3']
const TABLEAU = ['tab0', 'tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6']

function createKlondike(drawCount: number): GameState {
  const deck = shuffle(makeDecks(1))
  const piles: Record<string, Card[]> = { stock: [], waste: [] }
  FOUNDATIONS.forEach((f) => (piles[f] = []))
  TABLEAU.forEach((t) => (piles[t] = []))

  let pos = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[pos++], faceUp: row === col }
      piles[TABLEAU[col]].push(card)
    }
  }
  piles.stock = deck.slice(pos).map((c) => ({ ...c, faceUp: false }))
  return { piles, meta: { drawCount } }
}

function movingRun(s: GameState, from: MoveRef): Card[] | null {
  const pile = s.piles[from.pileId]
  if (!pile) return null
  if (from.pileId === 'stock') return null
  if (from.pileId === 'waste' || from.pileId.startsWith('fnd')) {
    return from.cardIndex === pile.length - 1 && pile.length ? [pile[from.cardIndex]] : null
  }
  const run = pile.slice(from.cardIndex)
  return isAltColorRun(run) ? run : null
}

function applyMove(s: GameState, from: MoveRef, toPileId: string): GameState {
  const next = cloneState(s)
  const run = movingRun(next, from)
  if (!run) return s
  next.piles[from.pileId].splice(from.cardIndex)
  const src = next.piles[from.pileId]
  if ((from.pileId.startsWith('tab')) && src.length && !top(src)!.faceUp) {
    top(src)!.faceUp = true
  }
  next.piles[toPileId].push(...run.map((c) => ({ ...c, faceUp: true })))
  return next
}

function canMove(s: GameState, from: MoveRef, toPileId: string): boolean {
  const run = movingRun(s, from)
  if (!run) return false
  const head = run[0]
  if (toPileId.startsWith('fnd')) {
    return run.length === 1 && canStackFoundation(head, top(s.piles[toPileId]))
  }
  if (toPileId.startsWith('tab')) {
    if (toPileId === from.pileId) return false
    return canStackAltColor(head, top(s.piles[toPileId]))
  }
  return false
}

function clickPile(s: GameState, pileId: string): GameState | null {
  if (pileId !== 'stock') return null
  const next = cloneState(s)
  const drawCount = next.meta.drawCount || 1
  if (next.piles.stock.length > 0) {
    const n = Math.min(drawCount, next.piles.stock.length)
    for (let i = 0; i < n; i++) {
      const card = next.piles.stock.pop()!
      card.faceUp = true
      next.piles.waste.push(card)
    }
    return next
  }
  if (next.piles.waste.length > 0) {
    next.piles.stock = next.piles.waste.reverse().map((c) => ({ ...c, faceUp: false }))
    next.piles.waste = []
    return next
  }
  return null
}

function autoTarget(s: GameState, from: MoveRef): string | null {
  const run = movingRun(s, from)
  if (!run || run.length !== 1) return null
  for (const f of FOUNDATIONS) {
    if (canStackFoundation(run[0], top(s.piles[f]))) return f
  }
  return null
}

function sources(s: GameState): MoveRef[] {
  const refs: MoveRef[] = []
  if (s.piles.waste.length) {
    refs.push({ pileId: 'waste', cardIndex: s.piles.waste.length - 1 })
  }
  TABLEAU.forEach((t) => {
    const col = s.piles[t]
    const firstUp = col.findIndex((c) => c.faceUp)
    if (firstUp >= 0) {
      for (let i = firstUp; i < col.length; i++) refs.push({ pileId: t, cardIndex: i })
    }
  })
  return refs
}

function hint(s: GameState): Hint | null {
  const srcs = sources(s)
  for (const from of srcs) {
    for (const f of FOUNDATIONS) {
      if (canMove(s, from, f)) return { from, toPileId: f }
    }
  }
  for (const from of srcs) {
    for (const t of TABLEAU) {
      if (canMove(s, from, t)) {
        // Ignore no-op king-to-empty shuffles.
        if (from.cardIndex === 0 && s.piles[t].length === 0) continue
        return { from, toPileId: t }
      }
    }
  }
  return null
}

function isWon(s: GameState): boolean {
  return FOUNDATIONS.reduce((sum, f) => sum + s.piles[f].length, 0) === 52
}

function layout(): LayoutRow[] {
  return [
    {
      slots: [
        ...FOUNDATIONS.map((id) => ({ pileId: id, kind: 'foundation' as const, fan: 'none' as const })),
        { spacer: true },
        { pileId: 'waste', kind: 'waste' as const, fan: 'right' as const },
        { pileId: 'stock', kind: 'stock' as const, fan: 'none' as const },
      ],
    },
    {
      slots: TABLEAU.map((id) => ({ pileId: id, kind: 'tableau' as const, fan: 'down' as const })),
    },
  ]
}

function makeEngine(id: string, name: string, drawCount: number): Engine {
  return {
    id,
    name,
    family: 'Klondike',
    instruction: 'Move all cards to the Foundations from Ace to King.',
    create: () => createKlondike(drawCount),
    layout,
    canPickUp: (s, ref) => movingRun(s, ref) !== null,
    canMove,
    applyMove,
    clickPile,
    autoTarget,
    isWon,
    hint,
  }
}

export const klondikeDraw1 = makeEngine('klondike-1', 'Klondike (Draw 1)', 1)
export const klondikeDraw3 = makeEngine('klondike-3', 'Klondike (Draw 3)', 3)
