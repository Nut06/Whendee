import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function RedirectPlan() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(main)/plan");
  }, [router]);
  return null;
}
