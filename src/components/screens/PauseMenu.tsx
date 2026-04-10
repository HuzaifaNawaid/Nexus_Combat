import { useGameStore } from '@/store/useGameStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function PauseMenu() {
  const { showPause, setShowPause } = useGameStore();

  const handleResume = () => {
    setShowPause(false);
    // Request pointer lock again
    const c3d = document.getElementById('c3d');
    if (c3d) c3d.requestPointerLock();
  };

  return (
    <Modal isOpen={showPause} onClose={handleResume}>
      <h2 className="font-bebas text-[32px] tracking-[0.2em] text-[#ffc844] mb-3.5">GAME PAUSED</h2>
      <div className="flex flex-col gap-2.5 items-center w-[260px] max-w-[88vw] mx-auto">
        <Button onClick={handleResume}>▶ RESUME</Button>
      </div>
    </Modal>
  );
}
