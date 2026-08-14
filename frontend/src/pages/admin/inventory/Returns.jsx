import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Returns() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '', condition: 'Good', remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/inventory/items');
        const data = await res.json();
        // Only show non-consumables that are currently assigned
        if (data.success) {
           const assignedAssets = data.items.filter(i => i.type === 'Non-Consumable' && i.status === 'Assigned');
           setItems(assignedAssets);
        }
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
      const res = await fetch('/api/inventory/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Item returned successfully!');
        navigate('/admin/inventory/history');
      } else {
        alert(data.message || 'Failed to return item');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectedItem = items.find(i => i._id === formData.itemId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Return Asset</h1>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-1">Select Asset to Return *</label>
            <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
              <option value="">-- Choose Assigned Asset --</option>
              {items.map(i => (
                <option key={i._id} value={i._id}>{i.name} ({i.assetId || i.itemCode}) - With: {i.currentHolder?.name || 'Unknown'}</option>
              ))}
            </select>
            {selectedItem && (
               <div className="mt-2 text-sm p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md text-amber-800 dark:text-amber-200">
                 <p>Returning from: <strong>{selectedItem.currentHolder?.name}</strong></p>
                 <p>Assigned Location: {selectedItem.currentLocation || 'N/A'}</p>
               </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Return Condition *</label>
              <select required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks / Issues found</label>
            <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" rows="3"></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading || !formData.itemId} className="px-6 py-2 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 disabled:opacity-50">
              {loading ? 'Processing...' : 'Process Return'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
