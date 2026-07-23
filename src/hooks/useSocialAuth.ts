import { useAlertActions } from "@/context/AlertContext";
import { isClerkAPIResponseError, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const providerName = (strategy: string) =>
  strategy === "oauth_google"
    ? "Google"
    : strategy === "oauth_apple"
      ? "Apple"
      : "GitHub";

const useSocialAuth = () => {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const { show } = useAlertActions(); // action-only subscription -> no re-render on alert open/close

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple" | "oauth_github",
  ) => {
    if (loadingStrategy) return; // guard against concurrent flows
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/"),
      });

      // If this triggers now, it means the user manually closed the browser
      if (!createdSessionId || !setActive) {
        show(
          "Sign-in incomplete",
          `${providerName(strategy)} sign-in did not complete. Please try again.`,
          "error",
        );
        return; // <- was missing: without this, we'd fall through to setActive with bad args
      }

      await setActive({ session: createdSessionId });
    } catch (error) {
      // console.error("Error in social auth", error);
      // console.error("Auth error details:", JSON.stringify(error, null, 2));
      if (isClerkAPIResponseError(error)) {
        // Now TypeScript knows that `error.errors` exists!
        if (error.errors[0]?.code === "session_exists") {
          console.log("Clerk session already exists in browser.");

          show(
            "Already signed in",
            "You are already authenticated. Syncing your session...",
            "success",
          );

          // router.replace("/");
          return;
        }
      }

      // console.error("Auth error details:", JSON.stringify(error, null, 2));
      console.error("Auth error details:", JSON.stringify(error, null, 2));
      show(
        "Error occurred",
        `Failed to sign in with ${providerName(strategy)}. Please try again.`,
        "error",
      );
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { handleSocialAuth, loadingStrategy };
};

export default useSocialAuth;
