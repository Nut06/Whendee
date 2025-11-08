import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commApi } from "@/lib/api";

type InviteTarget = {
  friendId: string;
  displayName: string;
  avatarUrl?: string;
};

const GROUP_ID = "group_demo";
const INVITER_ID = "user_organizer_1";

export default function FriendsScreen() {
  const [targets, setTargets] = useState<InviteTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commApi.listInviteTargets(GROUP_ID);
      setTargets(response.data ?? []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to load invite targets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  const handleInvite = async (friendId: string) => {
    try {
      setCreating(friendId);
      const response = await commApi.createInvitation(GROUP_ID, {
        inviterId: INVITER_ID,
        inviteeId: friendId,
        expiresInMinutes: 120,
      });
      setLastInviteLink(response.data?.inviteLink ?? null);
      Alert.alert("Invitation sent", response.data?.inviteLink ?? "");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to send invitation");
    } finally {
      setCreating(null);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6f7fb", paddingHorizontal: 16, paddingTop: 16 }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>Invite friends</Text>
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Choose who to send the invite link to</Text>
        </View>
        <TouchableOpacity
          onPress={() => void loadTargets()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#eaf3ff",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#cfe4ff",
          }}
        >
          <Ionicons name="refresh" size={18} color="#2b7cff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#2b7cff" />
        </View>
      ) : targets.length === 0 ? (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "#cfe4ff",
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center" }}>
            No available friends to invite right now.
          </Text>
        </View>
      ) : (
        targets.map((target) => (
          <View
            key={target.friendId}
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#eef1f5",
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#e0e7ff",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="person" size={20} color="#4338ca" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                  {target.displayName}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>ID: {target.friendId}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => void handleInvite(target.friendId)}
              disabled={creating === target.friendId}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: "#2b7cff",
                opacity: creating === target.friendId ? 0.6 : 1,
              }}
            >
              <Ionicons name="send" size={14} color="#fff" />
              <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#fff" }}>
                {creating === target.friendId ? "Sending..." : "Invite"}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {lastInviteLink && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "#ecfdf5",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#bbf7d0",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: "#047857", marginBottom: 6, fontWeight: "600" }}>
            Latest invite link
          </Text>
          <Text style={{ fontSize: 13, color: "#065f46" }}>{lastInviteLink}</Text>
        </View>
      )}
    </ScrollView>
  );
}
