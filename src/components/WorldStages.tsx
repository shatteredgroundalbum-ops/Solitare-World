import { ENGINES } from '../game/registry'
import { makeObjective } from '../game/objectives'
import { WorldDef, difficultyForStage, objectiveIdForStage } from '../game/worlds'
import { Stats, worldCompletion } from '../game/stats'
import { LivingBackground } from './LivingBackground'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  world: WorldDef
  onPlayStage: (stage: number) => void
  onExit: () => void
}

export function WorldStages({ stats, world, onPlayStage, onExit }: Props) {
  const cleared = Math.min(stats.worldProgress[world.id] ?? 0, world.stages)
  const pct = worldCompletion(stats, world.id, world.stages)
  const nextStage = Math.min(cleared + 1, world.stages)

  return (
    <div className="game-root">
      <LivingBackground />

      <div className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={onExit}>
            {'\u2039'} World Map
          </button>
          <PlayerCard stats={stats} />
        </div>
        <ResourceBar stats={stats} />
      </div>

      <div className="worldstages">
        <div className="world-header">
          <div className="world-header-icon">{world.icon}</div>
          <div className="world-header-text">
            <h2 className="library-title" style={{ margin: 0 }}>
              {world.name}
            </h2>
            <div className="world-blurb">{world.blurb}</div>
            <div className="world-bar wide">
              <div className="world-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="world-meta">
              {pct}% complete {'\u00B7'} {cleared}/{world.stages} stages cleared
            </div>
          </div>
          <button className="win-btn" onClick={() => onPlayStage(nextStage)}>
            {cleared === 0 ? 'Start' : cleared >= world.stages ? 'Replay' : 'Continue'}
          </button>
        </div>

        <div className="stage-grid">
          {Array.from({ length: world.stages }, (_, i) => i + 1).map((stage) => {
            const engineId = world.engineForStage(stage)
            const family = ENGINES[engineId]?.family ?? world.family
            const objective = makeObjective(objectiveIdForStage(stage, family), family)
            const difficulty = difficultyForStage(stage, world.stages)
            const isCleared = stage <= cleared
            const isLocked = stage > cleared + 1
            return (
              <button
                key={stage}
                className={`stage-tile${isCleared ? ' cleared' : ''}${isLocked ? ' locked' : ''}`}
                disabled={isLocked}
                onClick={() => !isLocked && onPlayStage(stage)}
              >
                <div className="stage-top">
                  <span className="stage-num">Stage {stage}</span>
                  {isCleared && <span className="stage-check">{'\u2714'}</span>}
                  {isLocked && <span className="stage-lock">{'\uD83D\uDD12'}</span>}
                </div>
                <div className="stage-engine">{ENGINES[engineId]?.name ?? family}</div>
                <div className={`stage-diff diff-${difficulty.toLowerCase()}`}>{difficulty}</div>
                <div className="stage-obj">{objective.short}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
