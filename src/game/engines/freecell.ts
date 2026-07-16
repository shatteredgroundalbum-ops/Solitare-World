import { Card, makeDecks, shuffle } from '../cards'
import { Engine, GameState, Hint, LayoutRow, MoveRef, cloneState, top } from '../engine'
import { canStackAltColor, canStackFoundation, isAltColorRun } from '../rules'

const FREE = ['free0', 'free1', 'free2', 'free3']
const FOUNDATIONS = ['fnd0', 'fnd1', 'fnd2', 'fnd3']
const TABLEAU = ['tab0', 'tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6', 'tab7']

function createFreeCell(): GameState {
  const deck = shuffle(makeDecks(1)).map((c) => ({ ...c, faceUp: true }))
  const piles: Record<string, Card[]> = {}
  FREE.forEach((f) => (piles[f] = []))
  FOUNDATIONS.forEach((f) => (piles[f] = []))
  TABLEAU.forEach((t) => (piles[t] = []))
  deck.forEach((card, i) => piles[TABLEAU[i % 8]].push(card))
  return { piles, meta: {} }
}

function maxSupermove(s: GameState, destPileId: string): number {
  const freeEmpty = FREE.filter((f) => s.piles[f].length === 0).length
  let emptyCols = TABLEAU.filter((t) => s.piles[t].length === 0).length
  if (destPileId.startsWith('tab') && s.piles[destPileId].length === 0) emptyCols -= 1
  return (1 + freeEmpty) * Math.pow(2, Math.max(0, emptyCols))
}

function movingRun(s: GameState, from: MoveRef): Card[] | null {
  const pile = s.piles[from.pileId]
  if (!pile) return null
  if (from.pileId.startsWith('free') || from.pileId.startsWith('fnd')) {
    return from.cardIndex === pile.length - 1 && pile.length ? [pile[from.cardIndex]] : null
  }
  const run = pile.slice(from.cardIndex)
  return isAltColorRun(run) ? run : null
}

function canMove(s: GameState, from: MoveRef, toPileId: string): boolean {
  const run = movingRun(s, from)
  if (!run) return false
  const head = run[0]
  if (toPileId.startsWith('free')) {
    return run.length === 1 && s.piles[toPileId].length === 0
  }
  if (toPileId.startsWith('fnd')) {
    return run.length === 1 && canStackFoundation(head, top(s.piles[toPileId]))
  }
  if (toPileId.startsWith('tab')) {
    if (toPileId === from.pileId) return false
    if (!canStackAltColor(head, top(s.piles[toPileId]))) return false
    return run.length <= maxSupermove(s, toPileId)
  }
  return false
}

function applyMove(s: GameState, from: MoveRef, toPileId: string): GameState {
  const next = cloneState(s)
  const run = movingRun(next, from)
  if (!run) return s
  next.piles[from.pileId].splice(from.cardIndex)
  next.piles[toPileId].push(...run.map((c) => ({ ...c, faceUp: true })))
  return next
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
  FREE.forEach((f) => {
    if (s.piles[f].length) refs.push({ pileId: f, cardIndex: 0 })
  })
  TABLEAU.forEach((t) => {
    const col = s.piles[t]
    for (let i = 0; i < col.length; i++) refs.push({ pileId: t, cardIndex: i })
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
        if (from.cardIndex === 0 && s.piles[from.pileId].length === 1 && s.piles[t].length === 0) {
          continue
        }
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
        ...FREE.map((id) => ({ pileId: id, kind: 'free' as const, fan: 'none' as const })),
        { spacer: true },
        ...FOUNDATIONS.map((id) => ({ pileId: id, kind: 'foundation' as const, fan: 'none' as const })),
      ],
    },
    {
      slots: TABLEAU.map((id) => ({ pileId: id, kind: 'tableau' as const, fan: 'down' as const })),
    },
  ]
}

export const freecell: Engine = {
  id: 'freecell',
  name: 'FreeCell',
  family: 'FreeCell',
  instruction: 'Use the free cells to build all four foundations from Ace to King.',
  create: createFreeCell,
  layout,
  canPickUp: (s, ref) => movingRun(s, ref) !== null,
  canMove,
  applyMove,
  clickPile: () => null,
  autoTarget,
  isWon,
  hint,
}
