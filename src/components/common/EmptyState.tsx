import React from 'react';
import Link from 'next/link';
import { Watch, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  resetUrl?: string;
  resetLabel?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Timepieces Found',
  description = 'We could not find any watches matching your selected criteria. Try adjusting your filters or search keywords.',
  resetUrl = '/watches',
  resetLabel = 'Reset All Filters',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-lg border border-luxury-800 bg-luxury-900/40 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-luxury-800/80 border border-luxury-700 flex items-center justify-center mb-5 text-gold/70">
        <Watch className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif text-luxury-100 tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-sm text-luxury-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onReset ? (
        <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          {resetLabel}
        </Button>
      ) : (
        <Button variant="outline" size="sm" href={resetUrl} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
};
