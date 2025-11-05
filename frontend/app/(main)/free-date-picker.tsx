import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";

// helper แปลง Date -> YYYY-MM-DD
const toKey = (d: Date) => d.toISOString().slice(0, 10);

export default function FreeDatePickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();

  // เก็บวันว่างที่เลือก (หลายวัน)
  const [selected, setSelected] = useState<Record<string, true>>({});

  // calendar ใช้ markedDates เพื่อไฮไลต์วันที่เลือก
  const marked = useMemo(() => {
    const obj: Record<string, any> = {};
    Object.keys(selected).forEach((k) => {
      obj[k] = {
        selected: true,
        selectedColor: "#2b7cff",
        selectedTextColor: "#fff",
      };
    });
    return obj;
  }, [selected]);

  const toggleDay = (day: DateData) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[day.dateString]) delete next[day.dateString];
      else next[day.dateString] = true;
      return next;
    });
  };

  const onSave = () => {
    const picked = Object.keys(selected).sort();
    // TODO: ถ้าต้องการบันทึกจริงลง store ให้เพิ่มเมธอด เช่น
    // planStore.setMyFreeDates((meetingId ?? '').trim(), picked)
    // ตอนนี้แค่กลับหน้าก่อน
    router.back();
  };

  const canSave = Object.keys(selected).length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}>
      {/* Bottom Sheet */}
      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: insets.bottom + 8,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#E7EAF0",
          }}
        >
          <Text style={{ flex: 1, fontWeight: "700", color: "#111827" }}>
            Select Starts Date & Time
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Subtitle line */}
        <View
          style={{
            paddingVertical: 8,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: "#2b7cff",
          }}
        >
          <Text style={{ color: "#6b7280" }}>Date Picker</Text>
        </View>

        {/* Calendar */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
          bounces={false}
        >
          <Calendar
            hideExtraDays={false}
            enableSwipeMonths
            onDayPress={toggleDay}
            markedDates={marked}
            theme={{
              todayTextColor: "#2b7cff",
              arrowColor: "#2b7cff",
              textDayFontSize: 14,
              textMonthFontWeight: "700",
            }}
            // ค่าเริ่มต้น = วันนี้
            initialDate={toKey(new Date())}
          />
        </ScrollView>

        {/* Footer Buttons */}
        <View
          style={{
            flexDirection: "row",
            padding: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: "#EEF1F5",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#374151", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSave}
            disabled={!canSave}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              backgroundColor: canSave ? "#2b7cff" : "#9DBCF9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
