import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";

const groups = [
  { id: "1", name: "Friends Forever", avatar: "https://placekitten.com/50/50" },
  { id: "2", name: "Movie Lover", avatar: "https://placekitten.com/51/51" },
  { id: "3", name: "Hiking", avatar: "https://placekitten.com/52/52" },
];

const people = [
  { id: "4", name: "John", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "5", name: "Ron", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
  { id: "6", name: "Amy", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: "7", name: "Bill Gates", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "8", name: "Victoria H", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
];

export default function AddMembers() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "blue" }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Add Members</Text>
        <TouchableOpacity>
          <Text style={{ color: "blue" }}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search"
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

      {/* Groups */}
      <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Groups</Text>
      {groups.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: item.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
            <Text>{item.name}</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ color: "blue" }}>Add</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* People */}
      <Text style={{ fontWeight: "bold", marginVertical: 8 }}>People</Text>
      {people.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: item.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
            <Text>{item.name}</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ color: "blue" }}>Add</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}