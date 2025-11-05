// app/(main)/calendar/select-date.tsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import planStore from "../../stores/planStore";

function Chip({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignSelf: "flex-start",
        backgroundColor: "#eaf3ff",
        borderColor: "#cfe4ff",
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 30,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Ionicons name="calendar-outline" size={14} color="#2b7cff" />
      <Text
        style={{ marginLeft: 6, fontSize: 12, fontWeight: "700", color: "#2b7cff" }}
      >
        Select a date to see time slots
      </Text>
    </TouchableOpacity>
  );
}

function DateBadge() {
  return (
    <View
      style={{
        width: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#cfe4ff",
        backgroundColor: "#f3f8ff",
        paddingVertical: 8,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: "#2b7cff", textAlign: "center" }}>
        No{"\n"}Date
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>00</Text>
    </View>
  );
}

export default function SelectDateScreen() {
  const insets = useSafeAreaInsets();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();
  const mid = (meetingId ?? "").trim();
  const plan = planStore.getByMeetingId(mid);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 110,
        paddingHorizontal: 12,
      }}
    >
      {/* การ์ดข้อมูลแผน */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eef1f5",
          padding: 12,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Chip onPress={() => { /* ตรงนี้จะเปิด date picker ได้ในอนาคต */ }} />
          <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <DateBadge />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              {plan?.title ?? "—"}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              Meeting ID: {plan?.meetingId ?? "—"}
            </Text>

            {/* แถบผู้ร่วม (mock) */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Image
                  key={i}
                  source={require("../../../assets/images/react-logo.png")}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: "#fff",
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                />
              ))}
              <Text style={{ marginLeft: 8, fontSize: 12, color: "#2b7cff" }}>5 participants</Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#eef1f5", marginTop: 10 }} />
          </View>
        </View>

        {/* แถวสถานที่ + สถานะเลือกวันที่ */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
            <Ionicons name="location-outline" size={18} color="#7c3aed" />
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
                {plan?.locationName ?? "No location"}
              </Text>
              {!!(plan as any)?.locationAddress && (
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {(plan as any).locationAddress}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {/* ไปหน้าเลือกวันที่จริงในอนาคต */}}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 12, color: "#22c55e", fontWeight: "700" }}>
              Select a date first{"\n"}
              <Text style={{ color: "#22c55e", fontWeight: "700" }}>No date selected</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* รายชื่อผู้ร่วม + สถานะเลือกวันที่ (ตัวอย่าง) */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eef1f5",
          paddingVertical: 8,
        }}
      >
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, fontWeight: "700", color: "#111827" }}>
          People
        </Text>

        {[
          { name: "Aliya", status: "Missing Date Selection" },
          { name: "Ron", status: "Missing Date Selection" },
          { name: "Amy", status: "Date Selected" },
          { name: "Bill Gates", status: "Date Selected" },
          { name: "Victoria", status: "Date Selected" },
        ].map((p, idx) => (
          <View
            key={idx}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopColor: "#f0f2f5",
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="person" size={16} color="#6b7280" />
            </View>
            <Text style={{ flex: 1, color: "#111827" }}>{p.name}</Text>
            <Text style={{ fontSize: 12, color: p.status.includes("Missing") ? "#9ca3af" : "#10b981" }}>
              {p.status}
            </Text>
          </View>
        ))}

        {/* แถวเลือกวันของฉัน */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: "#f0f2f5",
          }}
          onPress={() => {/* เปิด date-picker ของผู้ใช้ในอนาคต */}}
        >
          <Ionicons name="add-circle-outline" size={18} color="#6b7280" />
          <Text style={{ marginLeft: 8, color: "#6b7280" }}>Select your free date</Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
