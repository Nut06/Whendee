import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(main)/calendar");
  }, [router]);
  return null;
}