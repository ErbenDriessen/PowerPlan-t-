// powerplant/app/(tabs)/_layout.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";

const ACTIVE = "#9BCE5C"; // primary-soft (theme green)
const INACTIVE = "rgba(255,255,255,0.55)";
const ICON_SIZE = 22;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 68,
          paddingTop: 8,
          paddingBottom: 6,
          borderRadius: 32,
          backgroundColor: "rgba(18,30,22,0.65)",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          overflow: "hidden",
          elevation: 8,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={40}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Vandaag",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          tabBarLabel: "Planning",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          tabBarLabel: "Mijn boom",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? "tree" : "tree-outline"}
              size={ICON_SIZE + 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rust"
        options={{
          tabBarLabel: "Rust",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "moon" : "moon-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Meer",
          tabBarIcon: ({ color }) => (
            <Ionicons name="ellipsis-horizontal" size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
