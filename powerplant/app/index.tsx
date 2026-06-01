// powerplant/app/index.tsx
import { Redirect } from "expo-router";
import { useUserStore } from "../stores/useUserStore";

export default function Index() {
  // Onboarded if EITHER the explicit flag is set, OR there's any sign of
  // earlier app use. The defensive fallbacks cover edge cases where the
  // `hasOnboarded` write didn't quite land (e.g. the persist write to
  // AsyncStorage hadn't flushed when the user killed the app right after
  // tapping "Klaar"). If you have a name, goals, points or a planted
  // forest, you've clearly used the app before — never re-onboard you.
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const name = useUserStore((s) => s.name);
  const goals = useUserStore((s) => s.goals);
  const points = useUserStore((s) => s.points);
  const bomenGeplant = useUserStore((s) => s.bomenGeplant);

  const onboarded =
    hasOnboarded ||
    name.length > 0 ||
    goals.length > 0 ||
    points > 0 ||
    bomenGeplant > 0;

  return <Redirect href={onboarded ? "/(tabs)/home" : "/onboarding"} />;
}
