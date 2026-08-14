import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  itemCode: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryCategory', required: true },
  type: { type: String, enum: ['Consumable', 'Non-Consumable'], required: true },
  brand: { type: String, trim: true },
  model: { type: String, trim: true },
  description: { type: String, trim: true },
  unit: { type: String, default: 'Piece' }, // e.g., Piece, Box, Kg, Liter

  // Stock tracking
  currentQuantity: { type: Number, default: 0, min: 0 },
  minimumQuantity: { type: Number, default: 0, min: 0 },
  reorderQuantity: { type: Number, default: 0, min: 0 },

  // New Fields
  procurementType: { type: String, trim: true },
  purchasedBy: { type: String, trim: true },
  purchaseDate: { type: Date },
  company: { type: String, trim: true }, // Using this alongside brand if needed

  // Dynamic Custom Descriptions
  customFields: [{
    key: { type: String, trim: true },
    value: { type: String, trim: true },
    quantity: { type: Number, default: 1 }
  }],
  
  // Only for Non-Consumables (Assets)
  serialNumber: { type: String, trim: true, sparse: true },
  assetId: { type: String, trim: true, sparse: true },
  warrantyExpiry: { type: Date },
  condition: { type: String, trim: true, default: 'N/A' }, // Changed from enum to allow custom
  baseLocation: { type: String, trim: true }, // Location in the office
  
  // Where is the non-consumable right now?
  currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  currentLocation: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Available', 'Assigned', 'Returned', 'Maintenance', 'Damaged', 'Lost', 'Retired'],
    default: 'Available'
  }

}, { timestamps: true });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;
