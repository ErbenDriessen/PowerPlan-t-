// powerplant/app/(tabs)/_layout.tsx
//
// Uses Material Top Tabs (with PagerView under the hood) so the user can
// swipe horizontally between tab screens. The visible tab bar is
// repositioned to the bottom and styled as a custom floating glass card
// that matches the rest of the app.
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import type { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { withLayoutContext } from "expo-router";
import { Pressable, Text, View } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const ACTIVE = "#9BCE5C";
const INACTIVE = "rgba(255,255,255,0.55)";
const ICON_SIZE = 22;

const TAB_META: Record<
  string,
  { label: string; render: (focused: boolean, color: string) => React.ReactNode }
> = {
  home: {
    label: "Vandaag",
    render: (focused, color) => (
      <Ionicons name={focused ? "home" : "home-outline"} size={ICON_SIZE} color={color} />
    ),
  },
  planning: {
    label: "Planning",
    render: (focused, color) => (
      <Ionicons
        name={focused ? "calendar" : "calendar-outline"}
        size={ICON_SIZE}
        color={color}
      />
    ),
  },
  tree: {
    label: "Mijn boom",
    render: (focused, color) => (
      <MaterialCommunityIcons
        name={focused ? "tree" : "tree-outline"}
        size={ICON_SIZE + 2}
        color={color}
      />
    ),
  },
  buddy: {
    label: "Buddy",
    render: (focused, color) => (
      <Ionicons
        name={focused ? "people" : "people-outline"}
        size={ICON_SIZE}
        color={color}
      />
    ),
  },
  rust: {
    label: "Rust",
    render: (focused, color) => (
      <Ionicons name={focused ? "moon" : "moon-outline"} size={ICON_SIZE} color={color} />
    ),
  },
  settings: {
    label: "Meer",
    render: (_focused, color) => (
      <Ionicons name="ellipsis-horizontal" size={ICON_SIZE} color={color} />
    ),
  },
};

function FloatingTabBar({ state, navigation }: MaterialTopTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 20,
        height: 68,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(18,30,22,0.65)",
        overflow: "hidden",
        flexDirection: "row",
        elevation: 8,
      }}
    >
      <BlurView
        tint="dark"
        intensity={40}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? ACTIVE : INACTIVE;
        const meta = TAB_META[route.name];
        if (!meta) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={meta.label}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 8,
              paddingBottom: 6,
              gap: 2,
            }}
          >
            {meta.render(focused, color)}
            <Text
              style={{
                color,
                fontSize: 10,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      // The pager handles the actual swipe; we render our floating bar instead.
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: false,
      }}
    >
      <MaterialTopTabs.Screen name="home" />
      <MaterialTopTabs.Screen name="planning" />
      <MaterialTopTabs.Screen name="tree" />
      <MaterialTopTabs.Screen name="buddy" />
      <MaterialTopTabs.Screen name="rust" />
      <MaterialTopTabs.Screen name="settings" />
    </MaterialTopTabs>
  );
}
