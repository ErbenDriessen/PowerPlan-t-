// powerplant/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

function tabIcon(label: string, focused: boolean) {
  return (
    <View className="items-center" style={{ paddingTop: 6 }}>
      <Text className={`text-[10px] font-bold ${focused ? "text-white" : "text-white/55"}`}>
        {label}
      </Text>
      <View
        className={`mt-1 w-1 h-1 rounded-full ${focused ? "bg-primary-soft" : "bg-transparent"}`}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          height: 60,
          borderRadius: 28,
          backgroundColor: "rgba(18,30,22,0.85)",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
        },
      }}
    >
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => tabIcon("Vandaag", focused) }} />
      <Tabs.Screen name="planning" options={{ tabBarIcon: ({ focused }) => tabIcon("Planning", focused) }} />
      <Tabs.Screen name="tree" options={{ tabBarIcon: ({ focused }) => tabIcon("Mijn boom", focused) }} />
      <Tabs.Screen name="rust" options={{ tabBarIcon: ({ focused }) => tabIcon("Rust", focused) }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => tabIcon("Meer", focused) }} />
    </Tabs>
  );
}
