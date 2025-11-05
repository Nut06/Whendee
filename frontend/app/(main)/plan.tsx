import { useEffect, useMemo, useRef, useState } from "react";
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
      <View
        className="w-6 h-6 rounded-full items-center justify-center ml-1"
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#2b7cff",
          borderStyle: "dashed",
        }}
      >
        <Ionicons name="add" size={12} color="#2b7cff" />
      </View>
    </View>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateDMY(ds: string) {
  // ds: YYYY-MM-DD
  const [y, m, d] = ds.split("-");
  const mm = parseInt(m || "1", 10);
  const dd = d || "01";
  return `${dd} ${MONTHS[Math.max(0, Math.min(11, mm - 1))]} ${y}`;
}

function PillSelectDate({ meetingId }: { meetingId: string }) {
  const finalDate = planStore.getMeetingDetails(meetingId)?.finalDate;
  const label = finalDate ? formatDateDMY(finalDate) : "Select a date to see time slots";
  return (
    <View className="self-start mb-3">
      <View className="flex-row items-center bg-[#eaf3ff] border border-[#cfe4ff] px-3 py-2 rounded-full">
        <Ionicons name="calendar-outline" size={14} color="#2b7cff" />
        <Text className="ml-2 text-[12px] font-semibold text-[#2b7cff]">
          {label}
        </Text>
      </View>
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
      className="items-center justify-center"
      style={{
        width: 60,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbeafe", // light blue border
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <Text className="text-[11px] font-semibold" style={{ color: "#2563eb" }}>
        {label}
      </Text>
      <Text className="text-[20px] font-extrabold" style={{ color: "#2563eb" }}>
        {dayNum}
      </Text>
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

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const details = planStore.getMeetingDetails(plan.meetingId);
  const finalDate = details?.finalDate;

  // live countdown for cards with finalDate
  const [now, setNow] = useState(() => Date.now());
  const hasCountdown = Boolean(finalDate);
  useEffect(() => {
    if (!hasCountdown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasCountdown]);

  const remainingText = useMemo(() => {
    if (!finalDate) return null;
    const end = endOfDayLocal(finalDate);
    const diff = end.getTime() - now;
    return formatHMS(diff);
  }, [finalDate, now]);
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
  <PillSelectDate meetingId={plan.meetingId} />
        <View className="flex-row">
          <DateBadge meetingId={plan.meetingId} />
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-[15px] font-semibold text-[#111827]">
                {plan.title}
              </Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(main)/schedule-meeting",
                    params: { meetingId: plan.meetingId },
                  })
                }
                hitSlop={10}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
              </Pressable>
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

            <View className="flex-row items-stretch justify-between mt-3 mb-1">
              {/* Left: location block with subtitle */}
              <View className="flex-1 flex-row items-start pr-3">
                <Ionicons name="location-outline" size={16} color="#7c3aed" />
                <View className="ml-2 flex-1">
                  <Text className="text-[13px] font-semibold text-[#111827]">
                    {plan.locationName ?? "Undefined"}
                  </Text>
                  <Text className="text-[12px] text-[#6b7280]">
                    {plan.locationName
                      ? ""
                      : "This Plan didn’t have selected"}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="w-[1px] bg-[#eef1f5] mx-2" />

              {/* Right: Remaining Time or CTA */}
              <View className="flex-1 items-end pl-3">
                {finalDate ? (
                  <>
                    <Text className="text-[12px] text-[#6b7280]">Remaining Time</Text>
                    <Text className="text-[12px] font-semibold text-[#22c55e]">{remainingText}</Text>
                  </>
                ) : (
                  <Pressable onPress={goSelectDate} hitSlop={10}>
                    <Text className="text-[12px] text-[#6b7280] mb-[2px]">Select a plan first</Text>
                    <Text className="text-[12px] font-semibold text-[#22c55e]">No plan selected</Text>
                  </Pressable>
                )}
              </View>
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
  const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const headerDate = useMemo(() => {
    const d = new Date();
    const day = d.getDate().toString().padStart(2, "0");
    const month = MONTHS_LONG[d.getMonth()];
    const yr = d.getFullYear().toString().slice(-2);
    const dow = WEEKDAYS[d.getDay()];
    return `${day} ${month}’ ${yr} • ${dow}`;
  }, []);

  useEffect(() => {
    const unsub = planStore.subscribe(() => setPlans([...planStore.getAll()]));
    return () => {
      unsub();
    };
  }, []);

  // Incoming: มี finalDate และวันที่ยังไม่ผ่าน
  const incoming = useMemo(() => {
    return plans.filter((p) => {
      const fd = planStore.getMeetingDetails(p.meetingId)?.finalDate;
      if (!fd) return false;
      return endOfDayLocal(fd).getTime() > Date.now();
    });
  }, [plans]);
  const incomingIds = useMemo(() => new Set(incoming.map((p) => p.id)), [incoming]);
  const noSelected = plans.filter((p) => p.status === "noDate" && !incomingIds.has(p.id));
  const noDateSelected = plans.filter((p) => p.status === "noDateSelected" && !incomingIds.has(p.id));

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
          <Text className="text-[12px] text-[#6b7280]">{headerDate}</Text>
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
