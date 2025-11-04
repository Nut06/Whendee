import { identityApi } from "@/utils/api";
import { User } from "@/types/user.types";

type UserPreferencePayload = {
  key: string;
  label?: string;
  icon?: string | null;
  score?: number;
};

export const userService = {
    getUser: async (userId: string): Promise<User> => {
      const { data } = await identityApi.get<User>(`/users/${userId}`);
      return data;
    },

    updateUser: async (payload: User): Promise<User> => {
      const { data } = await identityApi.patch<User>('/users/me', payload);
      return data;
    },

    deleteUser: async (): Promise<void> => {
      await identityApi.delete('/users/me');
    },

    setUserPreference: async (preferences: UserPreferencePayload[]): Promise<User> => {
      try {
        const { data } = await identityApi.post<{
          success: boolean;
          message?: string;
          data: { user: User };
        }>('/users/preferences', { preferences });

        if (!data?.success) {
          throw new Error(data?.message || 'Failed to update preferences');
        }

        return data.data.user;
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to update preferences';
        throw new Error(message);
      }
    }
}


