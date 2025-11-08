
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';


interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

// =============================================
// 1. Button Component แบบสมบูรณ์
// =============================================

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // กำหนด style ตาม variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500';
      case 'secondary':
        return 'bg-secondary';
      case 'outline':
        return 'bg-transparent border-2 border-primary-500';
      case 'danger':
        return 'bg-danger';
      case 'success':
        return 'bg-success';
      default:
        return 'bg-primary-500';
    }
  };

  const getTextColorClasses = () => {
    return variant === 'outline' ? 'text-primary-500' : 'text-white';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'medium':
        return 'py-3.5 px-6';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3.5 px-6';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={styles.button}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        items-center justify-center flex-row rounded-xl
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${getTextColorClasses()} ${getTextSizeClasses()} font-semibold`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// =============================================
// 2. Primary Button (ปุ่มหลัก)
// =============================================

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.button}
      className={`
        w-full shadow-button-inner bg-primary-500 py-3.5 items-center justify-center rounded-xl
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className="text-base font-semibold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// =============================================
// 3. Outline Button (ปุ่มขอบ)
// =============================================

export function OutlineButton({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.socialButton}
      className={`
        w-full bg-white border border-default-200 py-3.5 
        items-center justify-center rounded-xl
        ${disabled ? 'opacity-50' : 'opacity-100'}
      `}
      activeOpacity={0.7}
    >
      <Text className="text-base font-medium text-default-800">{title}</Text>
    </TouchableOpacity>
  );
}

// =============================================
// 4. Icon Button (ปุ่มพร้อมไอคอน)
// =============================================

export function IconButton({
  title,
  icon,
  onPress,
  disabled = false,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.socialButton}
      className={`
        w-full bg-white border border-default-200 py-3.5 
        flex-row items-center justify-center rounded-xl
        ${disabled ? 'opacity-50' : 'opacity-100'}
      `}
      activeOpacity={0.7}
    >
      <View className="mr-3">{icon}</View>
      <Text className="text-base font-medium text-default-800">{title}</Text>
    </TouchableOpacity>
  );
}

// =============================================
// 5. Danger Button (ปุ่มแสดงความเสี่ยง)
// =============================================

export function DangerButton({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.button}
      className={`
        w-full bg-danger py-3.5 items-center justify-center rounded-xl
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className="text-base font-semibold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// =============================================
// 6. Small Button (ปุ่มขนาดเล็ก)
// =============================================

export function SmallButton({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}) {
  const bgClass = variant === 'primary' ? 'bg-primary-500' : 'bg-white border border-primary-500';
  const textClass = variant === 'primary' ? 'text-white' : 'text-primary-500';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgClass} py-2 px-4 items-center justify-center rounded-lg`}
      activeOpacity={0.8}
    >
      <Text className={`${textClass} text-sm font-semibold`}>{title}</Text>
    </TouchableOpacity>
  );
}

// =============================================
// StyleSheet (สำหรับ consistent rendering)
// =============================================

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    shadowColor: '#006FEE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButton: {
    borderRadius: 12,
    borderWidth: 1,
  },
});

// =============================================
// 🎯 ตัวอย่างการใช้งานใน Component
// =============================================

/*
import {
  Button,
  PrimaryButton,
  OutlineButton,
  IconButton,
  DangerButton,
  SmallButton,
} from '@/components/Buttons';
import { Feather } from '@expo/vector-icons';

function ExampleScreen() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View className="gap-3 p-4">
      {/* 1. Button แบบสมบูรณ์ (ปรับแต่งได้เยอะ) *\/}
      <Button
        title="Complete Button"
        onPress={handlePress}
        variant="primary"
        size="medium"
        fullWidth
      />

      <Button
        title="Loading Button"
        onPress={handlePress}
        loading={true}
        variant="primary"
      />

      <Button
        title="With Icon"
        onPress={handlePress}
        variant="primary"
        icon={<Feather name="check" size={20} color="white" />}
      />

      {/* 2. Primary Button (สำหรับ action หลัก) *\/}
      <PrimaryButton
        title="Log In"
        onPress={handlePress}
      />

      <PrimaryButton
        title="Loading..."
        onPress={handlePress}
        loading={true}
      />

      {/* 3. Outline Button *\/}
      <OutlineButton
        title="Cancel"
        onPress={handlePress}
      />

      {/* 4. Icon Button (สำหรับ social login) *\/}
      <IconButton
        title="Sign up with Google"
        icon={<Image source={require('@/assets/images/auth/google.png')} style={{ width: 20, height: 20 }} />}
        onPress={handlePress}
      />

      {/* 5. Danger Button *\/}
      <DangerButton
        title="Delete Account"
        onPress={handlePress}
      />

      {/* 6. Small Button *\/}
      <View className="flex-row gap-2">
        <SmallButton title="Save" onPress={handlePress} variant="primary" />
        <SmallButton title="Cancel" onPress={handlePress} variant="outline" />
      </View>

      {/* Button ใน row *\/}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <OutlineButton title="Cancel" onPress={handlePress} />
        </View>
        <View className="flex-1">
          <PrimaryButton title="Confirm" onPress={handlePress} />
        </View>
      </View>
    </View>
  );
}
*/

// =============================================
// Export all buttons
// =============================================

export default {
  Button,
  PrimaryButton,
  OutlineButton,
  IconButton,
  DangerButton,
  SmallButton,
};