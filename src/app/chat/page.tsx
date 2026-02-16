import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { ChatInterface } from "@/components/chat-interface";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isOperator = user.role === "admin" || user.role === "staff";

  return (
    <AppShell user={user} isOperator={isOperator}>
      <ChatInterface user={user} />
    </AppShell>
  );
}
