import { apiData } from '@/lib/api-client';
import type { FavoriteMutationResponse, FavoritesResponse } from '@/types/api';

export function fetchFavorites(signal?: AbortSignal): Promise<FavoritesResponse> {
  return apiData<FavoritesResponse>('/users/me/favorites', { signal });
}

export function addFavoriteTeam(teamId: string): Promise<FavoriteMutationResponse> {
  return apiData<FavoriteMutationResponse>(`/favorites/teams/${teamId}`, { method: 'POST' });
}

export function removeFavoriteTeam(teamId: string): Promise<FavoriteMutationResponse> {
  return apiData<FavoriteMutationResponse>(`/favorites/teams/${teamId}`, { method: 'DELETE' });
}

export function addFavoritePlayer(playerId: string): Promise<FavoriteMutationResponse> {
  return apiData<FavoriteMutationResponse>(`/favorites/players/${playerId}`, { method: 'POST' });
}

export function removeFavoritePlayer(playerId: string): Promise<FavoriteMutationResponse> {
  return apiData<FavoriteMutationResponse>(`/favorites/players/${playerId}`, { method: 'DELETE' });
}
