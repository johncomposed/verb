import { useState } from 'react';
import { Link } from 'react-router-dom';

type Mode = 'threejs' | 'r3f';

type Example = { name: string; label: string };
type Tile =
  | { kind: 'title' }
  | { kind: 'download' }
  | { kind: 'source' }
  | { kind: 'docs' }
  | { kind: 'example'; example: Example };

const TILES: Tile[] = [
  { kind: 'title' },
  { kind: 'example', example: { name: 'conics', label: 'Conics' } },
  { kind: 'example', example: { name: 'curveByPointInterpolation', label: 'Curve by point interpolation' } },
  { kind: 'download' },
  { kind: 'example', example: { name: 'curveClosestPoint', label: 'Closest point to a curve' } },
  { kind: 'example', example: { name: 'curveDivide', label: 'Divide a curve by arc length' } },
  { kind: 'source' },
  { kind: 'example', example: { name: 'curveIntersection', label: 'Curve-curve intersection' } },
  { kind: 'example', example: { name: 'curveSplit', label: 'Split a curve' } },
  { kind: 'example', example: { name: 'cylindricalSurface', label: 'Cylindrical surface' } },
  { kind: 'example', example: { name: 'extrudedSurface', label: 'Extruded surface' } },
  { kind: 'docs' },
  { kind: 'example', example: { name: 'revolvedSurface', label: 'Revolved surface' } },
  { kind: 'example', example: { name: 'loftedSurface', label: 'Lofted surface' } },
  { kind: 'example', example: { name: 'surfaceAdaptiveTessellation', label: 'Adaptive surface tessellation' } },
  { kind: 'example', example: { name: 'meshIntersection', label: 'Mesh-mesh intersection' } },
  { kind: 'example', example: { name: 'meshSlicing', label: 'Mesh slicing' } },
  { kind: 'example', example: { name: 'surface', label: 'NURBS Surface' } },
  { kind: 'example', example: { name: 'surfaceBoundaries', label: 'Surface boundary curves' } },
  { kind: 'example', example: { name: 'surfaceClosestPoint', label: 'Closest point to a surface' } },
  { kind: 'example', example: { name: 'surfaceIsocurves', label: 'Surface Isocurves' } },
  { kind: 'example', example: { name: 'surfaceIntersection', label: 'Surface-surface intersection' } },
  { kind: 'example', example: { name: 'surfaceSplit', label: 'Splitting a surface' } },
  { kind: 'example', example: { name: 'sweptSurface', label: 'Swept surface' } },
];

const BOX: React.CSSProperties = {
  position: 'relative',
  flexGrow: 1,
  overflow: 'hidden',
  color: 'white',
  height: 300,
  width: 300,
  textShadow: '0px 1px #000000',
  boxSizing: 'border-box',
};

const INNER: React.CSSProperties = {
  padding: 30,
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',
};

export function App() {
  const [mode, setMode] = useState<Mode>('r3f');

  return (
    <div style={{
      background: 'black',
      minHeight: '100vh',
      fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <ModeToggle mode={mode} setMode={setMode} />
      <div style={{
        backgroundColor: 'black',
        display: 'flex',
        alignContent: 'flex-start',
        flexWrap: 'wrap',
      }}>
        {TILES.map((tile, i) => {
          if (tile.kind === 'title') {
            return (
              <div key={i} style={{ ...BOX, background: '#DD5500', textAlign: 'right' }}>
                <div style={INNER}>
                  <h1 style={{ fontSize: 60, margin: 0, fontWeight: 300 }}>
                    verb<span style={{ fontSize: 12, paddingLeft: 5 }}>2.1.0</span>
                  </h1>
                  <h2 style={{ fontWeight: 300, margin: 0 }}>Open-source, cross-platform NURBS</h2>
                </div>
              </div>
            );
          }
          if (tile.kind === 'download') return <LinkBox key={i} color="#89CE00" href="https://github.com/pboyer/verb/archive/master.zip" label="download" />;
          if (tile.kind === 'source') return <LinkBox key={i} color="#B10064" href="https://github.com/pboyer/verb" label="source" />;
          if (tile.kind === 'docs') return <LinkBox key={i} color="#008E6E" href="https://verbnurbs.com/docs/" label="docs" />;
          return <ExampleBox key={i} example={tile.example} mode={mode} />;
        })}
      </div>
    </div>
  );
}

function LinkBox({ color, href, label }: { color: string; href: string; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ ...BOX, background: color }}>
      <a
        href={href}
        style={{ color: 'white', textDecoration: 'none' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{ ...INNER, background: hover ? '#222' : 'transparent' }}>
          <h1 style={{ fontSize: 40, margin: 0, fontWeight: 300 }}>{label}</h1>
        </div>
      </a>
    </div>
  );
}

function ExampleBox({ example, mode }: { example: Example; mode: Mode }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={BOX}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={`/pictures/${example.name}.png`}
        style={{ position: 'absolute', width: '100%' }}
        alt=""
      />
      <Link
        to={`/${mode}/${example.name}`}
        style={{ color: 'white', textDecoration: 'none' }}
      >
        <div
          style={{
            fontSize: 28,
            zIndex: 2,
            position: 'absolute',
            padding: 30,
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(20,20,20,0.8)',
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.15s',
            fontWeight: 300,
          }}
        >
          {example.label}
        </div>
      </Link>
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const btn = (active: boolean): React.CSSProperties => ({
    background: active ? '#fff' : 'transparent',
    color: active ? '#000' : '#fff',
    border: '1px solid #fff',
    padding: '4px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  });
  return (
    <div style={{
      position: 'fixed',
      top: 12,
      right: 12,
      zIndex: 10,
      display: 'flex',
      gap: 0,
      background: 'rgba(0,0,0,0.6)',
    }}>
      <button style={btn(mode === 'threejs')} onClick={() => setMode('threejs')}>three.js</button>
      <button style={btn(mode === 'r3f')} onClick={() => setMode('r3f')}>r3f</button>
    </div>
  );
}
