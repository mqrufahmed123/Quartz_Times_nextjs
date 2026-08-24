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
  title = 'An Error Occurred',
  message = 'We encountered an issue while loading the horological collection. Please try refreshing.',
  retry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-lg border border-rose-900/30 bg-rose-950/10 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mb-4 text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-serif text-luxury-100 mb-2">{title}</h3>
      <p className="text-sm text-luxury-400 mb-6 max-w-sm">{message}</p>
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
