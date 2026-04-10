import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className={cn("bg-[#050812]/95 border border-white/10 rounded-[14px] p-9 max-w-[500px] w-[90%] text-center", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
