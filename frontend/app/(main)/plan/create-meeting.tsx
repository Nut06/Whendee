import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

type Props = {
  onSave?: () => void;
  onCancel?: () => void;
};

export default function ScheduleMeeting({ onSave, onCancel }: Props) {
  const router = useRouter();

  // 🔹 Bottom Sheet states
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%", "70%"], []);
  const [modalType, setModalType] = useState<
    "date" | "duration" | "budget" | null
  >(null);

  // 🔹 Data states
  const [agenda, setAgenda] = useState("");
  const [dateText] = useState("12 Sep' 23");
  const [repeat] = useState("All Days");
  const [budget] = useState("5000 ฿");
  const [meetingLink] = useState(
    "http://sample.info/?insect=fireman&porter=a..."
  );

  const openSheet = (type: typeof modalType) => {
    setModalType(type);
    bottomSheetRef.current?.expand();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ==== Header ==== */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Schedule Meeting</Text>

          <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {/* ==== Meeting Agenda ==== */}
          <Text style={styles.sectionTitle}>MEETING AGENDA</Text>
          <View style={styles.card}>
            <TextInput
              style={[styles.textarea]}
              placeholder="Enter meeting agenda"
              placeholderTextColor="#999"
              multiline
              value={agenda}
              onChangeText={setAgenda}
            />
          </View>

          {/* ==== Timing ==== */}
          <Text style={styles.sectionTitle}>TIMING</Text>
          <TouchableOpacity style={styles.row} onPress={() => openSheet("date")}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Select Date</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{dateText}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>

          {/* ==== Other ==== */}
          <Text style={styles.sectionTitle}>OTHER</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => openSheet("duration")}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Repeat</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{repeat}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => openSheet("budget")}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Budget</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{budget}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>

          {/* ==== Invite ==== */}
          <Text style={styles.sectionTitle}>INVITE MEMBERS</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/(main)/friends/add-member")}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>➕  Add Members</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>

          {/* ==== Meeting Link ==== */}
          <Text style={styles.sectionTitle}>MEETING LINK</Text>
          <View style={[styles.card, styles.linkCard]}>
            <Text numberOfLines={1} style={styles.linkText}>
              {meetingLink}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => {}}>
              <Text style={styles.copyText}>📋</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ==== Bottom Sheet ==== */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={(props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          )}
        >
          <View style={{ padding: 20 }}>
            {modalType === "date" && (
              <>
                <Text style={styles2.sheetTitle}>Select Starts Date & Time</Text>
                <DateTimePicker mode="date" value={new Date()} />
                <View style={{ height: 12 }} />
                <DateTimePicker mode="time" value={new Date()} />
              </>
            )}

            {modalType === "duration" && (
              <>
                <Text style={styles2.sheetTitle}>Select Duration</Text>
                <DateTimePicker mode="time" value={new Date()} />
              </>
            )}

            {/* {modalType === "budget" && (
              <>
                <Text style={styles2.sheetTitle}>Input Budget</Text>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={0}
                  maximumValue={10000}
                  minimumTrackTintColor="#007BFF"
                  maximumTrackTintColor="#ddd"
                />
              </>
            )} */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={[styles2.sheetBtn, { backgroundColor: "#eee" }]}
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles2.sheetBtn, { backgroundColor: "#007BFF" }]}
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

// ==== Styles ====
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8fb",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e7eb",
    backgroundColor: "#fff",
  },
  headerButton: { padding: 8 },
  headerButtonText: { color: "#007aff", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  saveButton: {
    backgroundColor: "#4aa3ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveButtonText: { color: "#fff", fontWeight: "600" },

  body: { padding: 12, paddingBottom: 140 },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    color: "#7f8a93",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eef2f5",
  },
  textarea: { minHeight: 80, textAlignVertical: "top", color: "#222" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef2f5",
    marginBottom: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontSize: 15, color: "#222" },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rowValue: { color: "#666", marginRight: 8 },
  chev: { color: "#c0c6cc", fontSize: 18 },

  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkText: { flex: 1, marginRight: 8, color: "#333" },
  copyButton: { padding: 8 },
  copyText: { fontSize: 18 },
});

const styles2 = StyleSheet.create({
  sheetTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  sheetBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});
