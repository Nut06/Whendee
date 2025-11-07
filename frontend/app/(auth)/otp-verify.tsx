// app/(auth)/verify-otp.tsx
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { router, useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { useOtpStore } from '@/stores/otpStore';

export default function VerifyOTP() {

  const input = useRef<(TextInput | null) []>([]);
  const { 
    otp, 
    setOtp, 
    countdown, 
    canResend,
    attempts,
    isVerifying,
    isResending,
    verifyError,
    resendError,
    verifyOtp,
    resendOtp,
    decrementCountdown,
    resetState
  } = useOtpStore();
  
  useEffect(() => {
    if (countdown > 0) {
      decrementCountdown();
    }
  },[countdown]);


  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      setOtp(Number(text), index);
      // auto-focus next
    } else if (text === '') {
      setOtp(0, index);
    }
  }


  const formatTime = () => {
    const minutes = Math.floor(countdown / 60).toString().padStart(2, '0')
    const seconds = (countdown % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 px-6 pt-12 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="relative mb-2">
            <View className="flex-row items-center justify-center py-5 border-b border-gray-100">
              <View style={{ width: 40 }} />
              <Text className="flex-1 text-lg font-semibold text-center text-gray-900">OTP Verification</Text>
              <TouchableOpacity onPress={() => router.back()} className='w-10' accessibilityLabel="Close">
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

      {/* Title & instruction */}
      <Text className="mb-2 text-lg font-semibold text-center">Check your email for a code</Text>
      <Text className="mb-6 text-center text-gray-500">
        Please enter the verification code sent to your mail address{'\n'}
        <Text className="font-medium text-black">aliya.doherty@gmail.com</Text>
      </Text>

      {/* OTP Inputs */}
      <View className="flex-row justify-between px-3 mb-6">
        {otp.map((value, index:number) => (
          <TextInput
            key={index}
            value={value ? value.toString() : ''}
            onChangeText={(text) => handleChange(text, index)}
            maxLength={1}
            keyboardType="number-pad"
            className={`text-xl focus:border-primary-500 focus:shadow-blue-500/50 text-center rounded-md w-12 h-14 ${
              value ? 'border-blue-500' : 'border-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Timer */}
      <Text className="mb-6 text-base text-center text-gray-500">{formatTime()}</Text>

      {/* Resend */}
      { canResend && attempts < 3 && (
        <Text className="text-sm text-center text-gray-500">
          Did not get the code?{' '}
          <Text className="text-blue-500 underline" onPress={resendOtp} accessibilityLabel="Resend Code">
            Resend Code
          </Text>
        </Text>
      )}
    </KeyboardAvoidingView>
  )
}
