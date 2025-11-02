import { Tabs, Link } from "expo-router";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View } from "react-native";

const MARGIN = 12;   // ระยะห่างซ้าย-ขวา-ล่างของแถบ
const TAB_H  = 64;   // ความสูงแถบ
const FAB    = 56;   // ขนาดปุ่ม +
const OFFSET_X = 0;  // จูนซ้าย/ขวา ถ้าจำเป็น (ลบ=ซ้าย, บวก=ขวา)

function CustomTabBar(props: any) {
  // ปุ่ม + ให้อยู่ “ครึ่งความสูงของแถบ” พอดี
  const fabBottom = MARGIN + (TAB_H - FAB) / 2;

  return (
    // ❗ ลอยจากขอบจอ 12px รอบด้านซ้าย/ขวา/ล่าง ให้เหมือนภาพตัวอย่าง
    <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN }}>
      {/* แถบปกติ (4 ปุ่มอยู่ตำแหน่งเดิม) */}
      <BottomTabBar
        {...props}
        style={{
          height: TAB_H,
          borderRadius: 18,
          overflow: "hidden",              // ให้มุมโค้งทำงานจริง
          backgroundColor: "#fff",
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 8 : 10,
          // เงาเบาๆ ตามภาพ
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
        }}
      />

      {/* เส้น home-indicator จาง ๆ ด้านในบาร์ */}
      <View
        pointerEvents="none"
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

      {/* ปุ่ม + ซ้อนกลางบาร์แบบ absolute (ไม่กระทบ spacing ของแท็บ) */}
      <Link href="/(main)/create" asChild>
        <TouchableOpacity
          activeOpacity={0.92}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            position: "absolute",
            left: "50%",
            bottom: fabBottom,
            transform: [{ translateX: -FAB / 2 + OFFSET_X }], // จูนซ้าย/ขวาได้
            width: FAB,
            height: FAB,
            borderRadius: FAB / 2,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
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
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tabs
      // ใช้ custom bar เพื่อคุมตำแหน่งได้เป๊ะ
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        // ห้ามใส่ tabBarStyle ที่นี่แล้ว เพราะเราคุมใน CustomTabBar
      }}
    >
      {/* 4 แท็บจริงตามภาพ */}
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

      {/* ซ่อนเส้นทางที่ไม่ใช่แท็บ */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="plan-detail/[meetingId]" options={{ href: null }} />
      <Tabs.Screen name="create" options={{ href: null }} /> {/* ปลายทางของปุ่ม + */}
    </Tabs>
  );
}
