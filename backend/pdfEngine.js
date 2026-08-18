import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert hex color (#RRGGBB) to pdf-lib rgb()
function hexToRgb(hex) {
  if (!hex) return rgb(0, 0, 0);
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

// Default layout coordinates for General Certificate
export const DEFAULT_FIELD_CONFIGS = {
  candidateName: { x: 420.94, y: 375, fontSize: 32, font: 'Arial-Bold', color: '#dc2626', align: 'center' },
  courseName: { x: 420.94, y: 275, fontSize: 10, font: 'Arial-Bold', color: '#d97706', align: 'center' },
  duration: { x: 200, y: 120, fontSize: 11, font: 'Geometric-Sans', color: '#374151', align: 'center' },
  issueDate: { x: 200, y: 140, fontSize: 12, font: 'Geometric-Sans-Bold', color: '#111827', align: 'center' },
  certificateNo: { x: 730, y: 540, fontSize: 11, font: 'Geometric-Sans-Bold', color: '#4b5563', align: 'right' },
};

// Preset field coordinates for Small & Medium RPTO Certificate templates
export const RPTO_CERTIFICATE_CONFIGS = {
  candidateName: { x: 421, y: 278, fontSize: 24, font: 'Arial-Bold', align: 'center', color: '#dc2626' },
  rollNo: { x: 355, y: 248, fontSize: 14, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  groundFrom: { x: 375, y: 190, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  groundTo: { x: 495, y: 190, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  simulatorFrom: { x: 425, y: 168, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  simulatorTo: { x: 545, y: 168, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  certificateNo: { x: 410, y: 120, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
  uin: { x: 385, y: 96, fontSize: 13, font: 'Geometric-Sans', align: 'left', color: '#000000' },
};

export const SMALL_CERTIFICATE_CONFIGS = RPTO_CERTIFICATE_CONFIGS;
export const MEDIUM_CERTIFICATE_CONFIGS = RPTO_CERTIFICATE_CONFIGS;

export async function generateCertificatePdf(data, templatePath, customConfig = {}) {
  let pdfDoc;
  let page;
  let width, height;

  const fileNameLower = templatePath ? path.basename(templatePath).toLowerCase() : '';
  const isRptoCert = fileNameLower.includes('small') || fileNameLower.includes('medium') || fileNameLower.includes('rpto');
  const baseDefaults = isRptoCert ? RPTO_CERTIFICATE_CONFIGS : DEFAULT_FIELD_CONFIGS;
  const config = { ...baseDefaults, ...customConfig };

  if (templatePath && fs.existsSync(templatePath)) {
    const ext = path.extname(templatePath).toLowerCase();
    if (ext === '.pdf') {
      const templateBytes = fs.readFileSync(templatePath);
      pdfDoc = await PDFDocument.load(templateBytes);
      page = pdfDoc.getPages()[0];
      const size = page.getSize();
      width = size.width;
      height = size.height;
    } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      pdfDoc = await PDFDocument.create();
      width = 841.89; // Standard A4 Landscape
      height = 595.28;
      page = pdfDoc.addPage([width, height]);

      const imageBytes = fs.readFileSync(templatePath);
      const img = ext === '.png' ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }
  }

  // Fallback to default template file
  if (!pdfDoc) {
    const defaultPath = path.join(__dirname, 'templates', 'default-template.pdf');
    if (fs.existsSync(defaultPath)) {
      const templateBytes = fs.readFileSync(defaultPath);
      pdfDoc = await PDFDocument.load(templateBytes);
      page = pdfDoc.getPages()[0];
      const size = page.getSize();
      width = size.width;
      height = size.height;
    } else {
      throw new Error('No valid template found to generate certificate.');
    }
  }

  pdfDoc.registerFontkit(fontkit);

  let customFonts = {};
  try {
    const fontsDir = path.join(__dirname, 'fonts');
    if (fs.existsSync(path.join(fontsDir, 'Arimo-Regular.ttf'))) {
      customFonts['Arial'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Arimo-Regular.ttf')));
      customFonts['Arial-Bold'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Arimo-Bold.ttf')));
      customFonts['Geometric-Sans'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Montserrat-Regular.ttf')));
      customFonts['Geometric-Sans-Bold'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Montserrat-Bold.ttf')));
      if (fs.existsSync(path.join(fontsDir, 'Montserrat-SemiBold.ttf'))) {
        customFonts['Geometric-Sans-SemiBold'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Montserrat-SemiBold.ttf')));
      }
      if (fs.existsSync(path.join(fontsDir, 'Montserrat-Light.ttf'))) {
        customFonts['Geometric-Sans-Light'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Montserrat-Light.ttf')));
      }
      if (fs.existsSync(path.join(fontsDir, 'Montserrat-Medium.ttf'))) {
        customFonts['Geometric-Sans-Medium'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'Montserrat-Medium.ttf')));
      }
      if (fs.existsSync(path.join(fontsDir, 'GillSansMT.ttf'))) {
        customFonts['Gill-Sans-MT'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'GillSansMT.ttf')));
      }
      if (fs.existsSync(path.join(fontsDir, 'GillSansMT-Bold.ttf'))) {
        customFonts['Gill-Sans-MT-Bold'] = await pdfDoc.embedFont(fs.readFileSync(path.join(fontsDir, 'GillSansMT-Bold.ttf')));
      }
    }
  } catch (err) {
    console.warn('Failed to load custom TTF fonts, falling back to standard fonts.', err);
  }

  // Pre-load standard fonts
  const fonts = {
    'Helvetica': await pdfDoc.embedFont(StandardFonts.Helvetica),
    'Helvetica-Bold': await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    'Helvetica-Oblique': await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    'Times-Roman': await pdfDoc.embedFont(StandardFonts.TimesRoman),
    'Times-Bold': await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    'TimesRoman': await pdfDoc.embedFont(StandardFonts.TimesRoman),
    'Courier': await pdfDoc.embedFont(StandardFonts.Courier),
    'Courier-Bold': await pdfDoc.embedFont(StandardFonts.CourierBold),
  };

  fonts['Arial'] = customFonts['Arial'] || fonts['Helvetica'];
  fonts['Arial-Bold'] = customFonts['Arial-Bold'] || fonts['Helvetica-Bold'];
  fonts['Geometric-Sans'] = customFonts['Geometric-Sans'] || fonts['Helvetica'];
  fonts['Geometric-Sans-Bold'] = customFonts['Geometric-Sans-Bold'] || fonts['Helvetica-Bold'];
  fonts['Geometric-Sans-SemiBold'] = customFonts['Geometric-Sans-SemiBold'] || fonts['Helvetica-Bold'];
  fonts['Geometric-Sans-Light'] = customFonts['Geometric-Sans-Light'] || fonts['Geometric-Sans'] || fonts['Helvetica'];
  fonts['Geometric-Sans-Medium'] = customFonts['Geometric-Sans-Medium'] || fonts['Geometric-Sans-SemiBold'] || fonts['Geometric-Sans'] || fonts['Helvetica'];
  fonts['Gill-Sans-MT'] = customFonts['Gill-Sans-MT'] || fonts['Helvetica'];
  fonts['Gill-Sans-MT-Bold'] = customFonts['Gill-Sans-MT-Bold'] || fonts['Helvetica-Bold'];
  fonts['Gill-Sans-MT-SemiBold'] = fonts['Gill-Sans-MT-Bold']; // fallback for semibold

  // Helper to draw text for any field defined in config
  const drawFieldText = (key, textValue) => {
    if (textValue === undefined || textValue === null || textValue === '') return;
    const fieldConf = config[key];
    if (!fieldConf) return;

    let fontKey = fieldConf.font || 'Helvetica';
    const wt = String(fieldConf.fontWeight);
    if ((wt === 'bold' || wt === '700' || wt === '800' || wt === '900') && !fontKey.includes('Bold')) {
      if (fonts[`${fontKey}-Bold`]) fontKey = `${fontKey}-Bold`;
    } else if ((wt === 'semibold' || wt === '600') && !fontKey.includes('SemiBold')) {
      if (fonts[`${fontKey}-SemiBold`]) fontKey = `${fontKey}-SemiBold`;
    } else if ((wt === 'medium' || wt === '500') && !fontKey.includes('Medium')) {
      if (fonts[`${fontKey}-Medium`]) fontKey = `${fontKey}-Medium`;
    } else if ((wt === 'light' || wt === '300' || wt === '200' || wt === '100') && !fontKey.includes('Light')) {
      if (fonts[`${fontKey}-Light`]) fontKey = `${fontKey}-Light`;
    }

    const fontObj = fonts[fontKey] || fonts[fieldConf.font] || fonts['Helvetica'];
    const size = Number(fieldConf.fontSize) || 16;
    const colorObj = hexToRgb(fieldConf.color || '#000000');

    let textX = Number(fieldConf.x) || 100;
    const textY = Number(fieldConf.y) || 100;

    const strVal = String(textValue);
    const textWidth = fontObj.widthOfTextAtSize(strVal, size);

    if (fieldConf.align === 'center') {
      textX = textX - textWidth / 2;
    } else if (fieldConf.align === 'right') {
      textX = textX - textWidth;
    }

    page.drawText(strVal, {
      x: textX,
      y: textY,
      size,
      font: fontObj,
      color: colorObj,
    });
  };

  // Dynamically iterate over all keys in data
  Object.keys(data).forEach((key) => {
    let val = data[key];
    if (key === 'candidateName' && typeof val === 'string') {
      val = val.toUpperCase();
    }
    if (!isRptoCert) {
      if (key === 'duration' && val && !val.startsWith('Duration:')) val = `Duration: ${val}`;
      if (key === 'issueDate' && val && !val.startsWith('Issued:')) val = `Issued: ${val}`;
      if (key === 'certificateNo' && val && !val.startsWith('Cert No:')) val = `Cert No: ${val}`;
    }
    drawFieldText(key, val);
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
