import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle, Sparkles, Layers, FileText } from 'lucide-react';
import axios from 'axios';
import PreviewCanvas from './PreviewCanvas';

export default function BulkGen({ templates, selectedTemplate, setSelectedTemplate, fieldConfigs, theme = 'light' }) {
  const isDark = theme === 'dark';
  const [file, setFile] = useState(null);
  const [parsedRecords, setParsedRecords] = useState([]);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedRecords([]);
      setStatusMsg('');
      setErrorMsg('');
    }
  };

  const handleUploadExcel = async () => {
    if (!file) return;

    setLoadingParse(true);
    setErrorMsg('');
    setStatusMsg('');

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const res = await axios.post('/api/parse-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setParsedRecords(res.data.records);
        setStatusMsg(`Successfully parsed ${res.data.totalCount} records from ${file.name}!`);
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to parse Excel/CSV file.');
    } finally {
      setLoadingParse(false);
    }
  };

  const handleGenerateBulk = async () => {
    if (parsedRecords.length === 0) return;

    setLoadingGen(true);
    setErrorMsg('');

    try {
      const response = await axios.post(
        '/api/generate-bulk',
        {
          records: parsedRecords,
          templateFileName: selectedTemplate,
          customConfig: fieldConfigs,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bulk_Certificates_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMsg(`Successfully generated and downloaded ${parsedRecords.length} certificates in ZIP!`);
    } catch (err) {
      console.error('Error in bulk generation:', err);
      setErrorMsg('Failed to generate bulk ZIP file. Make sure backend is running.');
    } finally {
      setLoadingGen(false);
    }
  };

  const firstRecord = parsedRecords.length > 0 ? parsedRecords[0] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Excel Upload & Records List Section */}
      <div className="lg:col-span-6 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileSpreadsheet className="w-5 h-5 text-amber-500" /> Bulk Excel/CSV Generator
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generate 100s of certificates at once in a ZIP file</p>
            </div>
            {parsedRecords.length > 0 && (
              <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold rounded-full border border-amber-500/30 font-mono">
                {parsedRecords.length} Records Loaded
              </span>
            )}
          </div>

          {/* Template Selector */}
          <div>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider mb-2 font-heading`}>
              Select Target Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className={isDark
                ? 'w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500 transition-all cursor-pointer shadow-inner'
                : 'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 transition-all cursor-pointer shadow-sm'}
            >
              {templates.map((tpl) => (
                <option key={tpl.filename} value={tpl.filename}>
                  {tpl.name} ({tpl.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Excel File Upload Zone */}
          <div>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider mb-2 font-heading`}>
              Upload Excel (.xlsx, .xls) or CSV File
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDark ? 'border-slate-700 bg-slate-950/60 hover:border-amber-500/50' : 'border-slate-300 bg-slate-50 hover:border-amber-500 shadow-inner'}`}>
              <Upload className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer">
                <span className={`text-sm font-semibold transition-colors ${isDark ? 'text-slate-200 hover:text-amber-400' : 'text-slate-800 hover:text-amber-600'}`}>
                  {file ? file.name : 'Click to select Excel/CSV file'}
                </span>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Supports Candidate Name, Roll No, Ground Dates, Simulator Dates, UIN, etc.</p>
              </label>

              {file && (
                <div className="mt-4">
                  <button
                    onClick={handleUploadExcel}
                    disabled={loadingParse}
                    className={isDark
                      ? 'px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto transition-all border border-slate-700 shadow-md'
                      : 'px-5 py-2.5 bg-white hover:bg-slate-100 text-amber-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto transition-all border border-slate-300 shadow-sm'}
                  >
                    {loadingParse ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Parsing Records...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-500" /> Parse & Extract Excel Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Table Preview of Parsed Data */}
          {parsedRecords.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider font-heading ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Parsed Data Preview ({parsedRecords.length} records)
                </h3>
              </div>

              <div className={`max-h-60 overflow-y-auto overflow-x-auto rounded-xl border ${isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                <table className="w-full text-left text-xs">
                  <thead className={`sticky top-0 font-heading ${isDark ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-amber-700'}`}>
                    <tr>
                      <th className="px-3.5 py-2.5">#</th>
                      <th className="px-3.5 py-2.5">Name</th>
                      <th className="px-3.5 py-2.5">Roll No</th>
                      <th className="px-3.5 py-2.5">Ground Dates</th>
                      <th className="px-3.5 py-2.5">Simulator Dates</th>
                      <th className="px-3.5 py-2.5">UIN</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono text-[11px] ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                    {parsedRecords.slice(0, 10).map((rec, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-slate-900/50 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="px-3.5 py-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-3.5 py-2 font-sans font-semibold text-rose-500 uppercase">{rec.candidateName}</td>
                        <td className="px-3.5 py-2">{rec.rollNo || '-'}</td>
                        <td className="px-3.5 py-2">{rec.groundFrom} - {rec.groundTo}</td>
                        <td className="px-3.5 py-2">{rec.simulatorFrom} - {rec.simulatorTo}</td>
                        <td className="px-3.5 py-2">{rec.uin || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleGenerateBulk}
                disabled={loadingGen}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/25 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer text-sm"
              >
                {loadingGen ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating {parsedRecords.length} Certificates in ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate & Download Bulk ZIP ({parsedRecords.length} Certificates)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Sample Canvas Preview */}
      <div className="lg:col-span-6 flex flex-col justify-start">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col justify-center">
          <div className={`mb-3 text-xs font-medium flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>First Record Live Canvas Preview</span>
            {firstRecord && <span className="text-amber-600 dark:text-amber-400 font-bold uppercase">{firstRecord.candidateName}</span>}
          </div>
          <PreviewCanvas
            formData={
              firstRecord || {
                candidateName: 'Rahul Sharma',
                rollNo: 'RPTO-2026-889',
                groundFrom: '01/07/2026',
                groundTo: '10/07/2026',
                simulatorFrom: '11/07/2026',
                simulatorTo: '15/07/2026',
                certificateNo: 'CERT-RPTO-001',
                uin: 'UIN-994820',
                issueDate: '15/07/2026'
              }
            }
            fieldConfigs={fieldConfigs}
            selectedTemplate={selectedTemplate}
          />
        </div>
      </div>
    </div>
  );
}
