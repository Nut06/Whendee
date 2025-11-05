import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";
import planStore from "../lib/planStore";

// helper แปลง Date -> YYYY-MM-DD
const toKey = (d: Date) => d.toISOString().slice(0, 10);

export default function FreeDatePickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meetingId, mode } = useLocalSearchParams<{ meetingId?: string; mode?: string }>();
  const isFinalMode = (Array.isArray(mode) ? mode[0] : mode) === "final";

  // เก็บวันว่างที่เลือก (หลายวัน หรือ 1 วันเมื่อ final mode)
  const [selected, setSelected] = useState<Record<string, true>>({});
  const [visibleYm, setVisibleYm] = useState<{ y: number; m: number }>(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1 };
  });

  // ติดตามการเปลี่ยนแปลงของ store เพื่อ refresh marks
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = planStore.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  // calendar ใช้ markedDates เพื่อไฮไลต์วันที่เลือก
  // คำนวณ dot สีเขียว/แดง ตามความพร้อมของผู้เข้าร่วมในเดือนที่เห็นอยู่
  const availabilityMarks = useMemo(() => {
    const mid = ((meetingId ?? "") as string).trim();
    if (!mid) return {} as Record<string, any>;

    // เลือกกลุ่มผู้ใช้: ถ้ามี meetingDetails.members ใช้ชุดนั้น, ไม่งั้นใช้ผู้ใช้ทั้งหมดที่เคยบันทึกวันว่าง
    const details = planStore.getMeetingDetails(mid);
    let userIds = details?.members && details.members.length > 0
      ? details.members
      : planStore.getAllUsersWithFreeDates(mid);

    if (!userIds || userIds.length === 0) return {} as Record<string, any>;

    const y = visibleYm.y;
    const m = visibleYm.m; // 1..12
    const daysInMonth = new Date(y, m, 0).getDate();

    const marks: Record<string, any> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let freeCount = 0;
      for (const uid of userIds) {
        const list = planStore.getUserFreeDates(mid, uid);
        if (list.includes(ds)) freeCount++;
      }
      if (freeCount === userIds.length && userIds.length > 0) {
        // ทุกคนว่าง → จุดสีเขียว
        marks[ds] = { dots: [{ key: "all", color: "#16a34a" }], marked: true };
      } else if (userIds.length > 0 && freeCount === 0) {
        // ไม่มีใครว่าง → จุดสีแดง
        marks[ds] = { dots: [{ key: "none", color: "#ef4444" }], marked: true };
      }
    }
    return marks;
  }, [meetingId, visibleYm, tick]);

  // set วันที่สีเขียวสำหรับ final mode
  const greenSet = useMemo(() => {
    const s = new Set<string>();
    Object.entries(availabilityMarks).forEach(([ds, mk]: any) => {
      const hasGreen = (mk?.dots ?? []).some((d: any) => d.key === "all" || d.color === "#16a34a");
      if (hasGreen) s.add(ds);
    });
    return s;
  }, [availabilityMarks]);

  // รวม selection เข้าไปใน markedDates
  const marked = useMemo(() => {
    const out: Record<string, any> = { ...availabilityMarks };
    Object.keys(selected).forEach((k) => {
      out[k] = {
        ...(out[k] ?? {}),
        selected: true,
        selectedColor: "#2b7cff",
        selectedTextColor: "#fff",
      };
    });
    return out;
  }, [availabilityMarks, selected]);

  const toggleDay = (day: DateData) => {
    if (isFinalMode) {
      // เลือกได้เฉพาะวันสีเขียว และเลือกได้วันเดียว
      if (!greenSet.has(day.dateString)) return;
      setSelected({ [day.dateString]: true });
      return;
    }
    setSelected((prev) => {
      const next = { ...prev };
      if (next[day.dateString]) delete next[day.dateString];
      else next[day.dateString] = true;
      return next;
    });
  };

  // prefill เลือกเดิมถ้าเป็น final mode และมีค่าเก็บอยู่
  React.useEffect(() => {
    if (!isFinalMode) return;
    const mid = (meetingId ?? "").trim();
    if (!mid) return;
    const existing = planStore.getMeetingDetails(mid)?.finalDate;
    if (existing) setSelected({ [existing]: true });
  }, [isFinalMode, meetingId]);

  const onSave = () => {
    const picked = Object.keys(selected).sort();
    const mid = (meetingId ?? "").trim();
    if (!mid) return router.back();

    if (isFinalMode) {
      const finalDate = picked[0];
      if (finalDate) {
        planStore.setMeetingDetails(mid, { finalDate });
      }
    } else {
      const uid = planStore.getCurrentUserId();
      planStore.setUserFreeDates(mid, uid, picked);
    }
    router.back();
  };

  const canSave = isFinalMode ? Object.keys(selected).length === 1 : Object.keys(selected).length > 0;

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
            {isFinalMode ? "Select Plan Date" : "Select Starts Date & Time"}
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
          <Text style={{ color: "#6b7280" }}>
            {isFinalMode ? "Choose a date when everyone is free" : "Date Picker"}
          </Text>
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
            markingType="multi-dot"
            theme={{
              todayTextColor: "#2b7cff",
              arrowColor: "#2b7cff",
              textDayFontSize: 14,
              textMonthFontWeight: "700",
            }}
            // ค่าเริ่มต้น = วันนี้
            initialDate={toKey(new Date())}
            onMonthChange={(m) => setVisibleYm({ y: m.year, m: m.month })}
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
