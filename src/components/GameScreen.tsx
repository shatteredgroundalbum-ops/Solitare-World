import { useCallback, useEffect, useRef, useState } from 'react'
import { ENGINES } from '../game/registry'
import { GameSession } from '../game/session'
import { GameState } from '../game/engine'
import { Metrics, objectiveMet } from '../game/objectives'
import { SessionContext, Stats, WinResult, masteryLevel } from '../game/stats'
import { getWorld } from '../game/worlds'
import { ResourceBar } from './Chrome'
import { Board3D } from './Board3D'
import { Victory } from './Victory'

interface Props {
  session: GameSession
  stats: Stats
  onStart: (ctx: SessionContext) => void
  onWin: (ctx: SessionContext, result: WinResult) => void
  onNext: (() => void) | null
  onExit: () => void
}

interface Play {
  state: GameState
  score: number
  moves: number
  combo: number
}

function foundationCount(s: GameState): number {
  let n = 0
  for (const k of Object.keys(s.piles)) if (k.startsWith('fnd')) n += s.piles[k].length
  return n
}

function fmtClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function GameScreen({ session, stats, onStart, onWin, onNext, onExit }: Props) {
  const engine = ENGINES[session.engineId]
  const ctx: SessionContext = {
    gameId: session.engineId,
    worldId: session.worldId,
    stage: session.stage,
  }

  const [play, setPlay] = useState<Play>(() => ({
    state: engine.create(),
    score: 0,
    moves: 0,
    combo: 0,
  }))
  const [history, setHistory] = useState<Play[]>([])
  const [selection, setSelection] = useState<{ pileId: string; cardIndex: number } | null>(null)
  const [hint, setHint] = useState<ReturnType<typeof engine.hint>>(null)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState(session.objective.label)
  const [elapsed, setElapsed] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [undosUsed, setUndosUsed] = useState(0)
  const [cycled, setCycled] = useState(false)
  const [result, setResult] = useState<WinResult | null>(null)

  const startTime = useRef(Date.now())
  const dealToken = useRef(0)
  const startedTokens = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!startedTokens.current.has(dealToken.current)) {
      startedTokens.current.add(dealToken.current)
      onStart(ctx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.engineId])

  useEffect(() => {
    if (won) return
    const id = window.setInterval(() => setElapsed(Date.now() - startTime.current), 400)
    return () => window.clearInterval(id)
  }, [won])

  useEffect(() => {
    if (won || !engine.isWon(play.state)) return
    const timeMs = Date.now() - startTime.current
    const metrics: Metrics = { timeMs, hints: hintsUsed, undos: undosUsed, moves: play.moves, cycled }
    const met = objectiveMet(session.objective, metrics, engine.family)
    const finalScore = play.score + Math.max(0, 800 - Math.floor(timeMs / 1000) * 4) + (met ? 500 : 0)
    const res: WinResult = { score: finalScore, timeMs, objectiveMet: met }
    setWon(true)
    setResult(res)
    setMessage('You cleared the board!')
    onWin(ctx, res)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play.state, won])

  const commit = useCallback((nextState: GameState, recycle = false) => {
    setPlay((prev) => {
      setHistory((h) => [...h.slice(-400), prev])
      const gained = foundationCount(nextState) - foundationCount(prev.state)
      let { score, combo } = prev
      if (gained > 0) {
        combo = prev.combo + 1
        score += gained * (100 + combo * 25)
      } else {
        combo = 0
        score += 4
      }
      if (recycle) score = Math.max(0, score - 20)
      return { state: nextState, score, moves: prev.moves + 1, combo }
    })
    setSelection(null)
    setHint(null)
  }, [])

  const restart = useCallback(() => {
    dealToken.current += 1
    startTime.current = Date.now()
    setPlay({ state: engine.create(), score: 0, moves: 0, combo: 0 })
    setHistory([])
    setSelection(null)
    setHint(null)
    setWon(false)
    setResult(null)
    setElapsed(0)
    setHintsUsed(0)
    setUndosUsed(0)
    setCycled(false)
    setMessage(session.objective.label)
    if (!startedTokens.current.has(dealToken.current)) {
      startedTokens.current.add(dealToken.current)
      onStart(ctx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, session, onStart])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h
      setPlay(h[h.length - 1])
      setSelection(null)
      setHint(null)
      setWon(false)
      setResult(null)
      return h.slice(0, -1)
    })
    setUndosUsed((n) => n + 1)
  }, [])

  const doPileClick = useCallback(
    (pileId: string, kind: string) => {
      if (kind === 'stock') {
        const willRecycle = play.state.piles.stock?.length === 0 && play.state.piles.waste?.length > 0
        const next = engine.clickPile(play.state, pileId)
        if (next) {
          if (willRecycle) setCycled(true)
          commit(next, willRecycle)
        } else {
          setMessage('Cannot deal right now.')
        }
        return
      }
      if (selection && engine.canMove(play.state, selection, pileId)) {
        commit(engine.applyMove(play.state, selection, pileId))
      }
    },
    [engine, play.state, selection, commit],
  )

  const onCardClick = useCallback(
    (ref: { pileId: string; cardIndex: number }, kind: string) => {
      if (kind === 'stock') {
        doPileClick(ref.pileId, kind)
        return
      }
      if (!selection) {
        if (engine.canPickUp(play.state, ref)) {
          setSelection(ref)
          setHint(null)
        }
        return
      }
      if (engine.canMove(play.state, selection, ref.pileId)) {
        commit(engine.applyMove(play.state, selection, ref.pileId))
        return
      }
      if (selection.pileId === ref.pileId && selection.cardIndex === ref.cardIndex) {
        setSelection(null)
        return
      }
      setSelection(engine.canPickUp(play.state, ref) ? ref : null)
      setHint(null)
    },
    [engine, play.state, selection, commit, doPileClick],
  )

  const onCardDouble = useCallback(
    (ref: { pileId: string; cardIndex: number }) => {
      const target = engine.autoTarget(play.state, ref)
      if (target && engine.canMove(play.state, ref, target)) {
        commit(engine.applyMove(play.state, ref, target))
      }
    },
    [engine, play.state, commit],
  )

  const showHint = useCallback(() => {
    const h = engine.hint(play.state)
    setHintsUsed((n) => n + 1)
    if (h) {
      setSelection(null)
      setHint(h)
      setMessage('Hint: try the glowing card.')
    } else if (play.state.piles.stock && play.state.piles.stock.length > 0) {
      setMessage('No board moves — draw from the stock pile.')
    } else {
      setMessage('No moves available. Restart for a new deal.')
    }
  }, [engine, play.state])

  const m = stats.byGame[session.engineId]
  const mLevel = masteryLevel(m?.xp ?? 0)
  const world = session.worldId ? getWorld(session.worldId) : undefined
  const best = stats.bestScore[session.engineId] ?? 0

  return (
    <div className="game-root">
      <div className="bg-layer" />
      <div className="bg-vignette" />

      <div className="topbar game-topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={onExit} title="Back">
            {'\u2039'} {world ? 'World' : 'Library'}
          </button>
          <div className="game-title-block">
            <div className="game-title">{engine.name}</div>
            <div className="game-sub">
              {world ? `${world.name} \u00B7 Stage ${session.stage}` : 'Free Play'}
              {` \u00B7 ${session.difficulty}`}
            </div>
          </div>
        </div>

        <div className="hud-chips">
          <div className="chip">
            <span className="chip-label">Moves</span>
            <span className="chip-value">{play.moves}</span>
          </div>
          <div className="chip">
            <span className="chip-label">Time</span>
            <span className="chip-value">{fmtClock(elapsed)}</span>
          </div>
          <div className="chip">
            <span className="chip-label">Score</span>
            <span className="chip-value">{play.score.toLocaleString()}</span>
          </div>
          <div className={`chip combo${play.combo > 1 ? ' hot' : ''}`}>
            <span className="chip-label">Combo</span>
            <span className="chip-value">x{play.combo}</span>
          </div>
        </div>

        <ResourceBar stats={stats} />
      </div>

      <div className="left-panels">
        <div className="panel objective-panel">
          <div className="panel-title">Objective</div>
          <div className="panel-body">
            <span className="chest-icon">{'\uD83C\uDFAF'}</span>
            <div>
              <div className="quest-text">{session.objective.short}</div>
              <div className="quest-progress">{session.objective.label}</div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Mastery {'\u00B7'} {engine.family}</div>
          <div className="panel-body">
            <span className="loc-pin">{'\uD83C\uDFC5'}</span>
            <div>
              <div className="loc-name">Rank {mLevel}</div>
              <div className="loc-stage">
                {m?.wins ?? 0} wins {'\u00B7'} best {best.toLocaleString()}
              </div>
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
          <div className="side-title">Stars</div>
          <div className="side-icon star">{'\u2B50'}</div>
          <div className="side-value">{stats.objectivesMet}</div>
        </div>
        <div className="side-stat">
          <div className="side-title">Reward</div>
          <div className="side-icon">{'\u2728'}</div>
          <div className="side-value">+120 XP</div>
        </div>
      </div>

      <div className="table-wrap">
        <Board3D
          engine={engine}
          state={play.state}
          selection={selection}
          hint={hint}
          onCardClick={onCardClick}
          onCardDouble={onCardDouble}
          onPileClick={doPileClick}
        />
      </div>

      <div className="bottom-bar">
        <div className="controls">
          <button className="control-btn" onClick={showHint}>
            <span className="control-icon">{'\uD83D\uDCA1'}</span>
            <span>Hint</span>
            {hintsUsed ? <span className="ctrl-badge">{hintsUsed}</span> : null}
          </button>
          <button className="control-btn" onClick={undo} disabled={!history.length}>
            <span className="control-icon">{'\u21A9'}</span>
            <span>Undo</span>
            {history.length ? <span className="ctrl-badge">{history.length}</span> : null}
          </button>
          <button className="control-btn" onClick={restart}>
            <span className="control-icon">{'\uD83D\uDD01'}</span>
            <span>Restart</span>
          </button>
          <button className="control-btn" onClick={() => setMessage('Settings are coming soon.')}>
            <span className="control-icon">{'\u2699'}</span>
            <span>Settings</span>
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

      {won && result && (
        <Victory
          engineName={engine.name}
          session={session}
          result={result}
          masteryLevel={mLevel}
          onNext={onNext}
          onRestart={restart}
          onExit={onExit}
        />
      )}
    </div>
  )
}
