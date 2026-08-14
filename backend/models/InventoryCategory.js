import mongoose from 'mongoose';

const inventoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryCategory', default: null }
}, { timestamps: true });

const InventoryCategory = mongoose.models.InventoryCategory || mongoose.model('InventoryCategory', inventoryCategorySchema);

export default InventoryCategory;
