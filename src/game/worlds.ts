import { ObjectiveId } from './objectives'
import { isPlayable } from './registry'

export interface WorldDef {
  id: string
  name: string
  region: string
  icon: string
  family: string
  blurb: string
  stages: number
  unlockLevel: number
  accent: [string, string]
  /** Engine id to use for a given 1-based stage (families can escalate). */
  engineForStage: (stage: number) => string
}

export type Difficulty = 'Casual' | 'Normal' | 'Hard' | 'Expert'

export const WORLDS: WorldDef[] = [
  {
    id: 'medieval',
    name: 'Medieval Kingdom',
    region: 'The Kingdom',
    icon: '\uD83C\uDFF0',
    family: 'Klondike',
    blurb: 'Rebuild the kingdom, one Klondike deal at a time.',
    stages: 12,
    unlockLevel: 1,
    accent: ['#f4cf6b', '#6b8f3a'],
    engineForStage: (s) => (s >= 8 ? 'klondike-3' : 'klondike-1'),
  },
  {
    id: 'pirate',
    name: 'Pirate Isles',
    region: 'The Isles',
    icon: '\uD83C\uDFF4\u200D\u2620\uFE0F',
    family: 'Spider',
    blurb: 'Weave webs of cards across the seven seas.',
    stages: 12,
    unlockLevel: 2,
    accent: ['#7ad0ff', '#1f6f8f'],
    engineForStage: (s) => (s >= 6 ? 'spider-2' : 'spider-1'),
  },
  {
    id: 'crystal',
    name: 'Crystal Caverns',
    region: 'The Deep',
    icon: '\uD83D\uDC8E',
    family: 'FreeCell',
    blurb: 'Every cell counts in the glittering dark.',
    stages: 10,
    unlockLevel: 3,
    accent: ['#b78bff', '#5836a8'],
    engineForStage: () => 'freecell',
  },
  {
    id: 'dragon',
    name: "Dragon's Keep",
    region: 'The Summit',
    icon: '\uD83D\uDC09',
    family: 'Expert',
    blurb: 'Only masters may challenge the dragon.',
    stages: 8,
    unlockLevel: 6,
    accent: ['#ff8a5a', '#a02318'],
    engineForStage: (s) => (s % 2 === 0 ? 'spider-4' : 'klondike-3'),
  },
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    region: 'The Sands',
    icon: '\uD83D\uDD3A',
    family: 'Pyramid',
    blurb: 'Pyramid solitaire awaits beyond the dunes.',
    stages: 10,
    unlockLevel: 9,
    accent: ['#f4d06b', '#b07a1f'],
    engineForStage: () => 'pyramid', // not yet implemented -> world stays locked
  },
]

export function getWorld(id: string): WorldDef | undefined {
  return WORLDS.find((w) => w.id === id)
}

/** A world is playable only if all of its stage engines exist. */
export function worldPlayable(w: WorldDef): boolean {
  for (let s = 1; s <= w.stages; s++) {
    if (!isPlayable(w.engineForStage(s))) return false
  }
  return true
}

export function difficultyForStage(stage: number, worldStages: number): Difficulty {
  const ratio = stage / worldStages
  if (ratio <= 0.25) return 'Casual'
  if (ratio <= 0.55) return 'Normal'
  if (ratio <= 0.8) return 'Hard'
  return 'Expert'
}

const OBJECTIVE_CYCLE: ObjectiveId[] = ['clear', 'time', 'nohint', 'lowmoves', 'noundo', 'nocycle']

export function objectiveIdForStage(stage: number, family: string): ObjectiveId {
  if (stage === 1) return 'clear'
  let id = OBJECTIVE_CYCLE[(stage - 1) % OBJECTIVE_CYCLE.length]
  if (id === 'nocycle' && family !== 'Klondike') id = 'time' // recycle only meaningful in Klondike
  return id
}
