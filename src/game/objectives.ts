export type ObjectiveId = 'clear' | 'time' | 'nohint' | 'lowmoves' | 'noundo' | 'nocycle'

export interface Metrics {
  timeMs: number
  hints: number
  undos: number
  moves: number
  cycled: boolean
}

export interface Objective {
  id: ObjectiveId
  label: string
  short: string
}

const TIME_LIMIT_MS = 4 * 60 * 1000

function movesThreshold(family: string): number {
  if (family === 'Spider') return 220
  if (family === 'FreeCell') return 110
  return 130
}

export function makeObjective(id: ObjectiveId, family: string): Objective {
  switch (id) {
    case 'time':
      return { id, label: 'Win in under 4 minutes', short: 'Under 4:00' }
    case 'nohint':
      return { id, label: 'Win without using a hint', short: 'No hints' }
    case 'lowmoves':
      return {
        id,
        label: `Win in fewer than ${movesThreshold(family)} moves`,
        short: `< ${movesThreshold(family)} moves`,
      }
    case 'noundo':
      return { id, label: 'Win without using Undo', short: 'No undo' }
    case 'nocycle':
      return { id, label: 'Build every foundation before recycling the stock', short: 'No recycle' }
    default:
      return { id: 'clear', label: 'Clear the whole board', short: 'Clear the board' }
  }
}

export function objectiveMet(obj: Objective, m: Metrics, family: string): boolean {
  switch (obj.id) {
    case 'time':
      return m.timeMs <= TIME_LIMIT_MS
    case 'nohint':
      return m.hints === 0
    case 'lowmoves':
      return m.moves < movesThreshold(family)
    case 'noundo':
      return m.undos === 0
    case 'nocycle':
      return !m.cycled
    default:
      return true
  }
}
