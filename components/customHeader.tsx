// components/CustomHeader.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router'; 

export default function CustomHeader() {
  const router = useRouter();
  
  
  const user = {
    name: "Aliya Doherty",
    date: "09 September' 23 • Monday",
    profilePic: 'https://i.pravatar.cc/100?img=1',
    notifications: 4,
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: user.profilePic }} 
          style={styles.profileImage}
        />
        <View style={styles.onlineIndicator} />
        
        <View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.dateTime}>{user.date}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.notificationButton}
        
        onPress={() => router.push('/(main)/notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color="#333" />
        {}
        {user.notifications > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{user.notifications}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 0,
    height: 90, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#fff', 
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  onlineIndicator: {
    position: 'absolute',
    left: 30,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80', 
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationButton: {
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff3b30', 
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});