import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

import { memoryGlossaries, MemoryGlossary } from "@/lib/glossary/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Try database if not in Vitest offline mode
    if (!process.env.VITEST) {
      try {
        const dbGlossaries = await prisma.glossary.findMany({
          where: user ? { userId: user.id } : undefined,
          include: { terms: true },
          orderBy: { createdAt: "desc" },
        });

        if (dbGlossaries && dbGlossaries.length > 0) {
          return NextResponse.json({ glossaries: dbGlossaries });
        }
      } catch {
        // fallback
      }
    }

    // Fallback to memory
    const list = Array.from(memoryGlossaries.values());
    return NextResponse.json({ glossaries: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch glossaries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const name = (body.name || "Default Legal Glossary").trim();
    const sourceLang = (body.sourceLang || "en").toLowerCase().trim();
    const targetLang = (body.targetLang || "ar").toLowerCase().trim();
    const initialTerms = Array.isArray(body.terms) ? body.terms : [];

    const id = `glo_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    const newGlossary: MemoryGlossary = {
      id,
      userId: user?.id || null,
      name,
      sourceLang,
      targetLang,
      terms: initialTerms.map((t: any) => ({
        id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sourceText: t.sourceText,
        requiredTarget: t.requiredTarget,
        locked: t.locked ?? true,
      })),
      createdAt: now,
      updatedAt: now,
    };

    memoryGlossaries.set(id, newGlossary);

    if (!process.env.VITEST) {
      try {
        await prisma.glossary.create({
          data: {
            id,
            userId: user?.id,
            name,
            sourceLang,
            targetLang,
            terms: {
              create: newGlossary.terms.map((t) => ({
                id: t.id,
                sourceText: t.sourceText,
                requiredTarget: t.requiredTarget,
                locked: t.locked,
              })),
            },
          },
        });
      } catch {
        // fallback
      }
    }

    return NextResponse.json({ glossary: newGlossary }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create glossary" }, { status: 500 });
  }
}
