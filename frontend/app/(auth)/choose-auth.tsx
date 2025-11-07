import { Image, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const ChooseAuth = () => {
    const { height } = useWindowDimensions();
    const heroHeight = Math.round(height * 0.40)
    
    return (
        <View className="flex-1 pb-10">
        {/* Top Illustration */}
            <Image
            source={require('../../assets/images/Group.png')}
            className="w-full mb-10"
            resizeMode="cover"
            style={{ height: heroHeight }}
            />

        {/* Text Content */}
        <View className="px-6">
            {/* Dot Indicator */}
            <View className="flex-row justify-center mb-4 space-x-2">
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
            </View>

            <View>
            <Text className="px-3 mb-2 font-bold text-center text-display-2">Get The Full Experience</Text>
            <Text className="text-center text-gray-500">
                Communicate the brands identity, purpose, and values in a creative way
            </Text>
            </View>

            <View className='mt-10 space-y-4'>
            {/* Sign In Button */}
            <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                className="items-center py-3 mb-3 border rounded-full border-primary-400"
            >
                <Text className="text-blue-600 font-lato text-">Sign In</Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                className="items-center py-3 border border-gray-300 rounded-full"
            >
                <Text className="font-medium text-gray-700">Register</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
  )
}

export default ChooseAuth