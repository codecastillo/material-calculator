import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { elements } from '../data/elements.js'
import './Timeline.css'

const MIN_YEAR = -3750
const MAX_YEAR = 2010
const RANGE = MAX_YEAR - MIN_YEAR

const PRESETS = [
  { label: 'Ancient', year: -500 },
  { label: '1800s', year: 1800 },
  { label: '1900s', year: 1900 },
  { label: 'Modern', year: 1990 },
]

const PLAY_DURATION = 10000 // ms

function buildDensityGradient() {
  const buckets = 100
  const counts = new Array(buckets).fill(0)

  for (const el of elements) {
    const norm = (el.discovered - MIN_YEAR) / RANGE
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(norm * buckets)))
    counts[idx]++
  }

  // Spread influence to neighbors for smoother look
  const smooth = new Array(buckets).fill(0)
  for (let i = 0; i < buckets; i++) {
    for (let j = Math.max(0, i - 2); j <= Math.min(buckets - 1, i + 2); j++) {
      const dist = Math.abs(i - j)
      smooth[j] += counts[i] * (1 - dist * 0.3)
    }
  }

  const max = Math.max(...smooth)
  const stops = smooth.map((v, i) => {
    const pct = (i / (buckets - 1)) * 100
    const intensity = max > 0 ? v / max : 0
    // Blend from dim gold to bright gold based on density
    const alpha = 0.08 + intensity * 0.55
    return `rgba(200, 164, 78, ${alpha.toFixed(3)}) ${pct.toFixed(1)}%`
  })

  return `linear-gradient(to right, ${stops.join(', ')})`
}

function formatYear(year) {
  if (year < 0) return `${Math.abs(year)} BC`
  return `${year} AD`
}

export default function Timeline({ onYearChange, activeYear, onClose }) {
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const startYearRef = useRef(MIN_YEAR)

  const densityGradient = useMemo(() => buildDensityGradient(), [])

  const discoveredCount = useMemo(() => {
    if (activeYear == null) return elements.length
    return elements.filter(el => el.discovered <= activeYear).length
  }, [activeYear])

  const currentYear = activeYear ?? MAX_YEAR
  const sliderValue = currentYear - MIN_YEAR
  const percent = (sliderValue / RANGE) * 100

  const handleSliderChange = useCallback((e) => {
    const val = Number(e.target.value)
    onYearChange(MIN_YEAR + val)
    // Stop playback if user manually scrubs
    if (playing) {
      setPlaying(false)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onYearChange, playing])

  // Play/pause animation
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    startRef.current = performance.now()
    startYearRef.current = currentYear <= MIN_YEAR + 10 ? MIN_YEAR : currentYear

    const animate = (now) => {
      const elapsed = now - startRef.current
      const progress = Math.min(1, elapsed / PLAY_DURATION)
      const fromYear = startYearRef.current
      const year = Math.round(fromYear + (MAX_YEAR - fromYear) * progress)

      onYearChange(year)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setPlaying(false)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (!playing && currentYear >= MAX_YEAR - 10) {
      // Reset to start if at end
      onYearChange(MIN_YEAR)
      setTimeout(() => setPlaying(true), 50)
    } else {
      setPlaying(p => !p)
    }
  }

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-title">Discovery Timeline</span>
        <button className="timeline-close" onClick={onClose} title="Close timeline">
          &times;
        </button>
      </div>

      <div className="timeline-year-display">
        <span className="timeline-year-value">{formatYear(currentYear)}</span>
      </div>

      <div className="timeline-slider-row">
        <button
          className={`timeline-play-btn${playing ? ' playing' : ''}`}
          onClick={togglePlay}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        <div className="timeline-track-wrap">
          <div
            className="timeline-density-bar"
            style={{ background: densityGradient }}
          />
          <div
            className="timeline-progress-fill"
            style={{ width: `${percent}%` }}
          />
          <input
            type="range"
            min="0"
            max={RANGE}
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="timeline-input"
          />
        </div>
      </div>

      <div className="timeline-labels">
        <span className="timeline-label-edge">3750 BC</span>
        <span className="timeline-label-edge">2010 AD</span>
      </div>

      <div className="timeline-footer">
        <div className="timeline-count">
          <span className="timeline-count-num">{discoveredCount}</span>
          <span className="timeline-count-text"> of 118 elements discovered</span>
        </div>
        <div className="timeline-presets">
          {PRESETS.map(p => (
            <button
              key={p.label}
              className={`timeline-preset${currentYear === p.year ? ' active' : ''}`}
              onClick={() => {
                onYearChange(p.year)
                if (playing) {
                  setPlaying(false)
                  if (rafRef.current) cancelAnimationFrame(rafRef.current)
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
