import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className={`${sizeMap[size]} border-gold/20 border-t-gold rounded-full animate-spin`}
      />
      {text && (
        <p className="text-xs uppercase tracking-widest text-luxury-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};
