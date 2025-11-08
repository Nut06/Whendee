export type UserPreferenceValue = string | number | boolean | null;

export interface UserPreference {
  key: string;
  value: UserPreferenceValue;
}

export interface User {
  id: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreference[];
}
