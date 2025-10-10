import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

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
] as const;

export default function ChoosePreference() {
  const router = useRouter()
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (id: string) => {
    setSelectedPreferences(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSkip = () => {
    router.replace('/(tab)/home')
  }

  const handleNext = () => {
    if (selectedPreferences.length >= 5) {
      // TODO: Save preferences to backend
      router.replace('/(tab)/home')
    }
  }

  const canProceed = selectedPreferences.length >= 5

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
            <View className="flex-1 w-full mb-4 text-black bg-white">
              <Text className="text-3xl font-bold font-lato">
                Welcome to WhenDee
              </Text>
              <Text className="mt-2 font-lato">
                Pick 5 or more of your favorite activities
              </Text>
            </View>

          <View className='flex flex-row justify-end'>
              <TouchableOpacity
                onPress={handleSkip}
                className="px-5 py-2 rounded-full bg-white/30"
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-white">Skip</Text>
              </TouchableOpacity>
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
              {canProceed && (
                <TouchableOpacity 
                  onPress={handleNext}
                  className="px-8 py-3 bg-white rounded-full"
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-semibold text-purple-600">Continue</Text>
                </TouchableOpacity>
              )}
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
