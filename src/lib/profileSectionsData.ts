export interface SectionData {
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    badge?: string;
  }>;
}

export const PROFILE_SECTIONS_DATA: Record<string, SectionData> = {
  history: {
    title: "Call & Study History",
    description:
      "A record of all your past study sessions and peer calls on Vitril.",
    items: [
      {
        id: "1",
        title: "Advanced Calculus Review",
        subtitle: "Hosted • 4 participants",
        date: "2 hrs ago",
        badge: "+45 mins",
      },
      {
        id: "2",
        title: "Physics Lab Prep",
        subtitle: "Attended • Initiated by Sarah",
        date: "Yesterday",
        badge: "+60 mins",
      },
      {
        id: "3",
        title: "Rust Edge-AI System Architecture",
        subtitle: "Hosted • 1-on-1 Session",
        date: "3 days ago",
        badge: "+120 mins",
      },
    ],
  },
  settings: {
    title: "App Settings",
    description: "Manage your account preferences and app behaviors.",
    items: [
      {
        id: "s1",
        title: "Dark Mode Appearance",
        subtitle: "Currently set to System Default",
      },
      {
        id: "s2",
        title: "Data Usage & Caching",
        subtitle: "Clear local Stream Chat cache",
      },
    ],
  },
  analytics: {
    title: "Performance Analytics",
    description: "Deep dive into your study focus and peer ratings.",
    items: [
      {
        id: "a1",
        title: "Average Peer Rating",
        subtitle: "Based on 142 completed sessions",
        badge: "4.9 ★",
      },
      {
        id: "a2",
        title: "Peak Study Hours",
        subtitle: "You are most active between 8 PM - 11 PM",
      },
    ],
  },
};
