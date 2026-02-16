"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CalendarDays, Thermometer, School, UtensilsCrossed, Clock, Calendar, AlertCircle, Camera, Building2 } from "lucide-react";

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

        {/* Daily Briefing */}
        {briefing.length > 0 && (
          <div className="mb-10 w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Daily Briefing</h2>
              <span className="text-sm text-slate-400">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {briefing.map((item, i) => {
                let icon = <AlertCircle className="w-5 h-5" />;
                let iconBg = "bg-slate-100";
                let iconColor = "text-slate-500";
                let label = "INFO";

                if (item.icon === "utensils") {
                  icon = <UtensilsCrossed className="w-5 h-5" />;
                  iconBg = "bg-sky-100";
                  iconColor = "text-sky-600";
                  label = "TODAY'S LUNCH";
                } else if (item.icon === "clock") {
                  icon = <Building2 className="w-5 h-5" />;
                  iconBg = "bg-indigo-100";
                  iconColor = "text-indigo-600";
                  label = item.type === "urgent" ? "URGENT" : "SCHOOL STATUS";
                } else if (item.icon === "calendar") {
                  icon = <Camera className="w-5 h-5" />;
                  iconBg = "bg-rose-100";
                  iconColor = "text-rose-600";
                  label = "REMINDER";
                }

                return (
                  <Card
                    key={i}
                    className={`p-5 border border-slate-100 ${
                      item.type === "urgent" ? "bg-amber-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 ${iconColor}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                          {item.text.replace(/^(Today's lunch: |Heads up: |Pickup by |Reminder: )/i, "")}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat input */}
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-all border border-slate-200 hover:border-indigo-200 mb-10"
          onClick={() => router.push("/chat")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <span className="text-slate-400 text-left flex-1 text-base">
              Ask {user.organization?.name || "123 Preschool"} a question...
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center shrink-0 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </div>
          </div>
        </Card>

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
