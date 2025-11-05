import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import "./../global.css"

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated) {
      router.replace('/(main)/plan');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isInitialized, router]);

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
