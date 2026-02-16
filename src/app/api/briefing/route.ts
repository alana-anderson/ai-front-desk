import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  // Only parents see briefings
  if (user.role !== "parent") return NextResponse.json({ items: [] });

  const now = new Date();
  const hour = now.getHours();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[now.getDay()];

  const openHour = 8;
  const closingHour = 17;
  const closingMinute = 30;
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const currentMinutes = hour * 60 + now.getMinutes();
  const closeMinutes = closingHour * 60 + closingMinute;
  const openMinutes = openHour * 60;
  const isOpen = isWeekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const minutesUntilClose = closeMinutes - currentMinutes;
  const isNearClosing = isOpen && minutesUntilClose > 0 && minutesUntilClose <= 30;
  const isAfternoon = hour >= 15;
  const isMorning = hour < 12;

  type BriefingItem = {
    icon: string;
    label: string;
    text: string;
    type: string;
  };

  const items: BriefingItem[] = [];

  // Fetch all relevant knowledge at once
  const [mealKnowledge, hoursKnowledge, eventsKnowledge, closuresKnowledge] = await Promise.all([
    prisma.knowledge.findFirst({ where: { organizationId: user.organizationId, category: "daily_meal" } }),
    prisma.knowledge.findFirst({ where: { organizationId: user.organizationId, category: "hours" } }),
    prisma.knowledge.findFirst({ where: { organizationId: user.organizationId, category: "upcoming_event" } }),
    prisma.knowledge.findFirst({ where: { organizationId: user.organizationId, category: "closures" } }),
  ]);

  // Check if tomorrow is a closure
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  let tomorrowClosed = false;
  if (closuresKnowledge?.metadata && typeof closuresKnowledge.metadata === "object") {
    const meta = closuresKnowledge.metadata as { closures?: string[] };
    if (meta.closures?.includes(tomorrowStr)) {
      tomorrowClosed = true;
    }
  }

  // --- NEAR CLOSING (within 30 min): Urgent pickup warning ---
  if (isNearClosing) {
    items.push({
      icon: "alert",
      label: "PICKUP CLOSING SOON",
      text: `Pickup closes in ${minutesUntilClose} minutes. Running late? Let the front desk know.`,
      type: "urgent",
    });
  }

  // --- SCHOOL STATUS: Always show ---
  if (isOpen && !isNearClosing) {
    const hoursRemaining = Math.floor(minutesUntilClose / 60);
    const minsRemaining = minutesUntilClose % 60;
    const timeStr = hoursRemaining > 0
      ? `${hoursRemaining}h ${minsRemaining}m until close`
      : `${minsRemaining}m until close`;
    items.push({
      icon: "school",
      label: "SCHOOL STATUS",
      text: `Open now — ${timeStr}`,
      type: "school_status",
    });
  } else if (!isNearClosing) {
    items.push({
      icon: "school",
      label: "SCHOOL STATUS",
      text: isWeekday ? "Closed — opens 8:00 AM" : "Closed — reopens Monday 8:00 AM",
      type: "school_status",
    });
  }

  // --- MORNING (before noon): Lunch menu, hours, upcoming events ---
  if (isMorning) {
    // Today's lunch
    if (mealKnowledge?.metadata && typeof mealKnowledge.metadata === "object") {
      const meta = mealKnowledge.metadata as Record<string, string>;
      const todayMeal = meta[dayName];
      if (todayMeal) {
        items.push({
          icon: "utensils",
          label: "TODAY'S LUNCH",
          text: todayMeal,
          type: "meal",
        });
      }
    }

    // Pickup time
    if (hoursKnowledge) {
      items.push({
        icon: "clock",
        label: "PICKUP REMINDER",
        text: "Pickup by 5:30 PM today",
        type: "pickup",
      });
    }
  }

  // --- AFTERNOON (after 3pm): Pickup countdown, tomorrow notes ---
  if (isAfternoon && !isNearClosing) {
    // Pickup countdown
    if (isOpen) {
      const hoursLeft = Math.floor(minutesUntilClose / 60);
      const minsLeft = minutesUntilClose % 60;
      const countdownStr = hoursLeft > 0
        ? `${hoursLeft}h ${minsLeft}m remaining`
        : `${minsLeft} minutes remaining`;
      items.push({
        icon: "clock",
        label: "PICKUP REMINDER",
        text: `Pickup by 5:30 PM — ${countdownStr}`,
        type: "pickup",
      });
    }

    // Tomorrow notes
    if (tomorrowClosed) {
      items.push({
        icon: "calendar",
        label: "TOMORROW",
        text: "School is closed tomorrow — enjoy the day off!",
        type: "tomorrow",
      });
    }
  }

  // --- MIDDAY (noon to 3pm): Show pickup info and lunch ---
  if (hour >= 12 && hour < 15) {
    if (mealKnowledge?.metadata && typeof mealKnowledge.metadata === "object") {
      const meta = mealKnowledge.metadata as Record<string, string>;
      const todayMeal = meta[dayName];
      if (todayMeal) {
        items.push({
          icon: "utensils",
          label: "TODAY'S LUNCH",
          text: todayMeal,
          type: "meal",
        });
      }
    }

    if (isOpen && hoursKnowledge) {
      const hoursLeft = Math.floor(minutesUntilClose / 60);
      const minsLeft = minutesUntilClose % 60;
      const countdownStr = hoursLeft > 0
        ? `${hoursLeft}h ${minsLeft}m remaining`
        : `${minsLeft} minutes remaining`;
      items.push({
        icon: "clock",
        label: "PICKUP REMINDER",
        text: `Pickup by 5:30 PM — ${countdownStr}`,
        type: "pickup",
      });
    }
  }

  // --- UPCOMING EVENTS: Always show if within 5 days ---
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
        const when = diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
        items.push({
          icon: "calendar",
          label: "UPCOMING EVENT",
          text: `${event.name} — ${when}`,
          type: "event",
        });
      }
    }
  }

  return NextResponse.json({ items });
}
