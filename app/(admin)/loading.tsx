import { ListPageSkeleton } from '@/components/ui/states';

export default function Loading() {
  return <ListPageSkeleton filterRows={1} count={5} hasAction />;
}
