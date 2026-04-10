import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { LEVELS, MAP_META, VT } from '@/game/constants';
import { cn } from '@/lib/utils';
import { sfx } from '@/game/audio';
import { startLevel } from '@/game/engine';

export default function MapSelect() {
  const { screen, setScreen, unlocked } = useGameStore();

  if (screen !== 'map') return null;

  const handleSelect = (idx: number) => {
    sfx.menuClick();
    setTimeout(() => startLevel(idx), 220);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[radial-gradient(ellipse_at_50%_100%,#0a0014,#000_70%)] overflow-y-auto py-8">
      <div className="font-bebas text-[clamp(28px,8vw,44px)] tracking-[0.22em] text-[#ffc844] drop-shadow-[0_0_18px_rgba(255,136,0,0.4)] mb-1 text-center">
        SELECT MISSION
      </div>
      <div className="font-share-tech text-[10px] text-[#442] tracking-[0.4em] mb-7 text-center">
        Choose your battlefield — defeat the villain within
      </div>
      
      <div className="flex gap-3 flex-wrap justify-center max-w-[820px] px-4">
        {LEVELS.map((L, i) => {
          const meta = MAP_META[i];
          const vd = VT[L.villainIds[L.villainIds.length - 1]];
          const isUnlocked = i < unlocked;
          
          return (
            <div 
              key={i}
              className={cn(
                "w-[clamp(155px,88vw,230px)] border rounded-[11px] p-[16px_14px_13px] relative overflow-hidden transition-all duration-200",
                isUnlocked ? "border-white/10 bg-white/5 cursor-pointer hover:-translate-y-1 hover:border-[var(--mc)] hover:shadow-[0_0_22px_var(--mc)]" : "border-white/5 bg-white/5 opacity-40 cursor-not-allowed grayscale"
              )}
              style={{ '--mc': meta.col } as React.CSSProperties}
              onClick={() => isUnlocked && handleSelect(i)}
            >
              <div 
                className="absolute top-2.5 left-2.5 font-bebas text-[9px] tracking-[0.2em] px-1.5 py-0.5 rounded-[3px] border"
                style={{ background: `${meta.diffCol}22`, color: meta.diffCol, borderColor: `${meta.diffCol}44` }}
              >
                {meta.diff}
              </div>
              
              {!isUnlocked && <div className="absolute top-2.5 right-2.5 text-[18px] opacity-70">🔒</div>}
              
              <div className="text-[36px] mb-1.5 mt-4 text-center">{meta.icon}</div>
              <div className="font-bebas text-[10px] tracking-[0.4em] text-[var(--mc)] opacity-70 mb-0.5 text-center">LEVEL {i + 1}</div>
              <div className="font-bebas text-[17px] tracking-[0.14em] text-[var(--mc)] mb-1.5 text-center">{L.name}</div>
              
              <div className="flex items-center gap-1.5 mb-1.5 p-1.5 bg-black/40 rounded-[5px] border border-white/5">
                <div className="text-[22px]">{vd.icon}</div>
                <div className="text-left">
                  <div className="font-bebas text-[12px] text-[#ddd] tracking-[0.08em]">{vd.name}</div>
                  <div className="font-share-tech text-[7px] text-[#446] tracking-[0.2em]">{i === 5 ? 'FINAL BOSS' : 'LEVEL BOSS'} · {Math.round(vd.hp * (i === 5 ? 1.5 : 1))} HP</div>
                </div>
              </div>
              
              <div className="font-share-tech text-[8px] text-[#445] tracking-[0.15em] leading-[1.6] text-center">
                {meta.feats}
                {L.minis.length > 0 && <><br/>+ {L.minis.length} minion types</>}
              </div>
            </div>
          );
        })}
      </div>
      
      <Button variant="danger" className="w-[200px] mt-6" onClick={() => setScreen('char')}>← BACK</Button>
    </div>
  );
}
