import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const uiMessages = body.messages;
  const conversationId = body.conversationId;

  // Convert UIMessages (with parts) to CoreMessages (with content) for streamText
  const messages = uiMessages.map((m: any) => {
    const textContent = m.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("") || "";
    return {
      role: m.role,
      content: textContent,
    };
  });

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const conv = await prisma.conversation.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
      },
    });
    convId = conv.id;
  }

  // Get all knowledge for this org (small dataset, pass all to LLM)
  const knowledge = await prisma.knowledge.findMany({
    where: { organizationId: user.organizationId },
  });

  const knowledgeContext = knowledge
    .map((k) => {
      const q = k.question ? `Q: ${k.question}\n` : "";
      return `[${k.category}] ${q}A: ${k.answer}`;
    })
    .join("\n\n");

  const knowledgeIds = knowledge.map((k) => k.id);

  const systemPrompt = `You are the AI Front Desk assistant for ${user.organization?.name || "123 Preschool"}. You help parents, staff, and administrators with questions about the school.

RULES:
- Answer ONLY based on the school policies and information provided below. Do not make up information.
- Be warm, concise, and trustworthy. Parents are often anxious and busy.
- If you cannot find an answer in the provided information, you MUST start your response with exactly "[UNSURE]" followed by a helpful message like: "[UNSURE] I don't have that information yet — please call us at (505) 767-6500 or email info@123preschool.com and we'll help you right away."
- Only use the [UNSURE] tag when you genuinely cannot answer from the information below. If the answer IS in the policies, respond normally without the tag.
- Keep responses short (2-4 sentences) unless more detail is needed.
- When citing policies (like sick policy, fees), be specific with the details.

SCHOOL POLICIES AND INFORMATION:
${knowledgeContext}`;

  // Save the user's latest message
  const latestUserMessage = uiMessages[uiMessages.length - 1];
  if (latestUserMessage?.role === "user") {
    const textContent = latestUserMessage.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("") || "";
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: textContent,
      },
    });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    async onFinish({ text }) {
      // The AI prefixes responses with [UNSURE] when it can't find an answer
      const isStruggle = text.startsWith("[UNSURE]");
      const cleanText = isStruggle ? text.replace(/^\[UNSURE\]\s*/, "") : text;

      await prisma.message.create({
        data: {
          conversationId: convId,
          role: "assistant",
          content: cleanText,
          struggle: isStruggle,
          noMatch: isStruggle,
          knowledgeIds: isStruggle ? [] : knowledgeIds,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse({
    headers: { "X-Conversation-Id": convId },
  });
}
