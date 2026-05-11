// powerplant/app/index.tsx
import { Redirect } from "expo-router";
import { useUserStore } from "../stores/useUserStore";

export default function Index() {
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  return <Redirect href={hasOnboarded ? "/(tabs)/home" : "/onboarding"} />;
}
