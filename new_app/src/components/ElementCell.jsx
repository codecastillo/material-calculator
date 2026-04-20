import { memo } from 'react'
import { CATEGORIES } from '../data/elements'
import './ElementCell.css'

const PHASE_COLORS = {
  Solid: '#4aad6a',
  Liquid: '#3d8ef0',
  Gas: '#e8564a',
  Unknown: '#505264',
}

const ElementCell = memo(function ElementCell({
  element, isSelected, isFocused, isDimmed, onSelect, onHover, heatColor, phaseAtTemp,
}) {
  const cat = CATEGORIES[element.category]
  const displayColor = heatColor || cat.color
  const displayAccent = heatColor || cat.accent
  const phaseColor = phaseAtTemp ? PHASE_COLORS[phaseAtTemp] : null

  return (
    <button
      className={`el-cell ${isSelected ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      style={{
        '--c': displayColor,
        '--ca': displayAccent,
        ...(phaseColor && phaseAtTemp !== element.phase ? { '--phase-indicator': phaseColor } : {}),
      }}
      onClick={() => onSelect(element)}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="el-num">{element.number}</span>
      <span className="el-sym">{element.symbol}</span>
      <span className="el-mass">{element.mass}</span>
      {phaseAtTemp && phaseAtTemp !== element.phase && (
        <span className="el-phase-dot" style={{ background: phaseColor }} />
      )}
    </button>
  )
})

export default ElementCell
