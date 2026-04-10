import React from 'react';
import { cn } from '@/lib/utils';
import { sfx } from '@/game/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children?: React.ReactNode;
}

export function Button({ className, variant = 'primary', onClick, children, ...props }: ButtonProps) {
  const baseStyles = "font-bebas text-[17px] tracking-[0.2em] py-3 w-full rounded-[3px] transition-all duration-200 cursor-pointer";
  
  const variants = {
    primary: "border border-[rgba(255,140,0,0.3)] bg-[rgba(255,60,0,0.07)] text-[#ffaa44] hover:text-white hover:border-[#ff8800] hover:shadow-[0_0_22px_rgba(255,68,0,0.33)] hover:bg-[rgba(255,80,0,0.15)]",
    secondary: "border border-[rgba(0,200,255,0.2)] bg-[rgba(0,100,200,0.05)] text-[#44aaff] hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_rgba(0,136,255,0.26)]",
    danger: "border border-[rgba(255,40,40,0.2)] bg-[rgba(200,0,0,0.05)] text-[#ff6644] hover:text-white hover:border-[#ff2200] hover:shadow-[0_0_22px_rgba(255,34,0,0.26)]"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx.menuClick();
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      onClick={handleClick}
      {...props} 
    >
      {children}
    </button>
  );
}
