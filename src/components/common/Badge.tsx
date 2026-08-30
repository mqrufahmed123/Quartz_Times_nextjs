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
    gold: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    dark: 'bg-slate-800 text-slate-100 border border-slate-700',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] tracking-wider uppercase font-bold px-2.5 py-0.5 rounded-full',
    md: 'text-xs tracking-wider uppercase font-bold px-3 py-1 rounded-full',
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
