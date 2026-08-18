import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  // Candidate Information
  fullName: { type: String },
  permanentAddress: { type: String },
  phoneNumber: { type: String },
  emailAddress: { type: String },
  maximumQualification: { type: String },
  dateOfBirth: { type: String },
  aadharNumber: { type: String },
  secondaryIdNumber: { type: String },
  organizationOrIndividual: { type: String },

  status: { type: String, enum: ['Draft', 'Completed'], default: 'Completed' },

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
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  uin: { type: String, default: null }, // Assigned later during cert gen
  rollNo: { type: String, default: null, unique: true, sparse: true }, // Roll no for the batch

  // Certificate relation
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null },
}, { timestamps: true });

export default mongoose.model('Candidate', CandidateSchema);
