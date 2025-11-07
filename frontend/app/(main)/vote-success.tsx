import { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const formatChipLabel = (finalDate?: string) => {
  if (!finalDate) return "Select a date to see time slots";
  const [y, m, d] = finalDate.split("-");
  const mm = MONTHS[Math.max(0, Math.min(11, parseInt(m || "1", 10) - 1))];
  return `${d} ${mm} ${y}`;
};

const formatBadge = (finalDate?: string) => {
  if (!finalDate) return { label: "No Date", day: "00" };
  const [y, m, d] = finalDate.split("-");
  const mm = MONTHS[Math.max(0, Math.min(11, parseInt(m || "1", 10) - 1))];
  return { label: `${mm} ${y.slice(-2)}`, day: (d || "01").padStart(2, "0") };
};

function HeaderCard({
  chipLabel,
  badge,
  title,
  meetingId,
  detail,
}: {
  chipLabel: string;
  badge: { label: string; day: string };
  title: string;
  meetingId: string;
  detail?: string;
}) {
  return (
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
          {chipLabel}
        </Text>
      </View>

      <View style={{ flexDirection: "row" }}>
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
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#2b7cff", textAlign: "center" }}>
            {badge.label}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>{badge.day}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{title ?? "Event"}</Text>
            <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
          </View>
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            Meeting ID: {meetingId}
          </Text>
          {detail && (
            <Text style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }} numberOfLines={1}>
              Event detail: {detail}
            </Text>
          )}
          <View style={{ height: 1, backgroundColor: "#eef1f5", marginTop: 10 }} />
        </View>
      </View>
    </View>
  );
}

export default function VoteSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { name, eventId, title } = useLocalSearchParams<{ name?: string; eventId?: string; title?: string }>();
  const placeName = name && name.length > 0 ? name : "Selected location";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F6F7FB",
        paddingTop: insets.top + 8,
        paddingHorizontal: 12,
        paddingBottom: insets.bottom + 110,
      }}
    >
      <HeaderCard meetingId={eventId} title={title} />

      <View style={{ marginTop: 28, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
        <View
          style={{
            width: "80%",
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#eef1f5",
            paddingVertical: 26,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <Text style={{ textAlign: "center", color: "#6b7280", fontSize: 14 }}>
            The vote was successful
          </Text>
          <Text style={{ textAlign: "center", color: "#111827", marginTop: 12, fontSize: 15 }}>
            your trip location is
          </Text>
          <Text style={{ textAlign: "center", color: "#111827", marginTop: 6, fontSize: 16, fontWeight: "700" }}>
            {placeName}!
          </Text>
        </View>
      </View>
    </View>
  );
}
