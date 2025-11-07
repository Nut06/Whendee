import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

export default function Home() {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            router.replace("/(auth)/login");
        }, 1400);

        return () => clearTimeout(timer);
    }, [opacity]);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Animated.View style={{ opacity }} className="items-center">
                <Image source={require("../../assets/images/When_Logo.png")} className="w-40 h-40 mb-6" />
                <Text className="text-h1 text-center">WhenDee</Text>
                <Text className="text-xxl text-center mt-2">Hangouts meeting enjoy in one</Text>
            </Animated.View>
        </View>
    );
}