import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediumPdfPath = path.join(__dirname, '..', 'Medium Certificate Full RPTO Dinesh Yadav.pdf');
const smallPdfPath = path.join(__dirname, '..', 'Small Certificate template.pdf');

function inspectPdf(pdfPath, label) {
  console.log(`\n=== Inspecting ${label} ===`);
  if (!fs.existsSync(pdfPath)) {
    console.log(`File not found: ${pdfPath}`);
    return;
  }
  const data = fs.readFileSync(pdfPath, 'utf8');

  // Search for text showing Candidate Name or RPTO text or numbers
  const textMatches = data.match(/\(([^)]+)\)\s*T[jJ]/g) || data.match(/\[([^\]]+)\]\s*TJ/g);
  if (textMatches) {
    console.log(`Found ${textMatches.length} text fragments in raw PDF stream:`);
    textMatches.slice(0, 30).forEach((m) => console.log('  -', m));
  } else {
    console.log('No literal text fragments found in raw PDF stream (may be compressed stream).');
  }
}

inspectPdf(mediumPdfPath, 'Medium Certificate');
inspectPdf(smallPdfPath, 'Small Certificate');
