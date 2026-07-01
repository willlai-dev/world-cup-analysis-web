'use client';

import { useFavoriteIds, useToggleFavoriteTeam, useToggleFavoritePlayer } from '@/features/favorites/use-favorites';
import { cn } from '@/lib/utils';

type FavoriteButtonProps =
  | { kind: 'team'; id: string; className?: string }
  | { kind: 'player'; id: string; className?: string };

// Optimistic-ish favorite toggle. Reads current favorite state from the cached set.
export function FavoriteButton(props: FavoriteButtonProps) {
  const { teamIds, playerIds } = useFavoriteIds();
  const toggleTeam = useToggleFavoriteTeam();
  const togglePlayer = useToggleFavoritePlayer();

  const favorited =
    props.kind === 'team' ? teamIds.has(props.id) : playerIds.has(props.id);
  const isPending = props.kind === 'team' ? toggleTeam.isPending : togglePlayer.isPending;

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.kind === 'team') {
      toggleTeam.mutate({ teamId: props.id, favorited });
    } else {
      togglePlayer.mutate({ playerId: props.id, favorited });
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? '取消收藏' : '加入收藏'}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition-colors disabled:opacity-50',
        favorited
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
        props.className,
      )}
    >
      {isPending ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <span aria-hidden>{favorited ? '★' : '☆'}</span>
      )}
      {favorited ? '已收藏' : '收藏'}
    </button>
  );
}
