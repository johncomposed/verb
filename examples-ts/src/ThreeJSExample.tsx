import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as threejsExamples from './threejs/index';

type ExampleName = keyof typeof threejsExamples;

export function ThreeJSExample({ name }: { name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initFn = threejsExamples[name as ExampleName];
    if (initFn) {
      initFn(container);
    }

    return () => {
      // Clean up: remove the canvas on unmount
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [name]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          padding: '6px 14px',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Back
      </button>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
