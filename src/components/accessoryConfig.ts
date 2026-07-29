// components/accessoryConfig.ts
import type { AccessoryState } from "./MiniAccessory";

export const ACCESSORY_CONFIG: Record<
  AccessoryState["type"],
  { backgroundColor: string; autoDismissMs?: number }
> = {
  none: { backgroundColor: "transparent" },
  nowPlaying: { backgroundColor: "#F3F4F6" },
  activeCall: { backgroundColor: "#16A34A" },
  typing: { backgroundColor: "#1F2937", autoDismissMs: 5000 }, // 👈 auto-clear typing indicators
  draftReply: { backgroundColor: "#F3F4F6" },
};
