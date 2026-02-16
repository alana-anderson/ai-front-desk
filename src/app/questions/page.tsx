import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { QuestionLog } from "@/components/question-log";

export default async function QuestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "parent") redirect("/dashboard");

  const conversations = await prisma.conversation.findMany({
    where: { organizationId: user.organizationId },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Transform into question-answer pairs
  const pairs = conversations.flatMap((conv) => {
    const result: {
      id: string;
      question: string;
      answer: string;
      struggle: boolean;
      resolved: string | null;
      userName: string;
      createdAt: string;
    }[] = [];

    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      if (msg.role === "user") {
        const response = conv.messages[i + 1];
        result.push({
          id: response?.id || msg.id,
          question: msg.content,
          answer: response?.content || "(no response yet)",
          struggle: response?.struggle || false,
          resolved: response?.resolved || null,
          userName: conv.user.name,
          createdAt: msg.createdAt.toISOString(),
        });
      }
    }
    return result;
  });

  // Sort: unresolved struggles first, then by date descending
  pairs.sort((a, b) => {
    const aNeeds = a.struggle && !a.resolved ? 1 : 0;
    const bNeeds = b.struggle && !b.resolved ? 1 : 0;
    if (aNeeds !== bNeeds) return bNeeds - aNeeds;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <AppShell user={user} isOperator={true}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Parent Questions</h1>
          <p className="text-sm text-slate-500 mt-1">
            See what parents are asking and where the AI needs help.
          </p>
        </div>
        <QuestionLog pairs={pairs} orgId={user.organizationId} />
      </div>
    </AppShell>
  );
}
