'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFavoritePlayer,
  addFavoriteTeam,
  fetchFavorites,
  removeFavoritePlayer,
  removeFavoriteTeam,
} from '@/features/favorites/favorites-api';
import type { FavoritesResponse } from '@/types/api';

export const favoritesKey = ['favorites'] as const;

export function useFavorites() {
  return useQuery({
    queryKey: favoritesKey,
    queryFn: ({ signal }) => fetchFavorites(signal),
  });
}

// Set of favorited team/player ids for quick "is this favorited?" checks in cards.
export function useFavoriteIds() {
  const { data } = useFavorites();
  return {
    teamIds: new Set((data?.teams ?? []).map((t) => t.id)),
    playerIds: new Set((data?.players ?? []).map((p) => p.id)),
  };
}

function invalidateFavorites(queryClient: ReturnType<typeof useQueryClient>) {
  // Mutation responses may be FavoritesResponse or { success: true } — refetch to be safe.
  return queryClient.invalidateQueries({ queryKey: favoritesKey });
}

export function useToggleFavoriteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, favorited }: { teamId: string; favorited: boolean }) =>
      favorited ? removeFavoriteTeam(teamId) : addFavoriteTeam(teamId),
    onSuccess: (result) => {
      if (result && typeof result === 'object' && 'teams' in result) {
        queryClient.setQueryData<FavoritesResponse>(favoritesKey, result);
      } else {
        void invalidateFavorites(queryClient);
      }
    },
  });
}

export function useToggleFavoritePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, favorited }: { playerId: string; favorited: boolean }) =>
      favorited ? removeFavoritePlayer(playerId) : addFavoritePlayer(playerId),
    onSuccess: (result) => {
      if (result && typeof result === 'object' && 'players' in result) {
        queryClient.setQueryData<FavoritesResponse>(favoritesKey, result);
      } else {
        void invalidateFavorites(queryClient);
      }
    },
  });
}
