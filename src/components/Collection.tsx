import { Stats, playerLevel } from '../game/stats'
import { LivingBackground } from './LivingBackground'
import { PlayerCard, ResourceBar } from './Chrome'

interface Props {
  stats: Stats
  onExit: () => void
}

interface Section {
  name: string
  items: { icon: string; name: string }[]
  unlocked: number
}

export function Collection({ stats, onExit }: Props) {
  const level = playerLevel(stats.playerXp).level
  const worldsCleared = Object.values(stats.worldProgress).filter((v) => v > 0).length

  const sections: Section[] = [
    {
      name: 'Card Backs',
      unlocked: 1 + Math.min(5, stats.gamesWon),
      items: [
        { icon: '\u269C', name: 'Royal Fleur' },
        { icon: '\uD83C\uDFF4\u200D\u2620\uFE0F', name: 'Corsair' },
        { icon: '\uD83D\uDC8E', name: 'Crystalline' },
        { icon: '\uD83D\uDD3A', name: 'Pharaoh' },
        { icon: '\uD83D\uDC09', name: 'Dragon Scale' },
        { icon: '\u2744', name: 'Frostbite' },
      ],
    },
    {
      name: 'Tables',
      unlocked: 1 + worldsCleared,
      items: [
        { icon: '\uD83C\uDFF0', name: 'Kingdom Oak' },
        { icon: '\uD83C\uDF34', name: 'Island Bamboo' },
        { icon: '\uD83D\uDD2E', name: 'Cavern Glass' },
        { icon: '\uD83C\uDF0B', name: 'Volcano Stone' },
      ],
    },
    {
      name: 'Trophies',
      unlocked: Math.min(4, Math.floor(stats.gamesWon / 2)),
      items: [
        { icon: '\uD83E\uDD49', name: 'Bronze Cup' },
        { icon: '\uD83E\uDD48', name: 'Silver Cup' },
        { icon: '\uD83E\uDD47', name: 'Gold Cup' },
        { icon: '\uD83C\uDFC6', name: 'Grand Trophy' },
      ],
    },
    {
      name: 'Pets',
      unlocked: Math.min(4, Math.floor(level / 2)),
      items: [
        { icon: '\uD83D\uDC31', name: 'Castle Cat' },
        { icon: '\uD83E\uDD9C', name: 'Pirate Parrot' },
        { icon: '\uD83E\uDD8E', name: 'Cavern Gecko' },
        { icon: '\uD83D\uDC32', name: 'Baby Dragon' },
      ],
    },
  ]

  const totalItems = sections.reduce((s, c) => s + c.items.length, 0)
  const totalUnlocked = sections.reduce((s, c) => s + Math.min(c.unlocked, c.items.length), 0)

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

      <div className="library collection-screen">
        <h2 className="library-title">
          Collection Museum {'\u00B7'} {totalUnlocked}/{totalItems}
        </h2>
        {sections.map((sec) => (
          <div className="collection-section" key={sec.name}>
            <div className="cat-header">
              {sec.name}
              <span className="collection-count">
                {Math.min(sec.unlocked, sec.items.length)}/{sec.items.length}
              </span>
            </div>
            <div className="collection-grid">
              {sec.items.map((item, i) => {
                const locked = i >= sec.unlocked
                return (
                  <div key={item.name} className={`collectible${locked ? ' locked' : ''}`}>
                    <div className="collectible-icon">{locked ? '\uD83D\uDD12' : item.icon}</div>
                    <div className="collectible-name">{locked ? 'Locked' : item.name}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
