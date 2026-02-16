import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { KnowledgeEditor } from "@/components/knowledge-editor";

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "parent") redirect("/dashboard");

  const knowledge = await prisma.knowledge.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { category: "asc" },
  });

  return (
    <AppShell user={user} isOperator={true}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit your school&apos;s policies and information. Changes are reflected in the AI immediately.
          </p>
        </div>
        <KnowledgeEditor items={knowledge} orgId={user.organizationId} />
      </div>
    </AppShell>
  );
}
