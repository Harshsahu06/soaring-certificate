import express from 'express';
import InventoryCategory from '../models/InventoryCategory.js';
import Person from '../models/Person.js';
import Item from '../models/Item.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

const router = express.Router();

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await InventoryCategory.find().populate('parentCategory');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = new InventoryCategory(req.body);
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- PEOPLE ---
router.get('/people', async (req, res) => {
  try {
    const people = await Person.find();
    res.json({ success: true, people });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/people', async (req, res) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.json({ success: true, person });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- ITEMS ---
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().populate('category').populate('currentHolder');
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const requiredPassword = process.env.DELETE_PASSWORD || 'soaring@2026';
    if (password !== requiredPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Deletion denied.' });
    }

    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Optionally, you might want to also delete its transactions:
    // await InventoryTransaction.deleteMany({ item: req.params.id });

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- TRANSACTIONS ---
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('item')
      .populate('person')
      .sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// STOCK IN
router.post('/transactions/in', async (req, res) => {
  try {
    const { itemId, quantity, supplier, referenceNumber, remarks, date } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be positive' });

    const previousQuantity = item.currentQuantity || 0;
    const newQuantity = previousQuantity + qty;

    // Create transaction
    const transaction = new InventoryTransaction({
      item: itemId,
      type: 'STOCK_IN',
      quantity: qty,
      previousQuantity,
      newQuantity,
      supplier,
      referenceNumber,
      remarks,
      date: date || new Date()
    });
    await transaction.save();

    // Update item
    item.currentQuantity = newQuantity;
    if (item.type === 'Non-Consumable' && item.status === 'Retired') {
      item.status = 'Available';
    }
    await item.save();

    res.json({ success: true, transaction, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ISSUE
router.post('/transactions/issue', async (req, res) => {
  try {
    const { itemId, quantity, personId, project, location, remarks, date } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be positive' });

    const previousQuantity = item.currentQuantity || 0;

    if (previousQuantity < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Only ${previousQuantity} available.` });
    }
    const newQuantity = previousQuantity - qty;

    const transaction = new InventoryTransaction({
      item: itemId,
      type: 'ISSUE',
      quantity: -qty, // negative for issue
      previousQuantity,
      newQuantity,
      person: personId,
      project,
      location,
      remarks,
      date: date || new Date()
    });
    await transaction.save();

    item.currentQuantity = newQuantity;
    if (item.type === 'Non-Consumable') {
      item.status = newQuantity === 0 ? 'Assigned' : 'Available';
      item.currentHolder = personId;
      item.currentLocation = location || '';
    }
    await item.save();

    res.json({ success: true, transaction, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// RETURN (For Non-Consumables)
router.post('/transactions/return', async (req, res) => {
  try {
    const { itemId, personId, condition, remarks, date } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.type !== 'Non-Consumable') {
      return res.status(400).json({ success: false, message: 'Returns are primarily for non-consumable assets' });
    }

    const qty = Number(req.body.quantity) || 1;
    if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be positive' });

    const previousQuantity = item.currentQuantity || 0;
    const newQuantity = previousQuantity + qty;

    const transaction = new InventoryTransaction({
      item: itemId,
      type: 'RETURN',
      quantity: qty, // positive
      previousQuantity,
      newQuantity,
      person: personId || item.currentHolder, // person returning it
      remarks,
      date: date || new Date()
    });
    await transaction.save();

    item.currentQuantity = newQuantity;
    // We only clear the holder if they return everything, but for simplicity let's just clear it if requested or leave it.
    // Actually, setting to null is fine if it's meant to signify it's back in stock.
    if (newQuantity >= (item.minimumQuantity || 1)) {
       item.currentHolder = null;
       item.currentLocation = '';
    }
    item.condition = condition || item.condition;

    // Auto-update status based on condition
    if (['Needs Maintenance', 'Damaged'].includes(condition)) {
      item.status = condition === 'Damaged' ? 'Damaged' : 'Maintenance';
    } else {
      item.status = 'Available';
    }

    await item.save();

    res.json({ success: true, transaction, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DASHBOARD KPIs
router.get('/dashboard', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const consumables = await Item.countDocuments({ type: 'Consumable' });
    const nonConsumables = await Item.countDocuments({ type: 'Non-Consumable' });

    // Low stock: Consumables where currentQuantity <= minimumQuantity
    const lowStockItems = await Item.find({
      type: 'Consumable',
      $expr: { $lte: ['$currentQuantity', '$minimumQuantity'] }
    });

    const outOfStockItems = await Item.find({ currentQuantity: 0 });
    const assignedAssets = await Item.countDocuments({ type: 'Non-Consumable', status: 'Assigned' });
    const maintenanceAssets = await Item.countDocuments({ type: 'Non-Consumable', status: { $in: ['Maintenance', 'Damaged'] } });

    res.json({
      success: true,
      kpis: {
        totalItems,
        consumables,
        nonConsumables,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        assignedAssets,
        maintenanceAssets
      },
      lowStockItems
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
