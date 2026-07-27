import { authProviders, pills } from "@/constants/index";
import useSocialAuth from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthScreen = () => {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const isLoading = loadingStrategy !== null;
  const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DGso";

  return (
    <View className="flex-1 bg-background">
      <View className="absolute inset-0">
        <LinearGradient
          colors={["#0F0E17", "#1A1A2E", "#2D1B69", "#1A1A2E", "#0F0E17"]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <SafeAreaView className="flex-1 justify-between">
        {/* Top section: logo + hero — takes remaining space, shrinks if needed */}
        <View className="flex-1 justify-center">
          <View className="items-center pt-4 pb-2">
            <View className="w-16 h-16 rounded-[20px] bg-primary/15 items-center justify-center border border-primary/20">
              <Ionicons name="school" size={30} color="#A29BFE" />
            </View>

            <Text className="text-3xl font-extrabold text-foreground tracking-light mt-4 font-mono">
              Vitril.XYZ
            </Text>

            <Text className="text-foreground-muted text-[15px] mt-1.5 tracking-wide">
              Learn together, grow together
            </Text>
          </View>

          {/* Hero image now flexes instead of a fixed height */}
          <View className="items-center mt-2 z-0 relative flex-1">
            <Image
              source={require("@/assets/images/authe.png")}
              placeholder={{ blurhash }}
              style={{
                width: "70%", // however wide you actually want the picture to appear
                aspectRatio: 3 / 4, // match the real width:height ratio of your source image
                alignSelf: "center",
              }}
              contentFit="contain"
              transition={1000}
            />

            <View
              className="absolute bottom-4 right-10 rounded-2xl p-1.5 shadow-2xl z-20"
              style={{ transform: [{ rotate: "8deg" }] }}
            >
              <Image
                source={require("@/assets/images/authr.png")}
                placeholder={{ blurhash }}
                style={{
                  width: 120,
                  aspectRatio: 4 / 5, // match this image's real ratio too
                  borderRadius: 12,
                }}
                contentFit="contain"
                transition={1000}
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-center gap-2 px-6 mt-3 z-10">
            {pills.map((chip) => (
              <View
                key={chip.label}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${chip.bg}`}
              >
                <Ionicons name={chip.icon} size={13} color={chip.color} />
                <Text className="text-foreground-muted text-xs font-semibold tracking-wide">
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom section: fixed content, doesn't flex */}
        <View className="px-8 pb-4">
          <View className="flex-row items-center gap-3 my-4">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-foreground-subtle text-xs font-medium tracking-widest uppercase">
              Continue With
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="flex-row justify-center items-center gap-4 mb-4">
            {authProviders.map((provider) => {
              const isThisProviderLoading = loadingStrategy === provider.id;
              return (
                <Pressable
                  key={provider.id}
                  className={`size-16 rounded-2xl items-center justify-center active:scale-95 shadow-lg ${provider.bgClass} ${provider.shadowClass}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  accessibilityRole="button"
                  accessibilityLabel={`Continue with ${provider.name}`}
                  disabled={isLoading}
                  onPress={() => !isLoading && handleSocialAuth(provider.id)}
                >
                  {isThisProviderLoading ? (
                    <ActivityIndicator size="small" color="#6c5ce7" />
                  ) : provider.name === "Google" ? (
                    <Image
                      source={provider.logo}
                      style={[{ width: 24, height: 24 }, provider.imageStyle]}
                      contentFit="contain"
                    />
                  ) : (
                    <Ionicons
                      name={
                        provider.name === "Apple" ? "logo-apple" : "logo-github"
                      }
                      size={24}
                      color="#FFFFFE"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text className="text-foreground-subtle text-[11px] leading-4">
            By continuing, you agree to our{" "}
            <Text className="text-primary-light">Terms of Service</Text> and{" "}
            <Text className="text-primary-light">Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "orange",
  },
});

export default AuthScreen;
