import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StockIn() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '', quantity: '', supplier: '', referenceNumber: '', remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/inventory/items');
        const data = await res.json();
        if (data.success) setItems(data.items);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/transactions/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Stock received successfully!');
        navigate('/admin/inventory/history');
      } else {
        alert(data.message || 'Failed to receive stock');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectedItem = items.find(i => i._id === formData.itemId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Receive Stock (Stock IN)</h1>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-1">Select Item *</label>
            <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
              <option value="">-- Choose Item --</option>
              {items.map(i => (
                <option key={i._id} value={i._id}>{i.name} ({i.itemCode})</option>
              ))}
            </select>
            {selectedItem && (
               <p className="mt-2 text-sm text-slate-500">
                 Current Stock: <strong className="text-slate-800 dark:text-slate-200">{selectedItem.currentQuantity} {selectedItem.unit}</strong> | 
                 Type: {selectedItem.type}
               </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Received *</label>
              <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier / Vendor</label>
              <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Invoice / Reference No.</label>
              <input type="text" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" rows="3"></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading || !formData.itemId} className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Processing...' : 'Record Stock IN'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
