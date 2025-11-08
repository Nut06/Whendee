import { identityApi } from "../app/utils/api";
import type { ApiResponse } from "../app/utils/api";

export type FriendProfile = {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
};

type FriendListResponse = ApiResponse<{ friends: FriendProfile[] }>;
type UserListResponse = ApiResponse<{ users: FriendProfile[] }>;

export async function fetchFriends() {
  const response = await identityApi.get<FriendListResponse>("/user/friends");
  return response.data.data.friends;
}

export async function fetchUserDirectory() {
  const response = await identityApi.get<UserListResponse>("/user/list");
  return response.data.data.users;
}
