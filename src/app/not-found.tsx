import Link from 'next/link';
import { Home, Search, Ghost } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/**
 * Custom 404 Page for GGH Proposal AI.
 * Refined with high-end GGH design elements.
 */
export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      <div className="max-w-lg w-full flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl">
            <Ghost className="w-16 h-16 text-primary animate-bounce duration-1000" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-8xl font-black tracking-tighter text-slate-200">404</h2>
            <h3 className="text-4xl font-black tracking-tight text-slate-900 mt-[-2rem]">
              Lost in <span className="text-gradient">Space</span>
            </h3>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved or the proposal was deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button
            asChild
            size="2xl"
            className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-3" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="2xl"
            className="flex-1 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            <Search className="w-5 h-5 mr-3" />
            Search App
          </Button>
        </div>
      </div>
    </div>
  );
}
