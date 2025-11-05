import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";

const alreadyOnWhendee = [
  { id: "1", name: "John", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Ron", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Amy", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Bill Gates", avatar: "https://i.pravatar.cc/150?img=4" },
];

const inviteToWhendee = [
  { id: "5", name: "John", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "6", name: "Ron", avatar: "https://i.pravatar.cc/150?img=6" },
  { id: "7", name: "Amy", avatar: "https://i.pravatar.cc/150?img=7" },
  { id: "8", name: "Bill Gates", avatar: "https://i.pravatar.cc/150?img=8" },
];

export default function FriendsInvite() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.cancel}>Cancel</Text>
        <Text style={styles.title}>All Contacts</Text>
        <Text style={styles.save}>Save</Text>
      </View>

      {/* Search */}
      <TextInput style={styles.search} placeholder="Search" />

      {/* Already On Whendee */}
      <Text style={styles.sectionTitle}>Already On WhenDee</Text>
      <FlatList
        data={alreadyOnWhendee}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.viewMore}>View More</Text>

      {/* Invite To Whendee */}
      <Text style={styles.sectionTitle}>Invite to WhenDee</Text>
      <FlatList
        data={inviteToWhendee}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cancel: { color: "gray", fontSize: 16 },
  title: { fontWeight: "bold", fontSize: 18 },
  save: { color: "#067bff", fontSize: 16 },
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
