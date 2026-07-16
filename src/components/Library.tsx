import { LIBRARY, isPlayable } from '../game/registry'
import { Stats, masteryLevel } from '../game/stats'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onPlay: (engineId: string) => void
  onExit: () => void
}

export function Library({ stats, onPlay, onExit }: Props) {
  return (
    <div className="game-root">
      <div className="bg-layer" />
      <div className="bg-vignette" />

      <div className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={onExit} title="Back">
            {'\u2039'} Dashboard
          </button>
          <PlayerCard stats={stats} />
        </div>
        <ResourceBar stats={stats} />
      </div>

      <div className="library">
        <h2 className="library-title">Solitaire Library</h2>
        <div className="library-cats">
          {LIBRARY.map((cat) => (
            <div className="library-cat" key={cat.name}>
              <div className="cat-header">
                <span className="cat-icon">{cat.icon}</span>
                {cat.name}
              </div>
              <div className="cat-entries">
                {cat.entries.map((entry) => {
                  const playable = isPlayable(entry.id)
                  const m = stats.byGame[entry.id]
                  return (
                    <button
                      key={entry.id}
                      className={`variant${playable ? '' : ' locked'}`}
                      disabled={!playable}
                      onClick={() => playable && onPlay(entry.id)}
                    >
                      <span className="variant-name">{entry.name}</span>
                      {playable ? (
                        <span className="variant-meta">
                          {m ? `Mastery ${masteryLevel(m.xp)}` : 'Play'}
                        </span>
                      ) : (
                        <span className="variant-soon">Coming soon</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
