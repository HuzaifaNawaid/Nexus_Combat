import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { LEVELS } from '@/game/constants';
import { playBGM, MENU_BGM, audioEnabled } from '@/game/audio';

export default function Victory() {
  const { screen, setScreen, level, score } = useGameStore();

  if (screen !== 'victory') return null;

  const handleNext = () => {
    if (level + 1 < LEVELS.length) {
      setScreen('map');
    } else {
      setScreen('menu');
      if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
    }
  };

  const handleMenu = () => {
    setScreen('menu');
    if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-black/90">
      <h1 className="font-bebas text-[76px] bg-gradient-to-br from-[#44ff88] to-[#ffee00] bg-clip-text text-transparent">
        LEVEL CLEAR!
      </h1>
      <div className="font-share-tech text-[#224] tracking-[0.4em] text-[10px] my-1.5">
        VILLAIN DEFEATED
      </div>
      <div className="font-share-tech text-[22px] text-[#ffc844] my-2.5 mb-7">
        SCORE: {score}
      </div>
      <div className="flex gap-3">
        <Button onClick={handleNext}>
          {level + 1 < LEVELS.length ? 'NEXT LEVEL ▶' : 'MAIN MENU'}
        </Button>
        <Button variant="secondary" onClick={handleMenu}>MAIN MENU</Button>
      </div>
    </div>
  );
}
