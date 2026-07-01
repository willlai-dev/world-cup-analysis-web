import { PageHeadingSkeleton, CardGridSkeleton, Skeleton } from '@/components/ui/states';

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeadingSkeleton />
      {/* 關注國家 */}
      <section>
        <Skeleton className="mb-3 h-6 w-24" />
        <CardGridSkeleton count={3} />
      </section>
      {/* 關注球員 */}
      <section>
        <Skeleton className="mb-3 h-6 w-24" />
        <CardGridSkeleton count={3} />
      </section>
    </div>
  );
}
