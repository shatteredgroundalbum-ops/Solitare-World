export interface GameMastery {
  plays: number
  wins: number
  xp: number
}

export interface Stats {
  gold: number
  gems: number
  energy: number
  playerXp: number
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
  fastestMs: number | null
  totalTimeMs: number
  lastGameId: string | null
  lastWorldId: string | null
  lastStage: number | null
  worldProgress: Record<string, number>
  bestScore: Record<string, number>
  objectivesMet: number
  byGame: Record<string, GameMastery>
}

const STORAGE_KEY = 'sw3d.stats.v1'

export const DEFAULT_STATS: Stats = {
  gold: 25780,
  gems: 1250,
  energy: 5,
  playerXp: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  fastestMs: null,
  totalTimeMs: 0,
  lastGameId: null,
  lastWorldId: null,
  lastStage: null,
  worldProgress: {},
  bestScore: {},
  objectivesMet: 0,
  byGame: {},
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw) as Partial<Stats>
    return {
      ...DEFAULT_STATS,
      ...parsed,
      byGame: parsed.byGame ?? {},
      worldProgress: parsed.worldProgress ?? {},
      bestScore: parsed.bestScore ?? {},
    }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    /* storage unavailable; keep in-memory only */
  }
}

function mastery(stats: Stats, gameId: string): GameMastery {
  return stats.byGame[gameId] ?? { plays: 0, wins: 0, xp: 0 }
}

export interface SessionContext {
  gameId: string
  worldId?: string | null
  stage?: number | null
}

export function recordStart(stats: Stats, ctx: SessionContext): Stats {
  const m = mastery(stats, ctx.gameId)
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    lastGameId: ctx.gameId,
    lastWorldId: ctx.worldId ?? null,
    lastStage: ctx.stage ?? null,
    byGame: { ...stats.byGame, [ctx.gameId]: { ...m, plays: m.plays + 1 } },
  }
}

export interface WinReward {
  gold: number
  xp: number
}

export interface WinResult {
  score: number
  timeMs: number
  objectiveMet: boolean
}

export function recordWin(stats: Stats, ctx: SessionContext, result: WinResult): [Stats, WinReward] {
  const m = mastery(stats, ctx.gameId)
  const streak = stats.currentStreak + 1
  const reward: WinReward = {
    gold: 500 + (result.objectiveMet ? 250 : 0),
    xp: 120 + (result.objectiveMet ? 80 : 0),
  }
  const worldProgress = { ...stats.worldProgress }
  if (ctx.worldId && ctx.stage) {
    worldProgress[ctx.worldId] = Math.max(worldProgress[ctx.worldId] ?? 0, ctx.stage)
  }
  const bestScore = { ...stats.bestScore }
  bestScore[ctx.gameId] = Math.max(bestScore[ctx.gameId] ?? 0, result.score)

  const next: Stats = {
    ...stats,
    gold: stats.gold + reward.gold,
    playerXp: stats.playerXp + reward.xp,
    gamesWon: stats.gamesWon + 1,
    currentStreak: streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    fastestMs: stats.fastestMs === null ? result.timeMs : Math.min(stats.fastestMs, result.timeMs),
    totalTimeMs: stats.totalTimeMs + result.timeMs,
    objectivesMet: stats.objectivesMet + (result.objectiveMet ? 1 : 0),
    worldProgress,
    bestScore,
    byGame: {
      ...stats.byGame,
      [ctx.gameId]: { ...m, wins: m.wins + 1, xp: m.xp + reward.xp + 60 },
    },
  }
  return [next, reward]
}

export function worldCompletion(stats: Stats, worldId: string, stages: number): number {
  const cleared = Math.min(stats.worldProgress[worldId] ?? 0, stages)
  return stages === 0 ? 0 : Math.round((cleared / stages) * 100)
}

export function fmtDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function breakStreak(stats: Stats): Stats {
  if (stats.currentStreak === 0) return stats
  return { ...stats, currentStreak: 0 }
}

const XP_PER_LEVEL = 500

export function playerLevel(xp: number): { level: number; into: number; span: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  return { level, into: xp % XP_PER_LEVEL, span: XP_PER_LEVEL }
}

const XP_PER_MASTERY = 400

export function masteryLevel(xp: number): number {
  return Math.floor(xp / XP_PER_MASTERY) + 1
}

export function winRate(stats: Stats): number {
  return stats.gamesPlayed === 0 ? 0 : Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
}
