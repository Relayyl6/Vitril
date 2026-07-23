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
      {/* linear gradient background */}
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
        {/* Top section: logo + Hero */}
        <View>
          <View className="items-center pt-8 pb-2">
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

          <View className="items-center mt-4 z-0 relative w-full">
            <Image
              source={require("@/assets/images/authe.png")}
              placeholder={{ blurhash }}
              style={{ width: "100%", height: 450, alignSelf: "center" }} // Set width to 100% to span the screen edges
              contentFit="cover"
              transition={1000}
            />

            <View
              className="absolute bottom-6 right-10 rounded-2xl p-1.5 shadow-2xl z-20"
              style={{
                transform: [{ rotate: "8deg" }], // Adds a stylish askew angle to the float
              }}
            >
              <Image
                source={require("@/assets/images/authr.png")}
                placeholder={{ blurhash }}
                style={{ width: 160, height: 200, borderRadius: 12 }}
                contentFit="cover"
                transition={1000}
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-center gap-3 px-6 mt-5 z-10">
            {pills.map((chip) => (
              <View
                key={chip.label}
                className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${chip.bg}`}
              >
                <Ionicons name={chip.icon} size={14} color={chip.color} />
                <Text className="text-foreground-muted text-xs font-semibold tracking-wide">
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-8 pb-4">
          <View className="flex-row items-center gap-3 my-6">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-foreground-subtle text-xs font-medium tracking-widest uppercase">
              Continue With
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="flex-row justify-center items-center gap-4 mb-5">
            {authProviders.map((provider) => {
              const isThisProviderLoading = loadingStrategy === provider.id;

              return (
                <Pressable
                  key={provider.id}
                  className={`size-20 rounded-2xl items-center justify-center active:scale-95 shadow-lg ${provider.bgClass} ${provider.shadowClass}`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                  })}
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
                      style={[{ width: 28, height: 28 }, provider.imageStyle]}
                      contentFit="contain"
                    />
                  ) : (
                    <Ionicons
                      name={
                        provider.name === "Apple" ? "logo-apple" : "logo-github"
                      }
                      size={28}
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
