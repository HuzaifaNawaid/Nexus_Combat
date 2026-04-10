import { useGameStore } from '@/store/useGameStore';
import { UPG_POOL } from '@/game/constants';
import { useMemo } from 'react';

export default function UpgradePopup() {
  const { showUpgrade, setShowUpgrade, addUpgrade } = useGameStore();

  const choices = useMemo(() => {
    if (!showUpgrade) return [];
    return [...UPG_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [showUpgrade]);

  if (!showUpgrade) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] bg-black/50 backdrop-blur-sm">
      <div className="bg-[#000512]/95 border border-[#00c8ff]/20 rounded-[14px] p-8 text-center shadow-[0_0_55px_rgba(0,180,255,0.25)] min-w-[340px] animate-in zoom-in-95 duration-200">
        <div className="font-bebas text-[30px] tracking-[0.2em] text-[#00c8ff] mb-1">POWER UP</div>
        <div className="font-share-tech text-[9px] text-[#224] tracking-[0.3em] mb-5">Choose one upgrade for the next level</div>
        
        <div className="flex gap-2.5 justify-center">
          {choices.map((u) => (
            <div 
              key={u.id}
              className="w-[120px] p-[14px_8px] border border-[#00c8ff]/20 rounded-[9px] bg-[#00c8ff]/5 cursor-pointer transition-all hover:border-[#00c8ff] hover:shadow-[0_0_18px_rgba(0,136,255,0.26)] hover:-translate-y-1"
              onClick={() => {
                addUpgrade(u.id);
                setShowUpgrade(false);
              }}
            >
              <div className="text-[32px] mb-1.5">{u.icon}</div>
              <div className="font-bebas text-[14px] text-[#00c8ff] tracking-[0.1em]">{u.name}</div>
              <div className="text-[9px] text-[#335] mt-1 leading-[1.4]">{u.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
