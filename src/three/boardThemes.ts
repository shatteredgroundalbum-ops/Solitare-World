export interface BoardTheme {
  id: string
  woodBase: string
  woodRail: string
  trim: string
  trimEmissive: string
  felt: string
  glow: string
  glowIntensity: number
  emblem: string
  emblemColor: string
}

const THEMES: Record<string, BoardTheme> = {
  medieval: {
    id: 'medieval',
    woodBase: '#3f2915',
    woodRail: '#6b4a2c',
    trim: '#c79a3c',
    trimEmissive: '#7a5a12',
    felt: '#1f5a3a',
    glow: '#ffd9a0',
    glowIntensity: 0.35,
    emblem: '\u2694', // crossed swords crest
    emblemColor: '#e7c877',
  },
  pirate: {
    id: 'pirate',
    woodBase: '#3a2c18',
    woodRail: '#6e5637',
    trim: '#b98a4b',
    trimEmissive: '#5a4020',
    felt: '#25505a',
    glow: '#bfe3ff',
    glowIntensity: 0.35,
    emblem: '\u2693', // anchor / compass feel
    emblemColor: '#e8d9b0',
  },
  crystal: {
    id: 'crystal',
    woodBase: '#2f2b44',
    woodRail: '#4a4668',
    trim: '#b78bff',
    trimEmissive: '#4a2f8a',
    felt: '#243b52',
    glow: '#9a7cff',
    glowIntensity: 0.6,
    emblem: '\u2756', // gem lozenge
    emblemColor: '#cbb3ff',
  },
  dragon: {
    id: 'dragon',
    woodBase: '#161210',
    woodRail: '#2a2320',
    trim: '#7a7a84',
    trimEmissive: '#3a1a12',
    felt: '#2a1830',
    glow: '#ff5a3c',
    glowIntensity: 0.7,
    emblem: '\u2620', // skull/keep menace
    emblemColor: '#ff9a6a',
  },
  egypt: {
    id: 'egypt',
    woodBase: '#8a6a2a',
    woodRail: '#c9a86a',
    trim: '#f4cf6b',
    trimEmissive: '#8a6a2a',
    felt: '#3a2f1a',
    glow: '#ffe6a0',
    glowIntensity: 0.4,
    emblem: '\u2625', // ankh
    emblemColor: '#f4d98a',
  },
}

const FAMILY_TO_THEME: Record<string, string> = {
  Klondike: 'medieval',
  Spider: 'pirate',
  FreeCell: 'crystal',
  Expert: 'dragon',
}

export function themeForSession(worldId: string | null, family: string): BoardTheme {
  if (worldId && THEMES[worldId]) return THEMES[worldId]
  const byFamily = FAMILY_TO_THEME[family]
  if (byFamily && THEMES[byFamily]) return THEMES[byFamily]
  return THEMES.medieval
}
