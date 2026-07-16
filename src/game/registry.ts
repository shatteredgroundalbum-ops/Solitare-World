import { Engine } from './engine'
import { klondikeDraw1, klondikeDraw3 } from './engines/klondike'
import { freecell } from './engines/freecell'
import { spider1, spider2, spider4 } from './engines/spider'

export const ENGINES: Record<string, Engine> = {
  [klondikeDraw1.id]: klondikeDraw1,
  [klondikeDraw3.id]: klondikeDraw3,
  [freecell.id]: freecell,
  [spider1.id]: spider1,
  [spider2.id]: spider2,
  [spider4.id]: spider4,
}

export interface LibraryEntry {
  id: string
  name: string
}

export interface LibraryCategory {
  name: string
  icon: string
  entries: LibraryEntry[]
}

// The full concept library. Entries whose id maps to an engine in ENGINES are
// playable now; the rest are shown as "Coming soon" to convey the platform scope.
export const LIBRARY: LibraryCategory[] = [
  {
    name: 'Classic',
    icon: '\u2660',
    entries: [
      { id: 'klondike-1', name: 'Klondike (Draw 1)' },
      { id: 'klondike-3', name: 'Klondike (Draw 3)' },
      { id: 'vegas', name: 'Vegas' },
      { id: 'thoughtful', name: 'Thoughtful' },
    ],
  },
  {
    name: 'Spider',
    icon: '\uD83D\uDD77',
    entries: [
      { id: 'spider-1', name: 'Spider (1 Suit)' },
      { id: 'spider-2', name: 'Spider (2 Suit)' },
      { id: 'spider-4', name: 'Spider (4 Suit)' },
      { id: 'spiderette', name: 'Spiderette' },
    ],
  },
  {
    name: 'FreeCell',
    icon: '\u2663',
    entries: [
      { id: 'freecell', name: 'FreeCell' },
      { id: 'eight-off', name: 'Eight Off' },
      { id: 'bakers-game', name: "Baker's Game" },
      { id: 'seahaven', name: 'Seahaven Towers' },
    ],
  },
  {
    name: 'Pyramid',
    icon: '\u25B2',
    entries: [
      { id: 'pyramid', name: 'Pyramid' },
      { id: 'giza', name: 'Giza' },
      { id: 'tuts-tomb', name: "Tut's Tomb" },
    ],
  },
  {
    name: 'Golf',
    icon: '\u26F3',
    entries: [
      { id: 'golf', name: 'Golf' },
      { id: 'tripeaks', name: 'TriPeaks' },
      { id: 'black-hole', name: 'Black Hole' },
    ],
  },
  {
    name: 'Yukon',
    icon: '\u2699',
    entries: [
      { id: 'yukon', name: 'Yukon' },
      { id: 'russian', name: 'Russian Solitaire' },
      { id: 'alaska', name: 'Alaska' },
    ],
  },
  {
    name: 'More Variants',
    icon: '\u2726',
    entries: [
      { id: 'forty-thieves', name: 'Forty Thieves' },
      { id: 'canfield', name: 'Canfield' },
      { id: 'scorpion', name: 'Scorpion' },
      { id: 'fan', name: 'Fan' },
      { id: 'calculation', name: 'Calculation' },
      { id: 'accordion', name: 'Accordion' },
      { id: 'beleaguered', name: 'Beleaguered Castle' },
      { id: 'monte-carlo', name: 'Monte Carlo' },
      { id: 'clock', name: 'Clock' },
    ],
  },
]

export function isPlayable(id: string): boolean {
  return id in ENGINES
}

export function totalVariants(): number {
  return LIBRARY.reduce((sum, c) => sum + c.entries.length, 0)
}
