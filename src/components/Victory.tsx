import { CSSProperties, useMemo } from 'react'
import { GameSession } from '../game/session'
import { WinResult, fmtDuration } from '../game/stats'

interface Props {
  engineName: string
  session: GameSession
  result: WinResult
  masteryLevel: number
  onNext: (() => void) | null
  onRestart: () => void
  onExit: () => void
}

const CONFETTI_COLORS = ['#f4cf6b', '#ff6b6b', '#6bd0ff', '#8fe08f', '#c98bff', '#ffffff']

export function Victory({
  engineName,
  session,
  result,
  masteryLevel,
  onNext,
  onRestart,
  onExit,
}: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 48 }, () => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        animationDelay: `${Math.random() * 1.2}s`,
        animationDuration: `${2 + Math.random() * 1.8}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      })),
    [],
  )

  const coins = useMemo(
    () =>
      Array.from({ length: 20 }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist = 120 + Math.random() * 220
        return {
          ['--tx']: `${Math.cos(angle) * dist}px`,
          ['--ty']: `${Math.sin(angle) * dist - 60}px`,
          animationDelay: `${Math.random() * 0.25}s`,
        } as CSSProperties
      }),
    [],
  )

  return (
    <div className="win-overlay">
      <div className="confetti-layer" aria-hidden>
        {confetti.map((style, i) => (
          <span key={i} className="confetti" style={style} />
        ))}
      </div>
      <div className="coin-burst" aria-hidden>
        {coins.map((style, i) => (
          <span key={i} className="coin" style={style}>
            {'\uD83D\uDFE1'}
          </span>
        ))}
      </div>

      <div className="win-card">
        <div className="win-title">Victory!</div>
        <div className="win-sub">
          {session.worldName ? `${session.worldName} \u00B7 Stage ${session.stage}` : engineName} {'\u2014'}{' '}
          Mastery {masteryLevel}
        </div>

        <div className={`objective-result ${result.objectiveMet ? 'met' : 'missed'}`}>
          <span className="obj-mark">{result.objectiveMet ? '\u2714' : '\u2716'}</span>
          <span>
            {result.objectiveMet ? 'Objective complete: ' : 'Objective missed: '}
            {session.objective.short}
          </span>
        </div>

        <div className="win-scoreline">
          <div>
            <div className="ws-value">{result.score.toLocaleString()}</div>
            <div className="ws-label">Score</div>
          </div>
          <div>
            <div className="ws-value">{fmtDuration(result.timeMs)}</div>
            <div className="ws-label">Time</div>
          </div>
        </div>

        <div className="win-rewards">
          +{500 + (result.objectiveMet ? 250 : 0)} Gold &nbsp; +{120 + (result.objectiveMet ? 80 : 0)}{' '}
          XP {result.objectiveMet ? '\u00B7 Objective bonus!' : ''}
        </div>

        <div className="win-actions">
          {onNext && (
            <button className="win-btn" onClick={onNext}>
              Next Stage
            </button>
          )}
          <button className="win-btn ghost" onClick={onRestart}>
            Play Again
          </button>
          <button className="win-btn ghost" onClick={onExit}>
            {session.worldName ? 'World Map' : 'Library'}
          </button>
        </div>
      </div>
    </div>
  )
}
