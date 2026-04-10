import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { shoot, startReload, useSpecial, handleTouchMove, handleTouchAim, handleTouchJump } from '@/game/engine';

export default function TouchControls() {
  const state = useGameStore();
  const joyRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const joyId = useRef<number | null>(null);
  const joyOrigin = useRef({ x: 0, y: 0 });
  const aimTouchId = useRef<number | null>(null);
  const lastAim = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Try to lock orientation
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const joyRect = joyRef.current?.getBoundingClientRect();
        const inJoy = joyRect && t.clientX > joyRect.left - 10 && t.clientX < joyRect.right + 10 && t.clientY > joyRect.top - 10 && t.clientY < joyRect.bottom + 10;
        
        if (!inJoy && t.clientX > window.innerWidth * 0.42 && aimTouchId.current === null) {
          aimTouchId.current = t.identifier;
          lastAim.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const handleTouchMoveEvt = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === aimTouchId.current && useGameStore.getState().screen === 'hud') {
          const dx = t.clientX - lastAim.current.x;
          const dy = t.clientY - lastAim.current.y;
          handleTouchAim(dx, dy);
          lastAim.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === aimTouchId.current) {
          aimTouchId.current = null;
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMoveEvt, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMoveEvt);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (state.screen !== 'hud' || state.showPause) return null;

  // Only render on touch devices
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return null;

  const handleJoyStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const r = joyRef.current?.getBoundingClientRect();
    if (r) {
      joyOrigin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      joyId.current = t.identifier;
    }
  };

  const handleJoyMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== joyId.current) continue;
      
      const dx = t.clientX - joyOrigin.current.x;
      const dy = t.clientY - joyOrigin.current.y;
      const JR = 65;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), JR);
      const ang = Math.atan2(dy, dx);
      const nx = Math.cos(ang) * dist;
      const ny = Math.sin(ang) * dist;
      
      if (thumbRef.current) {
        thumbRef.current.style.left = `${40 + nx}px`;
        thumbRef.current.style.top = `${40 + ny}px`;
      }
      
      handleTouchMove(nx / JR, ny / JR);
    }
  };

  const resetJoy = () => {
    joyId.current = null;
    if (thumbRef.current) {
      thumbRef.current.style.left = '40px';
      thumbRef.current.style.top = '40px';
    }
    handleTouchMove(0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        ref={joyRef}
        className="absolute bottom-[90px] left-[30px] w-[130px] h-[130px] rounded-full bg-white/5 border-2 border-white/15 pointer-events-auto touch-none"
        onTouchStart={handleJoyStart}
        onTouchMove={handleJoyMove}
        onTouchEnd={resetJoy}
        onTouchCancel={resetJoy}
      >
        <div ref={thumbRef} className="absolute w-[50px] h-[50px] rounded-full bg-[#ff8800]/50 border-2 border-[#ff8800] left-[40px] top-[40px] pointer-events-none transition-all duration-75" />
        <span className="absolute -bottom-4 w-full text-center font-bebas text-[9px] text-white/50 tracking-[0.15em]">MOVE</span>
      </div>

      <div 
        className="absolute bottom-[120px] right-[28px] w-[76px] h-[76px] rounded-full bg-[#ff4400]/35 border-2 border-[#ff4400] flex items-center justify-center text-[26px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); shoot(); }}
      >
        🔫
        <span className="absolute -bottom-4 w-full text-center font-bebas text-[9px] text-white/50 tracking-[0.15em]">FIRE</span>
      </div>

      <div 
        className="absolute bottom-[220px] right-[28px] w-[56px] h-[56px] rounded-full bg-[#ffcc00]/25 border-2 border-[#ffcc00] flex items-center justify-center text-[20px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); startReload(); }}
      >
        🔄
        <span className="absolute -bottom-4 w-full text-center font-bebas text-[9px] text-white/50 tracking-[0.15em]">RELOAD</span>
      </div>

      <div 
        className="absolute bottom-[295px] right-[28px] w-[56px] h-[56px] rounded-full bg-[#00c8ff]/25 border-2 border-[#00c8ff] flex items-center justify-center text-[20px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); useSpecial(); }}
      >
        ⚡
        <span className="absolute -bottom-4 w-full text-center font-bebas text-[9px] text-white/50 tracking-[0.15em]">SPECIAL</span>
      </div>

      <div 
        className="absolute bottom-[120px] right-[115px] w-[48px] h-[48px] rounded-full bg-[#44ff88]/20 border-2 border-[#44ff88] flex items-center justify-center text-[18px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); handleTouchJump(); }}
      >
        ↑
        <span className="absolute -bottom-4 w-full text-center font-bebas text-[9px] text-white/50 tracking-[0.15em]">JUMP</span>
      </div>
    </div>
  );
}
