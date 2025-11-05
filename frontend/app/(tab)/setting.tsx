import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RedirectSettingTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(main)/settings');
  }, [router]);
  return null;
}