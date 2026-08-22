import express from 'express';
import path from 'path';
import Batch from '../models/Batch.js';
import Candidate from '../models/Candidate.js';
import UIN from '../models/UIN.js';
import Certificate from '../models/Certificate.js';
import TemplateConfig from '../models/TemplateConfig.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { generateCertificatePdf } from '../pdfEngine.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    let batches = await Batch.find().sort('-createdAt');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updated = false;
    for (let batch of batches) {
      if (!batch.isStatusOverridden) {
        const toDates = [batch.groundClassTo, batch.simulatorTo, batch.flyingClassTo].filter(Boolean).map(d => new Date(d));
        const fromDates = [batch.groundClassFrom, batch.simulatorFrom, batch.flyingClassFrom].filter(Boolean).map(d => new Date(d));
        
        if (toDates.length > 0 && fromDates.length > 0) {
          const maxDate = new Date(Math.max(...toDates));
          maxDate.setHours(0, 0, 0, 0);
          const minDate = new Date(Math.min(...fromDates));
          minDate.setHours(0, 0, 0, 0);

          let newStatus = batch.status;
          if (today > maxDate) {
            newStatus = 'Completed';
          } else if (today >= minDate && today <= maxDate) {
            newStatus = 'Active';
          } else if (today < minDate) {
            newStatus = 'Pending';
          }

          // In case it's currently something like 'active' from older schema
          if (batch.status === 'active') batch.status = 'Active';

          if (batch.status !== newStatus) {
            batch.status = newStatus;
            try {
              await batch.save();
              updated = true;
            } catch (err) {
              console.warn(`Could not auto-update batch ${batch._id}:`, err.message);
            }
          }
        }
      }
    }

    if (updated) {
      batches = await Batch.find().sort('-createdAt');
    }

    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/batches/:id', async (req, res) => {
  try {
    const existing = await Batch.findById(req.params.id);
    if (req.body.status && existing.status !== req.body.status) {
       req.body.isStatusOverridden = true;
    }
    // Allow frontend to explicitly reset the override (e.g. if they just want it to auto-manage again)
    if (req.body.resetOverride) {
       req.body.isStatusOverridden = false;
    }

    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const requiredPassword = process.env.DELETE_PASSWORD || 'soaring@2026';
    if (password !== requiredPassword) {
      return res.status(401).json({ message: 'Incorrect password. Deletion denied.' });
    }
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
    const { password } = req.body;
    const requiredPassword = process.env.DELETE_PASSWORD || 'soaring@2026';
    if (password !== requiredPassword) {
      return res.status(401).json({ message: 'Incorrect password. Deletion denied.' });
    }
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
    const { password } = req.body;
    const requiredPassword = process.env.DELETE_PASSWORD || 'soaring@2026';
    if (password !== requiredPassword) {
      return res.status(401).json({ message: 'Incorrect password. Deletion denied.' });
    }
    await UIN.findByIdAndDelete(req.params.id);
    res.json({ message: 'UIN deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================
// Certificate Generation & Sequence
// ========================
router.get('/next-sequence', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const certs = await Certificate.find({ certificateNo: new RegExp(`^SAPL/${currentYear}/`) }, 'certificateNo');
    
    // Default to 158 for 2026 based on user requirement, 0 for other years to reset
    let maxSeq = currentYear === 2026 ? 158 : 0; 
    
    certs.forEach(c => {
      const parts = c.certificateNo.split('/');
      if (parts.length === 3) {
        const seq = parseInt(parts[2]);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    res.json({ nextSequence: maxSeq + 1, year: currentYear });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/next-rollno', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const candidates = await Candidate.find({ rollNo: new RegExp(`^SAPL/${currentYear}/DPC/`) }, 'rollNo');
    
    let maxSeq = currentYear === 2026 ? 158 : 0; 
    
    candidates.forEach(c => {
      const parts = c.rollNo.split('/');
      if (parts.length === 4) {
        const seq = parseInt(parts[3]);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    // Default start logic, maybe start from 1
    const nextSequence = maxSeq + 1;
    res.json({ rollNo: `SAPL/${currentYear}/DPC/${nextSequence.toString().padStart(3, '0')}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate-certificate', async (req, res) => {
  try {
    const { candidateId, uinId, certificateNo, rollNo, courseName, duration, issueDate, templateFileName = 'default-template.pdf', groundFrom, groundTo, simulatorFrom, simulatorTo, flyingFrom, flyingTo } = req.body;

    const candidate = await Candidate.findById(candidateId).populate('batch');
    const uin = await UIN.findById(uinId);

    if (!candidate || !uin) {
      return res.status(404).json({ message: 'Candidate or UIN not found' });
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      // Assuming dateStr is YYYY-MM-DD
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    // Generate PDF
    const certData = {
      candidateName: candidate.fullName,
      courseName,
      duration,
      issueDate: formatDate(issueDate),
      certificateNo,
      rollNo: rollNo || candidate.rollNo || `R-${candidate.aadharNumber.slice(-4)}`,
      groundFrom: formatDate(groundFrom || candidate.batch?.groundClassFrom),
      groundTo: formatDate(groundTo || candidate.batch?.groundClassTo),
      simulatorFrom: formatDate(simulatorFrom || candidate.batch?.simulatorFrom),
      simulatorTo: formatDate(simulatorTo || candidate.batch?.flyingClassTo || candidate.batch?.simulatorTo),
      flyingFrom: formatDate(flyingFrom || candidate.batch?.flyingClassFrom),
      flyingTo: formatDate(flyingTo || candidate.batch?.flyingClassTo),
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

    const templatePath = path.join(__dirname, '..', 'templates', templateFileName);
    const pdfBytes = await generateCertificatePdf(certData, templatePath, customConfig);

    // Save record to DB
    const cert = await Certificate.create({
      candidateName: candidate.fullName,
      courseName,
      duration,
      issueDate,
      certificateNo,
      templateName: templateFileName,
      generationType: 'single',
      rollNo: certData.rollNo,
      uin: certData.uin,
      groundFrom: certData.groundFrom,
      groundTo: certData.groundTo,
      simulatorFrom: certData.simulatorFrom,
      simulatorTo: certData.simulatorTo
    });

    // Update candidate's rollNo if provided
    if (rollNo && candidate.rollNo !== rollNo) {
      candidate.rollNo = rollNo;
      await candidate.save();
    }

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
