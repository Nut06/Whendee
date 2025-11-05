import { Stack, router } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: 's1',
    title: 'Welcome to WhenDee',
    subtitle: 'Plan and enjoy hangouts with friends',
    image: require('../../assets/images/Group.png'),
  },
//   {
//     key: 's2',
//     title: 'Create Events',
//     subtitle: 'Quickly create meetups and invite friends',
//     image: require('../../../assets/images/partial-react-logo.png'),
//   },
//   {
//     key: 's3',
//     title: 'Stay Notified',
//     subtitle: 'Get reminders so you never miss out',
//     image: require('../../../assets/images/splash-icon.png'),
//   }
];

export default function Login() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);

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
          <View key={s.key} style={[styles.slide, { width }] }>
            <Image source={s.image} style={styles.image} resizeMode="contain" />
            <View style={styles.textWrap}>
              <Text className="text-h1 text-center">{s.title}</Text>
              <Text className="text-xxl text-center mt-2">{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            return (
              <Animated.View key={i} style={[styles.dot, { opacity }]} />
            );
          })}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.skip}>
            <Text className="text-base">Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext} style={styles.next}>
            <Text className="text-base text-white">{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  textWrap: {
    paddingHorizontal: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff'
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 6,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  skip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  next: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  }
});
