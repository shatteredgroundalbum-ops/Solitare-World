import { Stats, playerLevel } from '../game/stats'

export function PlayerCard({ stats }: { stats: Stats }) {
  const { level, into, span } = playerLevel(stats.playerXp)
  const pct = Math.round((into / span) * 100)
  return (
    <div className="player-card">
      <div className="avatar">{'\u2657'}</div>
      <div className="player-meta">
        <div className="player-name">Player</div>
        <div className="player-level">Level {level}</div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
          <span className="xp-text">
            {into} / {span} XP
          </span>
        </div>
      </div>
    </div>
  )
}

export function ResourceBar({ stats }: { stats: Stats }) {
  return (
    <div className="resources">
      <div className="resource gold">
        <span className="res-icon">{'\uD83D\uDFE1'}</span>
        <span className="res-value">{stats.gold.toLocaleString()}</span>
        <span className="res-plus">+</span>
      </div>
      <div className="resource gems">
        <span className="res-icon">{'\uD83D\uDC8E'}</span>
        <span className="res-value">{stats.gems.toLocaleString()}</span>
        <span className="res-plus">+</span>
      </div>
      <div className="resource energy">
        <span className="res-icon">{'\u26A1'}</span>
        <span className="res-value">{stats.energy}</span>
        <span className="res-plus">+</span>
      </div>
    </div>
  )
}

export function IconButton({
  label,
  icon,
  badge,
  onClick,
}: {
  label: string
  icon: string
  badge?: number
  onClick?: () => void
}) {
  return (
    <button className="icon-btn" title={label} aria-label={label} onClick={onClick}>
      <span className="icon-glyph">{icon}</span>
      <span className="icon-label">{label}</span>
      {badge ? <span className="badge">{badge}</span> : null}
    </button>
  )
}
