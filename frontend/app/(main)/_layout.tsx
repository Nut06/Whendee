import { Tabs, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_H = 56; // reduce overall tab bar height
const FAB = 56;
const LIFT = 22; // slightly less lift to match the thinner bar

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#6b7280",
  tabBarLabelStyle: { fontSize: 10, marginTop: 0 },
        // ให้พื้นหลังเพจเป็นสีเดียวกันทุกหน้า และเคารพ Safe Area ของอุปกรณ์
        sceneStyle: {
          backgroundColor: "#F6F7FB",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        // ชิดขอบล่าง เต็มความกว้าง (ปล่อยให้ Safe Area ของตัว Tab ดูแลเอง)
        tabBarStyle: {
          height: TAB_H,
          borderTopWidth: 0,
          backgroundColor: "#fff",
          paddingTop: 4,
          paddingBottom: Platform.OS === "ios" ? 6 : 8,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <View
              style={{
                position: "absolute",
                left: "32%",
                right: "32%",
                bottom: 6,
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}>
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
                      shadowOffset: { width: 0, height: 6},
                      elevation: 10,
                    }}
                  >
                    <Ionicons name="add" color="#fff" size={26} />
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
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
      <Tabs.Screen name="addMember" options={{ href: null }} />
      <Tabs.Screen name="inviteFriends" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="set-location" options={{ href: null }} />
      <Tabs.Screen name="vote-location" options={{ href: null }} />
      <Tabs.Screen name="vote-location-map" options={{ href: null }} />
      <Tabs.Screen name="vote-success" options={{ href: null }} />
      <Tabs.Screen name="location-status" options={{ href: null }} />
      <Tabs.Screen name="free-date-picker" options={{ href: null }} />
      <Tabs.Screen name="schedule-meeting" options={{ href: null }} />
      <Tabs.Screen name="select-date" options={{ href: null }} />
    </Tabs>
  );
}
