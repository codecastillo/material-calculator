import './TrendOverlay.css';

const TRENDS = [
  { key: 'electronegativity', label: 'Eneg' },
  { key: 'atomic-radius', label: 'Radius' },
  { key: 'ionization-energy', label: 'IE' },
];

const TREND_CONFIG = {
  'electronegativity': {
    direction: 'top-right',
    description: 'Electronegativity',
    hint: 'Increases → and ↑',
    color: '#3d8ef0',
  },
  'atomic-radius': {
    direction: 'bottom-left',
    description: 'Atomic Radius',
    hint: 'Increases ← and ↓',
    color: '#e07c4f',
  },
  'ionization-energy': {
    direction: 'top-right',
    description: 'Ionization Energy',
    hint: 'Increases → and ↑',
    color: '#8b5cf6',
  },
};

export function TrendControls({ activeTrend, onTrendChange }) {
  return (
    <div className="trend-controls">
      {TRENDS.map(({ key, label }) => (
        <button
          key={key}
          className={`trend-controls__btn${activeTrend === key ? ' trend-controls__btn--active' : ''}`}
          onClick={() => onTrendChange(activeTrend === key ? null : key)}
          title={TREND_CONFIG[key].description}
        >
          <span className="trend-controls__icon">
            {TREND_CONFIG[key].direction === 'top-right' ? '↗' : '↙'}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function TrendOverlay({ activeTrend }) {
  if (!activeTrend) return null;

  const config = TREND_CONFIG[activeTrend];
  if (!config) return null;

  const isTopRight = config.direction === 'top-right';

  return (
    <div className="trend-overlay">
      <svg
        className="trend-overlay__svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient along the arrow direction */}
          <linearGradient
            id={`trend-grad-${activeTrend}`}
            x1={isTopRight ? '0%' : '100%'}
            y1={isTopRight ? '100%' : '0%'}
            x2={isTopRight ? '100%' : '0%'}
            y2={isTopRight ? '0%' : '100%'}
          >
            <stop offset="0%" stopColor={config.color} stopOpacity="0.02" />
            <stop offset="50%" stopColor={config.color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0.18" />
          </linearGradient>

          {/* Arrowhead marker */}
          <marker
            id={`trend-arrow-${activeTrend}`}
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path
              d="M2 2 L10 6 L2 10"
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </marker>
        </defs>

        {/* Background wash */}
        <rect
          x="0" y="0" width="1000" height="600"
          fill={`url(#trend-grad-${activeTrend})`}
        />

        {/* Main diagonal arrow */}
        <line
          className="trend-overlay__arrow trend-overlay__arrow--main"
          x1={isTopRight ? 140 : 860}
          y1={isTopRight ? 480 : 120}
          x2={isTopRight ? 860 : 140}
          y2={isTopRight ? 120 : 480}
          stroke={config.color}
          strokeWidth="3"
          strokeOpacity="0.35"
          markerEnd={`url(#trend-arrow-${activeTrend})`}
          strokeDasharray="12 8"
        />

        {/* Secondary horizontal arrow */}
        <line
          className="trend-overlay__arrow trend-overlay__arrow--horiz"
          x1={isTopRight ? 100 : 900}
          y1="300"
          x2={isTopRight ? 900 : 100}
          y2="300"
          stroke={config.color}
          strokeWidth="2"
          strokeOpacity="0.18"
          markerEnd={`url(#trend-arrow-${activeTrend})`}
          strokeDasharray="8 6"
        />

        {/* Secondary vertical arrow */}
        <line
          className="trend-overlay__arrow trend-overlay__arrow--vert"
          x1="500"
          y1={isTopRight ? 520 : 80}
          x2="500"
          y2={isTopRight ? 80 : 520}
          stroke={config.color}
          strokeWidth="2"
          strokeOpacity="0.18"
          markerEnd={`url(#trend-arrow-${activeTrend})`}
          strokeDasharray="8 6"
        />

        {/* Parallel diagonal guide lines */}
        {[180, 340].map((offset) => (
          <line
            key={offset}
            className="trend-overlay__arrow trend-overlay__arrow--guide"
            x1={isTopRight ? 140 + offset : 860 - offset}
            y1={isTopRight ? 480 : 120}
            x2={isTopRight ? 860 : 140}
            y2={isTopRight ? 120 + offset : 480 - offset}
            stroke={config.color}
            strokeWidth="1"
            strokeOpacity="0.1"
            strokeDasharray="6 10"
          />
        ))}
      </svg>

      {/* Legend box */}
      <div
        className="trend-overlay__legend"
        style={{ '--trend-color': config.color }}
      >
        <span className="trend-overlay__legend-title">{config.description}</span>
        <span className="trend-overlay__legend-hint">{config.hint}</span>
      </div>
    </div>
  );
}
