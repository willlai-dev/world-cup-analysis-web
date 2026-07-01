import { Skeleton } from '@/components/ui/states';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Scoreboard card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
      </div>
      {/* Analysis cards */}
      {['賽前預測', 'AI 分析', '賽後報告'].map((title) => (
        <div key={title} className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
