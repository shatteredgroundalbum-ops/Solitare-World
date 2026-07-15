import { useCallback, useEffect, useState } from 'react'
import { ENGINES, isPlayable } from './game/registry'
import {
  Stats,
  loadStats,
  recordStart,
  recordWin,
  saveStats,
} from './game/stats'
import { Dashboard } from './components/Dashboard'
import { Library } from './components/Library'
import { GameScreen } from './components/GameScreen'
import { StatsScreen } from './components/StatsScreen'

type Screen =
  | { name: 'dashboard' }
  | { name: 'library' }
  | { name: 'game'; engineId: string }
  | { name: 'stats' }

export default function App() {
  const [stats, setStats] = useState<Stats>(() => loadStats())
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' })

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  const handleStart = useCallback((id: string) => {
    setStats((s) => recordStart(s, id))
  }, [])

  const handleWin = useCallback((id: string, elapsedMs: number) => {
    setStats((s) => recordWin(s, id, elapsedMs)[0])
  }, [])

  const play = useCallback((engineId: string) => {
    if (isPlayable(engineId)) setScreen({ name: 'game', engineId })
  }, [])

  const goDashboard = useCallback(() => setScreen({ name: 'dashboard' }), [])
  const goLibrary = useCallback(() => setScreen({ name: 'library' }), [])
  const goStats = useCallback(() => setScreen({ name: 'stats' }), [])

  const onContinue = useCallback(() => {
    if (stats.lastGameId && isPlayable(stats.lastGameId)) {
      setScreen({ name: 'game', engineId: stats.lastGameId })
    } else {
      setScreen({ name: 'library' })
    }
  }, [stats.lastGameId])

  if (screen.name === 'game') {
    const engine = ENGINES[screen.engineId]
    if (!engine) {
      goLibrary()
      return null
    }
    return (
      <GameScreen
        key={engine.id}
        engine={engine}
        stats={stats}
        onStart={handleStart}
        onWin={handleWin}
        onExit={goLibrary}
      />
    )
  }

  if (screen.name === 'library') {
    return <Library stats={stats} onPlay={play} onExit={goDashboard} />
  }

  if (screen.name === 'stats') {
    return <StatsScreen stats={stats} onExit={goDashboard} />
  }

  return (
    <Dashboard
      stats={stats}
      onOpenLibrary={goLibrary}
      onOpenStats={goStats}
      onContinue={onContinue}
    />
  )
}
