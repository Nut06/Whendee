import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/userService';

// Preference options matching Figma design - WhenDee activities
const PREFERENCES = [
  { id: 'karaoke', label: 'Karaoke', icon: 'microphone' },
  { id: 'bowling', label: 'Bowling', icon: 'bowling' },
  { id: 'meal-plan', label: 'Meal Plan', icon: 'silverware-fork-knife' },
  { id: 'movies', label: 'Movies', icon: 'movie-open' },
  { id: 'workout', label: 'Workout Plan', icon: 'dumbbell' },
  { id: 'travel', label: 'Travel', icon: 'beach' },
  { id: 'gaming', label: 'Gaming', icon: 'controller' },
  { id: 'book-club', label: 'Book Club', icon: 'book-open-page-variant' },
  { id: 'art', label: 'Art & Craft', icon: 'palette' },
  { id: 'coffee', label: 'Coffee Chat', icon: 'coffee-outline' },
  { id: 'outdoor', label: 'Outdoor Walk', icon: 'pine-tree' },
  { id: 'music', label: 'Live Music', icon: 'music-circle-outline' },
  { id: 'photography', label: 'Photography', icon: 'camera' },
  { id: 'cooking', label: 'Cooking Class', icon: 'chef-hat' },
  { id: 'language', label: 'Language Exchange', icon: 'translate' },
  { id: 'volunteering', label: 'Volunteering', icon: 'hand-heart' },
] as const;

export default function ChoosePreference() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasExistingPreferences = (user?.preferences?.length ?? 0) > 0;

  useEffect(() => {
    if (hasExistingPreferences) {
      router.replace('/(main)/home');
    }
  }, [hasExistingPreferences, router]);

  useEffect(() => {
    if (!user) return;
    const current = user.preferences?.map((pref) => pref.category.key) ?? [];
    if (current.length) {
      setSelectedPreferences(current);
    }
  }, [user]);

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    if (selectedPreferences.length < 5) {
      Alert.alert('Pick more favorites', 'กรุณาเลือกอย่างน้อย 5 กิจกรรมก่อนดำเนินการต่อ');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = selectedPreferences.map((id) => {
        const meta = PREFERENCES.find((pref) => pref.id === id);
        return {
          key: id,
          label: meta?.label,
          icon: meta?.icon ?? null,
        };
      });

      const updatedUser = await userService.setUserPreference(payload);
      await updateUser(updatedUser);
      router.replace('/(main)/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your preferences right now.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = selectedPreferences.length >= 5;

  return (
        <LinearGradient
          colors={['#6760D4', '#F0A1C6', '#FDC4B3']}
          locations={[0, 0.5385, 1]}
          style={{ flex: 1, }}
        >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            {/* Header */}
            <View className="w-full bg-white px-6 pt-14 pb-6 rounded-b-[32px]">
              <Text className="mt-6 text-3xl font-bold text-gray-900 font-lato">
                Welcome to WhenDee
              </Text>
              <Text className="mt-2 mb-4 text-base text-gray-500 font-lato">
                Pick 5 or more of your favorite activities
              </Text>
            </View>

          <View className="flex-row justify-end px-4 mt-4">
            <Text className="text-sm font-semibold text-white">
              เลือกอย่างน้อย 5 กิจกรรมเพื่อดำเนินการต่อ
            </Text>
          </View>

            {/* Preferences Grid */}
            <View className="flex-row flex-wrap justify-between mt-6 mb-8">
              {PREFERENCES.map((pref) => {
                const isSelected = selectedPreferences.includes(pref.id);
                return (
                  <TouchableOpacity
                    key={pref.id}
                    onPress={() => togglePreference(pref.id)}
                    style={[
                      styles.preferenceCard,
                      isSelected && styles.preferenceCardSelected
                    ]}
                    className={`w-[48%] mb-4 p-6 rounded-3xl items-center justify-center bg-white ${
                      isSelected ? 'opacity-100' : 'opacity-90'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="items-center">
                      <MaterialCommunityIcons
                        name={pref.icon as any}
                        size={40}
                        color="#9333EA"
                      />
                      <Text className="mt-3 text-sm font-semibold text-center text-purple-600 font-lato">
                        {pref.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View 
                        className="absolute bg-purple-600 rounded-full top-2 right-2"
                        style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <MaterialCommunityIcons name="check" size={16} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Progress Indicator */}
            <View className="items-center pb-8 mt-auto">
              <Text className="mb-2 text-sm text-white font-lato">
                {selectedPreferences.length} / 5 selected
              </Text>
              
              {/* Continue hint */}
              <TouchableOpacity
                onPress={handleNext}
                className={`px-8 py-3 rounded-full ${canProceed ? 'bg-white' : 'bg-white/50'}`}
                activeOpacity={canProceed ? 0.8 : 1}
                disabled={!canProceed || isSubmitting}
              >
                <Text
                  className={`text-base font-semibold ${canProceed ? 'text-purple-600' : 'text-purple-300'}`}
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  preferenceCard: {
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceCardSelected: {
    shadowColor: '#006FEE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    shadowColor: '#006FEE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
