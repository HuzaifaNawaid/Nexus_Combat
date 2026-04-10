import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { CHARS } from '@/game/constants';
import { cn } from '@/lib/utils';
import { sfx } from '@/game/audio';

export default function CharSelect() {
  const { screen, setScreen, charIdx, setCharIdx } = useGameStore();

  if (screen !== 'char') return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[radial-gradient(ellipse_at_50%_100%,#000d1a,#000_70%)] overflow-y-auto py-8">
      <div className="font-bebas text-[clamp(28px,9vw,46px)] tracking-[0.2em] text-[#00c8ff] drop-shadow-[0_0_18px_rgba(0,136,255,0.53)] mb-1 text-center">
        CHOOSE YOUR FIGHTER
      </div>
      <div className="font-share-tech text-[10px] text-[#224] tracking-[0.4em] mb-7 text-center">
        Each warrior carries a unique special ability
      </div>
      
      <div className="flex gap-4 flex-wrap justify-center w-full max-w-[800px] px-4">
        {CHARS.map((c, i) => (
          <div 
            key={c.id}
            className={cn(
              "w-[clamp(140px,42vw,175px)] border rounded-[12px] p-[18px_14px_14px] text-center cursor-pointer bg-white/5 transition-all duration-250",
              charIdx === i ? "scale-105 border-[var(--cc)] shadow-[0_0_30px_var(--cc),inset_0_0_20px_rgba(255,255,255,0.03)]" : "border-white/10 hover:border-[var(--cc)] hover:-translate-y-2 hover:scale-105"
            )}
            style={{ '--cc': c.color } as React.CSSProperties}
            onClick={() => { setCharIdx(i); sfx.charSelect(); }}
          >
            <span className="text-[clamp(44px,10vw,62px)] block mb-1.5 drop-shadow-[0_0_14px_var(--cc)]">{c.icon}</span>
            <div className="font-bebas text-[19px] tracking-[0.15em] text-[var(--cc)] mb-0.5">{c.name}</div>
            <div className="font-share-tech text-[8px] text-[#335] tracking-[0.25em] mb-2.5">{c.role}</div>
            
            <div className="flex justify-between mb-1.5 p-1 bg-black/30 rounded-[5px] border border-white/5">
              <div className="text-center"><span className="font-share-tech text-[7px] text-[#445] block tracking-[0.15em]">❤ HP</span><span className="font-bebas text-[15px] text-[var(--cc)] tracking-[0.05em]">{c.hp}</span></div>
              <div className="text-center"><span className="font-share-tech text-[7px] text-[#445] block tracking-[0.15em]">🛡 SHD</span><span className="font-bebas text-[15px] text-[var(--cc)] tracking-[0.05em]">{c.shield}</span></div>
              <div className="text-center"><span className="font-share-tech text-[7px] text-[#445] block tracking-[0.15em]">⚡ SPD</span><span className="font-bebas text-[15px] text-[var(--cc)] tracking-[0.05em]">{Math.round(c.spd * 10)}</span></div>
            </div>
            
            <div className="mb-2.5">
              {[
                ['HP', c.stats.HP],
                ['SHIELD', c.stats.SHIELD],
                ['SPEED', c.stats.SPEED],
                ['POWER', c.stats.POWER],
              ].map(([lbl, val]) => (
                <div key={lbl as string} className="flex items-center gap-1.5 my-1">
                  <span className="font-share-tech text-[8px] text-[#556] w-11 text-right tracking-[0.1em]">{lbl}</span>
                  <div className="flex-1 h-[5px] bg-white/5 rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px] bg-[var(--cc)]" style={{ width: `${(val as number) * 20}%` }} />
                  </div>
                  <span className="font-share-tech text-[8px] text-[var(--cc)] w-3.5 text-left">{val}</span>
                </div>
              ))}
            </div>
            
            <div className="text-[9px] text-[var(--cc)] opacity-80 border-t border-white/5 pt-2 mt-1 leading-[1.5]">
              ⚡ {c.special}<br/><small className="opacity-60">{c.sdesc}</small>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-6">
        <Button variant="secondary" className="w-[120px]" onClick={() => setScreen('menu')}>← BACK</Button>
        <Button className="w-[200px]" onClick={() => setScreen('map')}>⚔ DEPLOY TO COMBAT</Button>
      </div>
    </div>
  );
}
