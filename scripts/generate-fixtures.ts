import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { Jimp } from "jimp";

async function main() {
  const fixturesDir = path.join(process.cwd(), "fixtures");
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  console.log("Generating real test fixtures in fixtures/...");

  // 1. Generate real multi-page PDF with table layout
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Birth Certificate
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header
  page1.drawText("REPÚBLICA DE COLOMBIA", {
    x: 210,
    y: height - 60,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page1.drawText("REGISTRO DEL ESTADO CIVIL", {
    x: 200,
    y: height - 80,
    size: 12,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page1.drawText("REGISTRO CIVIL DE NACIMIENTO", {
    x: 195,
    y: height - 100,
    size: 11,
    font: fontBold,
    color: rgb(0.15, 0.3, 0.7),
  });

  // Table grid
  const tableY = height - 140;
  page1.drawRectangle({
    x: 50,
    y: tableY - 120,
    width: width - 100,
    height: 120,
    borderColor: rgb(0.3, 0.3, 0.3),
    borderWidth: 1,
  });

  // Table rows
  page1.drawLine({ start: { x: 50, y: tableY - 40 }, end: { x: width - 50, y: tableY - 40 }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
  page1.drawLine({ start: { x: 50, y: tableY - 80 }, end: { x: width - 50, y: tableY - 80 }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
  page1.drawLine({ start: { x: 220, y: tableY }, end: { x: 220, y: tableY - 120 }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });

  page1.drawText("Nombre completo:", { x: 60, y: tableY - 25, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page1.drawText("CAMILA SOFÍA VALENCIA MENDOZA", { x: 230, y: tableY - 25, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  page1.drawText("Fecha de nacimiento:", { x: 60, y: tableY - 65, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page1.drawText("14 de Mayo de 1998", { x: 230, y: tableY - 65, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  page1.drawText("Lugar de nacimiento:", { x: 60, y: tableY - 105, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page1.drawText("Bogotá D.C., Colombia", { x: 230, y: tableY - 105, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  // Page 2: Notary Attestation
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText("NOTARIO PÚBLICO - CÍRCULO DE BOGOTÁ", {
    x: 170,
    y: height - 60,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page2.drawText("Certifico que la presente copia es fiel y auténtica reproducción del original que reposa en los archivos.", {
    x: 60,
    y: height - 100,
    size: 9,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(fixturesDir, "sample_birth_cert.pdf"), pdfBytes);
  console.log("✓ Created fixtures/sample_birth_cert.pdf (2 pages with table)");

  // 2. Generate real DOCX file with tables, headers, and styled runs
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
</Relationships>`
  );

  zip.file(
    "word/header1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:r><w:t>UNIVERSIDAD NACIONAL AUTÓNOMA • ACTA DE CALIFICACIONES OFICIAL</w:t></w:r>
  </w:p>
</w:hdr>`
  );

  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>CERTIFICADO OFICIAL DE ESTUDIOS Y CALIFICACIONES</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>El suscrito Secretario General de la Universidad certifica que el estudiante ha completado los estudios correspondientes a la Licenciatura en Derecho.</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Materia / Asignatura</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Calificaciones</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Resultado</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Derecho Constitucional</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>9.5 / 10</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Aprobado con Distinción</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Derecho Internacional Privado</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>10.0 / 10</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Aprobado con Mención de Honor</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:r><w:t>Dado en la ciudad universitaria para los fines legales pertinentes.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`
  );

  const docxBytes = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(fixturesDir, "sample_transcript.docx"), docxBytes);
  console.log("✓ Created fixtures/sample_transcript.docx (OpenXML with table & header)");

  // 3. Generate sample PNG
  const pngImg = new Jimp({ width: 640, height: 400, color: 0xffffffff });
  // Draw card border
  for (let x = 20; x < 620; x++) {
    pngImg.setPixelColor(0x334155ff, x, 20);
    pngImg.setPixelColor(0x334155ff, x, 380);
  }
  for (let y = 20; y < 380; y++) {
    pngImg.setPixelColor(0x334155ff, 20, y);
    pngImg.setPixelColor(0x334155ff, 620, y);
  }
  const pngBuf = await pngImg.getBuffer("image/png");
  fs.writeFileSync(path.join(fixturesDir, "sample_id_card.png"), pngBuf);
  console.log("✓ Created fixtures/sample_id_card.png");

  // 4. Generate sample JPG
  const jpgImg = new Jimp({ width: 600, height: 450, color: 0xfaf8f5ff });
  for (let x = 30; x < 570; x++) {
    jpgImg.setPixelColor(0xb45309ff, x, 30);
    jpgImg.setPixelColor(0xb45309ff, x, 420);
  }
  for (let y = 30; y < 420; y++) {
    jpgImg.setPixelColor(0xb45309ff, 30, y);
    jpgImg.setPixelColor(0xb45309ff, 570, y);
  }
  const jpgBuf = await jpgImg.getBuffer("image/jpeg");
  fs.writeFileSync(path.join(fixturesDir, "sample_diploma.jpg"), jpgBuf);
  console.log("✓ Created fixtures/sample_diploma.jpg");

  console.log("All fixtures generated successfully!");
}

main().catch(console.error);
