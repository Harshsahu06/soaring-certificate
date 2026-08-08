import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import SingleGen from './components/SingleGen';
import BulkGen from './components/BulkGen';
import TemplateMapper from './components/TemplateMapper';
import HistoryTab from './components/HistoryTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cert_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('cert_theme', theme);
  }, [theme]);

  const [templates, setTemplates] = useState([
    { filename: 'default-template.pdf', name: 'Default Certificate', type: 'pdf' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('Small Certificate template.pdf');
  const [backendOnline, setBackendOnline] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Shared form data across main form and coordinate mapper
  const [formData, setFormData] = useState({
    candidateName: 'Dinesh Yadav',
    courseName: 'Small Class Remote Pilot Certificate',
    duration: '5 Days',
    issueDate: '12 Jul 2026',
    certificateNo: 'CERT-RPTO-001',
    rollNo: 'RPTO-2026-889',
    groundFrom: '01 Jul 2026',
    groundTo: '10 Jul 2026',
    simulatorFrom: '11 Jul 2026',
    simulatorTo: '15 Jul 2026',
    uin: 'UIN-994820',
  });

  // Default coordinate presets
  const generalConfigs = {
    candidateName: { x: 420.94, y: 375, fontSize: 32, font: 'Helvetica-Bold', color: '#dc2626', align: 'center' },
    courseName: { x: 420.94, y: 275, fontSize: 24, font: 'Helvetica-Bold', color: '#d97706', align: 'center' },
    duration: { x: 200, y: 120, fontSize: 11, font: 'Helvetica', color: '#374151', align: 'center' },
    issueDate: { x: 200, y: 140, fontSize: 12, font: 'Helvetica-Bold', color: '#111827', align: 'center' },
    certificateNo: { x: 730, y: 540, fontSize: 11, font: 'Helvetica-Bold', color: '#4b5563', align: 'right' },
  };

  // Exact JSON coordinates specified for Small & Medium Certificate
  const smallCertConfigs = {
    candidateName: { x: 421, y: 278, fontSize: 24, font: 'Helvetica-Bold', align: 'center', color: '#dc2626' },
    rollNo: { x: 355, y: 248, fontSize: 14, font: 'Helvetica', align: 'left', color: '#000000' },
    groundFrom: { x: 375, y: 190, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
    groundTo: { x: 495, y: 190, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
    simulatorFrom: { x: 425, y: 168, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
    simulatorTo: { x: 545, y: 168, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
    certificateNo: { x: 410, y: 120, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
    uin: { x: 385, y: 96, fontSize: 13, font: 'Helvetica', align: 'left', color: '#000000' },
  };

  const [savedConfigsMap, setSavedConfigsMap] = useState({});
  const [fieldConfigs, setFieldConfigs] = useState(smallCertConfigs);

  // Helper to resolve permanently saved configs with priority: MongoDB Atlas -> LocalStorage -> Presets
  const getEffectiveConfig = (templateName, dbMap = savedConfigsMap) => {
    if (!templateName) return smallCertConfigs;

    if (dbMap && dbMap[templateName] && Object.keys(dbMap[templateName]).length > 0) {
      return dbMap[templateName];
    }

    try {
      const localStr = localStorage.getItem(`cert_config_${templateName}`);
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage config read error:', e);
    }

    const nameLower = templateName.toLowerCase();
    if (nameLower.includes('small') || nameLower.includes('medium') || nameLower.includes('rpto')) {
      return smallCertConfigs;
    }
    return generalConfigs;
  };

  // Sync fieldConfigs whenever selectedTemplate changes
  useEffect(() => {
    const effective = getEffectiveConfig(selectedTemplate, savedConfigsMap);
    setFieldConfigs(effective);
  }, [selectedTemplate]);

  const fetchTemplates = async (overrideSelected = false) => {
    try {
      const res = await axios.get('/api/templates');
      if (res.data.success) {
        if (Array.isArray(res.data.templates)) {
          setTemplates(res.data.templates);
        }
        setBackendOnline(true);
        setDbConnected(!!res.data.dbConnected);

        if (res.data.savedConfigs && typeof res.data.savedConfigs === 'object') {
          setSavedConfigsMap(res.data.savedConfigs);
          if (overrideSelected) {
            const effective = getEffectiveConfig(selectedTemplate, res.data.savedConfigs);
            setFieldConfigs(effective);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server connection status:', err);
      setBackendOnline(false);
      setDbConnected(false);
    }
  };

  useEffect(() => {
    fetchTemplates(true);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark-theme bg-slate-950 text-slate-100' : 'light-theme bg-slate-50 text-slate-900'} flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        templatesCount={templates.length}
        backendOnline={backendOnline}
        dbConnected={dbConnected}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'single' && (
          <SingleGen
            templates={templates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            fieldConfigs={fieldConfigs}
            formData={formData}
            setFormData={setFormData}
            theme={theme}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkGen
            templates={templates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            fieldConfigs={fieldConfigs}
            theme={theme}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab backendOnline={backendOnline} theme={theme} />
        )}

        {activeTab === 'template' && (
          <TemplateMapper
            templates={templates}
            fetchTemplates={fetchTemplates}
            fieldConfigs={fieldConfigs}
            setFieldConfigs={setFieldConfigs}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            formData={formData}
            setFormData={setFormData}
            theme={theme}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${theme === 'dark' ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-500'} py-4 text-center text-xs transition-colors`}>
        <p>Certificate Studio • Light Mode & Dark Mode Supported</p>
      </footer>
    </div>
  );
}
