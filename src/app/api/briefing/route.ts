import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const now = new Date();
  const hour = now.getHours();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[now.getDay()];

  const items: { icon: string; text: string; type: string }[] = [];

  // School status (Open 8am / Closed)
  const openHour = 8;
  const closingHour = 17;
  const closingMinute = 30;
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const currentMinutes = hour * 60 + now.getMinutes();
  const openMinutes = openHour * 60;
  const closeMinutes = closingHour * 60 + closingMinute;
  const isOpen = isWeekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  items.push({
    icon: "clock",
    text: isOpen ? "Open 8am" : "Closed",
    type: "school_status",
  });

  // Today's meal
  const mealKnowledge = await prisma.knowledge.findFirst({
    where: { organizationId: user.organizationId, category: "daily_meal" },
  });
  if (mealKnowledge?.metadata && typeof mealKnowledge.metadata === "object") {
    const meta = mealKnowledge.metadata as Record<string, string>;
    const todayMeal = meta[dayName];
    if (todayMeal) {
      items.push({ icon: "utensils", text: `Today's lunch: ${todayMeal}`, type: "meal" });
    }
  }

  // Hours and pickup reminder
  const hoursKnowledge = await prisma.knowledge.findFirst({
    where: { organizationId: user.organizationId, category: "hours" },
  });
  if (hoursKnowledge) {
    const minutesUntilClose = closeMinutes - currentMinutes;

    if (minutesUntilClose > 0 && minutesUntilClose <= 30) {
      items.push({
        icon: "clock",
        text: `Heads up: Pickup closes in ${minutesUntilClose} minutes!`,
        type: "urgent",
      });
    } else if (hour < 12) {
      items.push({ icon: "clock", text: "Pickup by 5:30 PM today", type: "info" });
    }
  }

  // Upcoming events
  const eventsKnowledge = await prisma.knowledge.findFirst({
    where: { organizationId: user.organizationId, category: "upcoming_event" },
  });
  if (eventsKnowledge?.metadata && typeof eventsKnowledge.metadata === "object") {
    const meta = eventsKnowledge.metadata as { events?: { name: string; date: string }[] };
    if (meta.events) {
      const upcoming = meta.events.filter((e) => {
        const eventDate = new Date(e.date);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 5;
      });
      for (const event of upcoming.slice(0, 1)) {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const when = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;
        items.push({
          icon: "calendar",
          text: `${event.name} ${when}`,
          type: "event",
        });
      }
    }
  }

  return NextResponse.json({ items });
}
