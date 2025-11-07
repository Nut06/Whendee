import { useEffect, useMemo, useState } from "react";
import { Calendar, type DateObject } from "react-native-calendars";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import planStore, { type Plan } from "../lib/planStore";

const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("-");

function MeetingCard({ plan }: { plan: Plan }) {
  const dateLabel = planStore.getMeetingDetails(plan.meetingId)?.finalDate;
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="calendar-outline" size={18} color="#2b7cff" />
        <Text style={styles.cardTitle}>{plan.title}</Text>
      </View>
      {dateLabel && (
        <Text style={styles.cardSubtitle}>Date: {dateLabel}</Text>
      )}
      <Text style={styles.cardMeta}>
        Participants: {plan.participants} · Meeting ID: {plan.meetingId}
      </Text>
    </View>
  );
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(() => formatDate(new Date()));
  const [plans, setPlans] = useState<Plan[]>(planStore.getAll());

  useEffect(() => {
    const unsub = planStore.subscribe(() => setPlans([...planStore.getAll()]));
    return () => unsub();
  }, []);

  const markedDates = useMemo(() => {
    const marks: Record<string, object> = {
      [selected]: {
        selected: true,
        selectedColor: "#2b7cff",
        selectedTextColor: "#fff",
      },
    };
    plans.forEach((plan) => {
      const date = planStore.getMeetingDetails(plan.meetingId)?.finalDate;
      if (date) {
        marks[date] = {
          ...(marks[date] ?? {}),
          marked: true,
          dotColor: "#2b7cff",
        };
      }
    });
    return marks;
  }, [plans, selected]);

  const plansForDate = useMemo(() => {
    return plans.filter(
      (plan) => planStore.getMeetingDetails(plan.meetingId)?.finalDate === selected
    );
  }, [plans, selected]);

  const handleDayPress = (day: DateObject) => {
    setSelected(day.dateString);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f6f7fb",
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 16,
        }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          <Pressable
            style={styles.todayBadge}
            onPress={() => setSelected(formatDate(new Date()))}
          >
            <Ionicons name="time-outline" size={14} color="#2563eb" />
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
        </View>

        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: "#2b7cff",
            todayTextColor: "#2563eb",
            arrowColor: "#2b7cff",
            textDayFontFamily: Platform.select({
              ios: "Helvetica",
              android: "Roboto",
              default: "System",
            }),
          }}
          style={styles.calendar}
        />

        <Text style={styles.listTitle}>
          {plansForDate.length > 0
            ? `Plans for ${selected}`
            : "No plans for this date"}
        </Text>
        {plansForDate.map((plan) => (
          <MeetingCard key={plan.id} plan={plan} />
        ))}
        {plansForDate.length === 0 && (
          <Text style={styles.emptyText}>
            Select another day or create a new plan.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0edff",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  todayText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  calendar: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 18,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eef2f7",
    marginBottom: 10,
  },
  cardTitle: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
  },
});
