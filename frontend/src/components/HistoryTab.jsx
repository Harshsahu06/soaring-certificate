import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, Calendar, Award, CheckCircle2, Clock, Layers, FileText, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function HistoryTab({ backendOnline, theme = 'light' }) {
  const isDark = theme === 'dark';
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/certificates');
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
        setDbConnected(res.data.dbConnected);
      }
    } catch (err) {
      console.error('Failed to fetch certificate history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredCertificates = certificates.filter(
    (c) =>
      (c.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.certificateNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.uin || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* DB Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
              <Database className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                MongoDB Atlas History Vault
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {dbConnected
                  ? 'Real-time MongoDB Atlas Cloud Sync Active'
                  : 'Local Mode (Atlas will auto-sync when online)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className={isDark
                ? 'px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm'
                : 'px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Vault</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name, certificate no, roll no, or UIN..."
              className={isDark
                ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-medium'
                : 'w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium shadow-sm'}
            />
          </div>
        </div>
      </div>

      {/* History Records Grid / Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold flex items-center gap-2 font-heading ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Clock className="w-4 h-4 text-amber-500" /> Saved Records ({filteredCertificates.length})
          </h3>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {certificates.length} total certificates
          </span>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-medium">No certificates found in MongoDB history.</p>
            <p className="text-xs mt-1 text-slate-500">Generate a certificate from Single Form or Bulk tab to store records.</p>
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`font-heading ${isDark ? 'bg-slate-950 text-amber-400' : 'bg-slate-100 text-amber-700'}`}>
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Candidate Name</th>
                  <th className="px-4 py-3">Certificate / Roll No</th>
                  <th className="px-4 py-3">Training / Dates</th>
                  <th className="px-4 py-3">UIN</th>
                  <th className="px-4 py-3">Generated At</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700 bg-white'}`}>
                {filteredCertificates.map((cert, index) => (
                  <tr key={cert._id || index} className={isDark ? 'hover:bg-slate-900/60 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className="px-4 py-3 text-slate-400 font-bold">{index + 1}</td>
                    <td className="px-4 py-3 font-sans font-bold text-rose-500 uppercase tracking-wide">
                      {cert.candidateName}
                    </td>
                    <td className="px-4 py-3">
                      <div>{cert.certificateNo || 'CERT-001'}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cert.rollNo}</div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cert.courseName || 'RPTO Training'}</div>
                      {cert.groundFrom && (
                        <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          G: {cert.groundFrom}-{cert.groundTo} | S: {cert.simulatorFrom}-{cert.simulatorTo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{cert.uin || '-'}</td>
                    <td className="px-4 py-3 text-[10px] text-slate-500">
                      {new Date(cert.createdAt || Date.now()).toLocaleString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
