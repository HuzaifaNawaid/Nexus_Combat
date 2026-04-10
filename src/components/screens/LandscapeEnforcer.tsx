import { useEffect, useState } from 'react';

export default function LandscapeEnforcer() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth < window.innerHeight && window.innerWidth <= 768);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center text-center p-8 backdrop-blur-md">
      <div className="text-[60px] mb-5 animate-[rotateIcon_2s_infinite_ease-in-out_alternate]">🔄</div>
      <h1 className="font-bebas text-[38px] text-[#ffc844] tracking-[0.15em] mb-2.5">ROTATE DEVICE</h1>
      <p className="font-share-tech text-[14px] text-[#aaa] tracking-[0.1em] leading-[1.5]">
        NEXUS COMBAT must be played<br/>in landscape orientation.<br/><br/>Please rotate your phone to continue.
      </p>
      <style>{`
        @keyframes rotateIcon {
          0% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
