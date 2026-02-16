"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, MessageSquare, Sparkles } from "lucide-react";

type User = { id: string; name: string; role: string; organization: { name: string } | null };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function OperatorDashboard({
  user,
  recentQuestions,
  struggles,
}: {
  user: User;
  recentQuestions: number;
  struggles: number;
}) {
  const router = useRouter();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-800 mt-8 mb-1">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-xl text-indigo-600 font-medium mb-10">
          Here&apos;s what&apos;s happening at {user.organization?.name || "123 Preschool"}
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card
            className="p-6 cursor-pointer hover:shadow-md hover:border-cyan-200 transition-all border border-slate-100"
            onClick={() => router.push("/questions")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-slate-800">{recentQuestions}</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <p className="text-sm text-slate-500 text-left">
              Parent questions today
            </p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all border border-slate-100"
            onClick={() => router.push("/questions")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-slate-800">{struggles}</span>
              {struggles > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  Needs attention
                </Badge>
              )}
              {struggles === 0 && (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 text-left">
              {struggles > 0 ? "Questions needing your attention" : "All questions handled well"}
            </p>
          </Card>
        </div>

        {/* Quick actions */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card
            className="p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all border border-slate-100"
            onClick={() => router.push("/knowledge")}
          >
            <div className="mb-2">
              <Book className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Edit Knowledge Base</p>
            <p className="text-xs text-slate-400 mt-1">Update policies and info</p>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all border border-slate-100"
            onClick={() => router.push("/questions")}
          >
            <div className="mb-2">
              <MessageSquare className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">View Questions</p>
            <p className="text-xs text-slate-400 mt-1">See what parents are asking</p>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all border border-slate-100"
            onClick={() => router.push("/chat")}
          >
            <div className="mb-2">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Try the AI Chat</p>
            <p className="text-xs text-slate-400 mt-1">Test it yourself</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
