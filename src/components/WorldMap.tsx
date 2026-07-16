import { CSSProperties } from 'react'
import { WORLDS, worldPlayable } from '../game/worlds'
import { Stats, playerLevel, worldCompletion } from '../game/stats'
import { LivingBackground } from './LivingBackground'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onOpenWorld: (worldId: string) => void
  onExit: () => void
}

export function WorldMap({ stats, onOpenWorld, onExit }: Props) {
  const level = playerLevel(stats.playerXp).level

  return (
    <div className="game-root">
      <LivingBackground />

      <div className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={onExit}>
            {'\u2039'} Dashboard
          </button>
          <PlayerCard stats={stats} />
        </div>
        <ResourceBar stats={stats} />
      </div>

      <div className="worldmap">
        <h2 className="library-title">World Map</h2>
        <div className="world-path">
          {WORLDS.map((w, i) => {
            const playable = worldPlayable(w)
            const unlocked = playable && level >= w.unlockLevel
            const pct = worldCompletion(stats, w.id, w.stages)
            const locked = !unlocked
            return (
              <div
                key={w.id}
                className={`world-node${locked ? ' locked' : ''}`}
                style={{ ['--a1']: w.accent[0], ['--a2']: w.accent[1] } as CSSProperties}
                onClick={() => unlocked && onOpenWorld(w.id)}
              >
                <div className="world-icon">{w.icon}</div>
                <div className="world-info">
                  <div className="world-name">{w.name}</div>
                  <div className="world-family">{w.family}</div>
                  <div className="world-blurb">{w.blurb}</div>
                  {unlocked ? (
                    <>
                      <div className="world-bar">
                        <div className="world-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="world-meta">
                        {pct}% complete {'\u00B7'} {Math.min(stats.worldProgress[w.id] ?? 0, w.stages)}/
                        {w.stages} stages
                      </div>
                    </>
                  ) : (
                    <div className="world-locked">
                      {playable ? `Unlocks at Level ${w.unlockLevel}` : 'Coming soon'}
                    </div>
                  )}
                </div>
                {i < WORLDS.length - 1 && <div className="world-connector" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
