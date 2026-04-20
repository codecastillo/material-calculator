import { CATEGORIES } from '../data/elements'
import './ComparePanel.css'

const PROPERTIES = [
  { key: 'electronegativity', label: 'Electronegativity' },
  { key: 'density', label: 'Density (g/cm³)' },
  { key: 'melting', label: 'Melting Point (°C)' },
  { key: 'boiling', label: 'Boiling Point (°C)' },
  { key: 'mass', label: 'Atomic Mass (u)' },
]

function getCategoryColor(category) {
  return CATEGORIES[category]?.color || CATEGORIES['unknown'].color
}

function ComparePanel({ elements, onRemove, onClose }) {
  const el1 = elements[0] || null
  const el2 = elements[1] || null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="compare-backdrop" onClick={handleBackdropClick}>
      <div className="compare-panel">
        <button className="compare-panel__close" onClick={onClose}>
          &#x2715;
        </button>
        <h2 className="compare-panel__title">Element Comparison</h2>

        <div className="compare-panel__elements">
          {el1 ? (
            <div className="compare-element">
              <button
                className="compare-element__remove"
                onClick={() => onRemove(el1.number)}
              >
                &#x2715;
              </button>
              <div
                className="compare-element__symbol"
                style={{ color: getCategoryColor(el1.category) }}
              >
                {el1.symbol}
              </div>
              <div className="compare-element__name">{el1.name}</div>
              <div className="compare-element__number">#{el1.number}</div>
            </div>
          ) : (
            <div className="compare-placeholder">
              <span className="compare-placeholder__text">
                Select another element
              </span>
            </div>
          )}

          {el2 ? (
            <div className="compare-element">
              <button
                className="compare-element__remove"
                onClick={() => onRemove(el2.number)}
              >
                &#x2715;
              </button>
              <div
                className="compare-element__symbol"
                style={{ color: getCategoryColor(el2.category) }}
              >
                {el2.symbol}
              </div>
              <div className="compare-element__name">{el2.name}</div>
              <div className="compare-element__number">#{el2.number}</div>
            </div>
          ) : (
            <div className="compare-placeholder">
              <span className="compare-placeholder__text">
                Select another element
              </span>
            </div>
          )}
        </div>

        <div className="compare-bars">
          {PROPERTIES.map(({ key, label }) => {
            const val1 = el1 ? el1[key] : null
            const val2 = el2 ? el2[key] : null

            const absVal1 = val1 != null ? Math.abs(val1) : null
            const absVal2 = val2 != null ? Math.abs(val2) : null

            let maxVal = Math.max(absVal1 || 0, absVal2 || 0)
            if (maxVal === 0) maxVal = 1

            const pct1 = absVal1 != null ? (absVal1 / maxVal) * 100 : 0
            const pct2 = absVal2 != null ? (absVal2 / maxVal) * 100 : 0

            const color1 = el1 ? getCategoryColor(el1.category) : '#555'
            const color2 = el2 ? getCategoryColor(el2.category) : '#555'

            return (
              <div className="compare-bar-group" key={key}>
                <div className="compare-bar-group__label">{label}</div>
                <div className="compare-bar-row">
                  <div className="compare-bar compare-bar--left">
                    {val1 != null ? (
                      <>
                        <div
                          className="compare-bar__fill"
                          style={{
                            width: `${pct1}%`,
                            backgroundColor: color1,
                            opacity: 0.7,
                          }}
                        />
                        <span className="compare-bar__value">
                          {val1.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </>
                    ) : (
                      <div className="compare-bar__null" />
                    )}
                  </div>

                  <div className="compare-bar compare-bar--right">
                    {val2 != null ? (
                      <>
                        <div
                          className="compare-bar__fill"
                          style={{
                            width: `${pct2}%`,
                            backgroundColor: color2,
                            opacity: 0.7,
                          }}
                        />
                        <span className="compare-bar__value">
                          {val2.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </>
                    ) : (
                      <div className="compare-bar__null" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ComparePanel
