import { Skeleton } from '@/components/ui/states';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
      {/* 能力雷達骨架 */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col items-center gap-4 p-4 sm:flex-row">
          <Skeleton className="h-48 w-48 rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* AI 分析 & 評分骨架 */}
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm">
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
