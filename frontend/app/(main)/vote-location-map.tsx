import { useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function VoteLocationMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // state จำลองการปักหมุด (ถ้ามีการแตะในแผนที่ จะถือว่า “เลือกแล้ว”)
  const [hasPin, setHasPin] = useState(false);

  const onPressMap = () => setHasPin(true);
  const onSave = () => {
    // ตรงนี้คุณจะเก็บพิกัดจริง ๆ ก็ได้
    // แล้วกลับไปหน้าโหวต
    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F6F7FB",
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 12,
        paddingHorizontal: 12,
      }}
    >
      {/* การ์ดหัว */}
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
          <Ionicons name="location-outline" size={14} color="#2b7cff" />
          <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#2b7cff" }}>
            Tap map to drop a pin
          </Text>
        </View>

        {/* กล่องค้นหา (จำลอง) */}
        <View
          style={{
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            backgroundColor: "#fff",
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#9ca3af", fontSize: 13 }}>Barclay Center</Text>
        </View>
      </View>

      {/* แผนที่ (จำลอง) */}
      <Pressable
        onPress={onPressMap}
        style={{
          flex: 1,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#d9c2ff",
          backgroundColor: "#eef6ff",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* ปุ่มย้อนกลับลอยมุมซ้ายบน */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        {/* พื้นที่แผนที่ */}
        <Text style={{ color: "#6b7280" }}>Tap anywhere to drop a pin</Text>

        {/* หมุด (จำลอง) */}
        {hasPin && (
          <View
            style={{
              position: "absolute",
              right: 32,
              bottom: 48,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#ef4444",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        )}
      </Pressable>

      {/* ปุ่ม Save (แสดงเมื่อมีการปักหมุดแล้ว) */}
      {hasPin && (
        <TouchableOpacity
          onPress={onSave}
          activeOpacity={0.9}
          style={{
            marginTop: 12,
            alignSelf: "center",
            backgroundColor: "#2b7cff",
            height: 40,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#2b7cff",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
