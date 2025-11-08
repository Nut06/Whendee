import { useEffect, useMemo, useState } from "react";
import FriendsInvite from "./inviteFriends";
import type { FriendProfile } from "@/lib/identityApi";
import { fetchFriends, fetchUserDirectory } from "@/lib/identityApi";
import { useAuthStore } from "../stores/authStore";

const DEV_USER_ID = process.env.EXPO_PUBLIC_DEV_USER_ID;

export default function FriendsScreen() {
  const userId = useAuthStore((state) => state.user?.id) ?? DEV_USER_ID;
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [alreadyOn, setAlreadyOn] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("No user ID available");
      setFriends([]);
      setAlreadyOn([]);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([fetchFriends(), fetchUserDirectory()])
      .then(([friendsData, directory]) => {
        const friendList = friendsData ?? [];
        const friendIds = new Set(friendList.map((f) => f.id));
        const directoryList = (directory ?? []).filter((user) => !friendIds.has(user.id));
        setFriends(friendList);
        setAlreadyOn(directoryList);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load friends");
        setFriends([]);
        setAlreadyOn([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const memoizedFriends = useMemo(() => friends, [friends]);
  const memoizedAlreadyOn = useMemo(() => alreadyOn, [alreadyOn]);

  return (
    <FriendsInvite
      friends={memoizedFriends}
      alreadyOn={memoizedAlreadyOn}
      loadingFriends={loading}
      friendError={error}
    />
  );
}
