import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eventApi } from "../lib/api";

type PollOption = {
  id: string;
  label: string;
  tally: number;
};

export default function VoteLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId, title } = useLocalSearchParams<{ eventId?: string; title?: string }>();
  const eid = (eventId ?? "").trim();

  const [options, setOptions] = useState<PollOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadPoll = useCallback(async () => {
    if (!eid) return;
    try {
      setLoading(true);
      const response = await eventApi.getPoll(eid);
      const pollData = response.data;
      const pollOptions: PollOption[] = pollData?.options ?? [];
      setOptions(pollOptions);
      if (pollOptions.length === 0) {
        router.replace({ pathname: "/(main)/set-location", params: { eventId: eid } });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to load poll options");
    } finally {
      setLoading(false);
    }
  }, [eid, router]);

  useFocusEffect(
    useCallback(() => {
      if (eid) {
        void loadPoll();
      }
    }, [eid, loadPoll]),
  );

  const vote = async () => {
    if (!selectedOptionId || !eid) return;
    try {
      setSubmitting(true);
      await eventApi.submitVote(eid, {
        optionId: selectedOptionId,
        voterId: "user_demo",
      });
      const optionName = options.find((option) => option.id === selectedOptionId)?.label ?? "";
      router.push({
        pathname: "/(main)/vote-success",
        params: { eventId: eid, name: optionName, title: title ?? "" },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to submit vote");
    } finally {
      setSubmitting(false);
    }
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

        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator size="small" color="#2b7cff" />
          </View>
        ) : options.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              No options yet. Add a location first.
            </Text>
          </View>
        ) : (
          options.map((c: PollOption, idx: number) => {
            const isActive = selectedOptionId === c.id;
          return (
            <View key={c.id}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedOptionId(c.id)}
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
                  {c.label}
                </Text>
                <Ionicons name="thumbs-up" size={18} color={isActive ? "#2b7cff" : "#9ca3af"} />
              </TouchableOpacity>

              {idx < options.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#f1f3f6" }} />
              )}
            </View>
        );
        })
        )}
      </View>

      <TouchableOpacity
        disabled={!selectedOptionId || submitting}
        activeOpacity={0.9}
        onPress={() => void vote()}
        style={{
          marginTop: 14,
          alignSelf: "center",
          opacity: !selectedOptionId || submitting ? 0.5 : 1,
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
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {submitting ? "Voting..." : "Vote"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
