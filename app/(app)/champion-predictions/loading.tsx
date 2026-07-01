import { PageHeadingSkeleton, CardGridSkeleton, Skeleton } from '@/components/ui/states';

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeadingSkeleton hasAction />
      {/* 冠軍預測表格骨架 */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-6 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ml-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      {/* AI 報告骨架 */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
