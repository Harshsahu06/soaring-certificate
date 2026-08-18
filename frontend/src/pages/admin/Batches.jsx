import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoSrc from '../../assets/soaring-logo.png';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [formData, setFormData] = useState({
    batchName: '',
    groundClassFrom: '',
    groundClassTo: '',
    simulatorFrom: '',
    simulatorTo: '',
    flyingClassFrom: '',
    flyingClassTo: '',
    status: 'Pending'
  });

  const fetchBatches = async () => {
    try {
      const { data } = await axios.get(`/api/admin/batches`);
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
      setIsSubmitting(true);
      if (editingId) {
        await axios.put(`/api/admin/batches/${editingId}`, formData);
      } else {
        await axios.post(`/api/admin/batches`, formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchBatches();
      setFormData({
        batchName: '', groundClassFrom: '', groundClassTo: '', simulatorFrom: '', simulatorTo: '', flyingClassFrom: '', flyingClassTo: '', status: 'Pending'
      });
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsSubmitting(false);
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
      flyingClassFrom: batch.flyingClassFrom || '',
      flyingClassTo: batch.flyingClassTo || '',
      status: batch.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const pwd = window.prompt('Enter deletion password:');
    if (pwd) {
      try {
        setDeletingId(id);
        await axios.delete(`/api/admin/batches/${id}`, { data: { password: pwd } });
        fetchBatches();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting batch');
        console.error('Error deleting batch:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const downloadAttendanceSheet = async (batch) => {
    try {
      setDownloadingId(batch._id);
      const { data } = await axios.get(`/api/admin/candidates`);
      const batchCandidates = data.filter(c => c.batch && c.batch._id === batch._id);

      const dates = [
        batch.groundClassFrom, batch.groundClassTo,
        batch.simulatorFrom, batch.simulatorTo,
        batch.flyingClassFrom, batch.flyingClassTo
      ].filter(Boolean).map(d => new Date(d));

      if (dates.length === 0) {
        alert('Batch has no valid dates set.');
        return;
      }

      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      const isDateInRange = (d, startStr, endStr) => {
        if (!startStr || !endStr) return false;
        const start = new Date(startStr);
        const end = new Date(endStr);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const check = new Date(d);
        check.setHours(0, 0, 0, 0);
        return check >= start && check <= end;
      };

      const days = [];
      let current = new Date(minDate);
      while (current <= maxDate) {
        if (
          isDateInRange(current, batch.groundClassFrom, batch.groundClassTo) ||
          isDateInRange(current, batch.simulatorFrom, batch.simulatorTo) ||
          isDateInRange(current, batch.flyingClassFrom, batch.flyingClassTo)
        ) {
          days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }

      const doc = new jsPDF('landscape', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add Logo
      const img = new Image();
      img.src = logoSrc;
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      // Calculate width maintaining aspect ratio for a height of 40
      const logoHeight = 40;
      const logoWidth = (logoHeight * img.width) / img.height;

      // Shifted down by 10pt (y=30 instead of y=20)
      doc.addImage(img, 'PNG', 40, 30, logoWidth, logoHeight);

      // Centered Headers - Shifted down by 10pt
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text("SOARING AEROTECH PRIVATE LIMITED", pageWidth / 2, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      doc.text(`Attendance Sheet - ${batch.batchName}`, pageWidth / 2, 65, { align: 'center' });

      const headRows = [
        [
          { content: 'S.No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Batch No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Roll No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Name of Trainee', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
        ],
        []
      ];

      days.forEach(d => {
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        headRows[0].push({ content: dateStr, colSpan: 2, styles: { halign: 'center' } });
        headRows[1].push({ content: 'Morning', styles: { halign: 'center' } });
        headRows[1].push({ content: 'Evening', styles: { halign: 'center' } });
      });

      const body = batchCandidates.map((c, i) => {
        const row = [
          (i + 1).toString(),
          batch.batchName,
          c.rollNo || 'N/A',
          c.fullName
        ];
        days.forEach(() => {
          row.push('');
          row.push('');
        });
        return row;
      });

      autoTable(doc, {
        startY: 90,
        head: headRows,
        body: body,
        theme: 'grid',
        styles: { font: 'times', halign: 'center', valign: 'middle', fontSize: 9, cellPadding: 2, lineWidth: 0.5, lineColor: [0, 0, 0], minCellHeight: 35 },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineWidth: 0.5, lineColor: [0, 0, 0], minCellHeight: 20 },
        columnStyles: {
          0: { cellWidth: 30 },  // S.No
          1: { cellWidth: 50 },  // Batch No
          2: { cellWidth: 100 }, // Roll No
          3: { cellWidth: 100 }  // Name of Trainee
        }
      });

      doc.save(`Attendance_${batch.batchName}.pdf`);

    } catch (error) {
      console.error('Error generating attendance sheet:', error);
      alert('Failed to generate attendance sheet');
    } finally {
      setDownloadingId(null);
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
              batchName: '', groundClassFrom: '', groundClassTo: '', simulatorFrom: '', simulatorTo: '', flyingClassFrom: '', flyingClassTo: '', status: 'Pending'
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
              <th className="p-4">Flying Class</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></td></tr>
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
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {batch.flyingClassFrom} to {batch.flyingClassTo}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      batch.status === 'Active' || batch.status === 'Started' || batch.status === 'active' ? 'bg-green-100 text-green-700' : 
                      batch.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      batch.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {batch.status === 'active' ? 'Active' : batch.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => downloadAttendanceSheet(batch)} className="text-emerald-500 hover:text-emerald-700 p-2 disabled:opacity-50" title="Download Attendance Sheet" disabled={downloadingId === batch._id}>
                      {downloadingId === batch._id ? (
                         <span className="w-5 h-5 block border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                         <FileText className="w-5 h-5" />
                      )}
                    </button>
                    <button onClick={() => handleEdit(batch)} className="text-blue-500 hover:text-blue-700 p-2" title="Edit Batch">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(batch._id)} className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50" title="Delete" disabled={deletingId === batch._id}>
                      {deletingId === batch._id ? (
                         <span className="w-5 h-5 block border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                         <Trash2 className="w-5 h-5" />
                      )}
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
                  value={formData.batchName} onChange={e => setFormData({ ...formData, batchName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Ground From</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.groundClassFrom} onChange={e => setFormData({ ...formData, groundClassFrom: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Ground To</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.groundClassTo} onChange={e => setFormData({ ...formData, groundClassTo: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Simulator From</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.simulatorFrom} onChange={e => setFormData({ ...formData, simulatorFrom: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Simulator To</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.simulatorTo} onChange={e => setFormData({ ...formData, simulatorTo: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Flying From</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.flyingClassFrom} onChange={e => setFormData({ ...formData, flyingClassFrom: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Flying To</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.flyingClassTo} onChange={e => setFormData({ ...formData, flyingClassTo: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Batch Status (Overrides Auto-Status)</label>
                  <select className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Started">Started</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : (editingId ? 'Update Batch' : 'Save Batch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
