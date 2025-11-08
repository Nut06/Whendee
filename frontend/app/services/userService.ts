import { identityApi, ApiResponse } from "@/utils/api";
import { User } from "@/types/user.types";
import type {
  UpdateUserPayload,
  UsersLookupResult,
  UserListResult,
} from "@/types/api.types";

type UserPreferencePayload = {
  key: string;
  label?: string;
  icon?: string | null;
  score?: number;
};

export const userService = {
  // Fetch a single user by id via batch lookup endpoint
  getUser: async (userId: string): Promise<User> => {
    const res = await identityApi.post<ApiResponse<UsersLookupResult>>("/user/lookup", { ids: [userId] });
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch user');
    }
    const user = res.data.data.users?.[0];
    if (!user) throw new Error('User not found');
    return user;
  },

  // Update current user's profile (backend resolves user from token/dev override)
  updateUser: async (payload: UpdateUserPayload): Promise<User> => {
    const res = await identityApi.put<ApiResponse<{ user: User }>>('/user', payload);
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to update user');
    }
    return res.data.data.user;
  },

  // Optional: delete current user (not implemented on backend; kept for future)
  deleteUser: async (): Promise<void> => {
    await identityApi.delete('/user');
  },

  setUserPreference: async (preferences: UserPreferencePayload[]): Promise<User> => {
    try {
      const res = await identityApi.post<ApiResponse<{ user: User }>>("/user/preferences", { preferences });
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to update preferences');
      }
      return res.data.data.user;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update preferences';
      throw new Error(message);
    }
  },

  // Convenience: list users with pagination
  listUsers: async (opts: { page?: number; limit?: number; search?: string } = {}): Promise<UserListResult> => {
    const params: Record<string, string | number> = {};
    if (opts.page) params.page = opts.page;
    if (opts.limit) params.limit = opts.limit;
    if (opts.search) params.q = opts.search;
    const res = await identityApi.get<ApiResponse<UserListResult>>('/user/list', { params });
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch user list');
    }
    return res.data.data;
  },

  // Convenience: batch lookup users
  lookupUsers: async (ids: string[]): Promise<User[]> => {
    const res = await identityApi.post<ApiResponse<UsersLookupResult>>('/user/lookup', { ids });
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch users');
    }
    return res.data.data.users;
  },

  // Add friend by id
  addFriend: async (friendId: string): Promise<User> => {
    const res = await identityApi.post<ApiResponse<{ user: User }>>('/user/add/friend', { friendId });
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to add friend');
    }
    return res.data.data.user;
  },
}


