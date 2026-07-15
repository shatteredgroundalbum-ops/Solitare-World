// Standalone sanity checks for the Klondike rules engine.
// Run via: npx esbuild scripts/logic-check.ts --bundle --platform=node | node
import { Card } from '../src/game/cards'
import {
  GameState,
  applyMove,
  canMove,
  drawFromStock,
  foundationTargetFor,
  isWon,
} from '../src/game/klondike'

let passed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('FAIL: ' + msg)
  passed++
  console.log('ok - ' + msg)
}

function c(id: string, suit: Card['suit'], rank: number, faceUp = true): Card {
  return { id, suit, rank, faceUp }
}

// --- tableau-to-tableau move: red 6 onto black 7 ---
const s1: GameState = {
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [
    [c('spades-7', 'spades', 7)], // black 7
    [c('hearts-9', 'hearts', 9, false), c('hearts-6', 'hearts', 6)], // red 6 on top
    [],
    [],
    [],
    [],
    [],
  ],
}
const selRed6 = { pile: { type: 'tableau', index: 1 } as const, cardIndex: 1 }
assert(canMove(s1, selRed6, { type: 'tableau', index: 0 }), 'red 6 can move onto black 7')
const afterT2T = applyMove(s1, selRed6, { type: 'tableau', index: 0 })
assert(afterT2T.tableau[0].length === 2, 'destination column now has 2 cards')
assert(afterT2T.tableau[1].length === 1, 'source column reduced to 1 card')
assert(afterT2T.tableau[1][0].faceUp === true, 'newly exposed card flipped face up')

// --- invalid: red 6 cannot move onto red 7 (same color) ---
const s2: GameState = {
  ...s1,
  tableau: [[c('hearts-7', 'hearts', 7)], [c('diamonds-6', 'diamonds', 6)], [], [], [], [], []],
}
assert(
  !canMove(s2, { pile: { type: 'tableau', index: 1 }, cardIndex: 0 }, { type: 'tableau', index: 0 }),
  'red 6 cannot move onto red 7 (same color rejected)',
)

// --- moving a valid multi-card run ---
const s3: GameState = {
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [
    [c('clubs-9', 'clubs', 9)], // black 9
    [c('hearts-8', 'hearts', 8), c('spades-7', 'spades', 7)], // red8-black7 run
    [],
    [],
    [],
    [],
    [],
  ],
}
const runSel = { pile: { type: 'tableau', index: 1 } as const, cardIndex: 0 }
assert(canMove(s3, runSel, { type: 'tableau', index: 0 }), 'red-8/black-7 run can move onto black 9')
const afterRun = applyMove(s3, runSel, { type: 'tableau', index: 0 })
assert(afterRun.tableau[0].length === 3, 'run moved: destination has 3 cards')

// --- foundation: only Ace onto empty, then 2 same suit ---
const s4: GameState = {
  stock: [],
  waste: [c('hearts-1', 'hearts', 1)],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
}
assert(foundationTargetFor(s4, s4.waste[0]) >= 0, 'Ace has a valid foundation target')
const afterAce = applyMove(s4, { pile: { type: 'waste' }, cardIndex: 0 }, { type: 'foundation', index: 0 })
assert(afterAce.foundations[0].length === 1, 'Ace placed on foundation')

// --- stock draw and recycle ---
const s5: GameState = {
  stock: [c('clubs-2', 'clubs', 2, false)],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
}
const afterDraw = drawFromStock(s5)
assert(afterDraw.waste.length === 1 && afterDraw.waste[0].faceUp, 'draw flips a card to waste face up')
const afterRecycle = drawFromStock(afterDraw)
assert(afterRecycle.stock.length === 1 && afterRecycle.waste.length === 0, 'empty stock recycles waste')

// --- win detection ---
const full: Card[][] = ['hearts', 'clubs', 'diamonds', 'spades'].map((suit) =>
  Array.from({ length: 13 }, (_, i) => c(`${suit}-${i + 1}`, suit as Card['suit'], i + 1)),
)
const s6: GameState = { stock: [], waste: [], foundations: full, tableau: [[], [], [], [], [], [], []] }
assert(isWon(s6), 'full foundations detected as a win')

console.log(`\nAll ${passed} checks passed.`)
