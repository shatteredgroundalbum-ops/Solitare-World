export interface PlayerStats {
  level: number
  xp: number
  xpMax: number
  gold: number
  gems: number
  energy: number
  stars: number
  starsMax: number
  chests: number
  chestsMax: number
  streak: number
  dailyProgress: number
  dailyGoal: number
  locationStage: number
  locationStages: number
}

function IconButton({ label, icon, badge }: { label: string; icon: string; badge?: number }) {
  return (
    <button className="icon-btn" title={label} aria-label={label}>
      <span className="icon-glyph">{icon}</span>
      <span className="icon-label">{label}</span>
      {badge ? <span className="badge">{badge}</span> : null}
    </button>
  )
}

export function TopBar({ stats }: { stats: PlayerStats }) {
  const xpPct = Math.min(100, Math.round((stats.xp / stats.xpMax) * 100))
  return (
    <div className="topbar">
      <div className="player-card">
        <div className="avatar">{'\u2657'}</div>
        <div className="player-meta">
          <div className="player-name">Player</div>
          <div className="player-level">Level {stats.level}</div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            <span className="xp-text">
              {stats.xp.toLocaleString()} / {stats.xpMax.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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

      <div className="nav-buttons">
        <IconButton label="Map" icon={'\uD83D\uDDFA'} />
        <IconButton label="Quests" icon={'\uD83D\uDCDC'} badge={2} />
        <IconButton label="Collection" icon={'\uD83C\uDCCF'} />
        <IconButton label="Shop" icon={'\uD83D\uDED2'} />
        <IconButton label="Settings" icon={'\u2699'} />
      </div>
    </div>
  )
}

export function LeftPanels({ stats }: { stats: PlayerStats }) {
  return (
    <div className="left-panels">
      <div className="panel quest-panel">
        <div className="panel-title">Daily Quest</div>
        <div className="panel-body">
          <span className="chest-icon">{'\uD83E\uDDF0'}</span>
          <div>
            <div className="quest-text">Win 2 games</div>
            <div className="quest-progress">
              {stats.dailyProgress} / {stats.dailyGoal}
            </div>
          </div>
        </div>
      </div>
      <div className="panel location-panel">
        <div className="panel-title">Location</div>
        <div className="panel-body">
          <span className="loc-pin">{'\uD83D\uDCCD'}</span>
          <div>
            <div className="loc-name">Medieval Village</div>
            <div className="loc-stage">
              Stage {stats.locationStage}/{stats.locationStages}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RightPanel({ stats }: { stats: PlayerStats }) {
  const starPct = Math.min(100, Math.round((stats.stars / stats.starsMax) * 100))
  const chestPct = Math.min(100, Math.round((stats.chests / stats.chestsMax) * 100))
  return (
    <div className="right-panel">
      <div className="side-stat">
        <div className="side-title">Stars</div>
        <div className="side-icon star">{'\u2B50'}</div>
        <div className="side-bar">
          <div className="side-fill gold-fill" style={{ width: `${starPct}%` }} />
        </div>
        <div className="side-value">
          {stats.stars} / {stats.starsMax}
        </div>
      </div>
      <div className="side-stat">
        <div className="side-title">Chests</div>
        <div className="side-icon">{'\uD83E\uDDF0'}</div>
        <div className="side-bar">
          <div className="side-fill blue-fill" style={{ width: `${chestPct}%` }} />
        </div>
        <div className="side-value">
          {stats.chests} / {stats.chestsMax}
        </div>
      </div>
      <div className="side-stat">
        <div className="side-title">Streak</div>
        <div className="side-icon">{'\uD83C\uDFC6'}</div>
        <div className="side-value">Win Streak {stats.streak}</div>
      </div>
    </div>
  )
}
