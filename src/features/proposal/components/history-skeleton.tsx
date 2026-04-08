import { cn } from '@/shared/lib/utils';

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn('bg-slate-100 rounded-xl animate-pulse', className)} />
  );
}

export function HistorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b bg-slate-50/30 space-y-3">
            <Bone className="h-5 w-3/4" />
            <Bone className="h-3 w-1/3" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-full" />
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-between">
            <Bone className="h-3 w-24" />
            <Bone className="h-3 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
