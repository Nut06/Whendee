import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import planStore from "../../lib/planStore";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];


function Chip() {
  return (
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
  );
}

function DateBadge({ label, day }: { label: string; day: string }) {
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
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>{day}</Text>
    </View>
  );
}

function SuggestCard({
  title,
  liked,
  onLike,
}: {
  title: string;
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onLike}
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: "#111827" }}>{title}</Text>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: liked ? "#2b7cff" : "#eef2ff",
        }}
      >
        <Ionicons name="thumbs-up" size={18} color={liked ? "#fff" : "#2b7cff"} />
      </View>
    </TouchableOpacity>
  );
}

export default function PlanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();
  const mid = (meetingId ?? "").trim();

  const [, forceRefresh] = useState(0);
  useEffect(() => {
    const unsub = planStore.subscribe(() => forceRefresh((t) => t + 1));
    return unsub;
  }, []);

  // เรียก hooks เสมอ (ห้าม early return)
  const plan = useMemo(() => planStore.getByMeetingId(mid), [mid]);
  const meetingDetails = mid ? planStore.getMeetingDetails(mid) : undefined;

  // ถ้ามี location แล้ว → redirect ไป success (แต่ยัง render โครง)
  useEffect(() => {
    if (mid && plan?.locationName) {
      (router as any).replace({
        pathname: "/(main)/vote-success",
        params: { meetingId: mid, name: plan.locationName },
      });
    }
  }, [mid, plan?.locationName, router]);

  const goSetLocation = () =>
    (router as any).push({ pathname: "/(main)/set-location", params: { meetingId: mid } });

  // AI suggestions → ไปหน้า set-location พร้อม suggestedName
  const suggestions = ["Bowling", "Movie", "Mini Golf"];
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const likeAndGoSet = (name: string) => {
    setLiked((p) => ({ ...p, [name]: true }));
    (router as any).push({
      pathname: "/(main)/set-location",
      params: { meetingId: mid, suggestedName: name },
    });
  };

  const isRedirecting = !!plan?.locationName;
  const finalDate = meetingDetails?.finalDate;
  const badgeLabel = finalDate
    ? MONTHS[Math.max(0, Math.min(11, parseInt(finalDate.split("-")[1] || "1", 10) - 1))]
    : "No Date";
  const badgeDay = finalDate ? (finalDate.split("-")[2] || "01").padStart(2, "0") : "00";
  const displayMeetingId = plan?.meetingId ?? (mid || "—");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 110,
        paddingHorizontal: 12,
      }}
    >
      {isRedirecting ? (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#eef1f5",
            padding: 16,
          }}
        >
          <Text style={{ color: "#6b7280" }}>Redirecting…</Text>
        </View>
      ) : (
        <>
          {/* การ์ด info บน */}
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
            <Chip />
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <DateBadge label={badgeLabel} day={badgeDay} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
                    {plan?.title ?? "—"}
                  </Text>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
                </View>
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  Meeting ID: {displayMeetingId}
                </Text>

                <View style={{ height: 1, backgroundColor: "#eef1f5", marginTop: 10 }} />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={goSetLocation}
              style={{ flexDirection: "row", alignItems: "center", marginTop: 10, paddingVertical: 12 }}
            >
              <Ionicons name="location-outline" size={18} color="#7c3aed" />
              <Text style={{ marginLeft: 8, fontSize: 14, color: "#374151", flex: 1 }}>
                No location (Tap to set)
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* WhenDee Recommended */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: "#7656FF",
              padding: 12,
              paddingBottom: 6,
              overflow: "hidden",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 8 }}>
              WhenDee Recommended
            </Text>

            {suggestions.map((s) => (
              <SuggestCard key={s} title={s} liked={!!liked[s]} onLike={() => likeAndGoSet(s)} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
