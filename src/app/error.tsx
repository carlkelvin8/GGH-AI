'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

/**
 * Global Error Boundary for the application.
 * Refined with premium GGH styling.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 bg-background overflow-hidden">
      {/* Background Flair */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-destructive/5 blur-[120px]" />
      </div>

      <div className="max-w-md w-full flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
          <div className="relative p-6 bg-white rounded-3xl border border-destructive/10 shadow-xl">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Something went <span className="text-destructive">wrong</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            An unexpected error occurred. Our engineers have been notified and are looking into it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            onClick={reset}
            size="lg"
            className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 h-14 rounded-2xl border-slate-200 font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
