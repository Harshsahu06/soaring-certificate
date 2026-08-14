import mongoose from 'mongoose';

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, trim: true, unique: true, sparse: true },
  department: { type: String, trim: true },
  designation: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  location: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const Person = mongoose.models.Person || mongoose.model('Person', personSchema);

export default Person;
