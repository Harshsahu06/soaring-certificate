import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import JSZip from 'jszip';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Certificate from './models/Certificate.js';
import TemplateConfig from './models/TemplateConfig.js';
import { ensureDefaultTemplateExists } from './defaultTemplate.js';
import { generateCertificatePdf, DEFAULT_FIELD_CONFIGS, SMALL_CERTIFICATE_CONFIGS } from './pdfEngine.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads (for logo)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api/soaring', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Certificate Generator Backend API is running',
   
  });
});
// Directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const GENERATED_DIR = path.join(__dirname, 'generated');

[UPLOADS_DIR, TEMPLATES_DIR, GENERATED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer storage
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMPLATES_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage: uploadStorage });
const uploadTemplate = multer({ storage: templateStorage });

// Serve cert.html directly
app.get('/cert.html', (req, res) => {
  const certPath = path.join(__dirname, '..', 'cert.html');
  if (fs.existsSync(certPath)) {
    res.sendFile(certPath);
  } else {
    res.status(404).send('cert.html not found');
  }
});

// Serve template files for preview
app.get('/api/templates/file/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(TEMPLATES_DIR, filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        res.setHeader('Content-Type', `image/${ext === '.jpg' ? 'jpeg' : ext.replace('.', '')}`);
      }
      res.sendFile(filePath);
    } else {
      res.status(404).send('Template file not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Initialize DB and Default Template
let isDbConnected = false;
connectDB().then((connected) => {
  isDbConnected = connected;
});
// ensureDefaultTemplateExists();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health Check with DB Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Certificate Generator Backend API is running',
    dbConnected: isDbConnected,
  });
});

