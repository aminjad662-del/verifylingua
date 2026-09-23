import { describe, it, expect } from "vitest";
import { translateText, translateStructuredBlocks } from "@/lib/translation/translator";

describe("Certified Terminology & Fidelity Doctrine (Civil Registry, Degrees, Legal Titles)", () => {
  describe("1. Civil Registry & Vital Records Fidelity", () => {
    it("translates Spanish civil registry records with official USCIS terminology", async () => {
      const birthCert = await translateText("Acta de Nacimiento", { sourceLang: "es", targetLang: "en" });
      expect(birthCert).toBe("Birth Certificate");

      const birthRecord = await translateText("Partida de Nacimiento", { sourceLang: "es", targetLang: "en" });
      expect(birthRecord).toBe("Birth Record");

      const marriageCert = await translateText("Acta de Matrimonio", { sourceLang: "es", targetLang: "en" });
      expect(marriageCert).toBe("Marriage Certificate");

      const deathCert = await translateText("Acta de Defunción", { sourceLang: "es", targetLang: "en" });
      expect(deathCert).toBe("Death Certificate");

      const divorceDecree = await translateText("Sentencia de Divorcio", { sourceLang: "es", targetLang: "en" });
      expect(divorceDecree).toBe("Divorce Decree");
    });

    it("translates civil registry officers, books, and attestation formulas", async () => {
      const registrar = await translateText("Oficial del Registro Civil", { sourceLang: "es", targetLang: "en" });
      expect(registrar).toBe("Civil Registry Officer");

      const book = await translateText("Libro de Nacimientos", { sourceLang: "es", targetLang: "en" });
      expect(book).toBe("Book of Births");

      const folio = await translateText("Tomo", { sourceLang: "es", targetLang: "en" });
      expect(folio).toBe("Volume");

      const attestation = await translateText("Doy fe", { sourceLang: "es", targetLang: "en" });
      expect(attestation).toContain("attest");

      const beforeMe = await translateText("Ante mí", { sourceLang: "es", targetLang: "en" });
      expect(beforeMe).toBe("Before me");

      const apostille = await translateText("Apostilla de La Haya", { sourceLang: "es", targetLang: "en" });
      expect(apostille).toBe("Hague Apostille");
    });

    it("translates French and German civil status documents", async () => {
      const frBirth = await translateText("Acte de Naissance", { sourceLang: "fr", targetLang: "en" });
      expect(frBirth).toBe("Birth Certificate");

      const frOfficer = await translateText("Officier de l'État Civil", { sourceLang: "fr", targetLang: "en" });
      expect(frOfficer).toContain("Civil Registrar");

      const deBirth = await translateText("Geburtsurkunde", { sourceLang: "de", targetLang: "en" });
      expect(deBirth).toBe("Birth Certificate");

      const deOffice = await translateText("Standesamt", { sourceLang: "de", targetLang: "en" });
      expect(deOffice).toBe("Civil Registry Office");
    });
  });

  describe("2. Academic Degrees, Educational Credentials & Transcripts", () => {
    it("translates university degrees and avoid false equivalents", async () => {
      const diploma = await translateText("Título Universitario", { sourceLang: "es", targetLang: "en" });
      expect(diploma).toBe("University Degree Diploma");

      const degreeCert = await translateText("Acta de Grado", { sourceLang: "es", targetLang: "en" });
      expect(degreeCert).toContain("Graduation Record");

      const licLaw = await translateText("Licenciado en Derecho", { sourceLang: "es", targetLang: "en" });
      expect(licLaw).toContain("Bachelor of Laws");

      const engineer = await translateText("Ingeniero de Sistemas", { sourceLang: "es", targetLang: "en" });
      expect(engineer).toBe("Systems Engineer");

      const physician = await translateText("Médico Cirujano", { sourceLang: "es", targetLang: "en" });
      expect(physician).toContain("Doctor of Medicine");

      const cpa = await translateText("Contador Público", { sourceLang: "es", targetLang: "en" });
      expect(cpa).toContain("Certified Public Accountant");
    });

    it("translates transcripts, GPA, and graduation distinctions", async () => {
      const transcript = await translateText("Certificado de Calificaciones", { sourceLang: "es", targetLang: "en" });
      expect(transcript).toBe("Official Grade Transcript");

      const gpa = await translateText("Promedio Ponderado", { sourceLang: "es", targetLang: "en" });
      expect(gpa).toBe("Cumulative Grade Point Average (GPA)");

      const honors = await translateText("Mención de Honor", { sourceLang: "es", targetLang: "en" });
      expect(honors).toBe("Honors Distinction");

      const cumLaude = await translateText("Summa Cum Laude", { sourceLang: "es", targetLang: "en" });
      expect(cumLaude).toContain("Highest Honors");
    });

    it("translates European academic diplomas (FR / DE)", async () => {
      const frLicence = await translateText("Diplôme National de Licence", { sourceLang: "fr", targetLang: "en" });
      expect(frLicence).toContain("Bachelor's Degree");

      const frIng = await translateText("Diplôme d'Ingénieur", { sourceLang: "fr", targetLang: "en" });
      expect(frIng).toContain("Engineering");

      const deIng = await translateText("Diplom-Ingenieur", { sourceLang: "de", targetLang: "en" });
      expect(deIng).toContain("Engineering");

      const deAbitur = await translateText("Abiturzeugnis", { sourceLang: "de", targetLang: "en" });
      expect(deAbitur).toContain("University Entrance Qualification");
    });
  });

  describe("3. Legal Titles, Court Designations & Notarial Roles", () => {
    it("translates notarial instruments and legal powers of attorney", async () => {
      const notary = await translateText("Notario Público", { sourceLang: "es", targetLang: "en" });
      expect(notary).toBe("Civil Law Notary");

      const deed = await translateText("Escritura Pública", { sourceLang: "es", targetLang: "en" });
      expect(deed).toContain("Public Deed");

      const poa = await translateText("Poder Notarial", { sourceLang: "es", targetLang: "en" });
      expect(poa).toBe("Power of Attorney");

      const generalPoa = await translateText("Poder General para Pleitos y Cobranzas", { sourceLang: "es", targetLang: "en" });
      expect(generalPoa).toContain("Litigation and Collections");
    });

    it("translates court officers, judicial positions, and legal parties", async () => {
      const judge = await translateText("Juez de Primera Instancia", { sourceLang: "es", targetLang: "en" });
      expect(judge).toBe("Judge of the Court of First Instance");

      const clerk = await translateText("Secretario Judicial", { sourceLang: "es", targetLang: "en" });
      expect(clerk).toContain("Clerk of Court");

      const appearer = await translateText("Compareciente", { sourceLang: "es", targetLang: "en" });
      expect(appearer).toContain("Appearing Party");

      const license = await translateText("Cédula Profesional", { sourceLang: "es", targetLang: "en" });
      expect(license).toBe("Professional License");

      const courtTranslator = await translateText("Perito Traductor", { sourceLang: "es", targetLang: "en" });
      expect(courtTranslator).toBe("Certified Court Translator");
    });

    it("translates European legal and notarial roles (FR / DE)", async () => {
      const frNotaire = await translateText("Notaire", { sourceLang: "fr", targetLang: "en" });
      expect(frNotaire).toBe("Civil Law Notary");

      const frBailiff = await translateText("Huissier de Justice", { sourceLang: "fr", targetLang: "en" });
      expect(frBailiff).toContain("Bailiff");

      const deNotar = await translateText("Notar", { sourceLang: "de", targetLang: "en" });
      expect(deNotar).toBe("Civil Law Notary");

      const deLawyer = await translateText("Rechtsanwalt", { sourceLang: "de", targetLang: "en" });
      expect(deLawyer).toContain("Attorney at Law");
    });
  });

  describe("4. Structured Block Integration & Compound Precedence", () => {
    it("preserves compound phrases over individual token fragmentation", async () => {
      const blocks = [
        { id: "b1", text: "El Oficial del Registro Civil certifica la siguiente Acta de Nacimiento." },
        { id: "b2", text: "El Licenciado en Derecho otorgó un Poder General para Pleitos y Cobranzas ante el Notario Público." },
        { id: "b3", text: "El Promedio Ponderado consta en el Certificado de Calificaciones con Mención de Honor." },
      ];

      const translationMap = await translateStructuredBlocks(blocks, { sourceLang: "es", targetLang: "en" });

      const res1 = translationMap.get("b1")!;
      expect(res1).toContain("Civil Registry Officer");
      expect(res1).toContain("Birth Certificate");

      const res2 = translationMap.get("b2")!;
      expect(res2).toContain("Bachelor of Laws");
      expect(res2).toContain("General Power of Attorney for Litigation and Collections");
      expect(res2).toContain("Civil Law Notary");

      const res3 = translationMap.get("b3")!;
      expect(res3).toContain("Cumulative Grade Point Average (GPA)");
      expect(res3).toContain("Official Grade Transcript");
      expect(res3).toContain("Honors Distinction");
    });
  });
});
