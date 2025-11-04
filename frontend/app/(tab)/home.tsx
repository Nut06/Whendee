import { useAuthStore } from '@/stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const formatDateLabel = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear().toString().slice(-2);
  const weekday = now.toLocaleString('en-US', { weekday: 'long' });
  return `${day} ${month}' ${year} • ${weekday}`;
};

export default function Home() {
  const { user } = useAuthStore();
  const fullName = user?.name?.length ? user.name : 'Aliya Doherty';
  const dateLabel = formatDateLabel();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center gap-3">
              <Image
                source={
                  user?.avatarUrl
                    ? { uri: user.avatarUrl }
                    : require('../../assets/images/Group.png')
                }
                className="bg-gray-200 rounded-full w-14 h-14"
                resizeMode="cover"
              />
              <View>
                <Text className="text-lg font-semibold text-gray-900 font-lato">{fullName}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View className="w-2 h-2 rounded-full bg-emerald-400" />
                  <Text className="text-xs text-gray-500">{dateLabel}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.85}>
              <View className="relative">
                <View className="items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm">
                  <MaterialCommunityIcons name="bell-outline" size={22} color="#1C1C1E" />
                </View>
                <View className="absolute top-0 right-0 items-center justify-center w-5 h-5 rounded-full bg-rose-500">
                  <Text className="text-[10px] font-semibold text-white">4</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center px-4 py-3 bg-white shadow-sm rounded-2xl">
              <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-sm text-gray-400">Search meetings and other things</Text>
            </View>
          </View>

          <View className="items-center justify-center mt-16">
            <Image
              source={require('../../assets/images/agenda.png')}
              className="h-56 w-60"
              resizeMode="contain"
            />
            <Text className="mt-8 text-lg font-semibold text-gray-800 font-lato">
              Agendas have not been added yet
            </Text>
            <Text className="mt-2 text-sm text-gray-500">
              Please add your agendas
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
