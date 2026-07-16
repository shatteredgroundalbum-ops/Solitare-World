import { ENGINES } from './registry'
import { Objective, makeObjective } from './objectives'
import { Difficulty, WorldDef, difficultyForStage, objectiveIdForStage } from './worlds'

export interface GameSession {
  engineId: string
  worldId: string | null
  worldName: string | null
  stage: number | null
  difficulty: Difficulty
  objective: Objective
}

export function buildWorldSession(world: WorldDef, stage: number): GameSession {
  const engineId = world.engineForStage(stage)
  const family = ENGINES[engineId]?.family ?? world.family
  return {
    engineId,
    worldId: world.id,
    worldName: world.name,
    stage,
    difficulty: difficultyForStage(stage, world.stages),
    objective: makeObjective(objectiveIdForStage(stage, family), family),
  }
}

export function buildFreeSession(engineId: string): GameSession {
  const family = ENGINES[engineId]?.family ?? ''
  return {
    engineId,
    worldId: null,
    worldName: null,
    stage: null,
    difficulty: 'Normal',
    objective: makeObjective('clear', family),
  }
}
