import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import planStore from "../lib/planStore";
import {
  createEvent,
  updateEvent,
  ensureEventMember,
} from "@/lib/eventApi";

const ALERT_PRESET_MINUTES: Record<string, number | undefined> = {
  None: undefined,
  "At time of event": 0,
  "5 mins before": 5,
  "10 mins before": 10,
  "15 min before": 15,
  "30 mins before": 30,
  "1 hours before": 60,
  "2 hours before": 120,
  "1 day before": 60 * 24,
  "2 day before": 60 * 24 * 2,
  "1 week before": 60 * 24 * 7,
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDateDMY = (ds?: string) => {
  if (!ds) return undefined;
  const [y, m, d] = ds.split("-");
  const mm = parseInt(m || "1", 10);
  const dd = d || "01";
  return `${dd} ${MONTHS[Math.max(0, Math.min(11, mm - 1))]} ${y}`;
};

export default function ScheduleMeetingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meetingId } = useLocalSearchParams<{ meetingId?: string }>();
  const midParam = useMemo(
    () => (Array.isArray(meetingId) ? meetingId[0] : meetingId) ?? "",
    [meetingId],
  );
  const [ensuredMeetingId, setEnsuredMeetingId] = useState<string>("");

  useEffect(() => {
    if (midParam) {
      setEnsuredMeetingId(midParam);
      return;
    }
    setEnsuredMeetingId((prev) => {
      if (prev) return prev;
      return planStore.createPlan({ title: "New plan" });
    });
  }, [midParam]);

  const existing = ensuredMeetingId
    ? planStore.getMeetingDetails(ensuredMeetingId)
    : undefined;
  const planTitle = ensuredMeetingId
    ? planStore.getByMeetingId(ensuredMeetingId)?.title
    : undefined;

  const [agenda, setAgenda] = useState<string>(existing?.agenda ?? planTitle ?? "");
  const [repeat] = useState<string>(existing?.repeat ?? "All Days");
  const [budget, setBudget] = useState<number | undefined>(existing?.budget ?? 5000);
  const [alert] = useState<string>(existing?.alert ?? "15 min before");
  const [link, setLink] = useState<string>(existing?.link ?? "http://sample.info/?insect=fireman&porter=anything");
  const [isSaving, setIsSaving] = useState(false);

  // react to external store updates (e.g., plan date changed elsewhere)
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    const unsub = planStore.subscribe(() => forceRefresh((t) => t + 1));
    return unsub;
  }, []);

  // final date label
  const meetingDetails = ensuredMeetingId
    ? planStore.getMeetingDetails(ensuredMeetingId)
    : undefined;
  const finalDateLabel = formatDateDMY(meetingDetails?.finalDate) ?? "Select Date First";
  const scheduledAtIso = (() => {
    const fd = meetingDetails?.finalDate;
    if (!fd) return undefined;
    const parsed = new Date(fd);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  })();

  const alertMinutes = useMemo(() => {
    if (Object.prototype.hasOwnProperty.call(ALERT_PRESET_MINUTES, alert)) {
      return ALERT_PRESET_MINUTES[alert];
    }
    return undefined;
  }, [alert]);

  useEffect(() => {
    // if plan title loads later (unlikely), keep agenda empty string default if already edited
    if (!existing && !agenda && planTitle) setAgenda(planTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planTitle]);

  const onSave = async () => {
    if (isSaving || !ensuredMeetingId) return;

    const title = agenda?.trim() || planTitle || "Untitled plan";
    const description = agenda?.trim() || planTitle || "No description provided";

    try {
      setIsSaving(true);
      const payload = {
        title,
        eventDescription: description,
        repeat,
        budget,
        alertMinutes,
        scheduledAt: scheduledAtIso,
        meetingLink: link,
      };

      const backendEventId = planStore.getBackendEventId(ensuredMeetingId);
      const response = backendEventId
        ? await updateEvent(backendEventId, payload)
        : await createEvent(payload);

      planStore.setMeetingDetails(ensuredMeetingId, {
        agenda,
        repeat,
        budget,
        alert,
        link,
        members: existing?.members ?? [],
        finalDate: meetingDetails?.finalDate,
      });
      planStore.setPlanTitle(ensuredMeetingId, title);
      const resolvedEventId = response.data?.eventId ?? backendEventId;
      if (resolvedEventId) {
        planStore.setBackendEventId(ensuredMeetingId, resolvedEventId);
        const memberRes = await ensureEventMember(
          resolvedEventId,
          planStore.getCurrentUserId(),
        );
        if (memberRes.data) {
          planStore.upsertMember(ensuredMeetingId, memberRes.data);
        }
      }
      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to schedule meeting",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F7FB", paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: "#F6F7FB",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#6b7280" }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "700", color: "#111827" }}>Schedule Meeting</Text>
        <TouchableOpacity
          disabled={isSaving}
          onPress={onSave}
          style={{
            backgroundColor: "#2b7cff",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{isSaving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 20 }}>
        {/* Plan Title */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eef1f5", padding: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>PLAN TITLE</Text>
          <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10 }}>
            <TextInput
              value={agenda}
              onChangeText={setAgenda}
              multiline
              placeholder="Describe your meeting..."
              style={{ padding: 10, minHeight: 64 }}
            />
          </View>
        </View>

        {/* Timing */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eef1f5", overflow: "hidden", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 }}>TIMING</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(main)/select-date",
                params: { meetingId: ensuredMeetingId },
              })
            }
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              <Text style={{ marginLeft: 10, color: "#111827" }}>Select Date</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6b7280" }}>{finalDateLabel}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Other */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eef1f5", overflow: "hidden", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 }}>OTHER</Text>
          {/* Repeat */}
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="repeat-outline" size={18} color="#6b7280" />
              <Text style={{ marginLeft: 10, color: "#111827" }}>Repeat</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6b7280" }}>{repeat}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </TouchableOpacity>
          {/* Budget */}
          <View
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f2f5" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cash-outline" size={18} color="#6b7280" />
              <Text style={{ marginLeft: 10, color: "#111827" }}>Budget</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={budget != null ? String(budget) : ""}
                onChangeText={(t) => {
                  const digits = t.replace(/[^0-9.]/g, "");
                  const num = digits ? Number(digits) : undefined;
                  setBudget(Number.isFinite(num!) ? (num as number) : undefined);
                }}
                keyboardType="numeric"
                placeholder="0"
                style={{ minWidth: 60, textAlign: "right", color: "#6b7280" }}
              />
              <Text style={{ color: "#6b7280", marginLeft: 6 }}>฿</Text>
            </View>
          </View>
          {/* Alert */}
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f2f5" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="notifications-outline" size={18} color="#6b7280" />
              <Text style={{ marginLeft: 10, color: "#111827" }}>Alert</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6b7280" }}>{alert}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Invites Members */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eef1f5", overflow: "hidden", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 }}>INVITES MEMBERS</Text>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-add-outline" size={18} color="#6b7280" />
              <Text style={{ marginLeft: 10, color: "#111827" }}>Add Members</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Meeting Link */}
        <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eef1f5", padding: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>MEETING LINK</Text>
          <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
            <TextInput
              value={link}
              onChangeText={setLink}
              style={{ flex: 1, color: "#111827" }}
              placeholder="Paste meeting link"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Ionicons name="copy-outline" size={18} color="#6b7280" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
