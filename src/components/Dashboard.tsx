import { useState } from 'react'
import { Stats, winRate } from '../game/stats'
import { ENGINES, totalVariants } from '../game/registry'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onOpenLibrary: () => void
  onOpenStats: () => void
  onContinue: () => void
}

interface Tile {
  key: string
  label: string
  icon: string
  action?: () => void
  hint?: string
}

export function Dashboard({ stats, onOpenLibrary, onOpenStats, onContinue }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const soon = (name: string) => () => setToast(`${name} is coming soon.`)

  const lastName = stats.lastGameId ? ENGINES[stats.lastGameId]?.name : undefined

  const tiles: Tile[] = [
    {
      key: 'continue',
      label: lastName ? `Continue\n${lastName}` : 'Continue',
      icon: '\u25B6',
      action: onContinue,
    },
    { key: 'play', label: 'Play', icon: '\uD83C\uDCCF', action: onOpenLibrary },
    { key: 'map', label: 'World Map', icon: '\uD83D\uDDFA', action: onOpenLibrary },
    { key: 'daily', label: 'Daily Challenge', icon: '\uD83D\uDCC5', action: soon('Daily Challenge') },
    { key: 'events', label: 'Events', icon: '\uD83C\uDF89', action: soon('Events') },
    { key: 'collection', label: 'Collection', icon: '\uD83C\uDFB4', action: soon('Collection') },
    { key: 'achievements', label: 'Achievements', icon: '\uD83C\uDFC5', action: onOpenStats },
    { key: 'shop', label: 'Shop', icon: '\uD83D\uDED2', action: soon('Shop') },
    { key: 'leaderboards', label: 'Leaderboards', icon: '\uD83D\uDCCA', action: soon('Leaderboards') },
    { key: 'friends', label: 'Friends', icon: '\uD83D\uDC65', action: soon('Friends') },
    { key: 'profile', label: 'Profile', icon: '\uD83D\uDC64', action: onOpenStats },
    { key: 'settings', label: 'Settings', icon: '\u2699', action: soon('Settings') },
  ]

  return (
    <div className="game-root">
      <div className="bg-layer" />
      <div className="bg-vignette" />

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
            {totalVariants()} variants in the library &middot; {Object.keys(ENGINES).length} playable
            now &middot; {stats.gamesWon} wins &middot; {winRate(stats)}% win rate
          </p>
        </div>
        <div className="dash-grid">
          {tiles.map((t) => (
            <button key={t.key} className="dash-tile" onClick={t.action}>
              <span className="dash-icon">{t.icon}</span>
              <span className="dash-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="toast" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
    </div>
  )
}
