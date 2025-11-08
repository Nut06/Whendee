import { View, Text, TextInput } from 'react-native'
import React from 'react'

interface IndexProps {
    placeholder?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    isSecure?: boolean;
    value?: string;
    error?: boolean;
}

const InputField = ({ placeholder, onChangeText, isSecure, keyboardType, value, error }: IndexProps) => {
  return (
    <>
        <TextInput
            className="w-full bg-gray-50 border-primary-500 border-solid focus:outline-primary-500 focus:shadow-blue-500/50 rounded-xl px-4 py-3.5 text-base text-gray-900"
            placeholder={placeholder}
            keyboardType={keyboardType}
            placeholderTextColor="#9CA3AF"
            onChangeText={onChangeText}
            secureTextEntry={isSecure ? true : false}
            value={value}
        />
        {error && (
            <Text className="mt-1 text-sm text-red-500">This field is required</Text>
        )}
    </>
  )
}

export default InputField