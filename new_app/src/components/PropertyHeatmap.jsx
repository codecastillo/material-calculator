import './PropertyHeatmap.css';

const PROPERTIES = [
  { key: 'electronegativity', label: 'Electronegativity' },
  { key: 'density', label: 'Density' },
  { key: 'melting', label: 'Melting' },
  { key: 'boiling', label: 'Boiling' },
  { key: 'discovered', label: 'Discovered' },
];

export default function PropertyHeatmap({ activeProperty, onPropertyChange }) {
  return (
    <div className="property-heatmap">
      {PROPERTIES.map(({ key, label }) => (
        <button
          key={key}
          className={`property-heatmap__btn${activeProperty === key ? ' property-heatmap__btn--active' : ''}`}
          onClick={() => onPropertyChange(activeProperty === key ? null : key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
