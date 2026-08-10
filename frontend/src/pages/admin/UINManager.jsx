import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Key } from 'lucide-react';

export default function UINManager() {
  const [uins, setUins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUin, setNewUin] = useState('');

  const fetchUins = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/admin/uins');
      setUins(data);
    } catch (error) {
      console.error('Error fetching UINs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUins();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUin.trim()) return;
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/uins', { uinNumber: newUin });
      setNewUin('');
      fetchUins();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding UIN');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this UIN?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/admin/uins/${id}`);
        fetchUins();
      } catch (error) {
        console.error('Error deleting UIN:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Key className="text-amber-500" /> UIN Management
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="Enter new UIN Number"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            value={newUin}
            onChange={(e) => setNewUin(e.target.value)}
          />
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add UIN
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
              <th className="p-4">UIN Number</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
            ) : uins.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500">No UINs found</td></tr>
            ) : (
              uins.map(uin => (
                <tr key={uin._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{uin.uinNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${uin.isAssigned ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {uin.isAssigned ? 'Used' : 'Unused'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(uin._id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
