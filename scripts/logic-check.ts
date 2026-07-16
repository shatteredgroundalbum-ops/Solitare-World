// Standalone sanity checks for all solitaire engines.
// Run via: npm run check:logic
import { Card, Suit } from '../src/game/cards'
import { GameState } from '../src/game/engine'
import { klondikeDraw1 } from '../src/game/engines/klondike'
import { freecell } from '../src/game/engines/freecell'
import { spider1 } from '../src/game/engines/spider'

let passed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('FAIL: ' + msg)
  passed++
  console.log('ok - ' + msg)
}

let uid = 0
function c(suit: Suit, rank: number, faceUp = true): Card {
  return { id: `${suit}-${rank}-${uid++}`, suit, rank, faceUp }
}

function state(piles: Record<string, Card[]>, meta: Record<string, number> = {}): GameState {
  return { piles, meta }
}

function empties(prefix: string, n: number): Record<string, Card[]> {
  const o: Record<string, Card[]> = {}
  for (let i = 0; i < n; i++) o[`${prefix}${i}`] = []
  return o
}

// ---------------- Klondike ----------------
{
  const s = state(
    {
      stock: [c('clubs', 5, false)],
      waste: [],
      ...empties('fnd', 4),
      ...empties('tab', 7),
    },
    { drawCount: 1 },
  )
  s.piles.tab0 = [c('spades', 7)]
  s.piles.tab1 = [c('hearts', 9, false), c('hearts', 6)]

  const red6 = { pileId: 'tab1', cardIndex: 1 }
  assert(klondikeDraw1.canMove(s, red6, 'tab0'), 'klondike: red 6 -> black 7')
  const moved = klondikeDraw1.applyMove(s, red6, 'tab0')
  assert(moved.piles.tab0.length === 2, 'klondike: destination grew to 2')
  assert(moved.piles.tab1[0].faceUp, 'klondike: exposed card flipped up')

  const drawn = klondikeDraw1.clickPile(s, 'stock')!
  assert(drawn.piles.waste.length === 1 && drawn.piles.waste[0].faceUp, 'klondike: draw to waste')

  const aceState = state({ waste: [c('hearts', 1)], stock: [], ...empties('fnd', 4), ...empties('tab', 7) }, { drawCount: 1 })
  assert(klondikeDraw1.autoTarget(aceState, { pileId: 'waste', cardIndex: 0 }) === 'fnd0', 'klondike: ace auto-targets foundation')

  const win = state({ waste: [], stock: [], ...empties('fnd', 4), ...empties('tab', 7) })
  ;['hearts', 'clubs', 'diamonds', 'spades'].forEach((suit, i) => {
    win.piles[`fnd${i}`] = Array.from({ length: 13 }, (_, r) => c(suit as Suit, r + 1))
  })
  assert(klondikeDraw1.isWon(win), 'klondike: full foundations = win')
}

// ---------------- FreeCell ----------------
{
  const s = state({ ...empties('free', 4), ...empties('fnd', 4), ...empties('tab', 8) })
  s.piles.tab0 = [c('clubs', 9)]
  s.piles.tab1 = [c('hearts', 8), c('spades', 7)] // valid 2-card run
  const run = { pileId: 'tab1', cardIndex: 0 }
  // With 4 free cells + empty columns, a 2-card supermove is allowed.
  assert(freecell.canMove(s, run, 'tab0'), 'freecell: 2-card run -> black 9 (supermove)')

  // Restrict movement: fill all free cells and leave no empty columns => max supermove 1.
  const tight = state({ ...empties('free', 4), ...empties('fnd', 4), ...empties('tab', 8) })
  tight.piles.free0 = [c('diamonds', 2)]
  tight.piles.free1 = [c('diamonds', 3)]
  tight.piles.free2 = [c('diamonds', 4)]
  tight.piles.free3 = [c('diamonds', 5)]
  for (let i = 0; i < 8; i++) tight.piles[`tab${i}`] = [c('clubs', 13 - i)]
  tight.piles.tab0 = [c('spades', 9)] // black 9: accepts a red 8 head
  tight.piles.tab1 = [c('hearts', 8), c('spades', 7)] // valid red8-black7 run
  tight.piles.tab2 = [c('diamonds', 8)] // red 8: accepts a black 7 single
  assert(
    !freecell.canMove(tight, { pileId: 'tab1', cardIndex: 0 }, 'tab0'),
    'freecell: 2-card run blocked when no free cells / empty columns',
  )
  assert(
    freecell.canMove(tight, { pileId: 'tab1', cardIndex: 1 }, 'tab2'),
    'freecell: single card still moves when supermove is 1',
  )

  const freeMove = state({ ...empties('free', 4), ...empties('fnd', 4), ...empties('tab', 8) })
  freeMove.piles.tab0 = [c('spades', 10)]
  assert(freecell.canMove(freeMove, { pileId: 'tab0', cardIndex: 0 }, 'free0'), 'freecell: card -> empty free cell')
}

// ---------------- Spider (1 suit) ----------------
{
  const s = state({ stock: [], ...empties('fnd', 8), ...empties('tab', 10) }, { suitCount: 1 })
  s.piles.tab0 = [c('spades', 8)]
  s.piles.tab1 = [c('spades', 7), c('spades', 6)] // same-suit run
  const run = { pileId: 'tab1', cardIndex: 0 }
  assert(spider1.canMove(s, run, 'tab0'), 'spider: same-suit 7-6 run -> 8')

  // Auto-collect a completed King..Ace run into a foundation.
  const complete = state({ stock: [], ...empties('fnd', 8), ...empties('tab', 10) }, { suitCount: 1 })
  complete.piles.tab0 = [c('spades', 13), ...Array.from({ length: 11 }, (_, i) => c('spades', 12 - i))]
  // tab0 now holds K..2 (12 cards); place the Ace on tab1 and move it over to complete.
  complete.piles.tab1 = [c('spades', 1)]
  const afterComplete = spider1.applyMove(complete, { pileId: 'tab1', cardIndex: 0 }, 'tab0')
  assert(
    afterComplete.piles.fnd0.length === 13 && afterComplete.piles.tab0.length === 0,
    'spider: completed K-A run auto-moves to a foundation',
  )

  // Stock deal is blocked while a column is empty.
  const dealBlocked = state({ stock: [c('spades', 1, false)], ...empties('fnd', 8), ...empties('tab', 10) }, { suitCount: 1 })
  for (let i = 1; i < 10; i++) dealBlocked.piles[`tab${i}`] = [c('spades', 5)]
  assert(spider1.clickPile(dealBlocked, 'stock') === null, 'spider: cannot deal onto empty columns')

  const win = state({ stock: [], ...empties('fnd', 8), ...empties('tab', 10) }, { suitCount: 1 })
  for (let i = 0; i < 8; i++) win.piles[`fnd${i}`] = Array.from({ length: 13 }, (_, r) => c('spades', 13 - r))
  assert(spider1.isWon(win), 'spider: 8 completed runs = win')
}

console.log(`\nAll ${passed} checks passed.`)
