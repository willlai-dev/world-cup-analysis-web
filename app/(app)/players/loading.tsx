import { ListPageSkeleton } from '@/components/ui/states';

export default function Loading() {
  return <ListPageSkeleton filterRows={2} count={9} />;
}
