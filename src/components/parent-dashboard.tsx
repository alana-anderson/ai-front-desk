"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CalendarDays, Thermometer, School, UtensilsCrossed, Clock, Calendar, AlertCircle } from "lucide-react";

type User = { id: string; name: string; role: string; organization: { name: string } | null };
type BriefingItem = { icon: string; text: string; type: string };

const suggestionCards = [
  { 
    text: "Are you open on Veterans Day?", 
    icon: CalendarDays, 
    category: "Schedule",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-500",
    borderColor: "border-rose-100",
    hoverBorder: "hover:border-rose-300"
  },
  { 
    text: "What is the sick policy?", 
    icon: Thermometer, 
    category: "Health",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
    hoverBorder: "hover:border-amber-300"
  },
  { 
    text: "How do I schedule a tour?", 
    icon: School, 
    category: "Tours",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-500",
    borderColor: "border-teal-100",
    hoverBorder: "hover:border-teal-300"
  },
  { 
    text: "What's for lunch today?", 
    icon: UtensilsCrossed, 
    category: "Meals",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300"
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function ParentDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [briefing, setBriefing] = useState<BriefingItem[]>([]);
  const firstName = user.name.split(" ")[0];

  useEffect(() => {
    fetch("/api/briefing")
      .then((r) => r.json())
      .then((data) => setBriefing(data.items || []));
  }, []);

  function handleSuggestionClick(question: string) {
    const params = new URLSearchParams({ q: question });
    router.push(`/chat?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-20">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Greeting */}
        <h1 className="text-4xl font-bold text-slate-800 mt-8 mb-1">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-xl text-indigo-600 font-medium mb-8">
          How can {user.organization?.name || "we"} help?
        </p>

        {/* Briefing cards */}
        {briefing.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {briefing.map((item, i) => (
              <Card
                key={i}
                className={`px-4 py-3 text-sm flex items-center gap-2 border ${
                  item.type === "urgent"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-indigo-50/50 border-indigo-100 text-slate-600"
                }`}
              >
                {item.icon === "utensils" && <UtensilsCrossed className="w-4 h-4" />}
                {item.icon === "clock" && <Clock className="w-4 h-4" />}
                {item.icon === "calendar" && <Calendar className="w-4 h-4" />}
                {!["utensils", "clock", "calendar"].includes(item.icon) && <AlertCircle className="w-4 h-4" />}
                <span>{item.text}</span>
              </Card>
            ))}
          </div>
        )}

        {/* Chat input */}
        <div className="mb-10">
          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-slate-200 hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:p-[2px] group relative overflow-hidden"
            onClick={() => router.push("/chat")}
          >
            <div className="bg-white rounded-lg p-3 group-hover:p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
              <span className="text-slate-400 text-left flex-1 text-base">
                Ask {user.organization?.name || "123 Preschool"} a question...
              </span>
              <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Suggestion cards */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Common Questions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {suggestionCards.map((card) => (
            <Card
              key={card.text}
              className={`p-4 cursor-pointer hover:shadow-lg transition-all border ${card.borderColor} ${card.hoverBorder} text-left ${card.bgColor}`}
              onClick={() => handleSuggestionClick(card.text)}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bgColor.replace('50', '100')} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-sm text-slate-700 leading-snug mb-2 font-medium">{card.text}</p>
              <span className="text-xs text-slate-400">{card.category}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
