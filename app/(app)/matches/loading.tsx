import { ListPageSkeleton } from '@/components/ui/states';

export default function Loading() {
  return <ListPageSkeleton filterRows={2} count={6} variant="match" />;
}
