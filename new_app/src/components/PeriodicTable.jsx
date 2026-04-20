import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { elements } from '../data/elements'
import ElementCell from './ElementCell'
import './PeriodicTable.css'

function getGridPosition(el) {
  if (el.number >= 57 && el.number <= 71) {
    return { col: el.number - 57 + 3, row: 9 }
  }
  if (el.number >= 89 && el.number <= 103) {
    return { col: el.number - 89 + 3, row: 10 }
  }
  return { col: el.group, row: el.period }
}

// Build a grid map for keyboard navigation: [row][col] → element
const mainGridElements = elements.filter(el => !((el.number >= 57 && el.number <= 71) || (el.number >= 89 && el.number <= 103)))
const gridMap = {}
mainGridElements.forEach(el => {
  const pos = getGridPosition(el)
  if (!gridMap[pos.row]) gridMap[pos.row] = {}
  gridMap[pos.row][pos.col] = el
})

function findNearest(row, col, dRow, dCol) {
  let r = row + dRow
  let c = col + dCol
  const maxAttempts = 20
  for (let i = 0; i < maxAttempts; i++) {
    if (r < 1 || r > 7 || c < 1 || c > 18) return null
    if (gridMap[r]?.[c]) return gridMap[r][c]
    // If moving horizontally, keep going in that direction
    if (dCol !== 0) {
      c += dCol
    } else {
      // If moving vertically, try same col in next row
      r += dRow
    }
  }
  return null
}

