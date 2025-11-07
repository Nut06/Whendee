// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./../global.css";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
<<<<<<< HEAD
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
=======

  const [loading, isLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
      <QueryClientProvider client={queryClient}>
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
  );
}
>>>>>>> fd24859 (Implement backend for otp, line, google-auth)
