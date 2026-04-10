import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/screens/MainMenu';
import CharSelect from '@/components/screens/CharSelect';
import MapSelect from '@/components/screens/MapSelect';
import HUD from '@/components/screens/HUD';
import GameOver from '@/components/screens/GameOver';
import Victory from '@/components/screens/Victory';
import UpgradePopup from '@/components/screens/UpgradePopup';
import PauseMenu from '@/components/screens/PauseMenu';
import TouchControls from '@/components/screens/TouchControls';
import LandscapeEnforcer from '@/components/screens/LandscapeEnforcer';
import { useEffect } from 'react';

export default function App() {
  // Prevent default context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white font-share-tech select-none">
      <GameCanvas />
      
      <MainMenu />
      <CharSelect />
      <MapSelect />
      
      <HUD />
      <TouchControls />
      <PauseMenu />
      <UpgradePopup />
      
      <GameOver />
      <Victory />
      
      <LandscapeEnforcer />
    </div>
  );
}
