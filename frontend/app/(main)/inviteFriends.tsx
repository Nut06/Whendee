import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { FriendProfile } from "@/lib/identityApi";

type Props = {
  friends: FriendProfile[];
  alreadyOn: FriendProfile[];
  invites?: FriendProfile[];
  loadingFriends?: boolean;
  friendError?: string | null;
};

export default function FriendsInvite({
  friends,
  alreadyOn,
  invites = [],
  loadingFriends = false,
  friendError = null,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Search */}
      <TextInput style={styles.search} placeholder="Search" />

      <Text style={styles.sectionTitle}>Friends</Text>
      {loadingFriends ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#2563eb" />
          <Text style={styles.loadingText}>Loading friends…</Text>
        </View>
      ) : friendError ? (
        <Text style={styles.errorText}>{friendError}</Text>
      ) : friends.length === 0 ? (
        <Text style={styles.emptyText}>No friends yet.</Text>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Image
                source={{ uri: item.avatarUrl ?? "https://i.pravatar.cc/150?img=10" }}
                style={styles.avatar}
              />
              <Text style={styles.name}>{item.name ?? "Unknown friend"}</Text>
            </View>
          )}
        />
      )}

      {/* Already On Whendee */}
      {alreadyOn.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Already On WhenDee</Text>
          <FlatList
            scrollEnabled={false}
            data={alreadyOn}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Image source={{ uri: item.avatarUrl! }} style={styles.avatar} />
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Text style={styles.viewMore}>View More</Text>
        </>
      )}

      {/* Invite To Whendee */}
      {invites.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invite to WhenDee</Text>
          <FlatList
            scrollEnabled={false}
            data={invites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Image source={{ uri: item.avatarUrl! }} style={styles.avatar} />
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity style={styles.inviteButton}>
                  <Text style={styles.inviteText}>Invite</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontWeight: "bold", fontSize: 18 },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginVertical: 8 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { flex: 1, fontSize: 16 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: "#4b5563",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 8,
  },
  emptyText: {
    color: "#94a3b8",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addText: { color: "#067bff", fontWeight: "bold" },
  inviteButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inviteText: { color: "#000", fontWeight: "bold" },
  viewMore: { textAlign: "center", color: "gray", marginVertical: 8 },
});
