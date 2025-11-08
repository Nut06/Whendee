import type { User } from '@/types/user.types';

// Generic API envelope used by identity-service
export type ApiSuccess<T> = { success: true; message?: string; data: T };
export type ApiErrorResponse = { success: false; message: string; code?: string };
export type ApiResult<T> = ApiSuccess<T> | ApiErrorResponse;

// Common pagination metadata
export interface PagingMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Identity-service specific DTOs
export interface UsersLookupRequest { ids: string[] }
export interface UsersLookupResult { users: User[] }

export interface UserListQuery { page?: number; limit?: number; search?: string }
export interface UserListResult { users: User[]; meta: PagingMeta }

export interface AddFriendRequest { friendId: string }

export type PreferenceItem = {
  key: string;
  label?: string;
  icon?: string | null;
  score?: number;
};
export interface UpdatePreferencesRequest { preferences: PreferenceItem[] }
export interface UpdatePreferencesResult { user: User }

export interface UpdateUserPayload extends Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatarUrl'>> {
  // Allow additional fields as backend evolves
  [key: string]: unknown;
}
export interface UpdateUserResult { user: User }
