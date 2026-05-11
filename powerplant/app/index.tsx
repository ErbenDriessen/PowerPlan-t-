import { ScrollView, Text, View } from "react-native";
import { DuskBackground } from "../components/DuskBackground";
import { GlassCard } from "../components/GlassCard";
import { GhostButton, PrimaryButton, SoftButton } from "../components/buttons";
import { Chip } from "../components/Chip";

export default function Index() {
  return (
    <View className="flex-1">
      <DuskBackground />
      <ScrollView className="flex-1 px-6 pt-24" contentContainerClassName="gap-4">
        <GlassCard className="p-5">
          <Text className="text-white font-extrabold text-lg">Glass card</Text>
        </GlassCard>
        <GlassCard variant="warm" className="p-5">
          <Text className="text-white font-extrabold text-lg">Warm card</Text>
        </GlassCard>
        <PrimaryButton label="Primary" onPress={() => {}} />
        <GhostButton label="Ghost" onPress={() => {}} />
        <SoftButton label="Soft" onPress={() => {}} />
        <View className="flex-row gap-2 flex-wrap">
          <Chip label="Minder stress" selected onPress={() => {}} />
          <Chip label="Meer bewegen" selected={false} onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}
