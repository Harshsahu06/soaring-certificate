import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    batchName: '',
    groundClassFrom: '',
    groundClassTo: '',
    simulatorFrom: '',
    simulatorTo: '',
    status: 'active'
  });

  const fetchBatches = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/batches`);
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/batches/${editingId}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/batches`, formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchBatches();
      setFormData({
        batchName: '', groundClassFrom: '', groundClassTo: '', simulatorFrom: '', simulatorTo: '', status: 'active'
      });
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const handleEdit = (batch) => {
    setEditingId(batch._id);
    setFormData({
      batchName: batch.batchName || '',
      groundClassFrom: batch.groundClassFrom || '',
      groundClassTo: batch.groundClassTo || '',
      simulatorFrom: batch.simulatorFrom || '',
      simulatorTo: batch.simulatorTo || '',
      status: batch.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/batches/${id}`);
        fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Training Batches</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              batchName: '', groundClassFrom: '', groundClassTo: '', simulatorFrom: '', simulatorTo: '', status: 'active'
            });
            setShowModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Batch
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
              <th className="p-4">Batch Name</th>
              <th className="p-4">Ground Class</th>
              <th className="p-4">Simulator</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-slate-500">No batches found</td></tr>
            ) : (
              batches.map(batch => (
                <tr key={batch._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{batch.batchName}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {batch.groundClassFrom} to {batch.groundClassTo}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {batch.simulatorFrom} to {batch.simulatorTo}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${batch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(batch)} className="text-blue-500 hover:text-blue-700 p-2" title="Edit Batch">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(batch._id)} className="text-red-500 hover:text-red-700 p-2" title="Delete Batch">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{editingId ? 'Edit Batch' : 'Create New Batch'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Batch Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={formData.batchName} onChange={e => setFormData({...formData, batchName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Ground From</label>
                  <input required type="text" placeholder="e.g. 01 Jul 2026" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.groundClassFrom} onChange={e => setFormData({...formData, groundClassFrom: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Ground To</label>
                  <input required type="text" placeholder="e.g. 10 Jul 2026" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.groundClassTo} onChange={e => setFormData({...formData, groundClassTo: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Simulator From</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.simulatorFrom} onChange={e => setFormData({...formData, simulatorFrom: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Simulator To</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.simulatorTo} onChange={e => setFormData({...formData, simulatorTo: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600">
                  {editingId ? 'Update Batch' : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
