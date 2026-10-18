import React from 'react';
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
  title = 'No Watches Found',
  description = 'We could not find any watches matching your criteria. Try resetting filters or changing search keywords.',
  resetUrl = '/watches',
  resetLabel = 'Reset All Filters',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 my-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 max-w-lg mx-auto shadow-sm transition-colors">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 text-amber-500">
        <Watch className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
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
