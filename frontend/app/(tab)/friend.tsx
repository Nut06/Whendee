import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RedirectFriendTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(main)/friends');
  }, [router]);
  return null;
}