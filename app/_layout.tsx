import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="(main)/home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(main)/friends"
          options={{
            title: "Friends",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* ปุ่มกลาง (FAB) */}
        <Tabs.Screen
          name="(main)/createMeeting"
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: (props) => <CustomTabButton {...props} />,
          }}
        />

        <Tabs.Screen
          name="(main)/calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(main)/settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

function CustomTabButton(props: any) {
  const router = useRouter();

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.8}
      style={styles.middleButton}
      onPress={() => router.push("/(main)/createMeeting")}
    >
      <Ionicons name="add" size={32} color="#fff" />
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  middleButtonContainer: {
    top: -30,
    justifyContent: "center",
    alignItems: "center",
  },
  middleButton: {
  top: -25,
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: "#067bff",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#067bff",
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 8,

  },
});
