'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'We encountered an error loading this page. Please try refreshing.',
  retry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 my-8 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/10 max-w-lg mx-auto transition-colors">
      <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/50 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">{message}</p>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
