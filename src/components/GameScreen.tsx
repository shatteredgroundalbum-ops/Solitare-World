import { useCallback, useEffect, useRef, useState } from 'react'
import { Engine, GameState, Hint, MoveRef } from '../game/engine'
import { Stats, masteryLevel } from '../game/stats'
import { IconButton, PlayerCard, ResourceBar } from './Chrome'
import { Board } from './Board'

interface Props {
  engine: Engine
  stats: Stats
  onStart: (id: string) => void
  onWin: (id: string, elapsedMs: number) => void
  onExit: () => void
}

export function GameScreen({ engine, stats, onStart, onWin, onExit }: Props) {
  const [state, setState] = useState<GameState>(() => engine.create())
  const [history, setHistory] = useState<GameState[]>([])
  const [selection, setSelection] = useState<MoveRef | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState(engine.instruction)
  const startTime = useRef(Date.now())
  const dealToken = useRef(0)
  const startedTokens = useRef<Set<number>>(new Set())

  // Count a game start once per deal (deduped for StrictMode double-invoke).
  useEffect(() => {
    if (!startedTokens.current.has(dealToken.current)) {
      startedTokens.current.add(dealToken.current)
      onStart(engine.id)
    }
  }, [engine.id, onStart])

  useEffect(() => {
    if (!won && engine.isWon(state)) {
      setWon(true)
      setMessage('You cleared the table! Rewards added.')
      onWin(engine.id, Date.now() - startTime.current)
    }
  }, [state, won, engine, onWin])

  const commit = useCallback((next: GameState) => {
    setState((prev) => {
      setHistory((h) => [...h.slice(-300), prev])
      return next
    })
    setSelection(null)
    setHint(null)
  }, [])

  const newGame = useCallback(() => {
    dealToken.current += 1
    startTime.current = Date.now()
    setState(engine.create())
    setHistory([])
    setSelection(null)
    setHint(null)
    setWon(false)
    setMessage(engine.instruction)
    if (!startedTokens.current.has(dealToken.current)) {
      startedTokens.current.add(dealToken.current)
      onStart(engine.id)
    }
  }, [engine, onStart])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h
      setState(h[h.length - 1])
      setSelection(null)
      setHint(null)
      setWon(false)
      return h.slice(0, -1)
    })
  }, [])

  const doPileClick = useCallback(
    (pileId: string, kind: string) => {
      if (kind === 'stock') {
        const next = engine.clickPile(state, pileId)
        if (next) {
          commit(next)
        } else {
          setMessage('Cannot deal right now.')
        }
        return
      }
      if (selection && engine.canMove(state, selection, pileId)) {
        commit(engine.applyMove(state, selection, pileId))
      }
    },
    [engine, state, selection, commit],
  )

  const onCardClick = useCallback(
    (ref: MoveRef, kind: string) => {
      if (kind === 'stock') {
        doPileClick(ref.pileId, kind)
        return
      }
      if (!selection) {
        if (engine.canPickUp(state, ref)) {
          setSelection(ref)
          setHint(null)
        }
        return
      }
      if (engine.canMove(state, selection, ref.pileId)) {
        commit(engine.applyMove(state, selection, ref.pileId))
        return
      }
      if (selection.pileId === ref.pileId && selection.cardIndex === ref.cardIndex) {
        setSelection(null)
        return
      }
      setSelection(engine.canPickUp(state, ref) ? ref : null)
      setHint(null)
    },
    [engine, state, selection, commit, doPileClick],
  )

  const onCardDouble = useCallback(
    (ref: MoveRef) => {
      const target = engine.autoTarget(state, ref)
      if (target && engine.canMove(state, ref, target)) {
        commit(engine.applyMove(state, ref, target))
      }
    },
    [engine, state, commit],
  )

  const showHint = useCallback(() => {
    const h = engine.hint(state)
    if (h) {
      setSelection(null)
      setHint(h)
      setMessage('Hint: try the glowing card.')
    } else if (state.piles.stock && state.piles.stock.length > 0) {
      setMessage('No board moves — draw from the stock pile.')
    } else {
      setMessage('No moves available. Shuffle for a new deal.')
    }
  }, [engine, state])

  const m = stats.byGame[engine.id]
  const mLevel = masteryLevel(m?.xp ?? 0)

  return (
    <div className="game-root">
      <div className="bg-layer" />
      <div className="bg-vignette" />

      <div className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={onExit} title="Back">
            {'\u2039'} Library
          </button>
          <PlayerCard stats={stats} />
        </div>
        <ResourceBar stats={stats} />
        <div className="nav-buttons">
          <IconButton label="New" icon={'\uD83C\uDCCF'} onClick={newGame} />
          <IconButton label="Menu" icon={'\u2630'} onClick={onExit} />
        </div>
      </div>

      <div className="left-panels">
        <div className="panel">
          <div className="panel-title">{engine.name}</div>
          <div className="panel-body">
            <span className="chest-icon">{'\uD83C\uDFC5'}</span>
            <div>
              <div className="quest-text">Mastery {mLevel}</div>
              <div className="quest-progress">
                {m?.wins ?? 0} wins / {m?.plays ?? 0} plays
              </div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Family</div>
          <div className="panel-body">
            <span className="loc-pin">{'\uD83D\uDCCD'}</span>
            <div>
              <div className="loc-name">{engine.family}</div>
              <div className="loc-stage">Medieval Kingdom</div>
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="side-stat">
          <div className="side-title">Streak</div>
          <div className="side-icon">{'\uD83C\uDFC6'}</div>
          <div className="side-value">{stats.currentStreak}</div>
        </div>
        <div className="side-stat">
          <div className="side-title">Wins</div>
          <div className="side-icon star">{'\u2B50'}</div>
          <div className="side-value">{stats.gamesWon}</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table">
          <Board
            engine={engine}
            state={state}
            selection={selection}
            hint={hint}
            onCardClick={onCardClick}
            onCardDouble={onCardDouble}
            onPileClick={doPileClick}
          />
        </div>
      </div>

      <div className="bottom-bar">
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
            <div className="win-sub">
              {engine.name} {'\u2014'} Mastery {mLevel}
            </div>
            <div className="win-rewards">+500 Gold &nbsp; +120 XP &nbsp; Streak {stats.currentStreak}</div>
            <button className="win-btn" onClick={newGame}>
              Play Next Hand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
