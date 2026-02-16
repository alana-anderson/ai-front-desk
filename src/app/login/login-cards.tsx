"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: { name: string } | null;
};

const roleColors: Record<string, string> = {
  admin: "bg-indigo-100 text-indigo-700",
  staff: "bg-indigo-100 text-indigo-600",
  parent: "bg-indigo-50 text-indigo-600",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  staff: "Staff / Teacher",
  parent: "Parent",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export function LoginCards({ users }: { users: User[] }) {
  const router = useRouter();

  async function handleLogin(userId: string) {
    await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
      {users.map((user) => (
        <Card
          key={user.id}
          className="p-5 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 border border-slate-100"
          onClick={() => handleLogin(user.id)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 bg-indigo-50 text-indigo-700">
              <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant="secondary" className={`text-xs ${roleColors[user.role] || ""}`}>
              {roleLabels[user.role] || user.role}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
