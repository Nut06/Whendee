// app/(auth)/register.tsx
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import InputField from '@/components/input'
import { UserAuthInput } from '@/types/user.types'
import { useRegistration } from '@/contexts/RegistrationContext'
import { useRequestOTP } from '@/hooks/useOTP'
import { requestOtp } from '../../../services/identity-service/src/controller/authController';
import { useAuth } from '@/hooks/useAuth'

export default function Register() {
  const router = useRouter()
  const [agree, setAgree] = useState(false);
  const { requestOTP, isRequestOTPLoading, requestOTPError} = useAuth();
  const [errors, setErrors] = useState<Partial<Record<keyof UserAuthInput, boolean>>>({});
  
  const [input, setInput] = useState<UserAuthInput>({
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
  })

  const handleregister = () => {
    // ตรวจสอบว่ามีช่องไหนว่างบ้าง
    const newErrors: Partial<Record<keyof UserAuthInput, boolean>> = {};
    let hasError = false;
    let errorMessage = '';

    if (!input.fname?.trim()) {
      newErrors.fname = true;
      hasError = true;
      errorMessage = 'กรุณากรอกชื่อ';
    }
    if (!input.email?.trim()) {
      newErrors.email = true;
      hasError = true;
      errorMessage = errorMessage || 'กรุณากรอกอีเมล';
    }
    if (!input.phone?.trim()) {
      newErrors.phone = true;
      hasError = true;
      errorMessage = errorMessage || 'กรุณากรอกเบอร์โทรศัพท์';
    }
    if (!input.password?.trim()) {
      newErrors.password = true;
      hasError = true;
      errorMessage = errorMessage || 'กรุณากรอกรหัสผ่าน';
    }

    setErrors(newErrors);

    if (hasError) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', errorMessage);
      return;
    }

    // ดำเนินการลงทะเบียนต่อ
    // requestOTP(input);
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
                  setInput({ ...input, fname: text });
                  if (errors.fname) setErrors({ ...errors, fname: false });
                }}
                value={input.fname}
                error={errors.fname}
              />
              <InputField
                placeholder="Email address"
                onChangeText={(text) => {
                  setInput({ ...input, email: text });
                  if (errors.email) setErrors({ ...errors, email: false });
                }}
                value={input.email}
                keyboardType="email-address"
                error={errors.email}
              />
              <InputField
                placeholder="+66 | Telephone Number"
                onChangeText={(text) => {
                  setInput({ ...input, phone: text });
                  if (errors.phone) setErrors({ ...errors, phone: false });
                }}
                value={input.phone}
                keyboardType="phone-pad"
                error={errors.phone}
              />
              <InputField
                placeholder="Password"
                onChangeText={(text) => {
                  setInput({ ...input, password: text });
                  if (errors.password) setErrors({ ...errors, password: false });
                }}
                value={input.password}
                isSecure={true}
                error={errors.password}
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
              onPress={handleregister}
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