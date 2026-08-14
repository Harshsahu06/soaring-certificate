import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  groundClassFrom: { type: String, required: true },
  groundClassTo: { type: String, required: true },
  simulatorFrom: { type: String, required: true },
  simulatorTo: { type: String, required: true },
  flyingClassFrom: { type: String, required: true },
  flyingClassTo: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Batch', BatchSchema);
