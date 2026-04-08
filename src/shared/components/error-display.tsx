'use client';

import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { type UserFriendlyError } from '@/shared/lib/error-handler';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const getIcon = () => {
    switch (error.category) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getColorClasses = () => {
    switch (error.category) {
      case 'network':
        return 'border-red-200 bg-red-50';
      case 'timeout':
        return 'border-orange-200 bg-orange-50';
      case 'validation':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <Card className={`${getColorClasses()} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">
              {error.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {error.message}
            </p>
            {error.action && (
              <p className="text-gray-500 text-xs mt-2">
                {error.action}
              </p>
            )}
            {error.retryable && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Network status indicator
 */
export function NetworkStatus() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              You're offline
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}