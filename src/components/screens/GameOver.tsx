import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { startLevel } from '@/game/engine';
import { playBGM, MENU_BGM, audioEnabled } from '@/game/audio';

export default function GameOver() {
  const { screen, setScreen, level } = useGameStore();

  if (screen !== 'death') return null;

  const handleRetry = () => {
    startLevel(level);
  };

  const handleMenu = () => {
    setScreen('menu');
    if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-black/90">
      <h1 className="font-bebas text-[88px] text-[#ff2200] drop-shadow-[0_0_35px_rgba(255,34,0,0.53)] animate-pulse">
        YOU DIED
      </h1>
      <div className="font-share-tech text-[#442] tracking-[0.4em] my-2 mb-6 text-[11px]">
        THE VILLAIN PREVAILS
      </div>
      <div className="flex gap-3">
        <Button variant="danger" onClick={handleRetry}>RETRY LEVEL</Button>
        <Button variant="secondary" onClick={handleMenu}>MAIN MENU</Button>
      </div>
    </div>
  );
}
