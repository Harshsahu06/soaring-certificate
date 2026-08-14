import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Item from './models/Item.js';

async function dropIndex() {
  await connectDB();
  try {
    await Item.collection.dropIndex('serialNumber_1');
    console.log('Dropped serialNumber_1 index');
  } catch(e) {
    console.log('Index serialNumber_1 might not exist or already dropped', e.message);
  }
  try {
    await Item.collection.dropIndex('assetId_1');
    console.log('Dropped assetId_1 index');
  } catch(e) {
    console.log('Index assetId_1 might not exist', e.message);
  }
  process.exit(0);
}

dropIndex();
