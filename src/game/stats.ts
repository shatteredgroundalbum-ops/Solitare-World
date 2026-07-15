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
  lastGameId: string | null
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
  lastGameId: null,
  byGame: {},
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw) as Partial<Stats>
    return { ...DEFAULT_STATS, ...parsed, byGame: parsed.byGame ?? {} }
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

export function recordStart(stats: Stats, gameId: string): Stats {
  const m = mastery(stats, gameId)
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    lastGameId: gameId,
    byGame: { ...stats.byGame, [gameId]: { ...m, plays: m.plays + 1 } },
  }
}

export interface WinReward {
  gold: number
  xp: number
}

export function recordWin(stats: Stats, gameId: string, elapsedMs: number): [Stats, WinReward] {
  const m = mastery(stats, gameId)
  const streak = stats.currentStreak + 1
  const reward: WinReward = { gold: 500, xp: 120 }
  const next: Stats = {
    ...stats,
    gold: stats.gold + reward.gold,
    playerXp: stats.playerXp + reward.xp,
    gamesWon: stats.gamesWon + 1,
    currentStreak: streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    fastestMs: stats.fastestMs === null ? elapsedMs : Math.min(stats.fastestMs, elapsedMs),
    byGame: {
      ...stats.byGame,
      [gameId]: { ...m, wins: m.wins + 1, xp: m.xp + reward.xp + 60 },
    },
  }
  return [next, reward]
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
