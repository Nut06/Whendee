import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Person = {
  id: string;
  name: string;
  selected: boolean;
};

const PEOPLE: Person[] = [
  { id: "u1", name: "Aliya",      selected: true  },
  { id: "u2", name: "Ron",        selected: true  },
  { id: "u3", name: "Amy",        selected: true  },
  { id: "u4", name: "Bill Gates", selected: true  },
  { id: "u5", name: "Victoria",   selected: true  },
];

function PersonRow({ p, last }: { p: Person; last: boolean }) {
  return (
    <View style={{ paddingHorizontal: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#cfe4ff",
            marginRight: 12,
          }}
        />
        <Text style={{ flex: 1, fontSize: 15, color: "#111827" }}>{p.name}</Text>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          {p.selected ? "Location Selected" : "Missing Location Selected"}
        </Text>
      </View>
      {!last && <View style={{ height: 1, backgroundColor: "#f1f3f6" }} />}
    </View>
  );
}

export default function LocationStatusScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const selectedCount = PEOPLE.filter((x) => x.selected).length;
  const total = PEOPLE.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
      contentContainerStyle={{
        padding: 12,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 110,
      }}
    >
      {/* การ์ดหัวข้อ */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eef1f5",
          padding: 12,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#eaf3ff",
            borderColor: "#cfe4ff",
            borderWidth: 1,
            paddingHorizontal: 10,
            height: 28,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color="#2b7cff" />
          <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#2b7cff" }}>
            Select a date to see time slots
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              width: 56,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#cfe4ff",
              backgroundColor: "#f3f8ff",
              paddingVertical: 8,
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#2b7cff" }}>No{"\n"}Date</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>00</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>New Year trip</Text>
              <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
            </View>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              Event ID: {eventId ?? "—"}
            </Text>

            <View
              style={{
                marginTop: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#eef1f5",
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="pin-outline" size={16} color="#2b7cff" />
              <Text style={{ marginLeft: 8, fontSize: 13, color: "#111827" }}>
                Location selected: {selectedCount}/{total}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#eef1f5", marginTop: 10 }} />
          </View>
        </View>
      </View>

      {/* การ์ด People */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eef1f5",
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: 8,
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
          }}
        >
          People
        </Text>

        {PEOPLE.map((p, i) => (
          <PersonRow key={p.id} p={p} last={i === PEOPLE.length - 1} />
        ))}

        <TouchableOpacity
          onPress={() =>
            (router as any).push({ pathname: "/vote-location", params: { eventId } })
          }
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="hand-left-outline" size={16} color="#2b7cff" />
            <Text style={{ marginLeft: 10, fontSize: 14, color: "#111827" }}>
              Tap here to vote location for trip
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="sparkles-outline" size={16} color="#111827" />
            <Text style={{ marginLeft: 10, fontSize: 14, color: "#111827" }}>
              Ai suggestion
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
