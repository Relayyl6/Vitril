export function getGreetingForHour(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 16) return "Good Afternoon";
  if (hour < 21) return "Good evening";
  return "Good Night";
}
