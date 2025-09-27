import { Stack, router } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: 's1',
    title: 'Welcome to WhenDee',
    subtitle: 'Plan and enjoy hangouts with friends',
    image: require('../../assets/images/Group.png'),
  },
];

export default function Onboarding() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState<number>(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  function goNext() {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.replace('/login');
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {slides.map((s) => (
          <View key={s.key} style={{ width }} className="flex-1 items-center justify-center px-5">
            <Image source={s.image} className="w-48 h-48 mb-5" resizeMode="contain" />
            <View className="px-3">
              <Text className="text-h1 text-center">{s.title}</Text>
              <Text className="text-xxl text-center mt-2">{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      <View className="p-5 border-t border-gray-200 bg-white">
        <View className="flex-row justify-center items-center mb-3">
          {slides.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            return (
              <Animated.View key={i} style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#111827', marginHorizontal: 6 }, { opacity }]} />
            );
          })}
        </View>

        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.replace('/login')} className="py-2 px-3">
            <Text className="text-base">Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext} className="bg-gray-900 py-2 px-4 rounded-md">
            <Text className="text-base text-white">{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

