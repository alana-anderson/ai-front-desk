import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, question, answer } = await req.json();

  const updated = await prisma.knowledge.update({
    where: { id },
    data: { question: question || null, answer },
  });

  return NextResponse.json(updated);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId, category, question, answer } = await req.json();

  const created = await prisma.knowledge.create({
    data: {
      organizationId,
      category: category || "general",
      question: question || null,
      answer,
      source: "manual",
    },
  });

  return NextResponse.json(created);
}
