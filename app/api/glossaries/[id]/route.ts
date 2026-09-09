import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { memoryGlossaries } from "@/lib/glossary/store";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = memoryGlossaries.get(id);
    if (!existing) {
      return NextResponse.json({ error: "Glossary not found." }, { status: 404 });
    }

    if (body.name) existing.name = body.name;
    if (Array.isArray(body.terms)) {
      existing.terms = body.terms;
    }
    existing.updatedAt = new Date().toISOString();
    memoryGlossaries.set(id, existing);

    try {
      await prisma.glossary.update({
        where: { id },
        data: {
          name: existing.name,
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ glossary: existing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update glossary" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    memoryGlossaries.delete(id);

    try {
      await prisma.glossary.delete({ where: { id } });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: `Glossary ${id} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete glossary" }, { status: 500 });
  }
}
