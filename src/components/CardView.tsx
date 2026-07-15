import { Card, SUIT_SYMBOL, color, rankLabel } from '../game/cards'

interface Props {
  card: Card
  selected?: boolean
  hinted?: boolean
  onClick?: (e: React.MouseEvent) => void
  onDoubleClick?: (e: React.MouseEvent) => void
  style?: React.CSSProperties
}

export function CardView({ card, selected, hinted, onClick, onDoubleClick, style }: Props) {
  if (!card.faceUp) {
    return (
      <div
        className={`card card-back${hinted ? ' hinted' : ''}`}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div className="card-back-emblem">{'\u269C'}</div>
      </div>
    )
  }

  const symbol = SUIT_SYMBOL[card.suit]
  const label = rankLabel(card.rank)
  return (
    <div
      className={`card card-face ${color(card.suit)}${selected ? ' selected' : ''}${
        hinted ? ' hinted' : ''
      }`}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-card={card.id}
    >
      <div className="corner top">
        <span className="rank">{label}</span>
        <span className="suit">{symbol}</span>
      </div>
      <div className="pip-center">{symbol}</div>
      <div className="corner bottom">
        <span className="rank">{label}</span>
        <span className="suit">{symbol}</span>
      </div>
    </div>
  )
}
