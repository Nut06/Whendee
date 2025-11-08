// app/(auth)/register.tsx
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import InputField from '../components/ui/InputField'
import { RegisterRequest } from '@/types/user.types'
import { useAuthStore } from '@/stores/authStore'
import { useOtpStore } from '@/stores/otpStore'
import { refreshAccessToken } from '@/services/authService'

export default function Register() {
  const router = useRouter()
  const [agree, setAgree] = useState(false);
  const {user, setUser, setAuth, loginLine, loginGoogle, refreshToken} = useAuthStore();
  const { requestOtp } = useOtpStore();
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });
  
  const move = () => {
    if (user?.preferences === null) {
        router.replace('/(tab)/choose-preference');
      }
      router.replace('/(tab)/home');
  }
  const validateErrors = {
    name: !user?.name || user.name.trim() === '',
    email: !user?.email || user.email.trim() === '',
    phone: !user?.phone || user.phone.trim() === '',
    password: !user?.password || user.password.trim() === '',
  }

  const handleGoogle = async () => {
    try {
      await loginGoogle();
      // move();
      router.replace('/(tab)/choose-preference');
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Google login failed.';
      Alert.alert('Login failed', message);
    }
  };

  const handleLine = async () => {
    try {
      await loginLine();
      move();
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'LINE login failed.';
      Alert.alert('Login failed', message);
    }
  };
  
  const handleRegister = async () =>{
    setErrors(validateErrors);
    const hasErrors = Object.values(validateErrors).some(value => value);
    if (!user?.name || !user?.email || !user?.phone || !user?.password || hasErrors) {
      return;
    }
    await requestOtp({
      name:user.name,
      email:user.email,
      phone:user.phone,
      password:user.password
    });
    router.push('/(auth)/otp-verify');
  }
  
  return (
    <View className="flex-1">
        <View className="mx-5 mt-6 overflow-hidden bg-white shadow-lg rounded-3xl">
          {/* Header */}
          <View className="relative mb-2">
            <View className="flex-row items-center justify-center py-5 border-b border-gray-100">
              <View style={{ width: 40 }} />
              <Text className="flex-1 text-lg font-semibold text-center text-gray-900">Create Account</Text>
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
                placeholder="Full name"
                onChangeText={(text) => {
                  setUser('name', text);
                }}
                error={errors.name}
                value={user?.name}
              />
              <InputField
                placeholder="Email address"
                onChangeText={(text) => {
                  setUser('email', text);
                }}
                error={errors.email}
                value={user?.email}
                keyboardType="email-address"
              />
              <InputField
                placeholder="+66 | Telephone Number"
                onChangeText={(text) => {
                  setUser('phone', text);
                }}
                value={user?.phone}
                keyboardType="phone-pad"
              />
              <InputField
                placeholder="Password"
                onChangeText={(text) => {
                  setUser('password', text);
                }}
                value={user?.password}
                isSecure={true}
              />
            </View>

            {/* Terms Agreement */}
            <View className="flex-row items-start mt-4 mb-5">
              <TouchableOpacity 
                onPress={() => setAgree(!agree)} 
                className="mr-2.5 mt-0.5"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agree }}
              >
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  agree ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {agree && (
                    <Feather name="check" size={12} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <Text className="flex-1 text-xs leading-5 text-gray-600">
                By proceeding, I agree to the Minutes Of Meeting{' '}
                <Text className="text-blue-500">Privacy Policy</Text> and{' '}
                <Text className="text-blue-500">Terms Of Service</Text>.
              </Text>
            </View>

            {/* Get Verification Button */}
            <TouchableOpacity
              disabled={!agree}
              className={`rounded-full py-4 items-center ${
                agree ? 'bg-blue-400' : 'bg-blue-200'
              }`}
              activeOpacity={0.8}
              onPress={handleRegister}
            >
              <Text className="text-base font-semibold text-white">Get Verification</Text>
            </TouchableOpacity>

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
