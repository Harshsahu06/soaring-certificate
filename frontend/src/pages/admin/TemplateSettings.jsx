import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateMapper from '../../components/TemplateMapper';

export default function TemplateSettings() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fieldConfigs, setFieldConfigs] = useState({});
  const [formData, setFormData] = useState({
    candidateName: 'Ashish bamnawat',
    rollNo: 'SAPL/2026/DPC/159',
    groundFrom: '01/01/2026',
    groundTo: '05/05/2026',
    simulatorFrom: '06/06/2026',
    simulatorTo: '10/01/2026',
    certificateNo: 'SAPL/2026/159',
    uin: 'UA12345678',
    courseName: 'Drone Pilot Training',
    duration: '10 Days',
    issueDate: '10/01/2026',
    flyingFrom: '11/01/2026',
    flyingTo: '15/01/2026'
  });

  const [savedConfigsMap, setSavedConfigsMap] = useState({});

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`/api/templates`);
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



  return (
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4">
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
          savedConfigsMap={savedConfigsMap}
        />
      </div>
    </div>
  );
}
