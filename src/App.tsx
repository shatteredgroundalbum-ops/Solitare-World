import { useCallback, useEffect, useMemo, useState } from 'react'
import { CardView } from './components/CardView'
import { LeftPanels, PlayerStats, RightPanel, TopBar } from './components/Hud'
import {
  GameState,
  PileRef,
  Selection,
  applyMove,
  canMove,
  dealNewGame,
  drawFromStock,
  findHint,
  foundationTargetFor,
  isWon,
} from './game/klondike'
import { Card } from './game/cards'

const INITIAL_STATS: PlayerStats = {
  level: 28,
  xp: 12450,
  xpMax: 15000,
  gold: 25780,
  gems: 1250,
  energy: 5,
  stars: 45,
  starsMax: 120,
  chests: 2,
  chestsMax: 5,
  streak: 3,
  dailyProgress: 0,
  dailyGoal: 2,
  locationStage: 3,
  locationStages: 10,
}

interface HintHighlight {
  cardId: string
  destPile: PileRef
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => dealNewGame())
  const [history, setHistory] = useState<GameState[]>([])
  const [selection, setSelection] = useState<Selection | null>(null)
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS)
  const [hint, setHint] = useState<HintHighlight | null>(null)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('Move all cards to the Foundations from Ace to King!')

  const pushHistory = useCallback((prev: GameState) => {
    setHistory((h) => [...h.slice(-200), prev])
  }, [])

  const commit = useCallback(
    (next: GameState, prev: GameState) => {
      pushHistory(prev)
      setGame(next)
      setSelection(null)
      setHint(null)
    },
    [pushHistory],
  )

  useEffect(() => {
    if (!won && isWon(game)) {
      setWon(true)
      setStats((s) => ({
        ...s,
        gold: s.gold + 500,
        xp: Math.min(s.xpMax, s.xp + 300),
        stars: Math.min(s.starsMax, s.stars + 3),
        streak: s.streak + 1,
        dailyProgress: Math.min(s.dailyGoal, s.dailyProgress + 1),
      }))
      setMessage('You cleared the table! +500 gold, +300 XP')
    }
  }, [game, won])

  const newGame = useCallback(() => {
    setGame(dealNewGame())
    setHistory([])
    setSelection(null)
    setHint(null)
    setWon(false)
    setMessage('Move all cards to the Foundations from Ace to King!')
  }, [])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setGame(prev)
      setSelection(null)
      setHint(null)
      setWon(false)
      return h.slice(0, -1)
    })
  }, [])

  const onStockClick = useCallback(() => {
    setSelection(null)
    setHint(null)
    setGame((g) => {
      pushHistory(g)
      return drawFromStock(g)
    })
  }, [pushHistory])

  const tryMoveTo = useCallback(
    (dest: PileRef) => {
      if (!selection) return false
      if (canMove(game, selection, dest)) {
        commit(applyMove(game, selection, dest), game)
        return true
      }
      return false
    },
    [game, selection, commit],
  )

  const selectFrom = useCallback((sel: Selection | null) => {
    setSelection(sel)
    setHint(null)
  }, [])

  const autoToFoundation = useCallback(
    (card: Card, from: Selection) => {
      const target = foundationTargetFor(game, card)
      if (target >= 0 && canMove(game, from, { type: 'foundation', index: target })) {
        commit(applyMove(game, from, { type: 'foundation', index: target }), game)
        return true
      }
      return false
    },
    [game, commit],
  )

  const showHint = useCallback(() => {
    const h = findHint(game)
    if (h) {
      const src = h.from.pile
      let cardId = ''
      if (src.type === 'waste') cardId = game.waste[h.from.cardIndex]?.id ?? ''
      else if (src.type === 'tableau') cardId = game.tableau[src.index][h.from.cardIndex]?.id ?? ''
      setSelection(null)
      setHint({ cardId, destPile: h.to })
      setMessage('Hint: try the glowing card.')
    } else if (game.stock.length > 0 || game.waste.length > 0) {
      setMessage('Hint: draw from the stock pile.')
    } else {
      setMessage('No moves left. Try Shuffle for a new deal.')
    }
  }, [game])

  const foundationSuitHint = ['\u2665', '\u2663', '\u2666', '\u2660']

  const wasteTop = game.waste.length - 1

  const stockCount = game.stock.length

  const hintCardId = hint?.cardId

  const bottomControls = useMemo(
    () => (
      <div className="controls">
        <button className="control-btn" onClick={showHint}>
          <span className="control-icon">{'\uD83D\uDCA1'}</span>
          <span>Hint</span>
        </button>
        <button className="control-btn" onClick={undo} disabled={!history.length}>
          <span className="control-icon">{'\u21A9'}</span>
          <span>Undo</span>
          {history.length ? <span className="ctrl-badge">{history.length}</span> : null}
        </button>
        <button className="control-btn" onClick={newGame}>
          <span className="control-icon">{'\uD83D\uDD00'}</span>
          <span>Shuffle</span>
        </button>
      </div>
    ),
    [showHint, undo, newGame, history.length],
  )

  return (
    <div className="game-root">
      <div className="bg-layer" />
      <div className="bg-vignette" />

      <TopBar stats={stats} />
      <LeftPanels stats={stats} />
      <RightPanel stats={stats} />

      <div className="table-wrap">
        <div className="table">
          <div className="table-top">
            <div className="foundations">
              {game.foundations.map((pile, i) => {
                const top = pile[pile.length - 1]
                const isHintDest = hint?.destPile.type === 'foundation' && hint.destPile.index === i
                return (
                  <div
                    key={i}
                    className={`pile foundation${isHintDest ? ' hint-target' : ''}`}
                    onClick={() => tryMoveTo({ type: 'foundation', index: i })}
                  >
                    {top ? (
                      <CardView card={top} />
                    ) : (
                      <div className="empty-slot foundation-slot">{foundationSuitHint[i]}</div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="stock-waste">
              <div className="pile waste">
                {game.waste.length ? (
                  <CardView
                    card={game.waste[wasteTop]}
                    selected={
                      selection?.pile.type === 'waste' && selection.cardIndex === wasteTop
                    }
                    hinted={hintCardId === game.waste[wasteTop].id}
                    onClick={() =>
                      selection
                        ? selectFrom(null)
                        : selectFrom({ pile: { type: 'waste' }, cardIndex: wasteTop })
                    }
                    onDoubleClick={() =>
                      autoToFoundation(game.waste[wasteTop], {
                        pile: { type: 'waste' },
                        cardIndex: wasteTop,
                      })
                    }
                  />
                ) : (
                  <div className="empty-slot" />
                )}
              </div>
              <div className="pile stock" onClick={onStockClick} title="Draw">
                {stockCount ? (
                  <div className="card card-back stock-back">
                    <div className="card-back-emblem">{'\u269C'}</div>
                    <span className="stock-count">{stockCount}</span>
                  </div>
                ) : (
                  <div className="empty-slot recycle">{'\u21BB'}</div>
                )}
              </div>
            </div>
          </div>

          <div className="tableau">
            {game.tableau.map((col, colIndex) => {
              const isHintDest =
                hint?.destPile.type === 'tableau' && hint.destPile.index === colIndex
              return (
                <div
                  key={colIndex}
                  className={`pile tableau-col${isHintDest ? ' hint-target' : ''}`}
                  onClick={() => {
                    if (selection) tryMoveTo({ type: 'tableau', index: colIndex })
                  }}
                >
                  {col.length === 0 && <div className="empty-slot column-slot" />}
                  {col.map((card, cardIndex) => {
                    const isSel =
                      selection?.pile.type === 'tableau' &&
                      selection.pile.index === colIndex &&
                      cardIndex >= selection.cardIndex
                    return (
                      <CardView
                        key={card.id}
                        card={card}
                        selected={isSel}
                        hinted={hintCardId === card.id}
                        style={{ top: `${cardIndex * (card.faceUp ? 30 : 12)}px` }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!card.faceUp) return
                          const thisSel: Selection = {
                            pile: { type: 'tableau', index: colIndex },
                            cardIndex,
                          }
                          if (selection) {
                            // Attempt move onto this column first.
                            if (
                              !(
                                selection.pile.type === 'tableau' &&
                                selection.pile.index === colIndex
                              ) &&
                              canMove(game, selection, { type: 'tableau', index: colIndex })
                            ) {
                              tryMoveTo({ type: 'tableau', index: colIndex })
                              return
                            }
                            // Otherwise reselect (or deselect if same head).
                            if (
                              selection.pile.type === 'tableau' &&
                              selection.pile.index === colIndex &&
                              selection.cardIndex === cardIndex
                            ) {
                              selectFrom(null)
                              return
                            }
                          }
                          selectFrom(thisSel)
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          if (!card.faceUp) return
                          if (cardIndex !== col.length - 1) return
                          autoToFoundation(card, {
                            pile: { type: 'tableau', index: colIndex },
                            cardIndex,
                          })
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        {bottomControls}
        <div className="message-banner">{message}</div>
        <button className="wild-card-btn" title="Wild Card">
          <div className="card card-back mini">
            <div className="card-back-emblem">{'\u269C'}</div>
          </div>
          <span>Wild Card</span>
          <span className="badge">1</span>
        </button>
      </div>

      {won && (
        <div className="win-overlay" onClick={newGame}>
          <div className="win-card">
            <div className="win-title">Victory!</div>
            <div className="win-sub">Medieval Village {'\u2014'} Stage cleared</div>
            <div className="win-rewards">+500 Gold &nbsp; +300 XP &nbsp; +3 Stars</div>
            <button className="win-btn" onClick={newGame}>
              Play Next Hand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
