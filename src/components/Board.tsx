import { CSSProperties } from 'react'
import { Card } from '../game/cards'
import { Engine, GameState, Hint, MoveRef, Slot, isCardSlot } from '../game/engine'
import { CardView } from './CardView'

interface Props {
  engine: Engine
  state: GameState
  selection: MoveRef | null
  hint: Hint | null
  onCardClick: (ref: MoveRef, kind: string) => void
  onCardDouble: (ref: MoveRef) => void
  onPileClick: (pileId: string, kind: string) => void
}

const FAN_UP = 34
const FAN_DOWN = 14
const FAN_RIGHT = 18

function cardWidthFor(cols: number): number {
  if (cols >= 10) return 62
  if (cols >= 8) return 70
  return 76
}

export function Board({
  engine,
  state,
  selection,
  hint,
  onCardClick,
  onCardDouble,
  onPileClick,
}: Props) {
  const rows = engine.layout(state)
  const tableauRow = rows.find((r) =>
    r.slots.some((s) => isCardSlot(s) && s.kind === 'tableau'),
  )
  const cols = tableauRow
    ? tableauRow.slots.filter((s) => isCardSlot(s) && s.kind === 'tableau').length
    : 7
  const cardW = cardWidthFor(cols)
  const boardStyle = {
    ['--card-w']: `${cardW}px`,
    ['--card-h']: `${Math.round(cardW * 1.4)}px`,
    width: `${cols * cardW + (cols - 1) * 8}px`,
  } as CSSProperties

  const isSelected = (pileId: string, index: number): boolean => {
    if (!selection || selection.pileId !== pileId) return false
    return index >= selection.cardIndex
  }

  const renderPile = (slot: Slot, key: number) => {
    if (!isCardSlot(slot)) {
      return <div className="slot-spacer" key={`sp-${key}`} />
    }
    const { pileId, kind, fan } = slot
    const cards = state.piles[pileId] ?? []
    const isHintTarget = hint?.toPileId === pileId

    if (kind === 'stock') {
      return (
        <div
          key={pileId}
          className={`pile stock${isHintTarget ? ' hint-target' : ''}`}
          onClick={() => onPileClick(pileId, kind)}
          title="Draw"
        >
          {cards.length ? (
            <div className="card card-back stock-back">
              <div className="card-back-emblem">{'\u269C'}</div>
              <span className="stock-count">{cards.length}</span>
            </div>
          ) : (
            <div className="empty-slot recycle">{'\u21BB'}</div>
          )}
        </div>
      )
    }

    if (fan === 'down') {
      let offset = 0
      const positioned = cards.map((card) => {
        const t = offset
        offset += card.faceUp ? FAN_UP : FAN_DOWN
        return { card, t }
      })
      return (
        <div
          key={pileId}
          className={`pile tableau-col${isHintTarget ? ' hint-target' : ''}`}
          onClick={() => onPileClick(pileId, kind)}
        >
          {cards.length === 0 && <div className="empty-slot column-slot" />}
          {positioned.map(({ card, t }, i) => (
            <CardView
              key={card.id}
              card={card}
              selected={isSelected(pileId, i)}
              hinted={hint?.from.pileId === pileId && hint.from.cardIndex === i}
              style={{ top: `${t}px` }}
              onClick={(e) => {
                e.stopPropagation()
                if (card.faceUp) onCardClick({ pileId, cardIndex: i }, kind)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (card.faceUp) onCardDouble({ pileId, cardIndex: i })
              }}
            />
          ))}
        </div>
      )
    }

    // 'right' (waste) shows the last few cards fanned; 'none' shows only the top.
    const visible = fan === 'right' ? cards.slice(-3) : cards.slice(-1)
    const baseIndex = cards.length - visible.length
    return (
      <div
        key={pileId}
        className={`pile ${kind}${isHintTarget ? ' hint-target' : ''}`}
        onClick={() => onPileClick(pileId, kind)}
      >
        {cards.length === 0 && (
          <div className={`empty-slot ${kind}-slot`}>{kind === 'foundation' ? '\u25CB' : ''}</div>
        )}
        {visible.map((card: Card, vi: number) => {
          const i = baseIndex + vi
          return (
            <CardView
              key={card.id}
              card={card}
              selected={isSelected(pileId, i)}
              hinted={hint?.from.pileId === pileId && hint.from.cardIndex === i}
              style={fan === 'right' ? { left: `${vi * FAN_RIGHT}px`, position: 'absolute' } : undefined}
              onClick={(e) => {
                e.stopPropagation()
                if (card.faceUp) onCardClick({ pileId, cardIndex: i }, kind)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (card.faceUp) onCardDouble({ pileId, cardIndex: i })
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="board" style={boardStyle}>
      {rows.map((row, ri) => (
        <div className={`board-row${ri === 0 ? ' top-row' : ' tableau-row'}`} key={ri}>
          {row.slots.map((slot, si) => renderPile(slot, ri * 100 + si))}
        </div>
      ))}
    </div>
  )
}
