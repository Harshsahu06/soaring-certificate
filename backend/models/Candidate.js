import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  // Candidate Information
  fullName: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  maximumQualification: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  secondaryIdNumber: { type: String, required: true },
  organizationOrIndividual: { type: String, required: true },

  // Checklist (For Official Use Only - Do Not Fill)
  check4Photographs: { type: Boolean, default: false },
  check10thCertificate: { type: Boolean, default: false },
  checkAadhar: { type: Boolean, default: false },
  checkSecondaryIdType: { 
    type: String, 
    enum: ['Passport', 'Voter ID', 'Driving License', 'Ration Card', ''],
    default: '' 
  },
  checkSelfAttested: { type: Boolean, default: false },
  checkMedicalFitness: { type: Boolean, default: false },
  
  // References
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  uin: { type: String, default: null }, // Assigned later during cert gen
  rollNo: { type: String, default: null, unique: true, sparse: true }, // Roll no for the batch

  // Certificate relation
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null },
}, { timestamps: true });

export default mongoose.model('Candidate', CandidateSchema);