export default function PeriodicTable({
  onSelect, onHover, selectedElement, highlightCategory, searchTerm, temperatureFilter,
  heatmapProperty, getHeatmapColor, temperature,
}) {
  const searchLower = searchTerm.toLowerCase()
  const [highlightGroup, setHighlightGroup] = useState(null)
  const [highlightPeriod, setHighlightPeriod] = useState(null)
  const [focusedElement, setFocusedElement] = useState(null)
  const wrapperRef = useRef(null)

  const matchesSearch = useMemo(() => {
    if (!searchTerm) return null
    const set = new Set()
    elements.forEach(el => {
      if (
        el.name.toLowerCase().includes(searchLower) ||
        el.symbol.toLowerCase().includes(searchLower) ||
        String(el.number).includes(searchTerm)
      ) {
        set.add(el.number)
      }
    })
    return set
  }, [searchTerm, searchLower])

  // Compute phase at a given temperature (Kelvin → Celsius)
  const getPhaseAtTemp = useCallback((el) => {
    if (temperature == null) return el.phase
    const tempC = temperature - 273.15
    if (el.melting == null && el.boiling == null) return 'Unknown'
    if (el.melting != null && tempC < el.melting) return 'Solid'
    if (el.boiling != null && tempC >= el.boiling) return 'Gas'
    if (el.melting != null && el.boiling != null) return 'Liquid'
    // If only melting is known and we're above it
    if (el.melting != null && tempC >= el.melting) return 'Liquid'
    return el.phase
  }, [temperature])

  const isDimmedFn = useCallback((el) => {
    if (highlightCategory && el.category !== highlightCategory) return true
    if (matchesSearch && !matchesSearch.has(el.number)) return true
    if (temperatureFilter && el.phase !== temperatureFilter) return true
    if (highlightGroup && el.group !== highlightGroup) {
      // Lanthanides/actinides don't have a meaningful "group" for highlighting
      if (!((el.number >= 57 && el.number <= 71) || (el.number >= 89 && el.number <= 103))) return true
    }
    if (highlightPeriod && el.period !== highlightPeriod) return true
    return false
  }, [highlightCategory, matchesSearch, temperatureFilter, highlightGroup, highlightPeriod])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT') return

      const current = focusedElement || selectedElement
      if (!current) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault()
          setFocusedElement(elements[0])
          onHover(elements[0])
        }
        return
      }

      const pos = getGridPosition(current)
      // Skip if this is a lanthanide/actinide in the f-block
      const isF = (current.number >= 57 && current.number <= 71) || (current.number >= 89 && current.number <= 103)
      let next = null

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (isF) {
            const idx = elements.indexOf(current)
            next = elements[idx + 1] || null
          } else {
            next = findNearest(pos.row, pos.col, 0, 1)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (isF) {
            const idx = elements.indexOf(current)
            next = elements[idx - 1] || null
          } else {
            next = findNearest(pos.row, pos.col, 0, -1)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (!isF) next = findNearest(pos.row, pos.col, 1, 0)
          break
        case 'ArrowUp':
          e.preventDefault()
          if (!isF) next = findNearest(pos.row, pos.col, -1, 0)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (current) onSelect(current)
          return
        case 'Escape':
          e.preventDefault()
          setFocusedElement(null)
          onHover(null)
          return
        default:
          return
      }

      if (next) {
        setFocusedElement(next)
        onHover(next)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedElement, selectedElement, onSelect, onHover])

  return (
    <div className="pt-wrapper" ref={wrapperRef} tabIndex={-1}>
      {/* Period labels */}
      <div className="pt-periods">
        {[1,2,3,4,5,6,7].map(p => (
          <div
            key={p}
            className={`period-num ${highlightPeriod === p ? 'is-hl' : ''}`}
            onMouseEnter={() => setHighlightPeriod(p)}
            onMouseLeave={() => setHighlightPeriod(null)}
          >
            {p}
          </div>
        ))}
      </div>

      <div className="pt-grid-area">
        {/* Group labels */}
        <div className="pt-groups">
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i + 1}
              className={`group-num ${highlightGroup === i + 1 ? 'is-hl' : ''}`}
              onMouseEnter={() => setHighlightGroup(i + 1)}
              onMouseLeave={() => setHighlightGroup(null)}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="pt-grid">
          {elements
            .filter(el => !((el.number >= 57 && el.number <= 71) || (el.number >= 89 && el.number <= 103)))
            .map(el => {
            const pos = getGridPosition(el)
            const isDimmed = isDimmedFn(el)
            const phaseAtTemp = temperature != null ? getPhaseAtTemp(el) : el.phase
            const heatColor = heatmapProperty && getHeatmapColor ? getHeatmapColor(el, heatmapProperty) : null

            return (
              <div
                key={el.number}
                className="grid-slot"
                style={{
                  gridColumn: pos.col,
                  gridRow: pos.row,
                  animationDelay: `${el.number * 8}ms`,
                }}
              >
                <ElementCell
                  element={el}
                  isSelected={selectedElement?.number === el.number}
                  isFocused={focusedElement?.number === el.number}
                  isDimmed={isDimmed}
                  onSelect={onSelect}
                  onHover={onHover}
                  heatColor={heatColor}
                  phaseAtTemp={phaseAtTemp}
                />
              </div>
            )
          })}

          <div className="grid-slot" style={{ gridColumn: 3, gridRow: 6 }}>
            <div className="series-ref-cell lanthanide">
              <span className="ref-range">57-71</span>
              <span className="ref-symbol">La-Lu</span>
              <span className="ref-name">Lanthanides</span>
            </div>
          </div>
          <div className="grid-slot" style={{ gridColumn: 3, gridRow: 7 }}>
            <div className="series-ref-cell actinide">
              <span className="ref-range">89-103</span>
              <span className="ref-symbol">Ac-Lr</span>
              <span className="ref-name">Actinides</span>
            </div>
          </div>
        </div>

        {/* F-block separator */}
        <div className="fblock-gap">
          <div className="fblock-line" />
        </div>

        <div className="pt-fblock">
          {elements.filter(el => (el.number >= 57 && el.number <= 71) || (el.number >= 89 && el.number <= 103)).map(el => {
            const pos = getGridPosition(el)
            const isDimmed = isDimmedFn(el)
            const phaseAtTemp = temperature != null ? getPhaseAtTemp(el) : el.phase
            const heatColor = heatmapProperty && getHeatmapColor ? getHeatmapColor(el, heatmapProperty) : null

            return (
              <div
                key={el.number}
                className="grid-slot"
                style={{
                  gridColumn: pos.col - 2,
                  gridRow: pos.row - 8,
                  animationDelay: `${el.number * 8}ms`,
                }}
              >
                <ElementCell
                  element={el}
                  isSelected={selectedElement?.number === el.number}
                  isFocused={focusedElement?.number === el.number}
                  isDimmed={isDimmed}
                  onSelect={onSelect}
                  onHover={onHover}
                  heatColor={heatColor}
                  phaseAtTemp={phaseAtTemp}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
