import { CATEGORIES } from '../data/elements'
import './Legend.css'

export default function Legend({ highlightCategory, onCategoryClick }) {
  return (
    <div className="legend-card">
      <div className="legend-header">
        <span className="legend-title">Classification</span>
        {highlightCategory && (
          <button className="legend-reset" onClick={() => onCategoryClick(null)}>
            Clear
          </button>
        )}
      </div>
      <div className="legend-grid">
        {Object.entries(CATEGORIES).map(([key, { name, color }]) => (
          <button
            key={key}
            className={`legend-chip ${highlightCategory === key ? 'is-active' : ''} ${highlightCategory && highlightCategory !== key ? 'is-faded' : ''}`}
            onClick={() => onCategoryClick(prev => prev === key ? null : key)}
          >
            <span className="chip-bar" style={{ background: color }} />
            <span className="chip-label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
