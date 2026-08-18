import { motion } from 'motion/react'
import { formatCount, formatMagnitude } from '../format'
import type { Earthquake } from '../types'

interface SeismicTraceProps {
  earthquakes: Earthquake[]
  totalEvents: number | null
  maximumMagnitude: number | null
  health: 'UP' | 'DOWN' | 'UNKNOWN'
}

const TRACE_WIDTH = 960
const TRACE_BASELINE = 32

export function buildTracePath(earthquakes: Earthquake[]): string {
  const amplitudes = earthquakes.length > 0
    ? earthquakes.slice(0, 14).map((earthquake) => {
        const magnitude = Math.abs(earthquake.magnitude ?? 0.8)
        return Math.min(28, Math.max(4, magnitude * 4.35))
      })
    : [3, 5, 2, 4, 3, 6, 2, 4]
  const interval = TRACE_WIDTH / (amplitudes.length + 1)
  const segments = [`M 0 ${TRACE_BASELINE}`]

  amplitudes.forEach((amplitude, index) => {
    const x = interval * (index + 1)
    const lead = x - 10
    const rise = x - 2.5
    const fall = x + 3
    const settle = x + 9

    segments.push(
      `L ${lead.toFixed(1)} ${TRACE_BASELINE}`,
      `L ${rise.toFixed(1)} ${TRACE_BASELINE}`,
      `L ${x.toFixed(1)} ${(TRACE_BASELINE - amplitude).toFixed(1)}`,
      `L ${fall.toFixed(1)} ${(TRACE_BASELINE + amplitude * 0.58).toFixed(1)}`,
      `L ${settle.toFixed(1)} ${TRACE_BASELINE}`,
    )
  })

  segments.push(`L ${TRACE_WIDTH} ${TRACE_BASELINE}`)
  return segments.join(' ')
}

export function SeismicTrace({
  earthquakes,
  totalEvents,
  maximumMagnitude,
  health,
}: SeismicTraceProps) {
  const tracePath = buildTracePath(earthquakes)
  const traceKey = earthquakes.map((earthquake) => earthquake.usgsId).join('|') || 'standby'
  const signal = health === 'UP' ? 'live' : health === 'DOWN' ? 'interrupted' : 'acquiring'
  const countLabel = totalEvents === null ? 'Awaiting catalog' : `${formatCount(totalEvents)} catalog marks`

  return (
    <div
      className={`hero-trace hero-trace--${health.toLowerCase()}`}
      role="img"
      aria-label={`Seismic trace, ${signal} signal. ${countLabel}. Peak ${formatMagnitude(maximumMagnitude)}.`}
    >
      <span className="hero-trace__register" aria-hidden="true">
        <i />
        <span>
          <small>{signal} signal</small>
          <strong>Station 00 / waveform</strong>
        </span>
      </span>

      <span className="hero-trace__plot" aria-hidden="true">
        <svg viewBox={`0 0 ${TRACE_WIDTH} 64`} preserveAspectRatio="none">
          <line className="hero-trace__baseline" x1="0" y1={TRACE_BASELINE} x2={TRACE_WIDTH} y2={TRACE_BASELINE} />
          <motion.path
            key={traceKey}
            className="hero-trace__line"
            d={tracePath}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </svg>
        <i className="hero-trace__scan" />
      </span>

      <span className="hero-trace__reading" aria-hidden="true">
        <small>Peak / survey</small>
        <strong>{formatMagnitude(maximumMagnitude)}</strong>
        <em>{totalEvents === null ? 'linking' : `${formatCount(totalEvents)} marks`}</em>
      </span>
    </div>
  )
}
