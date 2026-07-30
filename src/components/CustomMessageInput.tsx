import { useAppContext } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  View,
} from "react-native";
import { TextComposerState } from "stream-chat";
import {
  AutoCompleteInput,
  StartAudioRecordingButton, // <-- Stream's Native Mic Button
  useMessageComposer,
  useMessageInputContext,
  useStateStore,
} from "stream-chat-expo";

const textSelector = (state: TextComposerState) => ({
  text: state.text,
});

export const CustomInput = () => {
  // --- STREAM CONTEXTS ---
  const { sendMessage, openAttachmentPicker } = useMessageInputContext();
  const { textComposer } = useMessageComposer();
  const { text } = useStateStore(textComposer.state, textSelector);
  const { channel } = useAppContext();
  const router = useRouter();

  const { height: screenHeight } = Dimensions.get("window");

  // --- ACTION MENU ANIMATION (Video & Call Only) ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const toggleActionMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      friction: 7,
      tension: 40,
      useNativeDriver: false,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const menuHeight = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 130], // Reduced height since we removed the 3rd mic button
  });

  const contentOpacity = menuAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const spin = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // --- CALL HANDLERS ---
  const handleVideoCall = () => {
    router.push({
      pathname: "/call/[callId]",
      params: { callId: channel?.id },
    });
  };

  const handleAudioCall = () => {
    // Add audio call route integration here
  };

  return (
    <View className="px-4 py-3 bg-white relative">
      {/* Floating Action Menu Backdrop */}
      {isMenuOpen && (
        <Pressable
          style={{
            position: "absolute",
            top: -screenHeight,
            bottom: 0,
            left: -1000,
            right: -1000,
            zIndex: 5,
          }}
          onPress={toggleActionMenu}
        />
      )}

      {/* Animated Floating Action Menu (Video & Call) */}
      <Animated.View
        style={{ height: menuHeight, width: 48 }}
        className="absolute right-4 bottom-16 bg-gray-100 rounded-full shadow-sm z-10 overflow-hidden flex-col justify-end pb-1"
      >
        <Animated.View
          style={{
            opacity: contentOpacity,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Pressable
            className="h-10 w-10 items-center justify-center mb-2 bg-white rounded-full shadow-sm"
            onPress={() => {
              handleVideoCall();
              toggleActionMenu();
            }}
          >
            <Ionicons name="videocam-outline" size={20} color="#555" />
          </Pressable>

          <Pressable
            className="h-10 w-10 items-center justify-center mb-2 bg-white rounded-full shadow-sm"
            onPress={() => {
              handleAudioCall();
              toggleActionMenu();
            }}
          >
            <Ionicons name="call-outline" size={20} color="#555" />
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={toggleActionMenu}
          className="h-10 w-10 items-center justify-center self-center"
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name={!isMenuOpen ? "chevron-up" : "chevron-down"}
              size={24}
              color="#555"
            />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Main Input Pill */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1 border border-gray-200 min-h-[48px]">
        
        <Pressable
          onPress={openAttachmentPicker}
          className="items-center justify-center w-10 h-10 ml-1"
        >
          <Ionicons name="add-circle" size={26} color="#888" />
        </Pressable>

        <View className="flex-1 ml-2 justify-center">
          <AutoCompleteInput />
        </View>

        {/* WHATSAPP LOGIC: Swap Send and Mic based on typing state */}
        {text ? (
          <Pressable
            onPress={sendMessage}
            className="h-9 w-9 rounded-full items-center justify-center ml-2 mr-1 bg-yellow-500"
          >
            <Ionicons name="send" size={16} color="white" className="ml-1" />
          </Pressable>
        ) : (
          <View className="ml-2 mr-1 items-center justify-center">
            {/* Stream handles permissions, holding, swiping, and uploading natively here */}
            <StartAudioRecordingButton />
          </View>
        )}
      </View>
    </View>
  );
};