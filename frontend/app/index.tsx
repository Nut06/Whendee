import { Redirect } from "expo-router";
export default function Index() {
  return <Redirect href="/(main)/plan" />; // เข้าแท็บ Home (plan) อัตโนมัติ
}
