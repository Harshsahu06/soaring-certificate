import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IssueStock() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  
  const [formData, setFormData] = useState({
    itemId: '', quantity: '1', personId: '', project: '', location: '', remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, peopleRes] = await Promise.all([
          fetch('/api/inventory/items'),
          fetch('/api/inventory/people')
        ]);
        const itemsData = await itemsRes.json();
        const peopleData = await peopleRes.json();
        if (itemsData.success) setItems(itemsData.items);
        if (peopleData.success) setPeople(peopleData.people);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/transactions/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Item issued successfully!');
        navigate('/admin/inventory/history');
      } else {
        alert(data.message || 'Failed to issue item');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectedItem = items.find(i => i._id === formData.itemId);
  // Disable if non-consumable is already assigned
  const isAvailable = selectedItem ? (selectedItem.type === 'Consumable' ? selectedItem.currentQuantity > 0 : selectedItem.status === 'Available') : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Issue Item (Stock OUT)</h1>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Item to Issue *</label>
              <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value, quantity: '1'})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
                <option value="">-- Choose Item --</option>
                {items.map(i => (
                  <option key={i._id} value={i._id}>{i.name} ({i.itemCode})</option>
                ))}
              </select>
              {selectedItem && (
                 <div className="mt-2 text-sm p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                   <p>Type: <strong>{selectedItem.type}</strong></p>
                   {selectedItem.type === 'Consumable' ? (
                      <p className={selectedItem.currentQuantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                         Stock Available: {selectedItem.currentQuantity} {selectedItem.unit}
                      </p>
                   ) : (
                      <p className={selectedItem.status === 'Available' ? 'text-emerald-600' : 'text-red-600'}>
                         Status: {selectedItem.status}
                      </p>
                   )}
                 </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Issue To (Person) *</label>
              <select required value={formData.personId} onChange={e => setFormData({...formData, personId: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
                <option value="">-- Choose Person --</option>
                {people.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.department || 'N/A'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {selectedItem?.type === 'Consumable' && (
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input required type="number" min="1" max={selectedItem.currentQuantity} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Project / Purpose</label>
              <input type="text" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" rows="3"></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading || !formData.itemId || !isAvailable} className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Processing...' : 'Issue Item'}
            </button>
          </div>
          
          {!isAvailable && selectedItem && (
            <p className="text-red-500 text-sm text-right mt-2">This item cannot be issued currently (Out of stock or already assigned).</p>
          )}

        </form>
      </div>
    </div>
  );
}
