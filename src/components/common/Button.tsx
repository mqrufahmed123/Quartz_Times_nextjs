import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      href,
      target,
      rel,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-amber-500/50';

    const variants = {
      primary:
        'bg-amber-500 text-slate-950 hover:bg-amber-600 active:scale-[0.98] border border-amber-500 shadow-sm',
      secondary:
        'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 active:scale-[0.98]',
      outline:
        'bg-transparent text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 active:scale-[0.98]',
      ghost:
        'bg-transparent text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]',
      whatsapp:
        'bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] active:scale-[0.98] border border-[#25D366] shadow-sm',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-[11px] px-3.5 py-1.5 rounded-lg gap-1.5',
      md: 'text-xs px-5 py-2.5 rounded-lg gap-2',
      lg: 'text-sm px-7 py-3.5 rounded-lg gap-2.5',
    };

    const content = (
      <>
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
