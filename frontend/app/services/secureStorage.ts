import * as SecureStore from 'expo-secure-store';

const KEYS = {
  OTP_SESSION_TOKEN: 'otp_session_token',
  OTP_SESSION_EXPIRES: 'otp_session_expires',
  VERIFICATION_TOKEN: 'verification_token',
  USER_TEMP_DATA: 'user_temp_data',
};

export class SecureStorage {
  
  // บันทึก OTP Session Token
  static async saveOTPSession(token: string, expiresIn: number) {
    try {
      const expiresAt = Date.now() + expiresIn * 1000;
      
      await SecureStore.setItemAsync(KEYS.OTP_SESSION_TOKEN, token);
      await SecureStore.setItemAsync(
        KEYS.OTP_SESSION_EXPIRES,
        expiresAt.toString()
      );
      
      return true;
    } catch (error) {
      console.error('Error saving OTP session:', error);
      return false;
    }
  }

  // ดึง OTP Session Token
  static async getOTPSessionToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.OTP_SESSION_TOKEN);
      const expiresAt = await SecureStore.getItemAsync(KEYS.OTP_SESSION_EXPIRES);

      if (!token || !expiresAt) {
        return null;
      }

      // เช็คว่าหมดอายุหรือยัง
      if (Date.now() > parseInt(expiresAt)) {
        await this.clearOTPSession();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting OTP session:', error);
      return null;
    }
  }

  // เช็คว่า OTP Session หมดอายุหรือยัง
  static async isOTPSessionExpired(): Promise<boolean> {
    try {
      const expiresAt = await SecureStore.getItemAsync(KEYS.OTP_SESSION_EXPIRES);
      
      if (!expiresAt) {
        return true;
      }

      return Date.now() > parseInt(expiresAt);
    } catch (error) {
      console.error('Error checking OTP session:', error);
      return true;
    }
  }

  // ลบ OTP Session
  static async clearOTPSession() {
    try {
      await SecureStore.deleteItemAsync(KEYS.OTP_SESSION_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.OTP_SESSION_EXPIRES);
      return true;
    } catch (error) {
      console.error('Error clearing OTP session:', error);
      return false;
    }
  }

  // ==================== Verification Token ====================

  // บันทึก Verification Token (หลัง verify OTP สำเร็จ)
  static async saveVerificationToken(token: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(KEYS.VERIFICATION_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving verification token:', error);
      return false;
    }
  }

  // ดึง Verification Token
  static async getVerificationToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.VERIFICATION_TOKEN);
    } catch (error) {
      console.error('Error getting verification token:', error);
      return null;
    }
  }

  // ลบ Verification Token
  static async clearVerificationToken() {
    try {
      await SecureStore.deleteItemAsync(KEYS.VERIFICATION_TOKEN);
      return true;
    } catch (error) {
      console.error('Error clearing verification token:', error);
      return false;
    }
  }

  // ==================== Temporary User Data ====================

  // บันทึกข้อมูล User ชั่วคราว (ไม่ sensitive)
  static async saveTempUserData(data: any) {
    try {
      await SecureStore.setItemAsync(
        KEYS.USER_TEMP_DATA,
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.error('Error saving temp user data:', error);
      return false;
    }
  }

  // ดึงข้อมูล User ชั่วคราว
  static async getTempUserData(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync(KEYS.USER_TEMP_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting temp user data:', error);
      return null;
    }
  }

  // ลบข้อมูล User ชั่วคราว
  static async clearTempUserData() {
    try {
      await SecureStore.deleteItemAsync(KEYS.USER_TEMP_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing temp user data:', error);
      return false;
    }
  }

  // ==================== Clear All ====================

  // ลบข้อมูลทั้งหมด
  static async clearAll() {
    try {
      await this.clearOTPSession();
      await this.clearVerificationToken();
      await this.clearTempUserData();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}