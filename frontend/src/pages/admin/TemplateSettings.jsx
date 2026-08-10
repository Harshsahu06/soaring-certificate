import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateMapper from '../../components/TemplateMapper';

export default function TemplateSettings() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fieldConfigs, setFieldConfigs] = useState({});
  const [formData, setFormData] = useState({
    candidateName: 'John Doe',
    rollNo: 'R-1234',
    groundFrom: '01 Jan 2026',
    groundTo: '05 Jan 2026',
    simulatorFrom: '06 Jan 2026',
    simulatorTo: '10 Jan 2026',
    certificateNo: 'CERT-123456',
    uin: 'UA12345678',
    courseName: 'Drone Pilot Training',
    duration: '10 Days',
    issueDate: '10 Jan 2026'
  });

  const [savedConfigsMap, setSavedConfigsMap] = useState({});

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/templates');
      setTemplates(res.data.templates || []);
      
      const dbConfigs = res.data.savedConfigs || {};
      setSavedConfigsMap(dbConfigs);

      if (res.data.templates?.length > 0 && !selectedTemplate) {
        setSelectedTemplate(res.data.templates[0].filename);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Apply configs when template changes
  useEffect(() => {
    if (!selectedTemplate) return;
    
    // 1. Try to get from DB map
    if (savedConfigsMap[selectedTemplate]) {
      setFieldConfigs(savedConfigsMap[selectedTemplate]);
      return;
    }

    // 2. Try to get from LocalStorage
    try {
      const local = localStorage.getItem(`cert_config_${selectedTemplate}`);
      if (local) {
        setFieldConfigs(JSON.parse(local));
        return;
      }
    } catch (e) {}

    // 3. Reset if neither found
    setFieldConfigs({});
  }, [selectedTemplate, savedConfigsMap]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Certificate Template Editor</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload new certificate PDF layouts and adjust the exact X, Y coordinates and font sizes of the text fields.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <TemplateMapper 
          templates={templates}
          fetchTemplates={fetchTemplates}
          fieldConfigs={fieldConfigs}
          setFieldConfigs={setFieldConfigs}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          formData={formData}
          setFormData={setFormData}
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}
