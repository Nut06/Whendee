import api from "@/utils/api";
import { User, UserAuthInput } from "@/types/user.types";

export const userService = {
    fetchUser: async (userId: string): Promise<User> => {
      const { data } = await api.get<User>(`/users/${userId}`);
      return data;
    },
    updateUser: async (payload: User): Promise<User> => {
      const { data } = await api.patch<User>('/users/me', payload);
      return data;
    },

    deleteUser: async (): Promise<void> => {
      await api.delete('/users/me');
    },
    setUserPreference: async (preferences: any): Promise<void> => {
      await api.post('/users/preferences', preferences);
    }
}


