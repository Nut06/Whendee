// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { debugAuth } from "@/utils/debug";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../frontend/global.css";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const root = segments[0];
    const inAuthGroup = root === "(auth)";
    debugAuth('AuthGate: state', { isInitialized, isAuthenticated, root, segments, hasUser: !!user });

    if (!isAuthenticated) {
      // หากยังไม่ล็อกอินและกำลังจะเข้า group อื่น ให้ส่งไป choose-auth
      if (!inAuthGroup) {
        debugAuth('AuthGate: redirect -> /(auth)/choose-auth');
        router.replace("/(auth)/choose-auth");
      }
      return;
    }

    // ผู้ใช้ล็อกอินแล้ว หากยังอยู่ในกลุ่ม auth ให้เปลี่ยนปลายทางตาม preference
    if (inAuthGroup || !segments.length) {
      const hasPreference = !!(user?.preferences && user.preferences.length > 0);
      if (hasPreference) {
        debugAuth('AuthGate: redirect -> /(main)/home');
        router.replace("/(main)/home");
      } else {
        debugAuth('AuthGate: redirect -> /(onboarding)/choose-preference');
        router.replace("/(onboarding)/choose-preference");
      }
    }
  }, [isAuthenticated, isInitialized, user, segments, router]);

  return null;
}

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View className="items-center justify-center flex-1 bg-white">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
          <Stack.Screen
            name="(auth)/register.tsx"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
