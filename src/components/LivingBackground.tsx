import { CSSProperties } from 'react'

const CLOUDS: CSSProperties[] = [
  { top: '10%', width: 220, height: 60, animationDuration: '68s', opacity: 0.7 },
  { top: '18%', width: 300, height: 78, animationDuration: '92s', animationDelay: '-30s', opacity: 0.55 },
  { top: '6%', width: 160, height: 46, animationDuration: '54s', animationDelay: '-12s', opacity: 0.8 },
  { top: '24%', width: 260, height: 70, animationDuration: '110s', animationDelay: '-70s', opacity: 0.45 },
]

const BIRDS = [
  { top: '22%', left: '12%', delay: '0s', dur: '14s', scale: 1 },
  { top: '18%', left: '30%', delay: '-4s', dur: '17s', scale: 0.8 },
  { top: '28%', left: '22%', delay: '-9s', dur: '20s', scale: 1.15 },
  { top: '15%', left: '46%', delay: '-6s', dur: '16s', scale: 0.7 },
]

/**
 * A living version of the backdrop: drifting clouds, a flock of birds, chimney
 * smoke, a waving castle banner, a shimmering waterfall and a slow day/night
 * cycle layered over the static art.
 */
export function LivingBackground() {
  return (
    <div className="living-bg" aria-hidden>
      <div className="bg-layer" />
      <div className="waterfall-shimmer" />

      <div className="sky">
        {CLOUDS.map((style, i) => (
          <div key={i} className="cloud" style={style} />
        ))}
        {BIRDS.map((b, i) => (
          <div
            key={i}
            className="bird-path"
            style={{ top: b.top, left: b.left, animationDuration: b.dur, animationDelay: b.delay }}
          >
            <div className="bird" style={{ transform: `scale(${b.scale})` }} />
          </div>
        ))}
      </div>

      <div className="smoke-source" style={{ left: '31%', top: '46%' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="smoke" style={{ animationDelay: `${i * 1.8}s` }} />
        ))}
      </div>

      <div className="flag" style={{ left: '70.5%', top: '20%' }}>
        <span className="flag-pole" />
        <span className="flag-cloth" />
      </div>

      <div className="day-night" />
      <div className="bg-vignette" />
    </div>
  )
}
