import fs from "fs";
import path from "path";
import JSZip from "jszip";

const fixturesDir = path.resolve(process.cwd(), "fixtures");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Minimal 1x1 transparent PNG for embedded image fixture
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

function createBaseTypesXml(hasImages = false): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImages ? '<Default Extension="png" ContentType="image/png"/>' : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;
}

const BASE_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

function createDocRels(hasImages = false): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  ${hasImages ? '<Relationship Id="rIdImage1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>' : ""}
</Relationships>`;
}

const DEFAULT_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>EXPEDIENTE JUDICIAL OFICIAL • SECCIÓN CIVIL</w:t></w:r></w:p>
</w:hdr>`;

const DEFAULT_FOOTER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:t>Copia Certificada Digital • Confidencial</w:t></w:r></w:p>
</w:ftr>`;

// 1. Long Translated Text DOCX
async function generateLongDocx() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", createBaseTypesXml());
  zip.file("_rels/.rels", BASE_RELS);
  zip.file("word/_rels/document.xml.rels", createDocRels());
  zip.file("word/header1.xml", DEFAULT_HEADER);
  zip.file("word/footer1.xml", DEFAULT_FOOTER);

  const paragraphs = [
    "MEMORANDUM DE DERECHO Y ALEGATOS DE CONCLUSIÓN",
    "El suscrito abogado defensor, en representación legal de la sociedad mercantil demandada, comparece respetuosamente ante el Juzgado de Primera Instancia para formular las siguientes consideraciones jurídicas de fondo.",
    "En primer término, es menester señalar que las obligaciones contractuales pactadas en fecha 12 de enero de 2024 fueron satisfechas en su totalidad con arreglo a la buena fe mercantil y a las normas aplicables del Código de Comercio.",
    "La contraparte pretende ignorar que los pagos correspondientes al segundo trimestre del ejercicio fiscal fueron debidamente acreditados mediante transferencias bancarias irrevocables, cuyas constancias obran en el folio cuarenta y dos del presente expediente.",
    "Asimismo, la pretendida indemnización por daños y perjuicios carece de nexo causal demostrable, toda vez que los retrasos en la entrega de suministros obedecieron a causas fortuitas y de fuerza mayor debidamente notificadas dentro del plazo legal estipulado.",
    "Por las razones expuestas, solicitamos a su Señoría desestimar íntegramente la demanda interpuesta en todas sus partes, con expresa condena en costas a la parte actora por temeridad procesal comprobada.",
    "En la ciudad de Bogotá D.C., a los veinticuatro días del mes de marzo de dos mil veintiséis."
  ];

  const bodyXml = paragraphs
    .map((p, idx) => `<w:p><w:r>${idx === 0 ? '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr>' : ''}<w:t>${p}</w:t></w:r></w:p>`)
    .join("\n");

  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${bodyXml}</w:body>
</w:document>`
  );

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(fixturesDir, "long_legal_brief.docx"), buf);
  console.log("✓ Created fixtures/long_legal_brief.docx");
}

// 2. Multi-page DOCX with explicit page breaks
async function generateMultipageDocx() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", createBaseTypesXml());
  zip.file("_rels/.rels", BASE_RELS);
  zip.file("word/_rels/document.xml.rels", createDocRels());
  zip.file("word/header1.xml", DEFAULT_HEADER);
  zip.file("word/footer1.xml", DEFAULT_FOOTER);

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>ESTATUTOS SOCIALES - PÁGINA 1</w:t></w:r></w:p>
    <w:p><w:r><w:t>Capítulo Primero: De la denominación, domicilio, objeto social y duración de la compañía.</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>ESTATUTOS SOCIALES - PÁGINA 2</w:t></w:r></w:p>
    <w:p><w:r><w:t>Capítulo Segundo: Del capital social, las acciones y los derechos de los accionistas fundadores.</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>ESTATUTOS SOCIALES - PÁGINA 3</w:t></w:r></w:p>
    <w:p><w:r><w:t>Capítulo Tercero: De la Junta General de Accionistas, la administración y la disolución legal.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file("word/document.xml", docXml);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(fixturesDir, "multipage_bylaws.docx"), buf);
  console.log("✓ Created fixtures/multipage_bylaws.docx");
}

// 3. DOCX with Embedded Drawing/Image
async function generateDocxWithImage() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", createBaseTypesXml(true));
  zip.file("_rels/.rels", BASE_RELS);
  zip.file("word/_rels/document.xml.rels", createDocRels(true));
  zip.file("word/header1.xml", DEFAULT_HEADER);
  zip.file("word/footer1.xml", DEFAULT_FOOTER);
  zip.file("word/media/image1.png", MINIMAL_PNG);

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>CERTIFICADO NOTARIAL CON FIRMA DIGITALIZADA</w:t></w:r></w:p>
    <w:p><w:r><w:t>Por medio del presente instrumento notarial, el Notario Público da fe de la autenticidad de la firma estampada a continuación.</w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:extent cx="1200000" cy="600000"/>
            <wp:docPr id="1" name="Firma Oficial Notario"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr><pic:cNvPr id="1" name="image1.png"/><pic:cNvPicPr/></pic:nvPicPr>
                  <pic:blipFill><a:blip r:embed="rIdImage1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                  <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1200000" cy="600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Dr. Roberto Méndez • Notario Segundo Titular</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file("word/document.xml", docXml);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(fixturesDir, "contract_with_signature.docx"), buf);
  console.log("✓ Created fixtures/contract_with_signature.docx");
}

// 4. DOCX with Complex Tables (multi-row headers, grid spans)
async function generateComplexTableDocx() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", createBaseTypesXml());
  zip.file("_rels/.rels", BASE_RELS);
  zip.file("word/_rels/document.xml.rels", createDocRels());
  zip.file("word/header1.xml", DEFAULT_HEADER);
  zip.file("word/footer1.xml", DEFAULT_FOOTER);

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>ESTADO FINANCIERO Y CUADRO DE DISTRIBUCIÓN DE DIVIDENDOS</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Clasificación Contable</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Ejercicio Fiscal 2025</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Cuenta Principal</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Subcuenta Auxiliar</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Monto Bruto</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Retención Fiscal</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Activos Corrientes</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Caja y Bancos</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$150,000 USD</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$15,000 USD</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Pasivos No Corrientes</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Deuda Financiera</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$45,000 USD</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$4,500 USD</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;

  zip.file("word/document.xml", docXml);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(fixturesDir, "complex_financial_table.docx"), buf);
  console.log("✓ Created fixtures/complex_financial_table.docx");
}

// 5. Corrupted File (Junk bytes)
function generateCorruptedFile() {
  const junk = Buffer.from("THIS_IS_A_CORRUPTED_FILE_WITH_NO_VALID_HEADER_OR_CENTRAL_DIRECTORY_1234567890");
  fs.writeFileSync(path.join(fixturesDir, "corrupted_document.docx"), junk);
  console.log("✓ Created fixtures/corrupted_document.docx");
}

async function main() {
  await generateLongDocx();
  await generateMultipageDocx();
  await generateDocxWithImage();
  await generateComplexTableDocx();
  generateCorruptedFile();
  console.log("All extra fixtures generated successfully!");
}

main().catch(console.error);
