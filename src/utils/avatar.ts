const AVATAR_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#EC4899",
  "#F97316",
  "#059669",
  "#0891B2",
  "#DC2626",
  "#4338CA",
  "#0F766E",
  "#7C2D12",
];

export const getInitials = (name: string) => {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const stringToColor = (text: string) => {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
