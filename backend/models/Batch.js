import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  groundClassFrom: { type: String, required: true },
  groundClassTo: { type: String, required: true },
  simulatorFrom: { type: String, required: true },
  simulatorTo: { type: String, required: true },
  flyingClassFrom: { type: String, required: true },
  flyingClassTo: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  isStatusOverridden: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Batch', BatchSchema);
