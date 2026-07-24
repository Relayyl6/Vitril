import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chats = () => {
  return (
    <SafeAreaView>
      <Text>Chats</Text>
      {/* <Button
        title="Try!"
        onPress={() => {
          Sentry.captureException(new Error("First error"));
        }}
      /> */}
    </SafeAreaView>
  );
};

export default Chats;
