import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true, trim: true },
    courseName: { type: String, required: false, trim: true },
    duration: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    certificateNo: { type: String, required: true, trim: true, index: true },
    templateName: { type: String, default: 'default-template.pdf' },
    generationType: { type: String, enum: ['single', 'bulk'], default: 'single' },
    rollNo: { type: String, default: '' },
    uin: { type: String, default: '' },
    groundFrom: { type: String, default: '' },
    groundTo: { type: String, default: '' },
    simulatorFrom: { type: String, default: '' },
    simulatorTo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
