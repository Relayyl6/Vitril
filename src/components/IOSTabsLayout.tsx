import { TabBarContext } from "@/context/TabBarContext";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import MiniAccessory, { AccessoryState } from "./MiniAccessory";

export default function IOSTabsLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const [accessoryState, setAccessoryState] = useState<AccessoryState>({
    type: "none",
  });

  // Automatically hide the tab bar whenever the keyboard opens, on any screen.
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => {
      setIsTabBarHidden(true);
    });
    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      setIsTabBarHidden(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <TabBarContext value={{ setIsTabBarHidden, setAccessoryState }}>
      <NativeTabs hidden={isTabBarHidden}>
        <NativeTabs.BottomAccessory>
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
        </NativeTabs.BottomAccessory>

        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf="message.fill"
            selectedColor={"#6C5CE7"}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="explore">
          <NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
          <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="safari.fill" selectedColor={"#6C5CE7"} />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf="person.crop.circle.fill"
            selectedColor={"#6C5CE7"}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="search" role="search">
          <NativeTabs.Trigger.Icon
            sf="magnifyingglass"
            selectedColor={"#6C5CE7"}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
