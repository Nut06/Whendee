import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import planStore, { type Plan } from "../lib/planStore";

function AvatarStack({ count = 5 }: { count?: number }) {
  const src = require("../../assets/images/react-logo.png");
  return (
    <View className="flex-row items-center">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <Image
          key={i}
          source={src}
          className="w-6 h-6 rounded-full border-2 border-white"
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        />
      ))}
      <View className="w-6 h-6 rounded-full bg-white border border-[#cfe4ff] items-center justify-center ml-1">
        <Ionicons name="add" size={12} color="#2b7cff" />
      </View>
    </View>
  );
}

function PillSelectDate() {
  return (
    <View className="self-start mb-3">
      <View className="flex-row items-center bg-[#eaf3ff] border border-[#cfe4ff] px-3 py-2 rounded-full">
        <Ionicons name="calendar-outline" size={14} color="#2b7cff" />
        <Text className="ml-2 text-[12px] font-semibold text-[#2b7cff]">
          Select a date to see time slots
        </Text>
      </View>
    </View>
  );
}

function DateBadge() {
  return (
    <View className="w-14 rounded-xl border border-[#cfe4ff] bg-[#f3f8ff] p-2 items-center">
      <Text className="text-[11px] font-semibold text-[#2b7cff]">No Date</Text>
      <Text className="text-[18px] font-bold text-[#2563eb]">00</Text>
    </View>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const goSelectDate = () =>
    router.push({
      pathname: "/(main)/select-date",
      params: { meetingId: plan.meetingId },
    });

  return (
    <Link
      href={{
        pathname: "/(main)/plan-detail/[meetingId]",
        params: { meetingId: plan.meetingId },
      }}
      asChild
    >
      <Pressable className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 pt-3 pb-2 mb-3">
        <PillSelectDate />
        <View className="flex-row">
          <DateBadge />
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-[15px] font-semibold text-[#111827]">
                {plan.title}
              </Text>
            </View>

            <Text className="text-[12px] text-[#6b7280] mt-1">
              Meeting ID: {plan.meetingId}
            </Text>

            <View className="flex-row items-center mt-2">
              <AvatarStack count={plan.participants} />
              <Text className="text-[12px] text-[#2b7cff] ml-2">
                {plan.participants} participants
              </Text>
            </View>

            <View className="h-[1px] bg-[#f0f2f5] mt-3" />

            <View className="flex-row items-center justify-between mt-3 mb-1">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#7c3aed" />
                <Text className="ml-2 text-[12px] text-[#6b7280]">
                  {plan.locationName ?? "Undefined"}
                </Text>
              </View>

              {/* แตะข้อความขวาเพื่อไปเลือกวัน */}
              <Pressable onPress={goSelectDate} hitSlop={10}>
                <Text className="text-[12px] font-medium text-[#2bbf6a]">
                  {plan.status === "noDate"
                    ? "Select a plan first"
                    : "Select a date (no date selected)"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<Plan[]>(planStore.getAll());

  useEffect(() => {
    const unsub = planStore.subscribe(() => setPlans([...planStore.getAll()]));
    return () => {
      unsub();
    };
  }, []);

  const noSelected = plans.filter((p) => p.status === "noDate");
  const noDateSelected = plans.filter((p) => p.status === "noDateSelected");

  return (
    <ScrollView
      className="flex-1 bg-[#f6f7fb]"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-[17px] font-semibold text-[#111827]">
            Aliya Doherty
          </Text>
          <Text className="text-[12px] text-[#6b7280]">
            09 September’ 23 • Monday
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={20} color="#007aff" />
      </View>

      {/* Search bar */}
      <View className="bg-white border border-gray-100 rounded-full px-4 py-2 flex-row items-center shadow-sm mb-4">
        <Ionicons name="search-outline" size={18} color="#8e8e93" />
        <Text className="ml-2 text-[13px] text-[#8e8e93]">
          Search meetings and other things
        </Text>
      </View>

      {/* Section 1 */}
      <Text className="text-[15px] font-semibold text-[#1f2937] mt-2 mb-2">
        No selected plans ({noSelected.length})
      </Text>
      {noSelected.map((p) => (
        <PlanCard key={p.id} plan={p} />
      ))}

      {/* Section 2 */}
      <Text className="text-[15px] font-semibold text-[#1f2937] mt-6 mb-2">
        No date selected plans ({noDateSelected.length})
      </Text>
      {noDateSelected.map((p) => (
        <PlanCard key={p.id} plan={p} />
      ))}

      <View className="h-6" />
    </ScrollView>
  );
}
