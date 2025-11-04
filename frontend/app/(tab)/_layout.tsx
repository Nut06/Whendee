import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const TAB_CONFIG = {
  home: {
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home-variant',
  },
  friend: {
    label: 'Friends',
    icon: 'account-group-outline',
    activeIcon: 'account-group',
  },
  calendar: {
    label: 'Calendar',
    icon: 'calendar-blank-outline',
    activeIcon: 'calendar',
  },
  setting: {
    label: 'Settings',
    icon: 'cog-outline',
    activeIcon: 'cog',
  },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

type ConfigEntry = typeof TAB_CONFIG[TabRouteName];

const getTabConfig = (name: string): ConfigEntry | undefined => TAB_CONFIG[name as TabRouteName];

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navContainer}
      >
        <View style={styles.itemsRow}>
          {state.routes.map((route, index) => {
            const tab = getTabConfig(route.name);
            if (!tab) {
              return null;
            }

            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            const iconName = isFocused ? tab.activeIcon : tab.icon;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : undefined}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                activeOpacity={0.85}
              >
                <View style={[styles.tabItem, isFocused && styles.tabItemActive]}>
                  <MaterialCommunityIcons
                    name={iconName as any}
                    size={24}
                    color={isFocused ? '#4F46E5' : '#A1A1AA'}
                  />
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="friend" options={{ title: 'Friends', tabBarLabel: 'Friends' }} />
    <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
    <Tabs.Screen name="setting" options={{ title: 'Settings' }} />
      <Tabs.Screen name="choose-preference" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  navContainer: {
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#27272A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: 'rgba(79,70,229,0.12)',
  },
  tabLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#4F46E5',
  },
});
