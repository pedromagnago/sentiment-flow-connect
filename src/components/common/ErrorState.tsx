
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div className="text-lg text-red-500">Erro: {message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};
