import fs from "fs";
import path from "path";
import JSZip from "jszip";

async function generateRealEmploymentContractDocx() {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/_rels/document.xml.rels
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`
  );

  // word/header1.xml
  zip.file(
    "word/header1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r>
      <w:rPr><w:rFonts w:ascii="Calibri"/><w:sz w:val="18"/></w:rPr>
      <w:t>GRUPO TECNOLÓGICO INTERNACIONAL • DEPARTAMENTO LABORAL</w:t>
    </w:r>
  </w:p>
</w:hdr>`
  );

  // word/footer1.xml
  zip.file(
    "word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r>
      <w:rPr><w:rFonts w:ascii="Calibri"/><w:sz w:val="16"/></w:rPr>
      <w:t>Documento Privado y Confidencial • Página 1 de 1</w:t>
    </w:r>
  </w:p>
</w:ftr>`
  );

  // word/document.xml
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t>CONTRATO INDIVIDUAL DE TRABAJO A TIEMPO INDETERMINADO</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>En la ciudad de Madrid, a 15 de febrero de 2026, celebran el presente contrato de trabajo la empresa Innovaciones Digitales S.L. como Empleador, y el Licenciado Alejandro Ramírez como Empleado.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>CLÁUSULA PRIMERA: CARGO Y FUNCIONES</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>El Empleado desempeñará el cargo de Ingeniero Principal de Sistemas con dedicación a tiempo completo.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>CLÁUSULA SEGUNDA: ESTRUCTURA DE COMPENSACIÓN</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Concepto</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Importe Mensual</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Frecuencia de Pago</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Salario Base Garantizado</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$7,500 USD</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Mensual vencido</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Bono por Rendimiento</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$2,000 USD</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Trimestral por objetivos</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>CLÁUSULA TERCERA: OBLIGACIÓN DE CONFIDENCIALIDAD</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:i/></w:rPr>
        <w:t>Toda información técnica, comercial o financiera a la que tenga acceso el empleado será considerada secreto empresarial confidencial.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Firmado en dos ejemplares de un mismo tenor y efecto en la fecha arriba indicada.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
  );

  const docxBytes = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  const fixturesDir = path.resolve(process.cwd(), "fixtures");
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const outPath = path.join(fixturesDir, "real_employment_contract.docx");
  fs.writeFileSync(outPath, docxBytes);
  console.log(`✓ Successfully generated OpenXML fixture: ${outPath} (${docxBytes.length} bytes)`);
}

generateRealEmploymentContractDocx().catch((err) => {
  console.error("Failed to generate fixture:", err);
  process.exit(1);
});
