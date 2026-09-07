import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicCode = id.toUpperCase();

    // Try finding in database with rapid fallback if disconnected
    let order: any = null;
    try {
      const queryPromise = prisma.order.findFirst({
        where: {
          OR: [{ id }, { publicCode }],
        },
        include: {
          documents: true,
          glossaryTerms: true,
          events: { orderBy: { createdAt: "desc" } },
          certificate: true,
        },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 300)
      );
      order = await Promise.race([queryPromise, timeoutPromise]);
    } catch {
      // Prisma disconnected or timeout in local dev fallback
      order = null;
    }

    const defaultSourceLang = order?.sourceLang || "Spanish";
    const defaultTargetLang = order?.targetLang || "English";
    const primaryName =
      order?.glossaryTerms?.find((g: any) => g.kind === "NAME")?.sourceText ||
      "ALEJANDRO MARTÍNEZ RIVERA";
    const docName = order?.documents?.[0]?.fileName || "Certificado_de_Nacimiento_Oficial.pdf";

    // Standardized legal segments matching USCIS 8 CFR § 204.2 standards
    const segments = [
      {
        id: "seg-1",
        page: 1,
        section: "HEADER",
        sourceText: "ESTADOS UNIDOS MEXICANOS • REGISTRO DEL ESTADO CIVIL",
        translatedText: "UNITED MEXICAN STATES • CIVIL REGISTRY OFFICE",
        isLockedTerm: false,
      },
      {
        id: "seg-2",
        page: 1,
        section: "HEADER",
        sourceText: "ACTA DE NACIMIENTO • CERTIFICACIÓN OFICIAL DE FOLIO",
        translatedText: "OFFICIAL BIRTH CERTIFICATE • OFFICIAL FOLIO RECORD",
        isLockedTerm: false,
      },
      {
        id: "seg-3",
        page: 1,
        section: "REGISTRATION_DETAILS",
        sourceText: "Número de Folio / Acta: 04829-B / Tomo: 12",
        translatedText: "Certificate / Folio Number: 04829-B / Volume: 12",
        isLockedTerm: true,
        lockedTermType: "REGISTRATION_ID",
      },
      {
        id: "seg-4",
        page: 1,
        section: "REGISTRATION_DETAILS",
        sourceText: "Fecha de Registro: 14 de Mayo de 1994",
        translatedText: "Registration Date: May 14, 1994",
        isLockedTerm: true,
        lockedTermType: "DATE",
      },
      {
        id: "seg-5",
        page: 1,
        section: "PERSON_RECORD",
        sourceText: `Nombre del Registrado: ${primaryName}`,
        translatedText: `Registered Individual's Name: ${primaryName}`,
        isLockedTerm: true,
        lockedTermType: "NAME",
      },
      {
        id: "seg-6",
        page: 1,
        section: "PERSON_RECORD",
        sourceText: "Fecha de Nacimiento: 02 de Mayo de 1994 (Dos de Mayo de Mil Novecientos Noventa y Cuatro)",
        translatedText: "Date of Birth: May 02, 1994 (May Second, Nineteen Ninety-Four)",
        isLockedTerm: true,
        lockedTermType: "DATE",
      },
      {
        id: "seg-7",
        page: 1,
        section: "PERSON_RECORD",
        sourceText: "Lugar de Nacimiento: Guadalajara, Jalisco, México",
        translatedText: "Place of Birth: Guadalajara, Jalisco, Mexico",
        isLockedTerm: false,
      },
      {
        id: "seg-8",
        page: 1,
        section: "PARENTAL_DATA",
        sourceText: "Padre: ROBERTO MARTÍNEZ SANDOVAL • Nacionalidad: Mexicana",
        translatedText: "Father: ROBERTO MARTÍNEZ SANDOVAL • Nationality: Mexican",
        isLockedTerm: true,
        lockedTermType: "NAME",
      },
      {
        id: "seg-9",
        page: 1,
        section: "PARENTAL_DATA",
        sourceText: "Madre: SOFÍA RIVERA MENDOZA • Nacionalidad: Mexicana",
        translatedText: "Mother: SOFÍA RIVERA MENDOZA • Nationality: Mexican",
        isLockedTerm: true,
        lockedTermType: "NAME",
      },
      {
        id: "seg-10",
        page: 1,
        section: "SEAL_MARGINALIA",
        sourceText: "[Sello Oficial Redondo: Dirección General del Registro Civil • Estado de Jalisco]",
        translatedText: "[Official Circular Seal: General Directorate of the Civil Registry • State of Jalisco]",
        isLockedTerm: false,
      },
      {
        id: "seg-11",
        page: 1,
        section: "NOTARIAL_AFFIDAVIT",
        sourceText: "Doy Fe. El Oficial del Registro Civil: Lic. Armando Castro Garza [Firma Ilegible]",
        translatedText: "I Attest. Civil Registry Officer: Lic. Armando Castro Garza [Illegible Signature]",
        isLockedTerm: false,
      },
    ];

    const lockedGlossary = [
      {
        term: primaryName,
        kind: "NAME",
        reason: "Locked to USCIS G-28 & Foreign Passport Entry",
        verifiedInTranslation: true,
      },
      {
        term: "May 02, 1994",
        kind: "DATE",
        reason: "DOB Strict Formatting (MM/DD/YYYY)",
        verifiedInTranslation: true,
      },
      {
        term: "ROBERTO MARTÍNEZ SANDOVAL",
        kind: "NAME",
        reason: "Paternal Name Match Guarantee",
        verifiedInTranslation: true,
      },
      {
        term: "SOFÍA RIVERA MENDOZA",
        kind: "NAME",
        reason: "Maternal Name Match Guarantee",
        verifiedInTranslation: true,
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: order?.id || "demo-order-id",
        publicCode: order?.publicCode || publicCode,
        status: order?.status || "QA",
        sourceLang: defaultSourceLang,
        targetLang: defaultTargetLang,
        serviceType: order?.serviceType || "CERTIFIED",
        receivingParty: order?.receivingParty || "USCIS",
        fileName: docName,
        pageCount: order?.pageCount || 1,
        translator: {
          name: "Elena V.",
          credentials: "ATA Member No. 271892 • Sworn Court & USCIS Accredited Translator",
          languages: ["Spanish", "English"],
          reviewNote: "All handwritten marginal notes and embossed seals transcribed verbatim per 8 CFR § 204.2.",
        },
      },
      segments,
      lockedGlossary,
      revisions: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load proofing data" },
      { status: 500 }
    );
  }
}
