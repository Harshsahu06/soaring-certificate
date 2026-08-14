import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  type: { 
    type: String, 
    enum: ['STOCK_IN', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'MAINTENANCE_IN', 'MAINTENANCE_OUT'], 
    required: true 
  },
  quantity: { type: Number, required: true }, // Negative for ISSUE, Positive for STOCK_IN/RETURN
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  
  // Who is involved (Supplier for IN, Person for ISSUE/RETURN)
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  supplier: { type: String, trim: true },
  project: { type: String, trim: true },
  location: { type: String, trim: true },
  
  // References
  referenceNumber: { type: String, trim: true }, // Invoice, Issue ID, etc.
  date: { type: Date, default: Date.now, required: true },
  remarks: { type: String, trim: true },
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

const InventoryTransaction = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;
