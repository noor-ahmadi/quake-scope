import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Earthquake } from '../types'
import { buildTracePath, SeismicTrace } from './SeismicTrace'

afterEach(cleanup)

const earthquakes = [
  { usgsId: 'minor', magnitude: 2.1 },
  { usgsId: 'major', magnitude: 6.2 },
] as Earthquake[]

describe('SeismicTrace', () => {
  it('turns the current observations into a bounded trace', () => {
    const path = buildTracePath(earthquakes)

    expect(path).toMatch(/^M 0 32/)
    expect(path).toContain('L 960 32')
    expect(path).not.toContain('NaN')
  })

  it('summarizes the live survey for assistive technology', () => {
    render(
      <SeismicTrace
        earthquakes={earthquakes}
        totalEvents={1234}
        maximumMagnitude={6.2}
        health="UP"
      />,
    )

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Seismic trace, live signal. 1,234 catalog marks. Peak M 6.2.',
    )
  })

  it('keeps the complete trace visible while its opacity settles', () => {
    const { container } = render(
      <SeismicTrace
        earthquakes={earthquakes}
        totalEvents={1234}
        maximumMagnitude={6.2}
        health="UP"
      />,
    )

    const trace = container.querySelector('.hero-trace__line')

    expect(trace).not.toHaveAttribute('pathLength')
    expect(trace).not.toHaveAttribute('stroke-dasharray')
    expect(trace?.getAttribute('d')).toMatch(/L 960 32$/)
  })
})
