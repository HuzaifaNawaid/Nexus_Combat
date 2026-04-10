import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ensureAudio } from '@/game/audio';

export default function MainMenu() {
  const { screen, setScreen, showHowToPlay, setShowHowToPlay, showAbout, setShowAbout } = useGameStore();

  if (screen !== 'menu') return null;

  const handlePlay = () => {
    ensureAudio();
    setScreen('char');
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[radial-gradient(ellipse_at_50%_80%,#120400,#000_70%)] overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255, 80, 0, .03) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255, 80, 0, .03) 60px)' }} />
      
      <div className="font-bebas text-[clamp(72px,13vw,148px)] leading-[0.88] text-center tracking-[0.06em] bg-gradient-to-b from-white via-[#ff9900] to-[#ff2200] bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(255,68,0,0.46)] animate-pulse">
        NEXUS<br/>COMBAT
      </div>
      
      <div className="font-share-tech text-[11px] tracking-[0.5em] text-[#ff6600aa] mb-11">
        Cinematic Arena Shooter
      </div>
      
      <div className="flex flex-col gap-2.5 items-center w-[260px] max-w-[88vw] z-10">
        <Button onClick={handlePlay}>▶ ENTER THE ARENA</Button>
        <Button variant="secondary" onClick={() => { ensureAudio(); setShowHowToPlay(true); }}>📖 HOW TO PLAY</Button>
        <Button variant="secondary" onClick={() => { ensureAudio(); setShowAbout(true); }}>ℹ ABOUT</Button>
      </div>

      <Modal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)}>
        <h2 className="font-bebas text-[32px] tracking-[0.2em] text-[#ffc844] mb-3.5">HOW TO PLAY</h2>
        <ul className="text-[14px] text-[#aab] leading-[1.8] text-left pl-4 mb-4 list-disc">
          <li><b className="text-[#ffc844]">WASD</b> — Move around the arena</li>
          <li><b className="text-[#ffc844]">Mouse</b> — Aim and look in any direction (360°)</li>
          <li><b className="text-[#ffc844]">Left Click / Key [5]</b> — Shoot your weapon</li>
          <li><b className="text-[#ffc844]">Keys [1–4]</b> — Switch between 4 weapons</li>
          <li><b className="text-[#ffc844]">[R]</b> — Reload current weapon</li>
          <li><b className="text-[#ffc844]">[F]</b> — Unleash Special Move (when bar is full)</li>
          <li><b className="text-[#ffc844]">Shift</b> — Sprint faster | <b className="text-[#ffc844]">Space</b> — Jump</li>
          <li><b className="text-[#ffc844]">Click screen</b> — Enable FPS lock mode</li>
        </ul>
        <p className="text-[14px] text-[#aab] text-left mt-2">Hit villains to charge your <b className="text-[#ffc844]">Special Bar ⚡</b>. Level 6 brings ALL villains back!</p>
        <Button variant="secondary" className="mt-4" onClick={() => setShowHowToPlay(false)}>CLOSE</Button>
      </Modal>

      <Modal isOpen={showAbout} onClose={() => setShowAbout(false)}>
        <h2 className="font-bebas text-[32px] tracking-[0.2em] text-[#ffc844] mb-3.5">ABOUT NEXUS COMBAT</h2>
        <p className="text-[14px] text-[#aab] leading-[1.8] text-left mb-3">A cinematic first-person arena shooter running entirely in the browser. Battle through 6 themed arenas, each guarded by a unique villain with escalating power.</p>
        <p className="text-[14px] text-[#aab] leading-[1.8] text-left mb-3">Choose from 4 characters with unique specials. Earn upgrades between levels. Level 6 is the ULTIMATE challenge — all 5 previous villains return plus the final boss.</p>
        <Button variant="secondary" className="mt-4" onClick={() => setShowAbout(false)}>CLOSE</Button>
      </Modal>
    </div>
  );
}
