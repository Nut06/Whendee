import { Tabs, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_H = 64;
const FAB = 56;
const LIFT = 24;

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        // ให้พื้นหลังเพจเป็นสีเดียวกันทุกหน้า
        sceneStyle: { backgroundColor: "#F6F7FB" },
        // ยกแท็บบาร์พ้นโฮมอินดิเคเตอร์เสมอ
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: Math.max(12, insets.bottom + 6),
          height: TAB_H,
          borderRadius: 18,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 8 : 10,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <View
              style={{
                position: "absolute",
                left: "32%",
                right: "32%",
                bottom: 8,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#E7E8EB",
                opacity: 0.9,
              }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="plan"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ปุ่ม + กลาง */}
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: () => (
            <Link href="/(main)/create" asChild>
              <TouchableOpacity
                activeOpacity={0.92}
                style={{
                  width: FAB,
                  height: FAB,
                  borderRadius: FAB / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -LIFT,
                }}
              >
                <View
                  style={{
                    width: FAB,
                    height: FAB,
                    borderRadius: FAB / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2b7cff",
                    shadowColor: "#2b7cff",
                    shadowOpacity: 0.22,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 10,
                  }}
                >
                  <Ionicons name="add" color="#fff" size={26} />
                </View>
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* routes อื่นที่ไม่ต้องโชว์เป็นแท็บ */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="plan-detail/[meetingId]" options={{ href: null }} />
      <Tabs.Screen name="set-location" options={{ href: null }} />
      <Tabs.Screen name="vote-location" options={{ href: null }} />
      <Tabs.Screen name="vote-location-map" options={{ href: null }} />
      <Tabs.Screen name="vote-success" options={{ href: null }} />
      <Tabs.Screen name="location-status" options={{ href: null }} />
      <Tabs.Screen name="free-date-picker" options={{ href: null }} />
    </Tabs>
  );
}
