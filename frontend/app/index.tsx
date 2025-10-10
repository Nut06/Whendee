<<<<<<< HEAD
import { Redirect } from "expo-router";
export default function Index() {
  return <Redirect href="/(main)/plan" />; // เข้าแท็บ Home (plan) อัตโนมัติ
=======
import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import { View, Text, Image } from "react-native";

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/choose-auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return(
    <View className="flex items-center justify-center flex-1 grid-cols-4 gap-1 bg-white">
      <View className='flex items-center justify-center col-span-4 gap-2'>
        <Image
          source={require('../assets/images/When_Logo.png')}
          className="mb-2"
          resizeMode="contain"
        />
        <Text className="text-display-2 font-lato text-default-900">WhenDee</Text>
        <Text className="text-body-xl font-lato text-default-600">Hangouts meeting enjoy in one</Text>
      </View>
    </View>
  );
>>>>>>> fd24859 (Implement backend for otp, line, google-auth)
}
