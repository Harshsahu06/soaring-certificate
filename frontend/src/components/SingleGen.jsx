import React, { useState } from 'react';
import { Download, Sparkles, RefreshCw, FileCheck, Calendar, User, BookOpen, Clock, Hash, Shield, Layers, FileCode2 } from 'lucide-react';
import axios from 'axios';
import PreviewCanvas from './PreviewCanvas';

export default function SingleGen({
  templates = [],
  selectedTemplate,
  setSelectedTemplate,
  fieldConfigs,
  formData = {},
  setFormData = () => {},
  theme = 'light',
}) {
  const isDark = theme === 'dark';
  const isSmallCert = selectedTemplate && (selectedTemplate.toLowerCase().includes('small') || selectedTemplate.toLowerCase().includes('medium') || selectedTemplate.toLowerCase().includes('rpto'));

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFillDemo = () => {
    const randomNo = 'CERT-' + Math.floor(1000 + Math.random() * 9000);
    const randomRoll = 'RPTO-' + Math.floor(100 + Math.random() * 900);
    const randomUin = 'UIN-' + Math.floor(100000 + Math.random() * 900000);

    setFormData({
      candidateName: 'Dinesh Yadav',
      courseName: 'Small Class Remote Pilot Certificate',
      duration: '5 Days',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNo: randomNo,
      rollNo: randomRoll,
      groundFrom: '2026-06-10',
      groundTo: '2026-06-12',
      simulatorFrom: '2026-06-13',
      simulatorTo: '2026-06-14',
      uin: randomUin,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post(
        '/api/generate-single',
        {
          ...formData,
          templateFileName: selectedTemplate,
          customConfig: fieldConfigs,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (formData.candidateName || 'Certificate').replace(/\s+/g, '_');
      link.setAttribute('download', `Certificate_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setErrorMsg('Failed to generate PDF. Make sure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = isDark
    ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono'
    : 'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono shadow-sm';

  const labelStyle = `block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider mb-1.5 font-heading`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileCheck className="w-5 h-5 text-amber-500" /> Certificate Form
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isSmallCert ? 'Small & Medium Class RPTO Fields' : 'General Certificate Fields'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500/20 transition-all font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo Data
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4.5">
            {/* Template Selector */}
            <div>
              <label className={labelStyle}>Select Certificate Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={isDark
                  ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500 transition-all cursor-pointer shadow-inner'
                  : 'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-sm'}
              >
                {templates.map((tpl) => (
                  <option key={tpl.filename} value={tpl.filename}>
                    {tpl.name} ({tpl.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Name */}
            <div>
              <label className={labelStyle}>Candidate Name (Capital, Bold, Red)</label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName || ''}
                  onChange={handleChange}
                  placeholder="e.g. DINESH YADAV"
                  required
                  className={isDark
                    ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-semibold uppercase tracking-wider'
                    : 'w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-semibold uppercase tracking-wider shadow-sm'}
                />
              </div>
            </div>

            {isSmallCert ? (
              <>
                {/* Roll No */}
                <div>
                  <label className={labelStyle}>Roll No</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo || ''}
                      onChange={handleChange}
                      placeholder="e.g. RPTO-2026-889"
                      className={isDark
                        ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono'
                        : 'w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all font-mono shadow-sm'}
                    />
                  </div>
                </div>

                {/* Ground Training From / To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Ground From</label>
                    <input
                      type="date"
                      name="groundFrom"
                      value={formData.groundFrom || ''}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Ground To</label>
                    <input
                      type="date"
                      name="groundTo"
                      value={formData.groundTo || ''}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                {/* Simulator Training From / To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Simulator From</label>
                    <input
                      type="date"
                      name="simulatorFrom"
                      value={formData.simulatorFrom || ''}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Simulator To</label>
                    <input
                      type="date"
                      name="simulatorTo"
                      value={formData.simulatorTo || ''}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                {/* Certificate No & UIN */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Certificate No</label>
                    <input
                      type="text"
                      name="certificateNo"
                      value={formData.certificateNo || ''}
                      onChange={handleChange}
                      placeholder="CERT-RPTO-001"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>UIN Number</label>
                    <input
                      type="text"
                      name="uin"
                      value={formData.uin || ''}
                      onChange={handleChange}
                      placeholder="UIN-994820"
                      className={inputStyle}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* General Certificate Fields */}
                <div>
                  <label className={labelStyle}>Course Name</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName || ''}
                      onChange={handleChange}
                      placeholder="e.g. Python Fullstack"
                      required
                      className={isDark
                        ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all'
                        : 'w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-sm'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration || ''}
                      onChange={handleChange}
                      placeholder="3 Months"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Issue Date</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate || ''}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Certificate Number</label>
                  <input
                    type="text"
                    name="certificateNo"
                    value={formData.certificateNo || ''}
                    onChange={handleChange}
                    placeholder="CERT001"
                    className={inputStyle}
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/25 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating High-Precision PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate & Download Certificate PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Canvas Preview */}
      <div className="lg:col-span-7 flex flex-col justify-start">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col justify-center">
          <PreviewCanvas
            formData={formData}
            fieldConfigs={fieldConfigs}
            selectedTemplate={selectedTemplate}
          />
        </div>
      </div>
    </div>
  );
}
