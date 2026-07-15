import { ENGINES } from '../game/registry'
import { Stats, masteryLevel, playerLevel, winRate } from '../game/stats'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onExit: () => void
}

function fmtTime(ms: number | null): string {
  if (ms === null) return '\u2014'
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

export function StatsScreen({ stats, onExit }: Props) {
  const { level } = playerLevel(stats.playerXp)
  const rows = Object.keys(ENGINES).map((id) => ({
    id,
    name: ENGINES[id].name,
    m: stats.byGame[id] ?? { plays: 0, wins: 0, xp: 0 },
  }))

  const summary = [
    { label: 'Player Level', value: level },
    { label: 'Games Played', value: stats.gamesPlayed },
    { label: 'Games Won', value: stats.gamesWon },
    { label: 'Win Rate', value: `${winRate(stats)}%` },
    { label: 'Current Streak', value: stats.currentStreak },
    { label: 'Best Streak', value: stats.bestStreak },
    { label: 'Fastest Win', value: fmtTime(stats.fastestMs) },
    { label: 'Total XP', value: stats.playerXp },
  ]

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

      <div className="stats-screen">
        <h2 className="library-title">Profile &amp; Statistics</h2>
        <div className="stat-cards">
          {summary.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <h3 className="mastery-title">Game Mastery</h3>
        <div className="mastery-table">
          <div className="mastery-row mastery-head">
            <span>Game</span>
            <span>Mastery</span>
            <span>Wins</span>
            <span>Plays</span>
            <span>XP</span>
          </div>
          {rows.map((r) => (
            <div className="mastery-row" key={r.id}>
              <span>{r.name}</span>
              <span>{masteryLevel(r.m.xp)}</span>
              <span>{r.m.wins}</span>
              <span>{r.m.plays}</span>
              <span>{r.m.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
