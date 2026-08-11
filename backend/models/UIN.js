import mongoose from 'mongoose';

const UINSchema = new mongoose.Schema({
  uinNumber: { type: String, required: true, unique: true },
  isAssigned: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', default: null }
}, { timestamps: true });

export default mongoose.model('UIN', UINSchema);
