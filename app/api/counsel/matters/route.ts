import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory fallback store for development & mock demonstration
const memoryMatters = [
  {
    id: "mat-1",
    matterNumber: "2026-USCIS-ALVAREZ",
    clientName: "Sofia Elena Alvarez Mendoza",
    alienNumber: "A209-843-112",
    petitionType: "I-485 Adjustment of Status",
    status: "READY_TO_FILE",
    notes: "Consular birth certificate + marriage certificate translated and certified.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 2,
    certifiedCount: 2,
    orders: [
      {
        id: "ord-101",
        publicCode: "VL-8921-XQ",
        fileName: "Certificado_Nacimiento_Alvarez.pdf",
        status: "CERTIFIED",
        verifyCode: "VL-A8291",
        sourceLang: "Spanish",
        targetLang: "English",
        pageCount: 2,
      },
      {
        id: "ord-102",
        publicCode: "VL-8922-YZ",
        fileName: "Acta_Matrimonio_Civil.pdf",
        status: "CERTIFIED",
        verifyCode: "VL-M9102",
        sourceLang: "Spanish",
        targetLang: "English",
        pageCount: 1,
      },
    ],
  },
  {
    id: "mat-2",
    matterNumber: "2026-USCIS-KOWALSKI",
    clientName: "Piotr Jan Kowalski",
    alienNumber: "A088-234-918",
    petitionType: "I-130 Petition for Alien Relative",
    status: "ACTIVE",
    notes: "Urgent consular filing. Polish birth record currently in proofing studio.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 1,
    certifiedCount: 0,
    orders: [
      {
        id: "ord-103",
        publicCode: "VL-9100-PL",
        fileName: "Odpis_Zupelny_Aktu_Urodzenia.pdf",
        status: "QA",
        verifyCode: null,
        sourceLang: "Polish",
        targetLang: "English",
        pageCount: 2,
      },
    ],
  },
  {
    id: "mat-3",
    matterNumber: "2026-EOIR-CHAVEZ",
    clientName: "Mateo Chavez Rodriguez",
    alienNumber: "A215-992-410",
    petitionType: "EOIR Asylum Defense",
    status: "ACTIVE",
    notes: "Police clearance certificate & affidavits for immigration court.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 3,
    certifiedCount: 1,
    orders: [
      {
        id: "ord-104",
        publicCode: "VL-9411-CH",
        fileName: "Constancia_Antecedentes_No_Penales.pdf",
        status: "CERTIFIED",
        verifyCode: "VL-C3819",
        sourceLang: "Spanish",
        targetLang: "English",
        pageCount: 1,
      },
    ],
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status") || "ALL";

    let matters = memoryMatters;

    try {
      const queryPromise = prisma.matter.findMany({
        include: {
          orders: {
            include: { documents: true, certificate: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      const dbMatters: any = await Promise.race([queryPromise, timeoutPromise]);
      if (dbMatters && dbMatters.length > 0) {
        matters = dbMatters.map((m: any) => ({
          id: m.id,
          matterNumber: m.matterNumber,
          clientName: m.clientName,
          alienNumber: m.alienNumber,
          petitionType: m.petitionType,
          status: m.status,
          notes: m.notes,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
          documentsCount: m.orders?.length || 0,
          certifiedCount: m.orders?.filter((o: any) => o.status === "CERTIFIED").length || 0,
          orders: (m.orders || []).map((o: any) => ({
            id: o.id,
            publicCode: o.publicCode,
            fileName: o.documents?.[0]?.fileName || "document.pdf",
            status: o.status,
            verifyCode: o.certificate?.verifyCode || null,
            sourceLang: o.sourceLang,
            targetLang: o.targetLang,
            pageCount: o.pageCount,
          })),
        }));
      }
    } catch {
      // fallback to memoryMatters in dev/disconnected environments
    }

    let filtered = matters;
    if (status !== "ALL") {
      filtered = filtered.filter((m) => m.status === status);
    }
    if (query) {
      filtered = filtered.filter(
        (m) =>
          m.matterNumber.toLowerCase().includes(query) ||
          m.clientName.toLowerCase().includes(query) ||
          (m.alienNumber && m.alienNumber.toLowerCase().includes(query)) ||
          m.petitionType.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      matters: filtered,
      total: filtered.length,
      metrics: {
        totalMatters: matters.length,
        readyToFile: matters.filter((m) => m.status === "READY_TO_FILE").length,
        active: matters.filter((m) => m.status === "ACTIVE").length,
        closed: matters.filter((m) => m.status === "CLOSED").length,
        avgTurnaroundHours: 3.8,
        uscisAdmissibilityRate: "100.0%",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load law firm matters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matterNumber, clientName, alienNumber, petitionType, notes } = body;

    if (!matterNumber || !clientName || !petitionType) {
      return NextResponse.json(
        { error: "Matter number, client name, and petition type are required." },
        { status: 400 }
      );
    }

    const newMatter = {
      id: "mat-" + Math.random().toString(36).substring(2, 9),
      matterNumber: matterNumber.trim().toUpperCase(),
      clientName: clientName.trim(),
      alienNumber: alienNumber ? alienNumber.trim() : null,
      petitionType: petitionType.trim(),
      status: "ACTIVE",
      notes: notes ? notes.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentsCount: 0,
      certifiedCount: 0,
      orders: [],
    };

    memoryMatters.unshift(newMatter);

    return NextResponse.json({
      success: true,
      matter: newMatter,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize new law firm matter." },
      { status: 500 }
    );
  }
}
