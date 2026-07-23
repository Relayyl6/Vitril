// src/app/search.tsx
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={{ padding: 16 }}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>
      <TextInput
        autoFocus
        placeholder="Search..."
        style={styles.input}
        onSubmitEditing={() => {/* run your search */}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});