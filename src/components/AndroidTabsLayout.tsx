import MiniAccessory, { type AccessoryState } from "@/components/MiniAccessory";
import { AndroidAccessoryPlacementContext } from "@/context/AndroidAccessoryPlacementContext";
import { TabBarContext } from "@/context/TabBarContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const TAB_BAR_CONFIG = {
  enableSeparateSearchTab: true,
  // When the keyboard opens, should the accessory switch to compact "inline" mode
  // instead of disappearing entirely alongside the tab bar?
  useInlineAccessoryWhenKeyboardOpen: true,
};

const TAB_ROUTES = [
  {
    name: "index",
    label: "Chats",
    icon: "chatbubble" as const,
    iconOutline: "chatbubble-outline" as const,
  },
  {
    name: "explore",
    label: "Explore",
    icon: "compass" as const,
    iconOutline: "compass-outline" as const,
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person" as const,
    iconOutline: "person-outline" as const,
  },
];

const SEARCH_ROUTE = {
  name: "search",
  icon: "search" as const,
  iconOutline: "search-outline" as const,
};

interface TabItemProps {
  route: (typeof TAB_ROUTES)[number];
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const TabBarButton = ({
  route,
  isFocused,
  onPress,
  onLongPress,
}: TabItemProps) => {
  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isFocused ? "#6C5CE7" : "transparent", {
      duration: 220,
    }),
    transform: [
      { scale: withTiming(isFocused ? 1.05 : 1.0, { duration: 220 }) },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      android_ripple={{ color: "transparent" }}
    >
      <Animated.View style={[styles.iconContainer, animatedContainerStyle]}>
        <Ionicons
          name={isFocused ? route.icon : route.iconOutline}
          size={isFocused ? 34 : 24}
          color={isFocused ? "#FFF" : "#6B7280"}
        />
        {!isFocused && <Text style={styles.tabLabel}>{route.label}</Text>}
      </Animated.View>
    </Pressable>
  );
};

function SearchTabButton({
  isFocused,
  onPress,
}: {
  isFocused: boolean;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isFocused ? "#6C5CE7" : "#FFFFFF", {
      duration: 220,
    }),
  }));

  return (
    <Pressable onPress={onPress} style={styles.searchButtonWrapper}>
      <Animated.View style={[styles.searchButton, animatedStyle]}>
        <Ionicons
          name={isFocused ? SEARCH_ROUTE.icon : SEARCH_ROUTE.iconOutline}
          size={22}
          color={isFocused ? "#FFF" : "#6B7280"}
        />
      </Animated.View>
    </Pressable>
  );
}

const FloatingTabBar = ({ state, descriptors, navigation }: any) => {
  const router = useRouter();

  return (
    <View style={styles.tabRow}>
      {/* Grouped Tabs Pill */}
      <View style={[styles.tabBarContainer]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          if (options.href === null) return null;

          const isFocused = state.index === index;
          const targetRoute = TAB_ROUTES.find((r) => r.name === route.name) || {
            name: route.name,
            label: route.name,
            icon: "chats",
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };

          const onLongPress = () =>
            navigation.emit({ type: "tabLongPress", target: route.key });

          return (
            <TabBarButton
              key={route.key}
              route={targetRoute}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>

      {/* 3. Search Button sits right next to the tab pill inside the row */}
      {TAB_BAR_CONFIG.enableSeparateSearchTab && (
        <SearchTabButton
          isFocused={false}
          onPress={() => router.push("/search")}
        />
      )}
    </View>
  );
};

export default function AndroidTabsLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const [accessoryState, setAccessoryState] = useState<AccessoryState>({
    type: "none",
  });
  const [accessoryPlacement, setAccessoryPlacement] = useState<
    "regular" | "inline"
  >("regular");

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsTabBarHidden(true);
      if (TAB_BAR_CONFIG.useInlineAccessoryWhenKeyboardOpen) {
        setAccessoryPlacement("inline");
      }
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsTabBarHidden(false);
      setAccessoryPlacement("regular");
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <TabBarContext value={{ setIsTabBarHidden, setAccessoryState }}>
      <AndroidAccessoryPlacementContext value={accessoryPlacement}>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: "Chats", headerShown: false }}
          />
          <Tabs.Screen
            name="explore"
            options={{ title: "Explore", headerShown: false }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: "Profile", headerShown: false }}
          />
        </Tabs>

        {accessoryState.type !== "none" && (
          <View
            style={[
              styles.accessoryWrapper,
              accessoryPlacement === "inline" && styles.accessoryWrapperInline,
              isTabBarHidden && styles.accessoryWrapperKeyboardOpen,
            ]}
          >
            <MiniAccessory
              state={accessoryState}
              onTogglePlayback={() => {
                if (accessoryState.type === "nowPlaying") {
                  setAccessoryState({
                    ...accessoryState,
                    isPlaying: !accessoryState.isPlaying,
                  });
                }
              }}
              onDismiss={() => setAccessoryState({ type: "none" })}
            />
          </View>
        )}
      </AndroidAccessoryPlacementContext>
    </TabBarContext>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    // flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    // width: "85%",
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 12,
    // marginHorizontal: 12,
    gap: 20,
    elevation: 6,
  },
  tabButton: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    width: 54,
    height: 54,
  },
  tabLabel: { fontSize: 10, marginTop: 2, color: "#6B7280", fontWeight: "600" },
  accessoryWrapper: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  accessoryWrapperInline: {
    bottom: 20, // sits closer to where the tab bar would be, since it's compact now
  },
  accessoryWrapperKeyboardOpen: {
    bottom: 8, // hugs the keyboard edge instead of floating mid-screen
  },
  tabRow: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
  },
  searchButtonWrapper: { alignItems: "center", justifyContent: "center" },
  searchButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  separateSearchWrapper: { alignItems: "center", justifyContent: "center" },
});
