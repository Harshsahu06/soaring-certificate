import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createDefaultCertificatePdf() {
  // A4 Landscape size: 841.89 x 595.28 points
  const width = 841.89;
  const height = 595.28;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Colors
  const darkBlue = rgb(15 / 255, 23 / 255, 42 / 255);    // #0f172a
  const gold = rgb(217 / 255, 119 / 255, 6 / 255);       // #d97706
  const borderBlue = rgb(30 / 255, 58 / 255, 138 / 255); // #1e3a8a
  const lightBg = rgb(250 / 255, 250 / 255, 249 / 255);   // #fafafa
  const textDark = rgb(31 / 255, 41 / 255, 55 / 255);    // #1f2937

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: lightBg,
  });

  // Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: borderBlue,
    borderWidth: 3,
  });

  // Inner Gold Border
  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Corner Ornaments / Accents
  const cornerSize = 40;
  // Top-left
  page.drawRectangle({ x: 20, y: height - 20 - cornerSize, width: cornerSize, height: cornerSize, color: darkBlue });
  // Top-right
  page.drawRectangle({ x: width - 20 - cornerSize, y: height - 20 - cornerSize, width: cornerSize, height: cornerSize, color: darkBlue });
  // Bottom-left
  page.drawRectangle({ x: 20, y: 20, width: cornerSize, height: cornerSize, color: darkBlue });
  // Bottom-right
  page.drawRectangle({ x: width - 20 - cornerSize, y: 20, width: cornerSize, height: cornerSize, color: darkBlue });

  // Fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Header Title
  const title = 'CERTIFICATE OF ACHIEVEMENT';
  const titleWidth = fontBold.widthOfTextAtSize(title, 28);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 100,
    size: 28,
    font: fontBold,
    color: darkBlue,
  });

  // Subtitle
  const subTitle = 'PROUDLY PRESENTED TO';
  const subTitleWidth = fontBold.widthOfTextAtSize(subTitle, 12);
  page.drawText(subTitle, {
    x: (width - subTitleWidth) / 2,
    y: height - 145,
    size: 12,
    font: fontBold,
    color: gold,
  });

  // Placeholder Name line
  page.drawLine({
    start: { x: 170, y: height - 240 },
    end: { x: width - 170, y: height - 240 },
    thickness: 1,
    color: gold,
  });

  // Presentation text
  const presText = 'for successfully completing the course and demonstrating excellence in';
  const presWidth = fontOblique.widthOfTextAtSize(presText, 14);
  page.drawText(presText, {
    x: (width - presWidth) / 2,
    y: height - 280,
    size: 14,
    font: fontOblique,
    color: textDark,
  });

  // Footer labels
  // Duration & Issue Date (Left side)
  page.drawLine({ start: { x: 100, y: 110 }, end: { x: 300, y: 110 }, thickness: 1, color: textDark });
  page.drawText('DATE & DURATION', {
    x: 145,
    y: 92,
    size: 10,
    font: fontBold,
    color: darkBlue,
  });

  // Signature (Right side)
  page.drawLine({ start: { x: width - 300, y: 110 }, end: { x: width - 100, y: 110 }, thickness: 1, color: textDark });
  page.drawText('AUTHORIZED SIGNATURE', {
    x: width - 270,
    y: 92,
    size: 10,
    font: fontBold,
    color: darkBlue,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function ensureDefaultTemplateExists() {
  const templatesDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  const defaultPath = path.join(templatesDir, 'default-template.pdf');
  if (!fs.existsSync(defaultPath)) {
    const bytes = await createDefaultCertificatePdf();
    fs.writeFileSync(defaultPath, bytes);
    console.log('Created default certificate template at:', defaultPath);
  }
}
