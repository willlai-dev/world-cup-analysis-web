'use client';

import { useFavorites } from '@/features/favorites/use-favorites';
import { PageHeading } from '@/components/layout/PageHeading';
import { TeamCard } from '@/components/cards/TeamCard';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';

export default function FavoritesPage() {
  const favorites = useFavorites();

  return (
    <div className="flex flex-col gap-8">
      <PageHeading title="關注名單" description="您收藏的國家隊與球員。" />

      {favorites.isLoading ? (
        <LoadingState />
      ) : favorites.isError ? (
        <ErrorState error={favorites.error} onRetry={() => favorites.refetch()} />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">關注國家</h2>
            {favorites.data && favorites.data.teams.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.data.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            ) : (
              <EmptyState message="尚未收藏任何國家隊。" />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">關注球員</h2>
            {favorites.data && favorites.data.players.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.data.players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <EmptyState message="尚未收藏任何球員。" />
            )}
          </section>
        </>
      )}
    </div>
  );
}
