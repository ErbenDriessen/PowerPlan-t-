// powerplant/app/index.tsx
import { Redirect } from "expo-router";
import { useUserStore } from "../stores/useUserStore";

export default function Index() {
  // Treat the user as onboarded if either the explicit flag is set, OR they
  // already have a name on record (defensive: if `hasOnboarded` ever gets
  // cleared by a migration or storage glitch, we don't loop them back
  // through onboarding when they've clearly already filled it in).
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const name = useUserStore((s) => s.name);
  const onboarded = hasOnboarded || name.length > 0;
  return <Redirect href={onboarded ? "/(tabs)/home" : "/onboarding"} />;
}
