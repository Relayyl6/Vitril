import { getInitials, stringToColor } from "@/utils/avatar";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  name: string;
  image?: string;
  size?: number;
}

export default function Avatar({ name, image, size = 48 }: AvatarProps) {
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: stringToColor(name),
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.38,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "700",
  },
});
