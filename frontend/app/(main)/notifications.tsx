import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchNotifications, respondToNotification, Notification } from '@/lib/notificationApi';
import { ensureEventMember } from '@/lib/eventApi';
import { useAuthStore } from '../stores/authStore';
import planStore from '../lib/planStore';

const NotificationItem = ({
  item,
  onAccept,
  onDecline,
}: {
  item: Notification;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const isPending = item.status === 'PENDING';
  const eventTitle =
    item.payload?.eventTitle ?? item.payload?.title ?? item.message ?? '';
  return (
    <View style={styles.itemContainer}>
      <Ionicons name="notifications-outline" size={24} color="#007BFF" style={styles.itemIcon} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {eventTitle ? (
          <Text style={styles.itemDetails}>{eventTitle}</Text>
        ) : null}
        {isPending ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.statusLabel}>Status: {item.status}</Text>
        )}
      </View>
      <Text style={styles.itemTime}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id ?? planStore.getCurrentUserId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async (item: Notification, action: 'ACCEPT' | 'DECLINE') => {
    if (!currentUserId) {
      Alert.alert('Missing user', 'Cannot respond without user information.');
      return;
    }
    if (action === 'ACCEPT') {
      const eventId = item.payload?.eventId ?? item.eventId;
      if (!eventId) {
        Alert.alert('Missing event', 'This notification has no event data.');
        return;
      }
      try {
        await ensureEventMember(eventId, currentUserId, 'ACCEPTED');
      } catch (err) {
        Alert.alert(
          'Unable to join event',
          err instanceof Error ? err.message : 'Unknown error occurred',
        );
        return;
      }
    }

    try {
      await respondToNotification(item.id, action);
      load();
    } catch (err) {
      Alert.alert(
        'Unable to update notification',
        err instanceof Error ? err.message : 'Unknown error occurred',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
        }}
      />
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.loadingState}>
          <Text style={{ color: '#dc2626' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onAccept={() => handleDecision(item, 'ACCEPT')}
              onDecline={() => handleDecision(item, 'DECLINE')}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.loadingState}>
              <Text style={{ color: '#6b7280' }}>No notifications.</Text>
            </View>
          }
        />
      )}
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
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  declineBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
});
