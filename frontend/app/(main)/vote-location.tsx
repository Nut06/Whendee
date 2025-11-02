import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import planStore, { type Candidate } from "../lib/planStore";


export default function VoteLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();
  const mid = (meetingId ?? "").trim();

  const candidates = useMemo<Candidate[]>(
    () => planStore.getCandidates(mid),
    [mid]
  );
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // ถ้าไม่มีตัวเลือกเลย ให้ย้อนกลับไป set-location
  useEffect(() => {
    if (mid && candidates.length === 0) {
      (router as any).replace({ pathname: "/(main)/set-location", params: { meetingId: mid } });
    }
  }, [mid, candidates.length, router]);

  const vote = () => {
    if (!selectedName) return;
    (router as any).push({
      pathname: "/(main)/vote-success",
      params: { meetingId: mid, name: selectedName },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 12,
        paddingBottom: insets.bottom + 100,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eef1f5",
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#111827",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          Location
        </Text>

        {candidates.map((c: Candidate, idx: number) => {
          const isActive = selectedName === c.name;
          return (
            <View key={c.id}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedName(c.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    marginRight: 12,
                    backgroundColor: isActive ? "#8b5cf6" : "#d1c4ff",
                    borderWidth: isActive ? 2 : 0,
                    borderColor: "#7c3aed",
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "#111827",
                    fontWeight: isActive ? "700" : "400",
                  }}
                >
                  {c.name}
                </Text>
                <Ionicons name="thumbs-up" size={18} color={isActive ? "#2b7cff" : "#9ca3af"} />
              </TouchableOpacity>

              {idx < candidates.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#f1f3f6" }} />
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        disabled={!selectedName}
        activeOpacity={0.9}
        onPress={vote}
        style={{
          marginTop: 14,
          alignSelf: "center",
          opacity: selectedName ? 1 : 0.5,
          backgroundColor: "#2b7cff",
          height: 44,
          paddingHorizontal: 26,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#2b7cff",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Vote</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
