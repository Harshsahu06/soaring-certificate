import express from 'express';
import path from 'path';
import Batch from '../models/Batch.js';
import Candidate from '../models/Candidate.js';
import UIN from '../models/UIN.js';
import Certificate from '../models/Certificate.js';
import TemplateConfig from '../models/TemplateConfig.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { generateCertificatePdf } from '../pdfEngine.js';

const router = express.Router();

router.use(protect, admin);

// ========================
// Batches
// ========================
router.post('/batches', async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find().sort('-createdAt');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// Candidates
// ========================
router.post('/candidates', async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('batch').sort('-createdAt');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/candidates/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// UINs
// ========================
router.post('/uins', async (req, res) => {
  try {
    const uin = await UIN.create({ uinNumber: req.body.uinNumber });
    res.status(201).json(uin);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'UIN already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/uins', async (req, res) => {
  try {
    const uins = await UIN.find().populate('assignedTo').sort('-createdAt');
    res.json(uins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/uins/:id', async (req, res) => {
  try {
    await UIN.findByIdAndDelete(req.params.id);
    res.json({ message: 'UIN deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// Certificate Generation
// ========================
router.post('/generate-certificate', async (req, res) => {
  try {
    const { candidateId, uinId, certificateNo, courseName, duration, issueDate, templateFileName = 'default-template.pdf' } = req.body;

    const candidate = await Candidate.findById(candidateId).populate('batch');
    const uin = await UIN.findById(uinId);

    if (!candidate || !uin) {
      return res.status(404).json({ message: 'Candidate or UIN not found' });
    }

    // Generate PDF
    const certData = {
      candidateName: candidate.fullName,
      courseName,
      duration,
      issueDate,
      certificateNo,
      rollNo: candidate.rollNo || `R-${candidate.aadharNumber.slice(-4)}`,
      groundFrom: candidate.batch.groundClassFrom,
      groundTo: candidate.batch.groundClassTo,
      simulatorFrom: candidate.batch.simulatorFrom,
      simulatorTo: candidate.batch.simulatorTo,
      uin: uin.uinNumber
    };

    // Load custom config if it exists from DB and merge with frontend cache
    let customConfig = req.body.customConfig || {};
    try {
      const configDoc = await TemplateConfig.findOne({ templateName: templateFileName }).lean();
      if (configDoc && configDoc.fieldConfigs) {
        customConfig = { ...configDoc.fieldConfigs, ...customConfig };
      }
    } catch (dbErr) {
      console.warn('Failed to fetch template config from DB, using frontend cache if available');
    }

    const templatePath = path.join(process.cwd(), 'templates', templateFileName);
    const pdfBytes = await generateCertificatePdf(certData, templatePath, customConfig);

    // Save record to DB
    const cert = await Certificate.create({
      candidateName: candidate.fullName,
      courseName,
      duration,
      issueDate,
      certificateNo,
      templateName: templateFileName,
      generationType: 'single'
    });

    // Update UIN usage count (optional, just for tracking)
    uin.isAssigned = true;
    await uin.save();

    candidate.uin = uin.uinNumber;
    candidate.certificate = cert._id;
    if(!candidate.rollNo) candidate.rollNo = `R-${candidate.aadharNumber.slice(-4)}`;
    await candidate.save();

    const safeName = candidate.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${safeName}_${certificateNo}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
