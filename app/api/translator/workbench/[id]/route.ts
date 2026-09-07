import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory segments store for live collaborative edits
const workbenchSegmentsStore = new Map<string, any[]>();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();

    let order: any = null;
    try {
      const queryPromise = prisma.order.findFirst({
        where: { OR: [{ id }, { publicCode }] },
        include: { documents: true, glossaryTerms: true },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      order = await Promise.race([queryPromise, timeoutPromise]);
    } catch {
      order = null;
    }

    const defaultSourceLang = order?.sourceLang || "Spanish";
    const defaultTargetLang = order?.targetLang || "English";
    const primaryName =
      order?.glossaryTerms?.find((g: any) => g.kind === "NAME")?.sourceText ||
      "ALEJANDRO MARTÍNEZ RIVERA";

    const initialSegments = [
      {
        id: "seg-1",
        section: "HEADER",
        sourceText: "ESTADOS UNIDOS MEXICANOS • REGISTRO DEL ESTADO CIVIL",
        targetText: "UNITED MEXICAN STATES • CIVIL REGISTRY OFFICE",
        locked: false,
        status: "TRANSLATED",
      },
      {
        id: "seg-2",
        section: "HEADER",
        sourceText: "ACTA DE NACIMIENTO • CERTIFICACIÓN OFICIAL DE FOLIO",
        targetText: "OFFICIAL BIRTH CERTIFICATE • OFFICIAL FOLIO RECORD",
        locked: false,
        status: "TRANSLATED",
      },
      {
        id: "seg-3",
        section: "RECORD_DETAILS",
        sourceText: "Número de Folio / Acta: 04829-B / Tomo: 12",
        targetText: "Certificate / Folio Number: 04829-B / Volume: 12",
        locked: true,
        status: "VERIFIED",
      },
      {
        id: "seg-4",
        section: "PERSON_RECORD",
        sourceText: `Nombre del Registrado: ${primaryName}`,
        targetText: `Registered Individual's Name: ${primaryName}`,
        locked: true,
        status: "VERIFIED",
      },
      {
        id: "seg-5",
        section: "PERSON_RECORD",
        sourceText: "Fecha de Nacimiento: 02 de Mayo de 1994 (Dos de Mayo de Mil Novecientos Noventa y Cuatro)",
        targetText: "Date of Birth: May 02, 1994 (May Second, Nineteen Ninety-Four)",
        locked: true,
        status: "VERIFIED",
      },
      {
        id: "seg-6",
        section: "SEAL_MARGINALIA",
        sourceText: "[Sello Oficial Redondo: Dirección General del Registro Civil • Estado de Jalisco]",
        targetText: "[Official Circular Seal: General Directorate of the Civil Registry • State of Jalisco]",
        locked: false,
        status: "TRANSLATED",
      },
    ];

    const currentSegments = workbenchSegmentsStore.get(publicCode) || initialSegments;

    return NextResponse.json({
      success: true,
      job: {
        publicCode,
        sourceLang: defaultSourceLang,
        targetLang: defaultTargetLang,
        documentName: order?.documents?.[0]?.fileName || "Certificado_Nacimiento_Oficial.pdf",
        serviceType: order?.serviceType || "CERTIFIED",
        assignedTranslator: {
          name: "Elena V.",
          credentials: "ATA Member No. 271892 • Certified Legal Translator",
          notaryCommission: "State of Florida • Commission No. GG-918231",
        },
        deadlineFormatted: "Today at 6:00 PM EST",
        lockedTerms: [
          { term: primaryName, kind: "NAME", matched: true },
          { term: "May 02, 1994", kind: "DATE", matched: true },
          { term: "04829-B", kind: "ID", matched: true },
        ],
      },
      segments: currentSegments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load translator workbench." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();
    const body = await req.json();
    const { segments } = body;

    if (!Array.isArray(segments)) {
      return NextResponse.json(
        { error: "Invalid payload: segments must be an array." },
        { status: 400 }
      );
    }

    workbenchSegmentsStore.set(publicCode, segments);

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
      segmentCount: segments.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save workbench segments." },
      { status: 500 }
    );
  }
}
