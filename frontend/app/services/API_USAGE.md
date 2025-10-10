# 📡 Axios API Service - คู่มือการใช้งาน

## 📋 สารบัญ
1. [การติดตั้ง](#การติดตั้ง)
2. [การตั้งค่า](#การตั้งค่า)
3. [การใช้งานพื้นฐาน](#การใช้งานพื้นฐาน)
4. [ตัวอย่าง Services](#ตัวอย่าง-services)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## 🚀 การติดตั้ง

```powershell
# จาก frontend folder
npm install axios

# (Optional) สำหรับเก็บ token
npm install @react-native-async-storage/async-storage
```

---

## ⚙️ การตั้งค่า

### 1. กำหนด Base URL

แก้ไขใน `app/service/api.ts`:

```typescript
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android Emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api'; // iOS Simulator
    } else if (Platform.OS === 'web') {
      return 'http://localhost:3000/api'; // Web
    }
    // Physical Device - เปลี่ยนเป็น IP ของเครื่อง dev
    return 'http://192.168.1.10:3000/api'; // 👈 เปลี่ยนตรงนี้
  }
  // Production
  return 'https://your-api.com/api'; // 👈 เปลี่ยนตรงนี้
};
```

### 2. เปิดใช้งาน Token Authentication (Optional)

Uncomment code ใน `api.ts`:

```typescript
// Request Interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📝 การใช้งานพื้นฐาน

### 1️⃣ Import API instance

```typescript
import api from '@/app/service/api';
// หรือ
import { api } from '@/app/service/api';
```

### 2️⃣ GET Request

```typescript
// ตัวอย่าง: ดึงข้อมูล user
const getUser = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

### 3️⃣ POST Request

```typescript
// ตัวอย่าง: Login
const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // เก็บ token
    await AsyncStorage.setItem('auth_token', response.data.token);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### 4️⃣ PUT/PATCH Request

```typescript
// ตัวอย่าง: อัปเดตโปรไฟล์
const updateProfile = async (userId: string, data: any) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### 5️⃣ DELETE Request

```typescript
// ตัวอย่าง: ลบ item
const deleteItem = async (itemId: string) => {
  try {
    await api.delete(`/items/${itemId}`);
  } catch (error) {
    throw error;
  }
};
```

---

## 🎯 ตัวอย่าง Services

### Auth Service (Login Component)

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import api, { getErrorMessage } from '@/app/service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // เรียก API
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // เก็บ token
      await AsyncStorage.setItem('auth_token', response.data.data.token);
      
      // Navigate to home
      router.replace('/(tab)/home');
      
    } catch (error) {
      Alert.alert('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>{loading ? 'Loading...' : 'Log In'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Register Service

```typescript
// app/(auth)/register.tsx
const handleRegister = async () => {
  try {
    setLoading(true);
    
    const response = await api.post('/auth/register', {
      name,
      email,
      phone,
      password,
    });

    // เก็บ token
    await AsyncStorage.setItem('auth_token', response.data.data.token);
    
    // Navigate to choose preference
    router.push('/(auth)/choose-preference');
    
  } catch (error) {
    Alert.alert('Registration Failed', getErrorMessage(error));
  } finally {
    setLoading(false);
  }
};
```

### OTP Verification

```typescript
// app/(auth)/otp-verify.tsx
const verifyOTP = async (otp: string) => {
  try {
    setLoading(true);
    
    const response = await api.post('/auth/verify-otp', {
      email,
      otp,
    });

    if (response.data.data.verified) {
      Alert.alert('Success', 'OTP verified successfully');
      router.push('/(tab)/home');
    }
    
  } catch (error) {
    Alert.alert('Verification Failed', getErrorMessage(error));
  } finally {
    setLoading(false);
  }
};

const resendOTP = async () => {
  try {
    await api.post('/auth/request-otp', { email });
    Alert.alert('Success', 'OTP sent to your email');
  } catch (error) {
    Alert.alert('Error', getErrorMessage(error));
  }
};
```

### Upload Image

```typescript
// Upload profile picture
import { uploadService } from '@/app/service/apiExamples';

const uploadProfilePicture = async (imageUri: string) => {
  try {
    setUploading(true);
    
    const imageUrl = await uploadService.uploadImage(imageUri, 'profile');
    
    // อัปเดต profile ด้วย URL ใหม่
    await api.put(`/users/${userId}`, {
      profileImage: imageUrl,
    });
    
    Alert.alert('Success', 'Profile picture updated');
    
  } catch (error) {
    Alert.alert('Upload Failed', getErrorMessage(error));
  } finally {
    setUploading(false);
  }
};
```

---

## 🚨 Error Handling

### แบบพื้นฐาน

```typescript
import { getErrorMessage, isNetworkError } from '@/app/service/api';

try {
  const response = await api.get('/data');
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message);
}
```

### แบบละเอียด

```typescript
import { isNetworkError } from '@/app/service/api';
import { isAxiosError } from 'axios';

try {
  const response = await api.post('/auth/login', data);
} catch (error) {
  if (isNetworkError(error)) {
    // ไม่มี internet หรือเซิร์ฟเวอร์ไม่ตอบสนง
    Alert.alert('Network Error', 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
  } else if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    switch (status) {
      case 400:
        Alert.alert('Invalid Input', message);
        break;
      case 401:
        Alert.alert('Unauthorized', 'กรุณาเข้าสู่ระบบใหม่');
        // Logout และ redirect to login
        break;
      case 404:
        Alert.alert('Not Found', 'ไม่พบข้อมูล');
        break;
      case 500:
        Alert.alert('Server Error', 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
        break;
      default:
        Alert.alert('Error', message || 'เกิดข้อผิดพลาด');
    }
  }
}
```

### Custom Hook สำหรับ API Calls

```typescript
// hooks/useApi.ts
import { useState } from 'react';
import { getErrorMessage } from '@/app/service/api';

export function useApi<T>(apiFunc: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc();
      setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// การใช้งาน
const { data, loading, error, execute } = useApi(() => 
  api.get('/users/me')
);

useEffect(() => {
  execute();
}, []);
```

---

## ✅ Best Practices

### 1. สร้าง Service แยกตาม Feature

```typescript
// services/authService.ts
import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// services/userService.ts
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};
```

### 2. ใช้ TypeScript Types

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};
```

### 3. Centralize Error Messages

```typescript
// constants/errorMessages.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่',
  SERVER_ERROR: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
};
```

### 4. Loading State Management

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.get('/data');
    // handle data
  } finally {
    setLoading(false); // ใช้ finally เพื่อให้แน่ใจว่า loading จะถูกปิด
  }
};
```

---

## 🔧 Environment Variables (Optional)

สร้างไฟล์ `.env`:

```env
# .env
API_BASE_URL_DEV=http://192.168.1.10:3000/api
API_BASE_URL_PROD=https://your-production-api.com/api
```

ใน `api.ts`:

```typescript
import Constants from 'expo-constants';

const BASE_URL = __DEV__
  ? Constants.expoConfig?.extra?.apiUrlDev || 'http://localhost:3000/api'
  : Constants.expoConfig?.extra?.apiUrlProd;
```

---

## 📞 ติดต่อ / ช่วยเหลือ

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ console logs (เปิด `__DEV__` mode)
2. ตรวจสอบ Base URL ว่าถูกต้อง
3. ทดสอบ API ด้วย Postman ก่อน
4. ตรวจสอบ CORS settings บน backend (ถ้าทดสอบบน web)

---

## 🎉 สรุป

ไฟล์สำคัญที่สร้างแล้ว:
- ✅ `app/service/api.ts` - Axios instance หลัก
- ✅ `app/service/apiExamples.ts` - ตัวอย่าง services
- ✅ `app/service/API_USAGE.md` - คู่มือนี้

### ขั้นตอนต่อไป:
1. แก้ Base URL ใน `api.ts`
2. สร้าง services ตาม feature ของคุณ
3. Uncomment AsyncStorage code (ถ้าต้องการใช้ token)
4. ทดสอบการเรียก API จริง

Happy Coding! 🚀
