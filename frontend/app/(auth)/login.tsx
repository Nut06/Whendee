import { View, Image, Text, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { PrimaryButton } from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { LoginRequest } from '@/types/user.types';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  
  const router = useRouter();
  const [userInput, setUserInput] = useState<LoginRequest>({ email: '', password: '' });
  const { loginWithCredentials, loginGoogle, loginLine } = useAuthStore();
  
  const [loading, setIsLoading] = useState<boolean>(false);
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithCredentials(userInput);
      router.replace('/(tab)/home');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Unable to log in. Please try again.';
      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setIsLoading(true);
      await loginGoogle();
      router.replace('/(tab)/choose-preference');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Google login failed.';
      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLine = async () => {
    try {
      setIsLoading(true);
      await loginLine();
      router.replace('/(tab)/home');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'LINE login failed.';
      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <View className="flex-1">
        <View className="mx-5 mt-6 overflow-hidden bg-white shadow-lg rounded-3xl">
          {/* Header */}
          <View className="relative mb-2">
            <View className="flex-row items-center justify-center py-5 border-b border-gray-100">
              <View style={{ width: 40 }} />
              <Text className="flex-1 text-lg font-semibold text-center text-gray-900">Log In</Text>
              <TouchableOpacity onPress={() => router.back()} className='w-10' accessibilityLabel="Close">
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>


          {/* Content */}
          <View className="px-5 py-6">
            {/* Input Fields */}
            <View className="items-stretch gap-3">
              <InputField
                placeholder="Email address"
                onChangeText={(text) => setUserInput({ ...userInput, email: text })}
                keyboardType="email-address"
              />
              <InputField
                placeholder="Password"
                onChangeText={(text) => setUserInput({ ...userInput, password: text })}
                isSecure={true}
              />
            </View>

            {/* Terms Agreement */}
            <View className="flex-row justify-end mt-4 mb-5">
                <TouchableOpacity 
                onPress={handleLogin}
                className="self-end mt-4 mb-5"
                accessibilityLabel="Forgot password"
                >
                <Text className="text-md text-primary-500 font-lato">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Log In Button */}
            <PrimaryButton
                title="Log In"
                onPress={handleLogin}
                loading={loading}
              />

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-xs text-gray-400">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Buttons */}
            <View className="gap-3">
              <TouchableOpacity 
                className="w-full justify-center gap-x-3 flex-row bg-white border border-gray-200 rounded-xl py-3.5 items-center"
                activeOpacity={0.7}
                onPress={handleGoogle}
              >
                <Image 
                  source={require('../../assets/images/auth/google.png')} 
                  className='h-5'
                  resizeMode="contain" 
                />
                <Text className="text-base font-medium text-gray-800">Sign up with Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-full flex-row bg-white border border-gray-200 rounded-xl py-3.5 items-center justify-center gap-x-3"
                activeOpacity={0.7}
                onPress={handleLine}
              >
                <Image 
                  source={require('../../assets/images/auth/line.png')} 
                  style={{ width: 20, height: 20, marginRight: 12 }} 
                  resizeMode="contain" 
                />
                <Text className="text-base font-medium text-gray-800">Sign up with Line</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </View>
  )
}
