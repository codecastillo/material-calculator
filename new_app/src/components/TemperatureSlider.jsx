import './TemperatureSlider.css'

const PRESETS = [
  { label: 'Absolute Zero', kelvin: 0 },
  { label: 'Room Temp', kelvin: 293 },
  { label: 'Water Boils', kelvin: 373 },
  { label: 'Iron Melts', kelvin: 1811 },
  { label: 'Surface of Sun', kelvin: 5778 },
]

export default function TemperatureSlider({ temperature, onTemperatureChange }) {
  const celsius = (temperature - 273.15).toFixed(1)
  const percent = (temperature / 6000) * 100

  return (
    <div className="temp-slider">
      <div className="temp-slider-track-wrap">
        <input
          type="range"
          min="0"
          max="6000"
          step="1"
          value={temperature}
          onChange={e => onTemperatureChange(Number(e.target.value))}
          className="temp-slider-input"
          style={{ '--thumb-percent': `${percent}%` }}
        />
      </div>
      <div className="temp-slider-readout">
        <span className="temp-value">{temperature}<span className="temp-unit">K</span></span>
        <span className="temp-separator">/</span>
        <span className="temp-value">{celsius}<span className="temp-unit">°C</span></span>
      </div>
      <div className="temp-presets">
        {PRESETS.map(p => (
          <button
            key={p.label}
            className={`temp-preset${temperature === p.kelvin ? ' active' : ''}`}
            onClick={() => onTemperatureChange(p.kelvin)}
            title={`${p.kelvin}K`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
