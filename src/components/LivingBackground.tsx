import { CSSProperties } from 'react'

const CLOUDS: CSSProperties[] = [
  { top: '9%', width: 240, height: 66, animationDuration: '42s', opacity: 0.85 },
  { top: '17%', width: 320, height: 84, animationDuration: '58s', animationDelay: '-20s', opacity: 0.7 },
  { top: '5%', width: 180, height: 52, animationDuration: '34s', animationDelay: '-12s', opacity: 0.9 },
  { top: '23%', width: 280, height: 74, animationDuration: '66s', animationDelay: '-44s', opacity: 0.6 },
  { top: '13%', width: 150, height: 44, animationDuration: '30s', animationDelay: '-8s', opacity: 0.8 },
]

const BIRDS = [
  { top: '20%', left: '8%', delay: '0s', dur: '9s', scale: 1.3 },
  { top: '16%', left: '20%', delay: '-2s', dur: '11s', scale: 1 },
  { top: '26%', left: '14%', delay: '-5s', dur: '10s', scale: 1.5 },
  { top: '13%', left: '34%', delay: '-3s', dur: '12s', scale: 0.9 },
  { top: '23%', left: '28%', delay: '-7s', dur: '9.5s', scale: 1.2 },
  { top: '30%', left: '40%', delay: '-4s', dur: '13s', scale: 1.1 },
  { top: '18%', left: '48%', delay: '-8s', dur: '10.5s', scale: 0.8 },
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

      <div className="flag" style={{ left: '70.5%', top: '18%' }}>
        <span className="flag-pole" />
        <span className="flag-cloth" />
      </div>

      <div className="mist" />
      <div className="day-night" />
      <div className="bg-vignette" />
    </div>
  )
}
