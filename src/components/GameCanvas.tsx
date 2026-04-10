import { useEffect, useRef } from 'react';
import { initEngine, stopEngine } from '@/game/engine';

export default function GameCanvas() {
  const c3dRef = useRef<HTMLCanvasElement>(null);
  const xcRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (c3dRef.current && xcRef.current) {
      initEngine(c3dRef.current, xcRef.current);
    }
    return () => stopEngine();
  }, []);

  return (
    <>
      <canvas ref={c3dRef} id="c3d" className="fixed inset-0 z-0 w-screen h-screen block" />
      <canvas ref={xcRef} id="xc" className="fixed inset-0 z-20 w-screen h-screen pointer-events-none" />
      <div id="vgn" className="fixed inset-0 pointer-events-none z-[8] opacity-0 transition-opacity duration-100" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(255, 0, 0, .4) 100%)' }} />
      <div id="sov" className="fixed inset-0 pointer-events-none z-30 opacity-0 transition-opacity duration-150" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 220, 0, .22) 0%, transparent 70%)' }} />
    </>
  );
}
