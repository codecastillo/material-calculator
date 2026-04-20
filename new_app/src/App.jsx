import { useState, useCallback } from 'react'
import PeriodicTable from './components/PeriodicTable'
import ElementDetail from './components/ElementDetail'
import Legend from './components/Legend'
import SearchBar from './components/SearchBar'
import TemperatureSlider from './components/TemperatureSlider'
import PropertyHeatmap from './components/PropertyHeatmap'
import ComparePanel from './components/ComparePanel'
import { getHeatmapColor } from './utils/heatmap'
import './App.css'

function App() {
  const [selectedElement, setSelectedElement] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [highlightCategory, setHighlightCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [temperatureFilter, setTemperatureFilter] = useState(null)
  const [temperature, setTemperature] = useState(null)
  const [showTempSlider, setShowTempSlider] = useState(false)
  const [heatmapProperty, setHeatmapProperty] = useState(null)
  const [compareElements, setCompareElements] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  const handleSelect = useCallback((element) => {
    setSelectedElement(prev => prev?.number === element.number ? null : element)
  }, [])

  const handleTableSelect = useCallback((element) => {
    if (window.event?.shiftKey || window._lastClickShift) {
      setCompareElements(prev => {
        if (prev.find(e => e.number === element.number)) return prev.filter(e => e.number !== element.number)
        if (prev.length >= 2) return [prev[1], element]
        return [...prev, element]
      })
      setShowCompare(true)
      return
    }
    handleSelect(element)
  }, [handleSelect])

  const handleCompareRemove = useCallback((num) => {
    setCompareElements(prev => prev.filter(e => e.number !== num))
  }, [])

  return (
    <div className="app" onClick={e => { window._lastClickShift = e.shiftKey }}>
      <header className="app-header">
        <div className="header-left">
          <div className="header-brand">
            <h1 className="brand-title">PERIODIC TABLE</h1>
            <div className="brand-rule" />
            <span className="brand-sub">OF THE ELEMENTS</span>
          </div>
        </div>

        <div className="header-controls">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <div className="divider" />
          <div className="phase-controls">
            <span className="phase-label">PHASE</span>
            {['Solid', 'Liquid', 'Gas'].map(phase => (
              <button
                key={phase}
                className={`phase-btn ${temperatureFilter === phase ? 'active' : ''}`}
                onClick={() => setTemperatureFilter(f => f === phase ? null : phase)}
              >
                <span className={`phase-dot ${phase.toLowerCase()}`} />
                {phase}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-section">
          <button
            className={`tool-btn ${showTempSlider ? 'active' : ''}`}
            onClick={() => {
              setShowTempSlider(v => !v)
              if (!showTempSlider && temperature === null) setTemperature(293)
              if (showTempSlider) setTemperature(null)
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
            TEMP
          </button>
          {showTempSlider && (
            <TemperatureSlider temperature={temperature ?? 293} onTemperatureChange={setTemperature} />
          )}
        </div>
        <div className="toolbar-section">
          <span className="tool-label">HEATMAP</span>
          <PropertyHeatmap activeProperty={heatmapProperty} onPropertyChange={setHeatmapProperty} />
        </div>
      </div>

      <div className="main-content">
        <PeriodicTable
          onSelect={handleTableSelect}
          onHover={setHoveredElement}
          selectedElement={selectedElement}
          highlightCategory={highlightCategory}
          searchTerm={searchTerm}
          temperatureFilter={temperatureFilter}
          heatmapProperty={heatmapProperty}
          getHeatmapColor={getHeatmapColor}
          temperature={temperature}
        />
        <div className="sidebar">
          <ElementDetail element={hoveredElement || selectedElement} />
          <Legend highlightCategory={highlightCategory} onCategoryClick={setHighlightCategory} />
        </div>
      </div>

      <footer className="app-footer">
        <span>118 ELEMENTS</span>
        <span className="footer-sep" />
        <span>SHIFT+CLICK TO COMPARE</span>
        <span className="footer-sep" />
        <span>ARROW KEYS TO NAVIGATE</span>
      </footer>

      {showCompare && compareElements.length > 0 && (
        <ComparePanel
          elements={compareElements}
          onRemove={handleCompareRemove}
          onClose={() => { setShowCompare(false); setCompareElements([]) }}
        />
      )}
    </div>
  )
}

export default App
