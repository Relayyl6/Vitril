import EmptyState from "@/components/EmptyState";
import { studyBuddyTheme } from "@/lib/theme";
import { useUser } from "@clerk/expo";
import type { UserResource } from "@clerk/types";
import * as Sentry from "@sentry/react-native";
import React, { useEffect, useRef } from "react";
import {
  Chat,
  OverlayProvider,
  useCreateChatClient,
  WithComponents,
} from "stream-chat-expo";
import FullScreenLoader from "./FullScreenLoader";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

const syncUserToStream = async (user: UserResource) => {
  try {
    await fetch("/api/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        name:
          user.fullName ??
          user.username ??
          user.emailAddresses[0].emailAddress.split("@")[0],
        image: user.imageUrl,
      }),
    });
  } catch (e) {
    console.error("Failed to sync user to Stream", e);
  }
};

const ChatClient = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserResource;
}) => {
  const syncedRef = useRef(false);
  useEffect(() => {
    if (!syncedRef.current) {
      syncUserToStream(user);
      syncedRef.current = true; // was declared but never set — see note below
    }
  }, [user]);

  const tokenProvider = async () => {
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      return data.token;
    } catch (e) {
      Sentry.logger.info("Failed to get stream chat token", {
        userId: user.id,
        message: e instanceof Error ? e.message : String(e),
      });
      Sentry.captureException(e, {
        extra: { userId: user.id, hook: "tokenProvider" },
      });
    }
  };

  const chatClient = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: {
      id: user.id,
      name:
        user.fullName ??
        user.username ??
        user.emailAddresses[0].emailAddress.split("@")[0],
      image: user.imageUrl,
    },
    tokenOrProvider: tokenProvider,
  });

  if (!chatClient)
    return <FullScreenLoader message="Loading chat (Stream) ..." />;

  return (
    <WithComponents
      overrides={{
        EmptyStateIndicator: () => (
          <EmptyState
            icon="book-outline"
            title="No messages yet"
            subtitle="Start a study conversation"
          />
        ),
      }}
    >
      <OverlayProvider>
        <Chat client={chatClient} style={studyBuddyTheme}>
          {children}
        </Chat>
      </OverlayProvider>
    </WithComponents>
  );
};

export const ChatWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <FullScreenLoader message="Loading Chat (Clerk) ..." />;
  if (!user) return <>{children}</>;

  return <ChatClient user={user}>{children}</ChatClient>;
};
