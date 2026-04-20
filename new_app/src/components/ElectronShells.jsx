import React, { useMemo } from 'react';
import './ElectronShells.css';

// Noble gas core configurations
const NOBLE_GAS_CONFIGS = {
  '[He]': '1s2',
  '[Ne]': '1s2 2s2 2p6',
  '[Ar]': '1s2 2s2 2p6 3s2 3p6',
  '[Kr]': '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6',
  '[Xe]': '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6',
  '[Rn]': '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6',
};

function parseElectronConfig(configStr) {
  if (!configStr) return [];

  let expanded = configStr;

  // Expand noble gas abbreviations
  for (const [symbol, expansion] of Object.entries(NOBLE_GAS_CONFIGS)) {
    if (expanded.includes(symbol)) {
      expanded = expanded.replace(symbol, expansion);
      break;
    }
  }

  // Parse subshells: e.g. "1s2", "2p6", "3d10"
  const shellElectrons = [0, 0, 0, 0, 0, 0, 0]; // shells 1-7
  const regex = /(\d)([spdf])(\d+)/g;
  let match;

  while ((match = regex.exec(expanded)) !== null) {
    const shellNum = parseInt(match[1], 10); // 1-7
    const electrons = parseInt(match[3], 10);
    if (shellNum >= 1 && shellNum <= 7) {
      shellElectrons[shellNum - 1] += electrons;
    }
  }

  // Return only populated shells
  const result = [];
  for (let i = 0; i < shellElectrons.length; i++) {
    if (shellElectrons[i] > 0) {
      result.push(shellElectrons[i]);
    } else if (result.length > 0) {
      // Include empty inner shells if there are outer ones
      // Actually, just break at the last populated shell
      // Check if any later shells have electrons
      const hasLater = shellElectrons.slice(i + 1).some(e => e > 0);
      if (hasLater) {
        result.push(0);
      } else {
        break;
      }
    }
  }

  return result;
}

function ElectronShells({ element, color = '#6ee7b7' }) {
  const shells = useMemo(() => {
    return parseElectronConfig(element?.electron_config);
  }, [element?.electron_config]);

  if (!shells.length) return null;

  const size = 120;
  const center = size / 2;
  const maxRadius = 54;
  const minRadius = 14;

  return (
    <div className="electron-shells">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="electron-shells__svg"
      >
        {/* Nucleus glow */}
        <defs>
          <radialGradient id="nucleus-glow">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="60%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Nucleus */}
        <circle cx={center} cy={center} r="6" fill="url(#nucleus-glow)" />
        <circle cx={center} cy={center} r="2.5" fill={color} className="electron-shells__nucleus" />

        {/* Shells */}
        {shells.map((electronCount, shellIndex) => {
          const radius = minRadius + ((maxRadius - minRadius) * (shellIndex / Math.max(shells.length - 1, 1)));
          const opacity = 1 - (shellIndex * 0.15);
          const animDuration = 6 + shellIndex * 4; // slower for outer shells

          return (
            <g key={shellIndex}>
              {/* Orbit ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeOpacity={opacity * 0.25}
                strokeWidth="0.5"
                className="electron-shells__orbit"
              />

              {/* Electrons */}
              <g className="electron-shells__electron-group" style={{ animationDuration: `${animDuration}s` }}>
                {Array.from({ length: electronCount }, (_, i) => {
                  const angle = (360 / electronCount) * i;
                  const rad = (angle * Math.PI) / 180;
                  const ex = center + radius * Math.cos(rad);
                  const ey = center + radius * Math.sin(rad);

                  return (
                    <circle
                      key={i}
                      cx={ex}
                      cy={ey}
                      r="1.8"
                      fill={color}
                      fillOpacity={opacity}
                      className="electron-shells__electron"
                    />
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ElectronShells;
