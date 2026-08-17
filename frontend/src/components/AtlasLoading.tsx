interface AtlasLoadingProps {
  eventCount: number
}

export function AtlasLoading({ eventCount }: AtlasLoadingProps) {
  return (
    <section className="panel map-panel atlas-loading" aria-label="Loading earthquake map" role="status">
      <div className="panel-heading map-heading">
        <div>
          <span className="eyebrow">Plate 01 / global plot</span>
          <h2>Live atlas</h2>
        </div>
        <span className="map-count"><b>{eventCount}</b> events plotted</span>
      </div>

      <div className="map-shell atlas-loading__shell">
        <div className="atlas-loading__target" aria-hidden="true">
          <span />
          <span />
          <i />
        </div>
        <div className="atlas-loading__copy">
          <span className="eyebrow">Plate assembly / incoming</span>
          <strong>Plotting field observations.</strong>
          <small>Loading the map engine and preparing the latest catalog.</small>
        </div>
        <div className="atlas-loading__meter" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
