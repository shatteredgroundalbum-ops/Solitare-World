export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Color = 'red' | 'black'

export interface Card {
  id: string
  suit: Suit
  rank: number // 1 = Ace, 11 = J, 12 = Q, 13 = K
  faceUp: boolean
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
}

export function color(suit: Suit): Color {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

export function rankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return String(rank)
  }
}

export function makeDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false })
    }
  }
  return deck
}

// Fisher-Yates shuffle using an optional seed-less RNG.
export function shuffle<T>(input: T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
