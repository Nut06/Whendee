// app/home/_layout.tsx
import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          backgroundColor: 'white',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View className="items-center">
              <FontAwesome name="home" size={24} color={focused ? '#007bff' : '#999'} />
              <Text className={`text-xs ${focused ? 'text-blue-600' : 'text-gray-500'}`}>Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => (
            <View className="items-center">
              <FontAwesome name="users" size={24} color={focused ? '#007bff' : '#999'} />
              <Text className={`text-xs ${focused ? 'text-blue-600' : 'text-gray-500'}`}>Friends</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: () => (
            <TouchableOpacity className="items-center justify-center w-16 h-16 -mt-6 bg-blue-600 rounded-full shadow-lg">
              <Entypo name="plus" size={28} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <View className="items-center">
              <FontAwesome name="calendar" size={24} color={focused ? '#007bff' : '#999'} />
              <Text className={`text-xs ${focused ? 'text-blue-600' : 'text-gray-500'}`}>Calendar</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <View className="items-center">
              <Ionicons name="settings" size={24} color={focused ? '#007bff' : '#999'} />
              <Text className={`text-xs ${focused ? 'text-blue-600' : 'text-gray-500'}`}>Settings</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