// List Available Templates & Saved Field Configs
app.get('/api/templates', async (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templates = files.map((file) => {
      const ext = path.extname(file).toLowerCase();
      return {
        filename: file,
        name: path.basename(file, ext),
        type: ext === '.pdf' ? 'pdf' : ['png', 'jpg', 'jpeg'].includes(ext.replace('.', '')) ? 'image' : 'unknown',
        path: path.join(TEMPLATES_DIR, file),
      };
    });

    // Retrieve custom saved field configs from DB if connected
    let dbConfigs = {};
    if (isDbConnected) {
      const configsDoc = await TemplateConfig.find({});
      configsDoc.forEach((item) => {
        dbConfigs[item.templateName] = item.fieldConfigs;
      });
    }

    res.json({
      success: true,
      templates,
      defaultConfig: DEFAULT_FIELD_CONFIGS,
      smallConfig: SMALL_CERTIFICATE_CONFIGS,
      savedConfigs: dbConfigs,
      dbConnected: isDbConnected,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload New Template
app.post('/api/templates/upload', uploadTemplate.single('templateFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const type = ext === '.pdf' ? 'pdf' : 'image';

    if (isDbConnected) {
      await TemplateConfig.findOneAndUpdate(
        { templateName: req.file.filename },
        { templateName: req.file.filename, type, fieldConfigs: DEFAULT_FIELD_CONFIGS },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Template uploaded successfully',
      filename: req.file.filename,
      type,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific template coordinates
app.get('/api/configs/:templateName', async (req, res) => {
  try {
    const { templateName } = req.params;
    if (isDbConnected) {
      const config = await TemplateConfig.findOne({ templateName }).lean();
      if (config) {
        return res.json({ success: true, config });
      }
    }

    // Return defaults if not found or DB not connected
    const isSmall = templateName.toLowerCase().includes('small');
    return res.json({
      success: true,
      config: {
        templateName,
        fieldConfigs: isSmall ? SMALL_CERTIFICATE_CONFIGS : DEFAULT_FIELD_CONFIGS
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save / Update Field Coordinates in MongoDB
app.post('/api/configs/save', async (req, res) => {
  try {
    const { templateName, fieldConfigs } = req.body;
    if (!templateName || !fieldConfigs) {
      return res.status(400).json({ success: false, message: 'Template name and fieldConfigs required' });
    }

    if (isDbConnected) {
      await TemplateConfig.findOneAndUpdate(
        { templateName },
        { templateName, fieldConfigs },
        { upsert: true, new: true }
      );
      res.json({ success: true, message: 'Template coordinates saved to MongoDB' });
    } else {
      res.json({ success: true, message: 'Coordinates updated in session' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate Single Certificate PDF + Store in MongoDB
app.post('/api/generate-single', async (req, res) => {
  try {
    const {
      candidateName = 'John Doe',
      courseName = 'Full Stack Development',
      duration = '3 Months',
      issueDate = new Date().toLocaleDateString('en-GB'),
      certificateNo = 'SAPL/2026/' + Math.floor(100000 + Math.random() * 900000),
      rollNo = '',
      groundFrom = '',
      groundTo = '',
      simulatorFrom = '',
      simulatorTo = '',
      uin = '',
      templateFileName = 'default-template.pdf',
      customConfig = {},
      preview = false,
    } = req.body;

    const templatePath = path.join(TEMPLATES_DIR, templateFileName);
    const pdfBytes = await generateCertificatePdf(
      {
        candidateName,
        courseName,
        duration,
        issueDate,
        certificateNo,
        rollNo,
        groundFrom,
        groundTo,
        simulatorFrom,
        simulatorTo,
        uin,
      },
      templatePath,
      customConfig
    );

    if (!preview && isDbConnected) {
      try {
        await Certificate.create({
          candidateName,
          courseName,
          duration,
          issueDate,
          certificateNo,
          templateName: templateFileName,
          generationType: 'single',
        });
      } catch (dbErr) {
        console.warn('Failed to save certificate record to MongoDB:', dbErr.message);
      }
    }

    if (preview) {
      const base64Pdf = Buffer.from(pdfBytes).toString('base64');
      return res.json({ success: true, pdfBase64: `data:application/pdf;base64,${base64Pdf}` });
    }

    const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${safeName}_${certificateNo}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating single certificate:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Parse Excel / CSV File
app.post('/api/parse-excel', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    fs.unlinkSync(req.file.path);

    const normalizedData = rawData.map((row, index) => {
      const getVal = (...keys) => {
        for (const k of keys) {
          const matchedKey = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
          if (matchedKey && row[matchedKey] !== undefined) return String(row[matchedKey]).trim();
        }
        return '';
      };

      return {
        id: index + 1,
        candidateName: getVal('candidate name', 'name', 'student name', 'candidate') || `Candidate ${index + 1}`,
        courseName: getVal('course name', 'course', 'program', 'subject') || 'General Course',
        duration: getVal('duration', 'period', 'months', 'time') || '1 Month',
        issueDate: getVal('issue date', 'date', 'issued date', 'issue_date') || new Date().toLocaleDateString('en-GB'),
        certificateNo: getVal('certificate number', 'certificate no', 'cert no', 'id', 'code') || `SAPL/2026/${1000 + index}`,
        rollNo: getVal('roll no', 'roll number', 'rollno', 'roll_no') || '',
        groundFrom: getVal('ground from', 'ground_from', 'ground start') || '',
        groundTo: getVal('ground to', 'ground_to', 'ground end') || '',
        simulatorFrom: getVal('simulator from', 'simulator_from', 'simulator start') || '',
        simulatorTo: getVal('simulator to', 'simulator_to', 'simulator end') || '',
        uin: getVal('uin', 'uin number', 'uin_no') || '',
      };
    });

    res.json({
      success: true,
      totalCount: normalizedData.length,
      records: normalizedData,
    });
  } catch (error) {
    console.error('Error parsing Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to parse Excel/CSV file: ' + error.message });
  }
});

// Bulk Generation -> Stores All in MongoDB + Downloads ZIP
app.post('/api/generate-bulk', async (req, res) => {
  try {
    const { records = [], templateFileName = 'default-template.pdf', customConfig = {} } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No records provided for bulk generation' });
    }

    const templatePath = path.join(TEMPLATES_DIR, templateFileName);
    const zip = new JSZip();
    const dbDocs = [];

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const candidateName = rec.candidateName || rec.Name || `Candidate_${i + 1}`;
      const courseName = rec.courseName || rec.Course || 'Course';
      const duration = rec.duration || rec.Duration || '';
      const issueDate = rec.issueDate || rec.Date || '';
      const certificateNo = rec.certificateNo || rec['Certificate No'] || `SAPL/2026/${1000 + i}`;

      const pdfBytes = await generateCertificatePdf(
        {
          candidateName,
          courseName,
          duration,
          issueDate,
          certificateNo,
          rollNo: rec.rollNo || '',
          groundFrom: rec.groundFrom || '',
          groundTo: rec.groundTo || '',
          simulatorFrom: rec.simulatorFrom || '',
          simulatorTo: rec.simulatorTo || '',
          uin: rec.uin || '',
        },
        templatePath,
        customConfig
      );

      const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeCertNo = certificateNo.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}_${safeCertNo}.pdf`;

      zip.file(fileName, pdfBytes);

      dbDocs.push({
        candidateName,
        courseName,
        duration,
        issueDate,
        certificateNo,
        templateName: templateFileName,
        generationType: 'bulk',
      });
    }

    if (isDbConnected && dbDocs.length > 0) {
      try {
        await Certificate.insertMany(dbDocs);
      } catch (dbErr) {
        console.warn('Failed to insert bulk certificates into MongoDB:', dbErr.message);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Certificates_Bundle.zip"');
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error in bulk generation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Certificate History from MongoDB
app.get('/api/certificates', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json({ success: true, dbConnected: false, certificates: [] });
    }

    const certificates = await Certificate.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({
      success: true,
      dbConnected: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server (Only if not running on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Certificate Generator Backend running on http://127.0.0.1:${PORT}`);
  });
}

export default app;
