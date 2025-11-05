import { useRouter } from "expo-router";
import { debugAuth } from "@/utils/debug";
import { useEffect } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import "./../global.css"

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated) {
      const hasPreference = !!(user?.preferences && user.preferences.length > 0);
      if (hasPreference) {
  debugAuth('Index: redirect -> /(main)/home');
  router.replace('/(main)/home');
      } else {
        // ผู้ใช้ล็อกอินแล้ว แต่ยังไม่มี preference ให้พาไปตั้งค่าก่อน
        debugAuth('Index: redirect -> /(onboarding)/choose-preference');
        router.replace('/(onboarding)/choose-preference');
      }
    } else {
      // ผู้ใช้ยังไม่ล็อกอิน ให้ไปหน้าเลือกวิธีเข้าสู่ระบบ
      debugAuth('Index: redirect -> /(auth)/choose-auth');
      router.replace('/(auth)/choose-auth');
    }
  }, [isAuthenticated, isInitialized, user, router]);

  return (
    <View className="flex items-center justify-center flex-1 grid-cols-4 gap-1 bg-white">
      <View className='flex items-center justify-center col-span-4 gap-2'>
        <Image
          source={require('../assets/images/When_Logo.png')}
          className="mb-2"
          resizeMode="contain"
        />
        <Text className="text-display-2 font-lato text-default-900">WhenDee</Text>
        <Text className="text-body-xl font-lato text-default-600">Hangouts meeting enjoy in one</Text>
        {!isInitialized && <ActivityIndicator className="mt-4" size="small" />}
      </View>
    </View>
  );
}
