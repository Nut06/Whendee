import { identityApi } from "../app/utils/api";

export type FriendProfile = {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
};

type FriendListResponse = {
  data: FriendProfile[];
};

export async function fetchFriends(userId: string) {
  const response = await identityApi.get<FriendListResponse>(`/users/${userId}/friends`);
  return response.data;
}
