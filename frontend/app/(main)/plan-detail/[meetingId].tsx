import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import planStore from "../../lib/planStore";
import { updateEvent } from "@/lib/eventApi";

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
  const [detail, setDetail] = useState(meetingDetails?.agenda ?? "");
  const [savingDetail, setSavingDetail] = useState(false);

  useEffect(() => {
    setDetail(meetingDetails?.agenda ?? "");
  }, [meetingDetails?.agenda]);

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

  const isRedirecting = !!plan?.locationName;
  const finalDate = meetingDetails?.finalDate;
  const badgeLabel = finalDate
    ? MONTHS[Math.max(0, Math.min(11, parseInt(finalDate.split("-")[1] || "1", 10) - 1))]
    : "No Date";
  const badgeDay = finalDate ? (finalDate.split("-")[2] || "01").padStart(2, "0") : "00";
  const displayMeetingId = plan?.meetingId ?? (mid || "—");
  const backendEventId = mid ? planStore.getBackendEventId(mid) : undefined;

  const persistDetail = async (nextDetail: string, opts?: { silent?: boolean }) => {
    if (!mid) return;
    const trimmed = nextDetail.trim();
    planStore.setMeetingDetails(mid, {
      ...(meetingDetails ?? {}),
      agenda: trimmed,
    });
    if (!backendEventId) {
      if (!opts?.silent) {
        Alert.alert("Saved locally", "Save the meeting in Schedule to sync with server.");
      }
      return;
    }
    try {
      setSavingDetail(true);
      await updateEvent(backendEventId, { eventDescription: trimmed });
      if (!opts?.silent) {
        Alert.alert("Updated", "Event detail saved.");
      }
    } catch (error) {
      if (!opts?.silent) {
        Alert.alert(
          "Unable to save detail",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    } finally {
      setSavingDetail(false);
    }
  };

  const handleSaveDetail = () => persistDetail(detail);

  const handleSuggestion = async (text: string) => {
    setLiked((prev) => ({ ...prev, [text]: true }));
    setDetail(text);
    await persistDetail(text, { silent: true });
  };

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

            <View
              style={{
                marginTop: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 12,
                backgroundColor: "#f9fafb",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", marginBottom: 6 }}>
                Event detail
              </Text>
              {meetingDetails?.agenda ? (
                <Text style={{ color: "#1f2937", fontSize: 14 }}>
                  {meetingDetails.agenda}
                </Text>
              ) : (
                <>
                  <TextInput
                    value={detail}
                    onChangeText={setDetail}
                    placeholder="Describe what this event is about..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    style={{
                      minHeight: 90,
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      textAlignVertical: "top",
                      backgroundColor: "#fff",
                      color: "#111827",
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleSaveDetail}
                    disabled={savingDetail}
                    style={{
                      alignSelf: "flex-end",
                      marginTop: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: savingDetail ? "#93c5fd" : "#2b7cff",
                      opacity: savingDetail ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {savingDetail ? "Saving..." : "Save detail"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* WhenDee Recommended */}
          {!meetingDetails?.agenda && (
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
                <SuggestCard key={s} title={s} liked={!!liked[s]} onLike={() => handleSuggestion(s)} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
