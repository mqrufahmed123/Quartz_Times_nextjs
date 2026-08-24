import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark' | 'outline' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    gold: 'bg-gold/15 text-gold border border-gold/30',
    dark: 'bg-luxury-800 text-luxury-200 border border-luxury-700',
    outline: 'bg-transparent text-luxury-300 border border-luxury-700',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-800/40',
    danger: 'bg-rose-950/60 text-rose-300 border border-rose-800/40',
    neutral: 'bg-luxury-900/80 text-luxury-300 border border-luxury-800',
  };

  const sizeStyles = {
    sm: 'text-[10px] tracking-widest uppercase font-medium px-2.5 py-0.5 rounded-full',
    md: 'text-xs tracking-wider uppercase font-medium px-3 py-1 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
