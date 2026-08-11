import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractTextAndCoords(pdfFileName) {
  const filePath = path.join(__dirname, '..', pdfFileName);
  console.log(`\n========================================`);
  console.log(`Extracting Text & Coordinates from: ${pdfFileName}`);
  console.log(`========================================`);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const pdfBuf = fs.readFileSync(filePath);
  const pdfStr = pdfBuf.toString('binary');

  // Find stream objects
  const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/g;
  let match;
  let streamCount = 0;

  while ((match = streamRegex.exec(pdfStr)) !== null) {
    streamCount++;
    const rawData = Buffer.from(match[1], 'binary');
    let decompressed;

    try {
      decompressed = zlib.inflateSync(rawData);
    } catch (e) {
      try {
        decompressed = zlib.unzipSync(rawData);
      } catch (e2) {
        continue;
      }
    }

    const content = decompressed.toString('utf8');

    // Look for text matrix (Tm) and text operations (Tj, TJ)
    // Tm format: a b c d x y Tm
    const lines = content.split(/[\r\n]+/);
    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check Tm line: e.g. 1 0 0 1 421 350 Tm or 24 0 0 24 421 350 Tm
      const tmMatch = line.match(/([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+Tm/);
      if (tmMatch) {
        currentX = parseFloat(tmMatch[5]);
        currentY = parseFloat(tmMatch[6]);
      }

      // Check Td line: dx dy Td
      const tdMatch = line.match(/([0-9.-]+)\s+([0-9.-]+)\s+Td/);
      if (tdMatch) {
        currentX += parseFloat(tdMatch[1]);
        currentY += parseFloat(tdMatch[2]);
      }

      // Check text line: (string) Tj or [ (string) ... ] TJ
      if (line.includes('Tj') || line.includes('TJ')) {
        const textExtracts = line.match(/\(([^)]+)\)/g) || [];
        const cleanText = textExtracts.map((t) => t.replace(/[()]/g, '')).join('');
        if (cleanText.length > 0) {
          console.log(`X: ${currentX.toFixed(1)}, Y: ${currentY.toFixed(1)} -> "${cleanText}"`);
        }
      }
    }
  }
}

extractTextAndCoords('Small Certificate template.pdf');
extractTextAndCoords('Medium Certificate Full RPTO Dinesh Yadav.pdf');
