import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function CertificateGen() {
  const [candidates, setCandidates] = useState([]);
  const [uins, setUins] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [formData, setFormData] = useState({
    candidateId: '',
    uinId: '',
    certificateNo: '',
    rollNo: '',
    duration: '5 Days',
    issueDate: new Date().toISOString().split('T')[0],
    templateFileName: 'Small Certificate template.pdf',
    groundFrom: '',
    groundTo: '',
    simulatorFrom: '',
    simulatorTo: '',
    flyingFrom: '',
    flyingTo: ''
  });

  const [loading, setLoading] = useState(false);
  const [savedConfigsMap, setSavedConfigsMap] = useState({});
  const [activeProfile, setActiveProfile] = useState('Default');
  const [availableProfiles, setAvailableProfiles] = useState(['Default']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, uinRes, tempRes, seqRes] = await Promise.all([
          axios.get(`/api/admin/candidates`),
          axios.get(`/api/admin/uins`),
          axios.get(`/api/templates`),
          axios.get(`/api/admin/next-sequence`)
        ]);
        // Show all candidates
        setCandidates(candRes.data);
        // Show all UINs
        setUins(uinRes.data);
        setTemplates(tempRes.data.templates || []);
        
        const dbConfigs = tempRes.data.savedConfigs || {};
        setSavedConfigsMap(dbConfigs);

        // Initialize sequences
        const { nextSequence, year } = seqRes.data;
        const availableTemplates = tempRes.data.templates || [];
        setFormData(prev => ({
          ...prev,
          certificateNo: `SAPL/${year}/${nextSequence}`,
          templateFileName: availableTemplates.length > 0 ? availableTemplates[0].filename : prev.templateFileName
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // When candidate changes, if they already have a custom rollNo, we could load it.
  // But to keep it simple and fulfill "it come according to format by default", we leave the auto-generated one
  // unless the candidate explicitly has one that matches the format.
  useEffect(() => {
    if (!formData.templateFileName) return;
    
    const templateConfigs = savedConfigsMap[formData.templateFileName] || {};
    const profiles = new Set(Object.keys(templateConfigs));

    // Also scan localStorage for profiles
    try {
      const prefix = `cert_config_${formData.templateFileName}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          const pName = key.substring(prefix.length);
          if (pName) profiles.add(pName);
        }
      }
    } catch (e) {}

    const profileArr = Array.from(profiles);
    
    if (profileArr.length === 0) {
      setAvailableProfiles(['Default']);
      setActiveProfile('Default');
    } else {
      setAvailableProfiles(profileArr.includes('Default') ? profileArr : ['Default', ...profileArr]);
      if (!profileArr.includes(activeProfile) && activeProfile !== 'Default') {
        setActiveProfile('Default');
      }
    }
  }, [formData.templateFileName, savedConfigsMap]);

  const handleCandidateChange = (e) => {
    const candidateId = e.target.value;
    const candidate = candidates.find(c => c._id === candidateId);
    setFormData(prev => ({ 
      ...prev, 
      candidateId,
      rollNo: candidate?.rollNo || '',
      groundFrom: candidate?.batch?.groundClassFrom || '',
      groundTo: candidate?.batch?.groundClassTo || '',
      simulatorFrom: candidate?.batch?.simulatorFrom || '',
      simulatorTo: candidate?.batch?.simulatorTo || '',
      flyingFrom: candidate?.batch?.flyingClassFrom || '',
      flyingTo: candidate?.batch?.flyingClassTo || ''
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Load custom config for selected profile
      let customConfig = {};
      
      if (savedConfigsMap[formData.templateFileName] && savedConfigsMap[formData.templateFileName][activeProfile]) {
        customConfig = savedConfigsMap[formData.templateFileName][activeProfile];
      } else if (activeProfile === 'Default') {
        // Fallback to localStorage if default
        try {
          const local = localStorage.getItem(`cert_config_${formData.templateFileName}_Default`);
          if (local) {
            customConfig = JSON.parse(local);
          } else {
            // Also try old format
            const oldLocal = localStorage.getItem(`cert_config_${formData.templateFileName}`);
            if (oldLocal) customConfig = JSON.parse(oldLocal);
          }
        } catch (e) { }
      }

      const response = await axios.post(
        `/api/admin/generate-certificate`,
        { ...formData, customConfig },
        { responseType: 'blob' }
      );

      const candidate = candidates.find(c => c._id === formData.candidateId);
      const safeName = candidate.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Certificate_${safeName}_${formData.certificateNo}.pdf`;

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Keep candidate and UIN in the lists so they can be reused, but fetch next sequence!
      const seqRes = await axios.get(`/api/admin/next-sequence`);
      const { nextSequence, year } = seqRes.data;
      setFormData({ 
        ...formData, 
        candidateId: '', 
        certificateNo: `SAPL/${year}/${nextSequence}`,
        rollNo: ''
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="text-amber-500" /> Issue Certificate
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Select Candidate</label>
              <select required className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.candidateId} onChange={handleCandidateChange}>
                <option value="">-- Select a candidate --</option>
                {candidates.map(c => (
                  <option key={c._id} value={c._id}>{c.fullName} (Batch: {c.batch?.batchName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Assign UIN</label>
              <select required className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.uinId} onChange={e => setFormData({ ...formData, uinId: e.target.value })}>
                <option value="">-- Select UIN --</option>
                {uins.map(u => (
                  <option key={u._id} value={u._id}>{u.uinNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Select Template</label>
              <select required className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.templateFileName} onChange={e => setFormData({ ...formData, templateFileName: e.target.value })}>
                {templates.filter(t => t.type === 'pdf').map(t => (
                  <option key={t.filename} value={t.filename}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Select Format Profile</label>
              <select required className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={activeProfile} onChange={e => setActiveProfile(e.target.value)}>
                {availableProfiles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Certificate Number</label>
              <input required type="text" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.certificateNo} onChange={e => setFormData({ ...formData, certificateNo: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Roll Number</label>
              <input required type="text" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Issue Date</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Duration</label>
              <input required type="text" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Ground From</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.groundFrom} onChange={e => setFormData({ ...formData, groundFrom: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Ground To</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.groundTo} onChange={e => setFormData({ ...formData, groundTo: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Simulator From</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.simulatorFrom} onChange={e => setFormData({ ...formData, simulatorFrom: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Simulator To</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.simulatorTo} onChange={e => setFormData({ ...formData, simulatorTo: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Flying From</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.flyingFrom} onChange={e => setFormData({ ...formData, flyingFrom: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Flying To</label>
              <input required type="date" className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                value={formData.flyingTo} onChange={e => setFormData({ ...formData, flyingTo: e.target.value })} />
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.candidateId || !formData.uinId}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:opacity-50 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              {loading ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   Generating...
                 </>
              ) : (
                 <>
                   <Download className="w-5 h-5" />
                   Generate & Issue Certificate
                 </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
