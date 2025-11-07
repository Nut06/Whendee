import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import planStore from "../lib/planStore";
import { ensureEventMember } from "@/lib/eventApi";
import { fetchFriends, type FriendProfile } from "@/lib/identityApi";

type Props = {
  onCancel?: () => void;
  onSave?: () => void;
};

export default function AddMembers({ onCancel, onSave }: Props) {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();
  const normalizedMeetingId = (Array.isArray(meetingId) ? meetingId[0] : meetingId) ?? "";
  const backendEventId = normalizedMeetingId
    ? planStore.getBackendEventId(normalizedMeetingId)
    : undefined;
  const [statuses, setStatuses] = useState<Record<string, "idle" | "loading" | "added">>({});
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const currentUserId = planStore.getCurrentUserId();
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    const unsub = planStore.subscribe(() => forceRefresh((t) => t + 1));
    return unsub;
  }, []);

  const plan = normalizedMeetingId ? planStore.getByMeetingId(normalizedMeetingId) : undefined;
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoadingFriends(true);
        setFriendsError(null);
        const response = await fetchFriends(currentUserId);
        if (!cancelled) {
          setFriends(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setFriendsError(error instanceof Error ? error.message : "Unable to load friends");
          setFriends([]);
        }
      } finally {
        if (!cancelled) setIsLoadingFriends(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!plan?.members) return;
    setStatuses((prev) => {
      const next = { ...prev };
      plan.members.forEach((member) => {
        next[member.userId] = "added";
      });
      return next;
    });
  }, [plan?.members]);

  const filteredFriends = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return friends;
    return friends.filter((friend) => {
      const name = friend.name?.toLowerCase() ?? "";
      const email = friend.email?.toLowerCase() ?? "";
      const phone = friend.phoneNumber ?? "";
      return name.includes(keyword) || email.includes(keyword) || phone.includes(keyword);
    });
  }, [friends, search]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    router.back();
  };
  const handleSave = () => {
    onSave?.();
  };

  const handleInvite = async (userId: string, name: string) => {
    if (!normalizedMeetingId || !backendEventId) {
      Alert.alert("Missing event", "Please schedule this meeting before inviting friends.");
      return;
    }

    try {
      setStatuses((prev) => ({ ...prev, [userId]: "loading" }));
      const response = await ensureEventMember(backendEventId, userId, "INVITED");
      if (response.data) {
        planStore.upsertMember(normalizedMeetingId, response.data);
      }
      setStatuses((prev) => ({ ...prev, [userId]: "added" }));
      Alert.alert("Invitation sent", `${name} has been invited.`);
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [userId]: "idle" }));
      Alert.alert(
        "Unable to invite friend",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={{ color: "blue" }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Add Members</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: "blue" }}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search friends"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 10,
          marginBottom: 12,
        }}
      />

    {/* Invite button */}
      <TouchableOpacity
      onPress={() => router.push("/(main)/inviteFriends")}
        style={{
          backgroundColor: "#f0f0f0",
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Text>Invite your friends</Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: "bold", marginVertical: 8 }}>Friends on Whendee</Text>
      {isLoadingFriends ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator />
        </View>
      ) : friendsError ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{friendsError}</Text>
      ) : filteredFriends.length === 0 ? (
        <Text style={{ color: "#6b7280", marginBottom: 12 }}>
          {friends.length === 0 ? "No friends found." : "No friends match your search."}
        </Text>
      ) : (
        filteredFriends.map((friend) => (
          <View
            key={friend.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri:
                    friend.avatarUrl ??
                    "https://ui-avatars.com/api/?background=EEF2FF&color=312E81&name=" +
                      encodeURIComponent(friend.name ?? "Friend"),
                }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
              />
              <View>
                <Text>{friend.name ?? "Unnamed friend"}</Text>
                {friend.email ? (
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>{friend.email}</Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              disabled={statuses[friend.id] === "loading" || statuses[friend.id] === "added"}
              onPress={() => handleInvite(friend.id, friend.name ?? "This friend")}
            >
              <Text style={{ color: statuses[friend.id] === "added" ? "gray" : "blue" }}>
                {statuses[friend.id] === "loading"
                  ? "Adding..."
                  : statuses[friend.id] === "added"
                  ? "Invited"
                  : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}
