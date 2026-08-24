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
      'inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-gold/50';

    const variants = {
      primary:
        'bg-gold text-luxury-950 hover:bg-gold-hover hover:shadow-luxury-glow active:scale-[0.98] border border-gold',
      secondary:
        'bg-luxury-800 text-luxury-100 hover:bg-luxury-700 hover:text-white border border-luxury-700 active:scale-[0.98]',
      outline:
        'bg-transparent text-luxury-200 border border-luxury-700 hover:border-gold hover:text-gold active:scale-[0.98]',
      ghost:
        'bg-transparent text-luxury-300 hover:text-gold hover:bg-luxury-900/50 active:scale-[0.98]',
      whatsapp:
        'bg-[#25D366] text-luxury-950 font-semibold hover:bg-[#20bd5a] hover:shadow-[0_0_20px_-3px_rgba(37,211,102,0.4)] active:scale-[0.98] border border-[#25D366]',
      danger:
        'bg-rose-900/80 text-rose-100 border border-rose-700 hover:bg-rose-800 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-[11px] px-3.5 py-1.5 rounded-sm gap-1.5',
      md: 'text-xs px-5 py-2.5 rounded-sm gap-2',
      lg: 'text-sm px-7 py-3.5 rounded-sm gap-2.5',
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
