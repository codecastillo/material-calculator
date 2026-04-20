import React, { useMemo } from 'react';
import './AtomViewer.css';

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

  for (const [symbol, expansion] of Object.entries(NOBLE_GAS_CONFIGS)) {
    if (expanded.includes(symbol)) {
      expanded = expanded.replace(symbol, expansion);
      break;
    }
  }

  const shellElectrons = [0, 0, 0, 0, 0, 0, 0];
  const regex = /(\d)([spdf])(\d+)/g;
  let match;

  while ((match = regex.exec(expanded)) !== null) {
    const shellNum = parseInt(match[1], 10);
    const electrons = parseInt(match[3], 10);
    if (shellNum >= 1 && shellNum <= 7) {
      shellElectrons[shellNum - 1] += electrons;
    }
  }

  const result = [];
  for (let i = 0; i < shellElectrons.length; i++) {
    if (shellElectrons[i] > 0) {
      result.push(shellElectrons[i]);
    } else if (result.length > 0) {
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

/* Generate deterministic but varied positions for nucleus particles */
function nucleusPositions(protonCount) {
  const particles = [];
  const total = Math.min(protonCount, 20); // cap visual particles
  const neutrons = Math.min(Math.round(total * 1.2), 26);
  const all = total + neutrons;

  for (let i = 0; i < all; i++) {
    // Use golden-angle-ish distribution for even spread
    const phi = i * 2.399963; // golden angle in radians
    const cosTheta = 1 - 2 * ((i + 0.5) / all);
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    const radius = 6 + (i % 3) * 3; // cluster tightly
    const x = radius * sinTheta * Math.cos(phi);
    const y = radius * sinTheta * Math.sin(phi);
    const z = radius * cosTheta;
    particles.push({
      x,
      y,
      z,
      isProton: i < total,
      size: 3 + (i % 3),
    });
  }
  return particles;
}

/* Orbit tilt angles for visual variety */
const ORBIT_TILTS = [
  { rx: 70, ry: 0, rz: 0 },
  { rx: 60, ry: 60, rz: 20 },
  { rx: 80, ry: -30, rz: 40 },
  { rx: 50, ry: 90, rz: -10 },
  { rx: 75, ry: 45, rz: 60 },
  { rx: 55, ry: -60, rz: 30 },
  { rx: 65, ry: 20, rz: -40 },
];

function AtomViewer({ element, color = '#6ee7b7', onClose }) {
  const shells = useMemo(
    () => parseElectronConfig(element?.electron_config),
    [element?.electron_config]
  );

  const nucleus = useMemo(
    () => nucleusPositions(element?.number || 1),
    [element?.number]
  );

  if (!element) return null;

  const shellCount = shells.length;
  const atomRadius = 140; // half of ~300px
  const nucleusRadius = 18;
  const minOrbitRadius = 50;
  const maxOrbitRadius = atomRadius - 10;

  return (
    <div className="atom-viewer-overlay" onClick={onClose}>
      <div
        className="atom-viewer"
        style={{ '--ac': color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="atom-viewer__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {/* 3D Scene */}
        <div className="atom-viewer__scene">
          <div className="atom-viewer__atom">
            {/* Nucleus */}
            <div className="atom-viewer__nucleus">
              {nucleus.map((p, i) => (
                <div
                  key={i}
                  className={`atom-viewer__nucleon ${p.isProton ? 'atom-viewer__nucleon--proton' : 'atom-viewer__nucleon--neutron'}`}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                  }}
                />
              ))}
              {/* Nucleus glow */}
              <div className="atom-viewer__nucleus-glow" />
            </div>

            {/* Electron orbits */}
            {shells.map((electronCount, shellIndex) => {
              const radius =
                shellCount === 1
                  ? (minOrbitRadius + maxOrbitRadius) / 2
                  : minOrbitRadius +
                    (maxOrbitRadius - minOrbitRadius) *
                      (shellIndex / (shellCount - 1));
              const tilt = ORBIT_TILTS[shellIndex % ORBIT_TILTS.length];
              const orbitDuration = 4 + shellIndex * 3; // outer shells orbit slower
              const opacity = 1 - shellIndex * 0.1;

              return (
                <div
                  key={shellIndex}
                  className="atom-viewer__orbit"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(${tilt.rz}deg)`,
                    opacity,
                  }}
                >
                  {/* Orbit ring */}
                  <div className="atom-viewer__orbit-ring" />

                  {/* Electrons */}
                  {Array.from({ length: electronCount }, (_, i) => {
                    const angle = (360 / electronCount) * i;
                    const delay = -(orbitDuration / electronCount) * i;

                    return (
                      <div
                        key={i}
                        className="atom-viewer__electron-track"
                        style={{
                          width: `${radius * 2}px`,
                          height: `${radius * 2}px`,
                          animationDuration: `${orbitDuration}s`,
                          animationDelay: `${delay}s`,
                          transform: `rotate(${angle}deg)`,
                        }}
                      >
                        <div className="atom-viewer__electron" />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info label */}
        <div className="atom-viewer__info">
          <span className="atom-viewer__symbol">{element.symbol}</span>
          <span className="atom-viewer__name">{element.name}</span>
          <span className="atom-viewer__number">Z = {element.number}</span>
        </div>
      </div>
    </div>
  );
}

export default AtomViewer;
