'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

export function SaveIndicator({ status, lastSaved, className }: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </div>
        );
      case 'saved':
        return showSaved ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        ) : null;
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Save failed</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        );
      default:
        return lastSaved ? (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">
              Last saved {formatRelativeTime(lastSaved)}
            </span>
          </div>
        ) : null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className={cn(
      'transition-all duration-200',
      showSaved && 'animate-in fade-in slide-in-from-right-2',
      className
    )}>
      {content}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Hook for managing save status
 */
export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  const setSaving = () => setStatus('saving');
  const setSaved = () => {
    setStatus('saved');
    setLastSaved(new Date());
  };
  const setError = () => setStatus('error');
  const setOffline = () => setStatus('offline');
  const setIdle = () => setStatus('idle');

  return {
    status,
    lastSaved,
    setSaving,
    setSaved,
    setError,
    setOffline,
    setIdle,
  };
}