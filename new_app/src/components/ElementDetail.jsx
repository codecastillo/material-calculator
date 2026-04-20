import { CATEGORIES } from '../data/elements'
import ElectronShells from './ElectronShells'
import './ElementDetail.css'

export default function ElementDetail({ element }) {
  if (!element) {
    return (
      <div className="detail-card detail-empty">
        <div className="empty-atom">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="4" fill="var(--text-ghost)" opacity="0.4" />
            <circle cx="24" cy="24" r="12" stroke="var(--text-ghost)" strokeWidth="0.5" opacity="0.25" />
            <circle cx="24" cy="24" r="20" stroke="var(--text-ghost)" strokeWidth="0.5" opacity="0.15" />
          </svg>
        </div>
        <p className="empty-text">Hover or select an element</p>
      </div>
    )
  }

  const cat = CATEGORIES[element.category]

  return (
    <div className="detail-card" style={{ '--dc': cat.color, '--dca': cat.accent }}>
      <div className="detail-glow" />

      <div className="detail-top">
        <div className="detail-meta">
          <span className="detail-num">{element.number}</span>
          <span className="detail-phase-tag">{element.phase}</span>
        </div>
        <div className="detail-hero">
          <span className="detail-symbol">{element.symbol}</span>
        </div>
        <h2 className="detail-name">{element.name}</h2>
        <div className="detail-mass">{element.mass} u</div>
        <div className="detail-cat-badge">
          <span className="cat-dot" style={{ background: cat.color }} />
          {cat.name}
        </div>
      </div>

      {/* Electron shell visualization */}
      <div className="detail-shells">
        <ElectronShells element={element} color={cat.accent} />
      </div>

      <p className="detail-desc">{element.summary}</p>

      <div className="detail-props">
        <PropRow label="Electron Configuration" value={element.electron_config} mono />
        <PropRow label="Electronegativity" value={element.electronegativity} />
        <PropRow label="Density" value={element.density ? `${element.density} g/cm\u00B3` : null} />
        <PropRow label="Melting Point" value={element.melting != null ? `${element.melting}\u00B0C` : null} />
        <PropRow label="Boiling Point" value={element.boiling != null ? `${element.boiling}\u00B0C` : null} />
        <PropRow
          label="Discovered"
          value={element.discovered > 0 ? element.discovered : `~${Math.abs(element.discovered)} BC`}
        />
      </div>
    </div>
  )
}

function PropRow({ label, value, mono }) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <span className={`prop-value ${mono ? 'mono' : ''}`}>{value ?? '\u2014'}</span>
    </div>
  )
}
