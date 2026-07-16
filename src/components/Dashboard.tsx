import { useState } from 'react'
import { ENGINES, totalVariants } from '../game/registry'
import { WORLDS, difficultyForStage, getWorld, worldPlayable } from '../game/worlds'
import { Stats, fmtDuration, playerLevel, worldCompletion } from '../game/stats'
import { LivingBackground } from './LivingBackground'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onContinue: () => void
  onPlay: () => void
  onWorldMap: () => void
  onOpenStats: () => void
  onOpenCollection: () => void
}

function ProgressRow({ label, pct, detail }: { label: string; pct: number; detail: string }) {
  return (
    <div className="prog-row">
      <div className="prog-head">
        <span className="prog-label">{label}</span>
        <span className="prog-detail">{detail}</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  )
}

export function Dashboard({
  stats,
  onContinue,
  onPlay,
  onWorldMap,
  onOpenStats,
  onOpenCollection,
}: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const soon = (name: string) => () => setToast(`${name} is coming soon.`)

  const level = playerLevel(stats.playerXp)
  const lastEngine = stats.lastGameId ? ENGINES[stats.lastGameId] : undefined
  const lastWorld = stats.lastWorldId ? getWorld(stats.lastWorldId) : undefined

  // Overall world completion (average across playable worlds).
  const playableWorlds = WORLDS.filter(worldPlayable)
  const worldPct = Math.round(
    playableWorlds.reduce((s, w) => s + worldCompletion(stats, w.id, w.stages), 0) /
      Math.max(1, playableWorlds.length),
  )

  const continueLabel = lastEngine
    ? lastWorld
      ? `${lastWorld.name} \u00B7 Stage ${Math.min((stats.worldProgress[lastWorld.id] ?? 0) + 1, lastWorld.stages)}`
      : lastEngine.name
    : 'Start your adventure'

  const nowPlaying = lastEngine
    ? {
        variant: lastEngine.name,
        world: lastWorld?.name ?? 'Free Play',
        stage: stats.lastStage ? `Stage ${stats.lastStage}` : '\u2014',
        difficulty:
          lastWorld && stats.lastStage
            ? difficultyForStage(stats.lastStage, lastWorld.stages)
            : 'Normal',
        best: (stats.bestScore[stats.lastGameId!] ?? 0).toLocaleString(),
      }
    : null

  return (
    <div className="game-root">
      <LivingBackground />

      <div className="topbar">
        <div className="topbar-left">
          <PlayerCard stats={stats} />
        </div>
        <ResourceBar stats={stats} />
      </div>

      <div className="dashboard">
        <div className="dash-hero">
          <h1 className="dash-title">Solitaire World 3D</h1>
          <p className="dash-sub">
            {totalVariants()} variants {'\u00B7'} {WORLDS.length} worlds {'\u00B7'} {stats.gamesWon}{' '}
            wins {'\u00B7'} best streak {stats.bestStreak}
          </p>
        </div>

        <div className="dash-main">
          <div className="dash-left">
            <button className="continue-btn" onClick={onContinue}>
              <span className="continue-play">{'\u25B6'}</span>
              <span className="continue-text">
                <span className="continue-title">Continue Adventure</span>
                <span className="continue-sub">{continueLabel}</span>
              </span>
            </button>

            <div className="secondary-row">
              <button className="secondary-btn" onClick={onPlay}>
                <span className="sec-icon">{'\uD83C\uDCCF'}</span>Play
              </button>
              <button className="secondary-btn" onClick={onWorldMap}>
                <span className="sec-icon">{'\uD83D\uDDFA'}</span>World Map
              </button>
              <button className="secondary-btn" onClick={soon('Events')}>
                <span className="sec-icon">{'\uD83C\uDF89'}</span>Events
              </button>
            </div>
          </div>

          <div className="dash-right">
            <div className="now-playing panel">
              <div className="panel-title">Now Playing</div>
              {nowPlaying ? (
                <>
                  <div className="np-variant">{nowPlaying.variant}</div>
                  <div className="np-grid">
                    <div>
                      <span className="np-k">World</span>
                      <span className="np-v">{nowPlaying.world}</span>
                    </div>
                    <div>
                      <span className="np-k">Stage</span>
                      <span className="np-v">{nowPlaying.stage}</span>
                    </div>
                    <div>
                      <span className="np-k">Difficulty</span>
                      <span className="np-v">{nowPlaying.difficulty}</span>
                    </div>
                    <div>
                      <span className="np-k">Best Score</span>
                      <span className="np-v">{nowPlaying.best}</span>
                    </div>
                    <div>
                      <span className="np-k">Streak</span>
                      <span className="np-v">{stats.currentStreak}</span>
                    </div>
                    <div>
                      <span className="np-k">Time Played</span>
                      <span className="np-v">{fmtDuration(stats.totalTimeMs)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="np-empty">No game yet — press Play to begin.</div>
              )}
            </div>

            <div className="progress-panel panel">
              <div className="panel-title">Progression</div>
              <ProgressRow
                label="Player Level"
                pct={(level.into / level.span) * 100}
                detail={`Lv ${level.level}`}
              />
              <ProgressRow label="World Completion" pct={worldPct} detail={`${worldPct}%`} />
              <ProgressRow
                label="Daily Quests"
                pct={(Math.min(3, stats.gamesWon) / 3) * 100}
                detail={`${Math.min(3, stats.gamesWon)}/3`}
              />
              <ProgressRow
                label="Weekly Progress"
                pct={(Math.min(10, stats.gamesWon) / 10) * 100}
                detail={`${Math.min(10, stats.gamesWon)}/10`}
              />
              <ProgressRow
                label="Season Pass"
                pct={(level.level / 50) * 100}
                detail={`Tier ${level.level}`}
              />
              <ProgressRow
                label="Collection"
                pct={(Math.min(18, stats.gamesWon + 3) / 18) * 100}
                detail={`${Math.min(18, stats.gamesWon + 3)}/18`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onOpenCollection}>
          <span className="nav-icon">{'\uD83C\uDFB4'}</span>Collection
        </button>
        <button className="nav-item" onClick={onOpenStats}>
          <span className="nav-icon">{'\uD83C\uDFC5'}</span>Achievements
        </button>
        <button className="nav-item" onClick={soon('Shop')}>
          <span className="nav-icon">{'\uD83D\uDED2'}</span>Shop
        </button>
        <button className="nav-item" onClick={soon('Friends')}>
          <span className="nav-icon">{'\uD83D\uDC65'}</span>Friends
        </button>
        <button className="nav-item" onClick={onOpenStats}>
          <span className="nav-icon">{'\uD83D\uDC64'}</span>Profile
        </button>
      </div>

      {toast && (
        <div className="toast" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
    </div>
  )
}
