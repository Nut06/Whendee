import { Redirect } from "expo-router";

export default function Index() {
  // const isLoggedIn = false; // mock, ไว้เชื่อมกับ auth state จริงทีหลัง
  // return isLoggedIn ? <Redirect href="/(main)/home" /> : <Redirect href="/login" />;
  return <Redirect href="/(main)/home" />;
}
