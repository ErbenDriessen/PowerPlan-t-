// powerplant/components/GlassCard.tsx
import { View, ViewProps } from "react-native";

type Variant = "default" | "warm" | "green" | "strong";

const STYLES: Record<Variant, string> = {
  default: "bg-white/[0.07] border border-white/10 rounded-3xl",
  warm: "bg-yellow/10 border border-yellow/20 rounded-3xl",
  green: "bg-primary-soft/10 border border-primary-soft/25 rounded-3xl",
  strong: "bg-white/10 border border-white/15 rounded-[28px]",
};

export function GlassCard({
  variant = "default",
  className = "",
  children,
  ...rest
}: ViewProps & { variant?: Variant }) {
  return (
    <View className={`${STYLES[variant]} ${className}`} {...rest}>
      {children}
    </View>
  );
}
