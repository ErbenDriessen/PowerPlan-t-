// powerplant/components/buttons.tsx
import { Pressable, PressableProps, Text } from "react-native";

type BtnProps = PressableProps & { label: string; className?: string };

export function PrimaryButton({ label, className = "", ...rest }: BtnProps) {
  return (
    <Pressable
      {...rest}
      className={`bg-primary rounded-3xl py-4 px-5 active:opacity-80 ${className}`}
    >
      <Text className="text-white text-center font-extrabold text-base">{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, className = "", ...rest }: BtnProps) {
  return (
    <Pressable
      {...rest}
      className={`bg-white/10 border border-white/15 rounded-3xl py-4 px-5 active:opacity-80 ${className}`}
    >
      <Text className="text-white text-center font-extrabold text-base">{label}</Text>
    </Pressable>
  );
}

export function SoftButton({ label, className = "", ...rest }: BtnProps) {
  return (
    <Pressable
      {...rest}
      className={`bg-white/10 border border-white/15 rounded-2xl py-2.5 px-3.5 active:opacity-80 ${className}`}
    >
      <Text className="text-white text-center font-bold text-xs">{label}</Text>
    </Pressable>
  );
}
