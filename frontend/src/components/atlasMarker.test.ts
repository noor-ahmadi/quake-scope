import { describe, expect, it } from 'vitest'
import { atlasMarkerSize, createAtlasMarkerIcon } from './atlasMarker'

describe('atlasMarker', () => {
  it('keeps observation marks legible and bounded across magnitude extremes', () => {
    expect(atlasMarkerSize(null)).toBe(18)
    expect(atlasMarkerSize(2)).toBe(18)
    expect(atlasMarkerSize(100)).toBe(46)
  })

  it('prints selected magnitude details into a larger field mark', () => {
    const icon = createAtlasMarkerIcon(6.2, true)

    expect(icon.options.className).toContain('atlas-marker-host--major')
    expect(icon.options.className).toContain('is-selected')
    expect(icon.options.iconSize).toEqual([58, 58])
    expect(icon.options.html).toContain('aria-hidden="true"')
    expect(icon.options.html).toContain('atlas-marker__label')
    expect(icon.options.html).toContain('M 6.2')
  })

  it('keeps unselected marks quiet', () => {
    const icon = createAtlasMarkerIcon(3.4, false)

    expect(icon.options.className).toContain('atlas-marker-host--medium')
    expect(icon.options.className).not.toContain('is-selected')
    expect(icon.options.html).not.toContain('atlas-marker__label')
  })
})
