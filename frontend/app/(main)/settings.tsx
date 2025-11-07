import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type IoniconName = keyof typeof Ionicons.glyphMap;

const sections: Array<{
  title: string;
  items: { icon: IoniconName; label: string }[];
}> = [
  {
    title: "General",
    items: [
      { icon: "person-outline", label: "Account" },
      { icon: "shield-checkmark-outline", label: "Privacy & Security" },
      { icon: "language-outline", label: "Language" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help Center" },
      { icon: "chatbubbles-outline", label: "Contact Support" },
      { icon: "document-text-outline", label: "Terms & Policies" },
    ],
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=5",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Aliya Doherty</Text>
            <Text style={styles.profileEmail}>aliya.doherty@example.com</Text>
          </View>
          <Ionicons name="pencil-outline" size={18} color="#64748b" />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: "#c7dfff" }}
            thumbColor={notificationsEnabled ? "#2563eb" : "#f4f4f5"}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ true: "#c7dfff" }}
            thumbColor={darkMode ? "#2563eb" : "#f4f4f5"}
          />
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity key={item.label} style={styles.sectionItem}>
                <View style={styles.sectionIcon}>
                  <Ionicons name={item.icon} size={18} color="#2563eb" />
                </View>
                <Text style={styles.sectionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5f5" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  toggleRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e1edff",
    marginRight: 12,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
});
