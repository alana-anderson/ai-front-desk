import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId, action, knowledgeEntry } = await req.json();

  if (!messageId || !action) {
    return NextResponse.json({ error: "Missing messageId or action" }, { status: 400 });
  }

  if (action === "ignore") {
    await prisma.message.update({
      where: { id: messageId },
      data: { resolved: "ignored", resolvedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "rectify") {
    // Create the new knowledge entry
    if (!knowledgeEntry?.answer) {
      return NextResponse.json({ error: "Knowledge answer required" }, { status: 400 });
    }

    await prisma.knowledge.create({
      data: {
        organizationId: user.organizationId,
        category: knowledgeEntry.category || "general",
        question: knowledgeEntry.question || null,
        answer: knowledgeEntry.answer,
        source: "rectified",
      },
    });

    // Mark message as rectified
    await prisma.message.update({
      where: { id: messageId },
      data: { resolved: "rectified", resolvedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
