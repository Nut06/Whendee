// src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api.Examples';

// API Functions
const fetchUser = async (userId: string) => {
  // Implement user fetch logic or use appropriate userService method
  return userService.updateProfile(userId, {});
};

const fetchCurrentUser = async () => {
  // Implement current user fetch logic
  return userService.getFriends().then(friends => friends[0]);
};

const updateUser = async (data: any) => {
  return await userService.updateProfile(data.userId, data);
};

const deleteUser = async (userId: string) => {
  // Implement delete logic
  return Promise.resolve();
};

// Custom Hook
export const useUser = (userId?: string) => {
  const queryClient = useQueryClient();

  // Query: Get current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId || 'me'],
    queryFn: () => userId ? fetchUser(userId) : fetchCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Mutation: Update user
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(['user', 'me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Mutation: Delete user
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    refetch,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    updateError: updateUserMutation.error,
    deleteError: deleteUserMutation.error,
  };
};