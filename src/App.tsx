import { useCallback, useEffect, useState } from 'react'
import { isPlayable } from './game/registry'
import { getWorld, worldPlayable } from './game/worlds'
import { playerLevel } from './game/stats'
import {
  SessionContext,
  Stats,
  WinResult,
  loadStats,
  recordStart,
  recordWin,
  saveStats,
} from './game/stats'
import { GameSession, buildFreeSession, buildWorldSession } from './game/session'
import { Dashboard } from './components/Dashboard'
import { Library } from './components/Library'
import { GameScreen } from './components/GameScreen'
import { StatsScreen } from './components/StatsScreen'
import { WorldMap } from './components/WorldMap'
import { WorldStages } from './components/WorldStages'
import { Collection } from './components/Collection'

type Screen =
  | { name: 'dashboard' }
  | { name: 'library' }
  | { name: 'worldmap' }
  | { name: 'world'; worldId: string }
  | { name: 'game'; session: GameSession }
  | { name: 'stats' }
  | { name: 'collection' }

export default function App() {
  const [stats, setStats] = useState<Stats>(() => loadStats())
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' })

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  const handleStart = useCallback((ctx: SessionContext) => {
    setStats((s) => recordStart(s, ctx))
  }, [])

  const handleWin = useCallback((ctx: SessionContext, result: WinResult) => {
    setStats((s) => recordWin(s, ctx, result)[0])
  }, [])

  const playFree = useCallback((engineId: string) => {
    if (isPlayable(engineId)) setScreen({ name: 'game', session: buildFreeSession(engineId) })
  }, [])

  const playStage = useCallback((worldId: string, stage: number) => {
    const world = getWorld(worldId)
    if (!world) return
    setScreen({ name: 'game', session: buildWorldSession(world, stage) })
  }, [])

  const goDashboard = useCallback(() => setScreen({ name: 'dashboard' }), [])

  const onContinue = useCallback(() => {
    const worldId = stats.lastWorldId
    const world = worldId ? getWorld(worldId) : undefined
    if (world && worldPlayable(world) && playerLevel(stats.playerXp).level >= world.unlockLevel) {
      const next = Math.min((stats.worldProgress[world.id] ?? 0) + 1, world.stages)
      setScreen({ name: 'game', session: buildWorldSession(world, next) })
      return
    }
    if (stats.lastGameId && isPlayable(stats.lastGameId)) {
      playFree(stats.lastGameId)
      return
    }
    setScreen({ name: 'worldmap' })
  }, [stats, playFree])

  if (screen.name === 'game') {
    const session = screen.session
    const world = session.worldId ? getWorld(session.worldId) : undefined
    const hasNext = !!(world && session.stage && session.stage < world.stages)
    const exitToWorld = () =>
      world ? setScreen({ name: 'world', worldId: world.id }) : setScreen({ name: 'library' })
    return (
      <GameScreen
        key={`${session.engineId}-${session.worldId ?? 'free'}-${session.stage ?? 0}`}
        session={session}
        stats={stats}
        onStart={handleStart}
        onWin={handleWin}
        onNext={
          hasNext && world && session.stage
            ? () => playStage(world.id, session.stage! + 1)
            : null
        }
        onExit={exitToWorld}
      />
    )
  }

  if (screen.name === 'library') {
    return <Library stats={stats} onPlay={playFree} onExit={goDashboard} />
  }

  if (screen.name === 'worldmap') {
    return (
      <WorldMap
        stats={stats}
        onOpenWorld={(worldId) => setScreen({ name: 'world', worldId })}
        onExit={goDashboard}
      />
    )
  }

  if (screen.name === 'world') {
    const world = getWorld(screen.worldId)
    if (!world) {
      setScreen({ name: 'worldmap' })
      return null
    }
    return (
      <WorldStages
        stats={stats}
        world={world}
        onPlayStage={(stage) => playStage(world.id, stage)}
        onExit={() => setScreen({ name: 'worldmap' })}
      />
    )
  }

  if (screen.name === 'stats') {
    return <StatsScreen stats={stats} onExit={goDashboard} />
  }

  if (screen.name === 'collection') {
    return <Collection stats={stats} onExit={goDashboard} />
  }

  return (
    <Dashboard
      stats={stats}
      onContinue={onContinue}
      onPlay={() => setScreen({ name: 'library' })}
      onWorldMap={() => setScreen({ name: 'worldmap' })}
      onOpenStats={() => setScreen({ name: 'stats' })}
      onOpenCollection={() => setScreen({ name: 'collection' })}
    />
  )
}
