import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { eventApi } from "../lib/api";

type EventSummary = {
  id: string;
  title: string;
  description?: string;
  location?: string | null;
  startsAt?: string;
  endsAt?: string;
  organizerId?: string;
  poll?: {
    id: string;
    status: string;
    options: { id: string; label: string; tally: number }[];
  } | null;
};

function AvatarStack({ count = 5 }: { count?: number }) {
  const src = require("../../assets/images/react-logo.png");
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <Image
          key={i}
          source={src}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#fff",
            marginLeft: i === 0 ? 0 : -10,
          }}
        />
      ))}
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#cfe4ff",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 4,
        }}
      >
        <Ionicons name="add" size={12} color="#2b7cff" />
      </View>
    </View>
  );
}

function PillSelectDate({ text = "Select a date to see time slots" }: { text?: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eaf3ff",
        borderColor: "#cfe4ff",
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Ionicons name="calendar-outline" size={14} color="#2b7cff" />
      <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#2b7cff" }}>{text}</Text>
    </View>
  );
}

function DateBadge({ meetingId }: { meetingId: string }) {
  const finalDate = planStore.getMeetingDetails(meetingId)?.finalDate;
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const label = finalDate
    ? MONTHS[Math.max(0, Math.min(11, parseInt(finalDate.split("-")[1] || "1", 10) - 1))]
    : "No Date";
  const dayNum = finalDate ? (finalDate.split("-")[2] || "01").padStart(2, "0") : "00";

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
      <Text
        style={{ fontSize: 11, fontWeight: "700", color: "#2b7cff", textAlign: "center" }}
      >
        {"No\nDate"}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563eb" }}>00</Text>
    </View>
  );
}

function formatHMS(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function endOfDayLocal(ds: string) {
  // ds expects YYYY-MM-DD
  const [y, m, d] = ds.split("-").map((v) => parseInt(v, 10));
  const dt = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
  return dt;
}

function PlanCard({ event }: { event: EventSummary }) {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#eef1f5",
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <PillSelectDate />

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <DateBadge />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>{event.title}</Text>
            <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
          </View>
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Event ID: {event.id.slice(0, 8)}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <AvatarStack />
            <Text style={{ marginLeft: 8, fontSize: 12, color: "#2b7cff" }}>
              Organizer: {event.organizerId ?? "unknown"}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: "#eef1f5", marginVertical: 14 }} />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Ionicons name="location-outline" size={16} color="#7c3aed" />
              <Text style={{ marginLeft: 8, fontSize: 13, color: "#6b7280" }}>
                {event.location ? event.location : "Location pending"}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#2bbf6a" }}>
              {event.poll ? event.poll.status : "No poll"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
            <Link
              href={{ pathname: "/(main)/set-location", params: { eventId: event.id, title: event.title } }}
              asChild
            >
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#cfe4ff",
                  backgroundColor: "#eaf3ff",
                }}
              >
                <Ionicons name="add-circle-outline" size={16} color="#2b7cff" />
                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#2b7cff" }}>
                  Add Option
                </Text>
              </Pressable>
            </Link>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: "#2b7cff",
              }}
              onPress={() =>
                router.push({ pathname: "/(main)/vote-location", params: { eventId: event.id, title: event.title } })
              }
            >
              <Ionicons name="thumbs-up" size={16} color="#fff" />
              <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#fff" }}>Vote</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const USERNAME = process.env.EXPO_PUBLIC_DISPLAY_NAME ?? "Aliya Doherty";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "2-digit",
    weekday: "long",
  }).format(date);
}

export default function PlanScreen() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await eventApi.getEvents();
      setEvents(response.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await eventApi.getEvents();
      setEvents(response.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh events");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const todayText = useMemo(() => formatDate(new Date()), []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6f7fb", paddingHorizontal: 16, paddingTop: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}>{USERNAME}</Text>
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{todayText}</Text>
        </View>
        <View
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
          <Ionicons name="notifications-outline" size={18} color="#2b7cff" />
        </View>
      </View>

      {/* Search bar */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          marginBottom: 18,
        }}
      >
        <Ionicons name="search-outline" size={18} color="#8e8e93" />
        <Text style={{ marginLeft: 8, fontSize: 13, color: "#8e8e93" }}>Search meetings and other things</Text>
      </View>

      {/* Incoming Plans */}
      {incoming.length > 0 && (
        <>
          <Text className="text-[15px] font-semibold text-[#1f2937] mt-2 mb-2">
            Incoming Plans ({incoming.length})
          </Text>
          {incoming.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="small" color="#2b7cff" />
        </View>
      ) : error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-3">
          <Text className="text-red-600 text-[13px]">{error}</Text>
          <Pressable className="mt-2" onPress={() => void loadEvents()}>
            <Text className="text-[13px] text-[#2b7cff] font-semibold">Tap to retry</Text>
          </Pressable>
        </View>
      ) : events.length === 0 ? (
        <View className="bg-white border border-dashed border-[#cfe4ff] rounded-2xl px-4 py-6 items-center">
          <Text className="text-[14px] text-[#6b7280] text-center">
            No events yet. Create a plan from the Create tab to get started.
          </Text>
        </View>
      ) : (
        events.map((event) => <PlanCard key={event.id} event={event} />)
      )}

      <View className="h-6" />
    </ScrollView>
  );
}
