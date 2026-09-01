import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting VerifyLingua database seeding...");

  // 1. Seed Translators
  const translators = [
    {
      email: "elena.v@verifylingua.com",
      name: "Elena V.",
      languages: ["Spanish", "English", "Catalan"],
      credentials: "ATA Member No. 271892 • Certified Legal Translator",
      active: true,
    },
    {
      email: "tariq.a@verifylingua.com",
      name: "Tariq A.",
      languages: ["Arabic", "English", "French"],
      credentials: "ATA Member No. 381920 • Court Certified Linguist",
      active: true,
    },
    {
      email: "carlos.m@verifylingua.com",
      name: "Carlos M.",
      languages: ["Portuguese", "Spanish", "English"],
      credentials: "ATA Member No. 194820 • Certified Immigration Translator",
      active: true,
    },
    {
      email: "mei.l@verifylingua.com",
      name: "Mei L.",
      languages: ["Chinese", "English"],
      credentials: "ATA Member No. 492018 • Certified Academic Evaluator",
      active: true,
    },
  ];

  for (const t of translators) {
    const existing = await prisma.translator.findFirst({ where: { email: t.email } });
    if (!existing) {
      await prisma.translator.create({ data: t });
    }
  }
  console.log(`✅ Seeded ${translators.length} certified ATA translators.`);

  // 2. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@verifylingua.com" },
    update: {},
    create: {
      email: "demo@verifylingua.com",
      name: "Mohammed Abdullah Al-Rashid",
      phone: "+1 (555) 234-5678",
      locale: "en",
      notifyChannel: "EMAIL",
      isGuest: false,
    },
  });

  // 3. Seed In-Progress Demo Order (VL-7X9K2)
  const existingOrder1 = await prisma.order.findUnique({
    where: { publicCode: "VL-7X9K2" },
  });

  if (!existingOrder1) {
    const promisedAt = new Date();
    promisedAt.setHours(promisedAt.getHours() + 24);

    await prisma.order.create({
      data: {
        publicCode: "VL-7X9K2",
        userId: demoUser.id,
        guestEmail: demoUser.email,
        status: "TRANSLATING",
        sourceLang: "es",
        targetLang: "en",
        serviceType: "CERTIFIED",
        pageCount: 1,
        wordCount: 240,
        subtotal: 24.95,
        addOnTotal: 0.0,
        total: 24.95,
        receivingParty: "USCIS",
        promisedAt,
        documents: {
          create: [
            {
              fileName: "Acta_Nacimiento_Madrid.pdf",
              s3Key: "vault/VL-7X9K2/Acta_Nacimiento_Madrid.pdf",
              mimeType: "application/pdf",
              pages: 1,
              sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            },
          ],
        },
        glossaryTerms: {
          create: [
            {
              sourceText: "MOHAMMED ABDULLAH AL-RASHID",
              requiredTarget: "MOHAMMED ABDULLAH AL-RASHID",
              kind: "NAME",
              locked: true,
            },
            {
              sourceText: "FATIMA ZAHRA AL-RASHID",
              requiredTarget: "FATIMA ZAHRA AL-RASHID",
              kind: "NAME",
              locked: true,
            },
          ],
        },
        events: {
          create: [
            {
              type: "STATUS_CHANGE",
              message: "Order placed & payment authorized. Pre-payment document triage passed.",
              actor: "SYSTEM",
            },
            {
              type: "ASSIGNED",
              message: "Assigned to ATA-certified native translator Elena V. Source documents decrypted.",
              actor: "SYSTEM",
            },
            {
              type: "STATUS_CHANGE",
              message: "Translation in progress. Passport name lock terms validated in workspace.",
              actor: "TRANSLATOR: Elena V.",
            },
          ],
        },
        messages: {
          create: [
            {
              senderType: "SYSTEM",
              body: "Welcome to your live order thread! Elena V. is currently translating your document. All passport transliterations are locked.",
            },
            {
              senderType: "TRANSLATOR",
              body: "Hello! I have reviewed your document scan and verified all official stamps. Translation is proceeding smoothly.",
            },
          ],
        },
      },
    });
    console.log("✅ Seeded in-progress demo order VL-7X9K2.");
  }

  // 4. Seed Completed Demo Order (VL-3M8Q1) with Certificate
  const existingOrder2 = await prisma.order.findUnique({
    where: { publicCode: "VL-3M8Q1" },
  });

  if (!existingOrder2) {
    const deliveredAt = new Date();
    deliveredAt.setDate(deliveredAt.getDate() - 3);

    const order2 = await prisma.order.create({
      data: {
        publicCode: "VL-3M8Q1",
        userId: demoUser.id,
        guestEmail: demoUser.email,
        status: "DELIVERED",
        sourceLang: "es",
        targetLang: "en",
        serviceType: "CERTIFIED",
        pageCount: 2,
        wordCount: 480,
        subtotal: 49.9,
        addOnTotal: 0.0,
        total: 49.9,
        receivingParty: "UNIVERSITY",
        promisedAt: deliveredAt,
        deliveredAt,
        documents: {
          create: [
            {
              fileName: "Titulo_Universitario_Degree.pdf",
              s3Key: "vault/VL-3M8Q1/Titulo_Universitario_Degree.pdf",
              mimeType: "application/pdf",
              pages: 2,
              sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            },
          ],
        },
        events: {
          create: [
            {
              type: "STATUS_CHANGE",
              message: "Order placed & payment authorized.",
              actor: "SYSTEM",
            },
            {
              type: "ASSIGNED",
              message: "Assigned to ATA-certified linguist Carlos M.",
              actor: "SYSTEM",
            },
            {
              type: "CERTIFICATE_ISSUED",
              message: "USCIS QA passed. Official signed Certificate of Accuracy issued.",
              actor: "SYSTEM",
            },
          ],
        },
        certificate: {
          create: {
            verifyCode: "CERT-3M8Q1-9014",
            pdfS3Key: "certificates/CERT-3M8Q1-9014.pdf",
            documentSha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            translatorName: "Carlos M.",
            translatorCredentials: "ATA Member No. 194820 • Certified Immigration Translator",
          },
        },
      },
    });
    console.log("✅ Seeded completed demo order VL-3M8Q1 with verification certificate.");
  }

  console.log("🎉 Database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
