import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RedirectTabLayout() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(main)/home');
  }, [router]);
  return null;
}
