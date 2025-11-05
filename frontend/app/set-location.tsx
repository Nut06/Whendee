import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function RedirectSetLocation() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(main)/location/set-location");
  }, [router]);
  return null;
}
