// app/(main)/notifications.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOCK_NOTIFICATIONS = [
  { id: '1', icon: 'people', title: 'Group Invitation Received!', details: 'You\'ve been invited to join [ชื่อกลุ่ม]. Tap to accept or decline.', time: '2 days ago' },
  { id: '2', icon: 'hand-wave', title: 'You\'ve Joined the Group!', details: 'You are now a member of [ชื่อกลุ่ม]. Say hi 👋 to everyone!', time: '6 days ago' },
  { id: '3', icon: 'person-add', title: 'New Friend Request', details: '[ชื่อคนส่งคำขอ] wants to be friends with you. Accept or ignore?', time: '9 days ago' },
  { id: '4', icon: 'notifications', title: 'Upcoming Event in 2 Days', details: 'Your group Ex1 has an event coming up in 2 days. Get ready!', time: '13 days ago' },
  { id: '5', icon: 'people', title: 'You\'re Now Friends!', details: 'You and [ชื่อเพื่อน] are now connected. Say hi 👋.', time: '4 days ago' },
];

const NotificationItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
  <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}>
    <Ionicons 
        name={item.icon as any} 
        size={24} 
        color="#007BFF" 
        style={styles.itemIcon} 
    />
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDetails}>{item.details}</Text>
    </View>
    <Text style={styles.itemTime}>{item.time}</Text>
  </TouchableOpacity>
);

export default function NotificationsScreen() {
    const navigation = useNavigation();
    
    return (
        <SafeAreaView style={styles.safeArea}>
            {/*ตั้งค่า Header ของ Stack Navigator ให้มีปุ่มย้อนกลับ */}
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Notifications",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: { fontWeight: '600' },
                    headerShadowVisible: false,
                }}
            />
            
            <FlatList
                data={MOCK_NOTIFICATIONS}
                renderItem={({ item }) => <NotificationItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  listContent: {
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eef2f5',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  }
});
