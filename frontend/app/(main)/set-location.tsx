// app/(main)/set-location.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eventApi } from "@/lib/api";

// ------ UI helpers (เล็ก ๆ ให้เหมือนดีไซน์) ------
function PillInfo({ text }: { text: string }) {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillDot} />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

function DateBadge() {
  return (
    <View style={styles.dateBadge}>
      <Text style={styles.dateBadgeTop}>No Date</Text>
      <Text style={styles.dateBadgeNum}>00</Text>
    </View>
  );
}

function MeetingCard({ meetingId, title }: { meetingId: string; title: string }) {
  return (
    <View style={styles.card}>
      <PillInfo text="No location selected yet" />

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <DateBadge />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.meetingTitle}>{title || "Event"}</Text>
            <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
          </View>
          <Text style={styles.meetingSub}>
            Meeting ID: <Text style={{ color: "#2b7cff", textDecorationLine: "underline" }}>{meetingId}</Text>
          </Text>

          <View style={{ height: 1, backgroundColor: "#eef2f7", marginTop: 10 }} />
        </View>
      </View>
    </View>
  );
}

// ----------------- หน้าตั้งค่าตำแหน่ง -----------------
export default function SetLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId = "", title } = useLocalSearchParams<{ eventId?: string; title?: string }>();
  const [eventTitle, setEventTitle] = useState<string>(title ?? "");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // NYC – Barclays Center เป็นค่าเริ่มต้นเพื่อให้เห็นแมพ
  const initialRegion: Region = useMemo(
    () => ({
      latitude: 40.68265,
      longitude: -73.97540,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    []
  );

  const [region, setRegion] = useState<Region>(initialRegion);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        const response = await eventApi.getEvent(eventId);
        if (!isMounted) return;
        setEventTitle(response.data?.title ?? "");
      } catch (error) {
        console.error(error);
        if (isMounted) {
          Alert.alert("Error", "Unable to load event details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // กดที่แมพเพื่อปักหมุด
  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPin({ lat: latitude, lng: longitude });
  };

  const handleSave = async () => {
    if (!pin || !eventId) return;

    const displayName =
      query?.trim().length > 0
        ? query.trim()
        : `Pinned @ ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`;

    try {
      setSaving(true);
      await eventApi.addPollOption(eventId, { label: displayName });
      router.push({ pathname: "/(main)/vote-location", params: { eventId } });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to save location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7fb", paddingTop: insets.top + 8 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerName}>Aliya Doherty</Text>
            <Text style={styles.headerSub}>09 September’ 23 • Monday</Text>
          </View>
          <Ionicons name="notifications-outline" size={20} color="#2b7cff" />
        </View>

        {/* Meeting card */}
        <MeetingCard meetingId={String(eventId)} title={eventTitle} />

        {loading && (
          <View style={{ marginVertical: 24, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#2b7cff" />
          </View>
        )}

        {/* Search box */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#8e8e93" />
          <TextInput
            placeholder="Search your trip location"
            placeholderTextColor="#8e8e93"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* Map with dashed purple border */}
        <View style={styles.mapOuter}>
          <View style={styles.mapDashed}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={initialRegion}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
            >
              {pin && (
                <Marker
                  coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                  title="Pinned location"
                  description="Tap Save to use this place"
                  pinColor="#e11d48"
                />
              )}
            </MapView>
          </View>
        </View>

        {/* Save button (แสดงเฉพาะเมื่อมีหมุด) */}
        {pin && (
          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.9}
            onPress={() => void handleSave()}
            disabled={saving}
          >
            <Text style={styles.saveTxt}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  pillWrap: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderColor: "#cfe4ff",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2b7cff",
    marginRight: 6,
  },
  pillText: { color: "#2b7cff", fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderColor: "#eef2f7",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  meetingTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  meetingSub: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  dateBadge: {
    width: 56,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#cfe4ff",
    backgroundColor: "#f3f8ff",
    alignItems: "center",
  },
  dateBadgeTop: { fontSize: 11, fontWeight: "600", color: "#2b7cff" },
  dateBadgeNum: { fontSize: 18, fontWeight: "800", color: "#2563eb" },

  searchWrap: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eef2f7",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { marginLeft: 8, fontSize: 14, color: "#111827", flex: 1 },

  mapOuter: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  mapDashed: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#D7B4FF",
    borderStyle: "dashed",
  },

  saveBtn: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: "#2b7cff",
    paddingHorizontal: 28,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2b7cff",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
