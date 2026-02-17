import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { ParentDashboard } from "@/components/parent-dashboard";
import { OperatorDashboard } from "@/components/operator-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Stats for operator welcome
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const recentQuestions = await prisma.message.count({
    where: {
      role: "user",
      createdAt: { gte: startOfToday },
      conversation: { organizationId: user.organizationId },
    },
  });

  const struggles = await prisma.message.count({
    where: {
      role: "assistant",
      struggle: true,
      resolved: null,
      conversation: { organizationId: user.organizationId },
    },
  });

  const isOperator = user.role === "admin" || user.role === "staff";

  return (
    <AppShell user={user} isOperator={isOperator}>
      {isOperator ? (
        <OperatorDashboard
          user={user}
          recentQuestions={recentQuestions}
          struggles={struggles}
        />
      ) : (
        <ParentDashboard user={user} />
      )}
    </AppShell>
  );
}
