import { useGameStore } from '@/store/useGameStore';
import { CHARS, LEVELS } from '@/game/constants';
import { cn } from '@/lib/utils';
import { toggleAudio, audioEnabled } from '@/game/audio';
import { swGun } from '@/game/engine';

export default function HUD() {
  const state = useGameStore();

  if (state.screen !== 'hud') return null;

  const C = CHARS[state.charIdx];
  const L = LEVELS[state.level];

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top Left */}
      <div className="absolute top-4 left-4 md:top-[18px] md:left-[18px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[26px]" style={{ filter: `drop-shadow(0 0 6px ${C.color})` }}>{C.icon}</span>
          <span className="font-bebas text-[15px] tracking-[0.15em]" style={{ color: C.color }}>{C.name}</span>
        </div>
        <div className="font-bebas text-[10px] md:text-[12px] tracking-[0.22em] bg-black/70 border border-white/10 px-3 py-1 rounded-full text-[#ffc844] backdrop-blur-sm inline-block">
          LEVEL {state.level + 1} — {L.name}
        </div>
        <div className="font-share-tech text-[11px] md:text-[13px] text-[#667] tracking-[0.2em] mt-1.5">
          SCORE <span className="text-white">{state.score}</span>
        </div>
      </div>

      {/* Top Right (Audio & Pause) */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        <button 
          className="w-[34px] h-[34px] bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-[14px] hover:border-[#ff8800] hover:shadow-[0_0_12px_rgba(255,68,0,0.3)] transition-all"
          onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
          title="Toggle Audio"
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
        <button 
          className="w-[34px] h-[34px] bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-[14px] hover:border-[#ff8800] hover:shadow-[0_0_12px_rgba(255,68,0,0.3)] transition-all"
          onClick={(e) => { e.stopPropagation(); state.setShowPause(true); }}
          title="Pause Game"
        >
          ⏸
        </button>
      </div>

      {/* Boss Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[min(300px,78vw)] md:w-[min(460px,62vw)] bg-black/75 border border-[#ff4400]/25 rounded-[10px] px-3 py-2 backdrop-blur-sm text-center">
        <div className="font-bebas text-[10px] md:text-[12px] tracking-[0.3em] mb-1" style={{ color: state.bossColor }}>
          {state.bossIcon} {state.bossName}
        </div>
        <div className="h-[11px] bg-white/5 rounded-[5px] overflow-hidden mb-1">
          <div className="h-full rounded-[5px] transition-all duration-150" style={{ width: `${state.bossHpPct}%`, backgroundColor: state.bossColor }} />
        </div>
        <div className="font-share-tech text-[7px] md:text-[8px] tracking-[0.3em] text-[#445]">
          {state.bossPhase}
        </div>
      </div>

      {/* Killfeed */}
      <div className="absolute top-[52px] md:top-[68px] right-2 md:right-4 flex flex-col gap-1 items-end">
        {state.killfeed.map((kf) => (
          <div key={kf.id} className="font-share-tech text-[9px] md:text-[10px] bg-black/80 px-2 py-1 rounded-[3px] border-l-2 animate-kfa" style={{ borderLeftColor: kf.color }}>
            {kf.text}
          </div>
        ))}
      </div>

      {/* Bottom Left (Vitals) */}
      <div className="absolute bottom-[220px] md:bottom-[24px] left-2.5 md:left-[22px] w-[150px] md:w-[230px]">
        <div className="mb-1.5">
          <div className="font-share-tech text-[8px] tracking-[0.3em] mb-1 text-[#ff4444]">❤ HEALTH</div>
          <div className="h-[7px] bg-white/5 rounded-[4px] overflow-hidden relative">
            <div className="h-full rounded-[4px] transition-all duration-150 bg-gradient-to-r from-[#cc0000] via-[#ff5555] to-[#ff9999]" style={{ width: `${(state.hp / state.maxHp) * 100}%` }} />
            <span className="absolute right-1 top-0 font-share-tech text-[9px]">{Math.ceil(state.hp)}</span>
          </div>
        </div>
        <div>
          <div className="font-share-tech text-[8px] tracking-[0.3em] mb-1 text-[#4488ff]">🛡 SHIELD</div>
          <div className="h-[7px] bg-white/5 rounded-[4px] overflow-hidden relative">
            <div className="h-full rounded-[4px] transition-all duration-150 bg-gradient-to-r from-[#0044cc] via-[#2277ff] to-[#88aaff]" style={{ width: `${(state.shield / state.maxShield) * 100}%` }} />
            <span className="absolute right-1 top-0 font-share-tech text-[9px]">{Math.ceil(state.shield)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Center (Special) */}
      <div className="absolute bottom-[230px] md:bottom-[24px] left-1/2 -translate-x-1/2 text-center w-[155px] md:w-[260px]">
        <div className="font-bebas text-[13px] tracking-[0.4em] text-[#ffc844] mb-1">⚡ SPECIAL POWER</div>
        <div className="h-[13px] bg-white/5 rounded-[7px] overflow-hidden border border-[#ffc800]/10">
          <div 
            className={cn("h-full rounded-[7px] transition-all duration-200 bg-gradient-to-r from-[#ff8800] via-[#ffcc00] to-[#ffff44]", state.spRdy && "shadow-[0_0_20px_rgba(255,204,0,0.8)] animate-pulse")} 
            style={{ width: `${(state.special / state.maxSpecial) * 100}%` }} 
          />
        </div>
        <div className="font-share-tech text-[8px] text-[#554] mt-1 tracking-[0.2em]">
          {state.spRdy ? '⚡ PRESS [F] TO UNLEASH!' : 'HIT ENEMIES TO CHARGE — [F] UNLEASH'}
        </div>
      </div>

      {/* Bottom Right (Weapons) */}
      <div className="absolute bottom-[205px] md:bottom-[24px] right-2.5 md:right-[22px] pointer-events-auto">
        <div className="flex gap-1 md:gap-2 bg-black/40 md:bg-transparent p-1.5 md:p-0 rounded-[10px] border border-white/5 md:border-none">
          {state.weapons.map((w, i) => (
            <div 
              key={i}
              className={cn(
                "w-[46px] h-[54px] md:w-[68px] md:h-[76px] border rounded-[10px] md:rounded-[7px] flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer",
                i === state.gunIdx ? "border-[#ffc844] shadow-[0_0_14px_rgba(255,200,68,0.26)] bg-[#ffc800]/10" : "border-white/10 bg-black/70"
              )}
              onClick={(e) => { e.stopPropagation(); swGun(i); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); swGun(i); }}
            >
              <div className="absolute top-1 left-1.5 text-[8px] md:text-[9px] text-[#334] font-share-tech">{w.key}</div>
              <div className="text-[22px] md:text-[24px]">{w.icon}</div>
              <div className="hidden md:block font-bebas text-[11px] text-[#aaa] tracking-[0.1em]">{w.name}</div>
              <div className="hidden md:block font-share-tech text-[9px] text-[#ffc844]">{w.curAmmo}/{w.maxAmmo}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reloading Bar */}
      <div className={cn("absolute bottom-[310px] md:bottom-[118px] left-1/2 -translate-x-1/2 text-center transition-opacity duration-200", state.reloading ? "opacity-100" : "opacity-0")}>
        <div className="w-[88px] h-[5px] bg-white/10 rounded-[3px] overflow-hidden mb-1">
          <div className="h-full bg-[#ffc844] rounded-[3px]" style={{ width: `${state.reloadPct}%` }} />
        </div>
        <div className="font-share-tech text-[8px] text-[#ffc844] tracking-[0.3em]">RELOADING</div>
      </div>

      {/* PC Hint */}
      <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 font-share-tech text-[8px] text-[#223] tracking-[0.22em] whitespace-nowrap">
        LMB/[5] SHOOT &nbsp;|&nbsp; [1-4] WEAPON &nbsp;|&nbsp; [R] RELOAD &nbsp;|&nbsp; [F] SPECIAL &nbsp;|&nbsp; CLICK=FPS LOCK
      </div>

      {/* Announcement */}
      {state.announcement && (
        <div 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bebas text-[clamp(30px,6vw,66px)] text-center leading-[1.1] animate-in fade-in zoom-in duration-200"
          style={{ color: state.announcement.color, textShadow: '0 0 30px currentColor' }}
        >
          {state.announcement.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}
