import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const PREDEFINED_KEYS = [
  'UIN',
  'RPS Serial No',
  'Manufacture Serial No',
  'FCM Serial No',
  'Slave Serial No',
  'Monitor Serial No',
  'CPU Serial No',
  'Engine No',
  'Model Code',
  'LED Screen Serial No'
];

export default function ItemsMaster() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  
  // Form state
  const [type, setType] = useState('Consumable');
  const [formData, setFormData] = useState({
    name: '', itemCode: '', category: '', brand: '', company: '', model: '', description: '', unit: 'Piece',
    minimumQuantity: 0, reorderQuantity: 0,
    serialNumber: '', assetId: '',
    procurementType: '', purchasedBy: '', purchaseDate: '',
    baseLocation: '', condition: '', currentQuantity: 0
  });
  
  const [customFields, setCustomFields] = useState([]);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/inventory/items'),
        fetch('/api/inventory/categories')
      ]);
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      if (itemsData.success) setItems(itemsData.items);
      if (catsData.success) setCategories(catsData.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addCustomField = () => {
    setCustomFields([...customFields, { key: PREDEFINED_KEYS[0], value: '', quantity: 1 }]);
  };
  
  const updateCustomField = (index, field, val) => {
    const newFields = [...customFields];
    newFields[index][field] = val;
    setCustomFields(newFields);
  };
  
  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty custom fields
      const validCustomFields = customFields.filter(f => f.key.trim() && f.value.trim());
      
      const payload = { ...formData, type, customFields: validCustomFields };
      const res = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        // Fix for "Unknown Category" bug: Manually populate category object in state
        const populatedCategory = categories.find(c => c._id === data.item.category) || { name: 'Unknown' };
        const newItem = { ...data.item, category: populatedCategory };
        
        setItems([newItem, ...items]);
        setShowAddForm(false);
        // Reset form
        setFormData({ 
          name: '', itemCode: '', category: '', brand: '', company: '', model: '', description: '', unit: 'Piece', 
          minimumQuantity: 0, reorderQuantity: 0, serialNumber: '', assetId: '',
          procurementType: '', purchasedBy: '', purchaseDate: '', baseLocation: '', condition: '', currentQuantity: 0
        });
        setCustomFields([]);
      } else {
        alert(data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    const pwd = window.prompt(`Are you sure you want to delete "${name}"?\nEnter admin password to confirm:`);
    if (!pwd) return;

    try {
      const res = await fetch(`/api/inventory/items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.filter(i => i._id !== id));
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during deletion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Items Master</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700">
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Search by name or code..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        />
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="stock-desc">Highest Stock</option>
          <option value="stock-asc">Lowest Stock</option>
        </select>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          
          <div className="flex gap-4 mb-6">
            <button 
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium ${type === 'Consumable' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-300 dark:border-amber-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
              onClick={() => setType('Consumable')}
            >
              Consumable
            </button>
            <button 
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium ${type === 'Non-Consumable' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500 border border-purple-300 dark:border-purple-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
              onClick={() => setType('Non-Consumable')}
            >
              Non-Consumable
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {/* Standard Fields */}
            <div>
              <label className="block text-sm font-medium mb-1">Item Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item Code / SKU *</label>
              <input required type="text" value={formData.itemCode} onChange={e => setFormData({...formData, itemCode: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. Piece, Box, Kg" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            
            {/* New Purchasing Details */}
            <div>
              <label className="block text-sm font-medium mb-1">Type of Procurement</label>
              <input type="text" list="procurement-options" value={formData.procurementType} onChange={e => setFormData({...formData, procurementType: e.target.value})} placeholder="Select or type..." className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
              <datalist id="procurement-options">
                <option value="Purchased (GeM)" />
                <option value="Purchased (Direct)" />
                <option value="Rented" />
                <option value="Leased" />
                <option value="Donated / Sponsored" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purchased By</label>
              <input type="text" value={formData.purchasedBy} onChange={e => setFormData({...formData, purchasedBy: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Purchase</label>
              <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company / Brand</label>
              <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location in Office</label>
              <input type="text" value={formData.baseLocation} onChange={e => setFormData({...formData, baseLocation: e.target.value})} placeholder="e.g. Server Room, Desk 5" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item Condition</label>
              <input type="text" list="condition-options" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} placeholder="e.g. Working, Damaged" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
              <datalist id="condition-options">
                <option value="Working" />
                <option value="Half Working" />
                <option value="Not Working" />
                <option value="New / Excellent" />
                <option value="Needs Maintenance" />
                <option value="Damaged" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Initial Quantity</label>
              <input type="number" min="0" value={formData.currentQuantity} onChange={e => setFormData({...formData, currentQuantity: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
            </div>

            {/* Conditional Fields based on Type */}
            {type === 'Consumable' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Quantity</label>
                  <input type="number" value={formData.minimumQuantity} onChange={e => setFormData({...formData, minimumQuantity: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Quantity</label>
                  <input type="number" value={formData.reorderQuantity} onChange={e => setFormData({...formData, reorderQuantity: e.target.value})} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2" />
                </div>
              </>
            )}
            
            {/* Dynamic Custom Fields Section */}
            <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-semibold">Additional Descriptions / Serial Numbers</h3>
                 <button type="button" onClick={addCustomField} className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                   <Plus className="w-4 h-4" /> Add Field
                 </button>
               </div>
               
               {customFields.length > 0 ? (
                 <div className="space-y-3">
                   {customFields.map((field, index) => (
                     <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-start">
                       <div className="w-full md:w-1/3">
                         <input 
                           type="text" 
                           list="predefined-keys" 
                           placeholder="Select or type key"
                           value={field.key} 
                           onChange={e => updateCustomField(index, 'key', e.target.value)} 
                           className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                         />
                         <datalist id="predefined-keys">
                           {PREDEFINED_KEYS.map(pk => <option key={pk} value={pk} />)}
                         </datalist>
                       </div>
                       <div className="w-full md:w-1/2">
                         <input 
                           type="text" 
                           placeholder="Value (e.g. SN12345)"
                           value={field.value} 
                           onChange={e => updateCustomField(index, 'value', e.target.value)} 
                           className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                         />
                       </div>
                       <div className="w-24">
                         <input 
                           type="number" 
                           min="1"
                           placeholder="Qty"
                           value={field.quantity} 
                           onChange={e => updateCustomField(index, 'quantity', e.target.value)} 
                           className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                         />
                       </div>
                       <button type="button" onClick={() => removeCustomField(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-slate-500 italic">No additional descriptions added. Click "Add Field" to include UINs or Serial numbers.</p>
               )}
            </div>

            <div className="md:col-span-2 mt-6 text-right">
               <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700">Save Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">Item Details</th>
              <th className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">Specifications</th>
              <th className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">Type & Category</th>
              <th className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">Stock / Status</th>
              <th className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items
              .filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = categoryFilter === 'All' || (item.category && item.category._id === categoryFilter);
                return matchesSearch && matchesCategory;
              })
              .sort((a, b) => {
                if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
                if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
                if (sortBy === 'date-desc') return new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0);
                if (sortBy === 'date-asc') return new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0);
                if (sortBy === 'stock-asc') return (a.currentQuantity || 0) - (b.currentQuantity || 0);
                if (sortBy === 'stock-desc') return (b.currentQuantity || 0) - (a.currentQuantity || 0);
                return 0;
              })
              .map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-900 dark:text-white text-base">{item.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Code: {item.itemCode}</p>
                  {item.company && <p className="text-xs text-slate-500">Company: {item.company}</p>}
                  {item.purchaseDate && <p className="text-xs text-slate-500">Purchased: {new Date(item.purchaseDate).toLocaleDateString()}</p>}
                </td>
                <td className="px-6 py-4 align-top max-w-xs">
                   {/* Custom fields display */}
                   {item.customFields && item.customFields.length > 0 ? (
                      <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {item.customFields.map((cf, idx) => (
                           <li key={idx}><span className="font-semibold text-slate-800 dark:text-slate-200">{cf.key}:</span> {cf.value} {cf.quantity > 1 ? `(Qty: ${cf.quantity})` : ''}</li>
                        ))}
                      </ul>
                   ) : (
                      <span className="text-xs text-slate-400 italic">No extra specs</span>
                   )}
                   {item.procurementType && <p className="text-xs mt-2 text-slate-500">Procurement: {item.procurementType}</p>}
                </td>
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.type === 'Consumable' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                    {item.type}
                  </span>
                  <p className="text-xs mt-1 text-slate-500 font-medium">{item.category?.name || 'Unknown Category'}</p>
                </td>
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  {item.type === 'Consumable' ? (
                    <div>
                      <p className="font-medium text-lg">{item.currentQuantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span></p>
                      {item.currentQuantity <= item.minimumQuantity && <span className="text-xs text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded">LOW STOCK</span>}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-lg">{item.currentQuantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span></p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        item.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                      {item.condition && item.condition !== 'N/A' && <span className="ml-2 text-xs text-slate-500 font-medium text-amber-600">({item.condition})</span>}
                      {item.baseLocation && <p className="text-xs mt-1 text-slate-500">Loc: {item.baseLocation}</p>}
                      {item.status === 'Assigned' && item.currentHolder && (
                        <p className="text-xs mt-1 text-slate-500">With: <span className="font-medium text-slate-700 dark:text-slate-300">{item.currentHolder.name}</span></p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 align-top whitespace-nowrap text-right">
                  <button onClick={() => handleDelete(item._id, item.name)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete Item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
