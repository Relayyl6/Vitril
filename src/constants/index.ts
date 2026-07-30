import { COLORS } from "@/lib/theme";

export const pills = [
  {
    icon: "videocam" as const,
    label: "Video Calls",
    color: "#A29BFE",
    bg: "bg-primary/12 border-primary/20",
  },
  {
    icon: "chatbubbles" as const,
    label: "Study Rooms",
    color: "#FF6B6B",
    bg: "bg-accent/12 border-accent/20",
  },
  {
    icon: "people" as const,
    label: "Find Partners",
    color: "#00B894",
    bg: "bg-accent-secondary/12 border-accent-secondary/20",
  },
];

export const authProviders = [
  {
    id: "oauth_google" as const,
    name: "Google",
    logo: require("@/assets/images/google.png"),
    bgClass: "bg-transparent border border-[#2D1B69]",
    shadowClass: "shadow-white/10",
    imageStyle: {},
  },
  {
    id: "oauth_apple" as const,
    name: "Apple",
    logo: require("@/assets/images/apple.png"),
    bgClass: "bg-transparent border border-[#2D1B69]",
    shadowClass: "shadow-white/10",
    imageStyle: { tintColor: "#000000" },
  },
  {
    id: "oauth_github" as const,
    name: "GitHub",
    logo: require("@/assets/images/github.png"),
    bgClass: "bg-transparent border border-[#2D1B69]",
    shadowClass: "shadow-white/10",
    imageStyle: { tintColor: "#24292e" },
  },
];

export const MENU_ITEMS = [
  {
    id: "notifications", // This matches app/profile/notifications.tsx
    icon: "notifications-outline", // Note: Ionicons uses "notifications-outline" with an 's'
    label: "Notifications",
    color: COLORS.primary,
  },
  {
    id: "saved-resources",
    icon: "bookmark-outline",
    label: "Saved Resources",
    color: COLORS.accent,
  },
  {
    id: "study-history",
    icon: "time-outline",
    label: "Study History",
    color: COLORS.accentSecondary,
  },
  {
    id: "settings",
    icon: "settings-outline",
    label: "Settings",
    color: COLORS.textMuted,
  },
];
