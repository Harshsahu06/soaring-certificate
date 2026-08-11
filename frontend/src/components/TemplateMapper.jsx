import React, { useState } from 'react';
import { Settings, Upload, Sliders, Save, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles, Layers, Type, Palette, AlignLeft, Target } from 'lucide-react';
import axios from 'axios';
import PreviewCanvas from './PreviewCanvas';

export default function TemplateMapper({
  templates = [],
  fetchTemplates,
  fieldConfigs = {},
  setFieldConfigs = () => { },
  selectedTemplate = 'default-template.pdf',
  setSelectedTemplate = () => { },
  formData = {},
  setFormData = () => { },
  theme = 'light',
}) {
  const isDark = theme === 'dark';
  const [activeField, setActiveField] = useState('candidateName');
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fieldLabels = {
    candidateName: 'Candidate Name',
    rollNo: 'Roll No',
    groundFrom: 'Ground From',
    groundTo: 'Ground To',
    simulatorFrom: 'Simulator From',
    simulatorTo: 'Simulator To',
    certificateNo: 'Certificate Number',
    uin: 'UIN Number',
    courseName: 'Course Name',
    duration: 'Duration',
    issueDate: 'Issue Date',
  };

  const fontsList = [
    'Helvetica',
    'Helvetica-Bold',
    'Helvetica-Oblique',
    'Times-Roman',
    'Times-Bold',
    'Courier',
    'Courier-Bold',
    'Arial',
    'Arial-Bold',
    'Geometric-Sans',
    'Geometric-Sans-Bold'
  ];

  const handleConfigChange = (field, key, value) => {
    setFieldConfigs((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || { x: 400, y: 300, fontSize: 16, font: 'Helvetica', color: '#000000', align: 'left' }),
        [key]: value,
      },
    }));
  };

  const handleFieldChange = (field, updatedConfig) => {
    setFieldConfigs((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || { x: 400, y: 300, fontSize: 16, font: 'Helvetica', color: '#000000', align: 'left' }),
        ...updatedConfig,
      },
    }));
  };

  const handleNudge = (dx, dy) => {
    const current = fieldConfigs?.[activeField] || { x: 400, y: 300 };
    handleFieldChange(activeField, {
      x: Math.max(0, Math.round((current.x || 0) + dx)),
      y: Math.max(0, Math.round((current.y || 0) + dy)),
    });
  };

  const handleSaveConfigs = async () => {
    try {
      setSaveMsg('Saving coordinates permanently...');

      try {
        localStorage.setItem(`cert_config_${selectedTemplate}`, JSON.stringify(fieldConfigs));
      } catch (e) { }

      await axios.post('/api/configs/save', {
        templateName: selectedTemplate,
        fieldConfigs,
      });

      if (fetchTemplates) await fetchTemplates();
      setSaveMsg('Coordinates saved to MongoDB Atlas & Local Storage!');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save configs:', err);
      setSaveMsg('Coordinates saved in Local Storage cache!');
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('templateFile', file);

    try {
      const res = await axios.post('/api/templates/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        await fetchTemplates();
        setSelectedTemplate(res.data.filename);
      }
    } catch (err) {
      console.error('Error uploading template:', err);
    } finally {
      setUploading(false);
    }
  };



  const loadPreset = (type) => {
    if (type === 'rpto') {
      setFieldConfigs({
        candidateName: {
          x: 423,
          y: 277,
          fontSize: 38,
          font: 'Helvetica-Bold',
          color: '#d22426',
          align: 'center'
        },

        rollNo: {
          x: 397,
          y: 256,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        groundFrom: {
          x: 409,
          y: 197,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        groundTo: {
          x: 515,
          y: 197,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        simulatorFrom: {
          x: 456,
          y: 179,
          fontSize: 13,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        simulatorTo: {
          x: 567,
          y: 180,
          fontSize: 13,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        certificateNo: {
          x: 417,
          y: 127,
          fontSize: 15,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        uin: {
          x: 386,
          y: 102,
          fontSize: 15,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },
      });

    } else {

      // setFieldConfigs({
      //   candidateName: {
      //     x: 420.94,
      //     y: 375,
      //     fontSize: 32,
      //     font: 'Helvetica-Bold',
      //     color: '#dc2626',
      //     align: 'center'
      //   },

      //   courseName: {
      //     x: 420.94,
      //     y: 275,
      //     fontSize: 24,
      //     font: 'Helvetica-Bold',
      //     color: '#d97706',
      //     align: 'center'
      //   },

      //   duration: {
      //     x: 200,
      //     y: 120,
      //     fontSize: 11,
      //     font: 'Helvetica',
      //     color: '#374151',
      //     align: 'center'
      //   },

      //   issueDate: {
      //     x: 200,
      //     y: 140,
      //     fontSize: 12,
      //     font: 'Helvetica-Bold',
      //     color: '#111827',
      //     align: 'center'
      //   },

      //   certificateNo: {
      //     x: 730,
      //     y: 540,
      //     fontSize: 11,
      //     font: 'Helvetica-Bold',
      //     color: '#4b5563',
      //     align: 'right'
      //   },
      // });
      setFieldConfigs({
        candidateName: {
          x: 423,
          y: 277,
          fontSize: 38,
          font: 'Helvetica-Bold',
          color: '#d22426',
          align: 'center'
        },

        rollNo: {
          x: 397,
          y: 256,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        groundFrom: {
          x: 409,
          y: 197,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        groundTo: {
          x: 515,
          y: 197,
          fontSize: 14,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        simulatorFrom: {
          x: 456,
          y: 179,
          fontSize: 13,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        simulatorTo: {
          x: 567,
          y: 180,
          fontSize: 13,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        certificateNo: {
          x: 417,
          y: 127,
          fontSize: 15,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },

        uin: {
          x: 386,
          y: 102,
          fontSize: 15,
          font: 'Geometric-Sans',
          color: '#000000',
          align: 'left'
        },
      });
    }
  }
  const currentConf = fieldConfigs?.[activeField] || { x: 420, y: 300, fontSize: 16, font: 'Helvetica', color: '#000000', align: 'left' };

  const inputStyle = isDark
    ? 'w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium'
    : 'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium shadow-sm';

  const selectStyle = isDark
    ? 'w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 cursor-pointer'
    : 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 cursor-pointer shadow-sm';

  const labelStyle = `block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider mb-1 flex items-center gap-1`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Panel: Field Position Sliders & Controls */}
      <div className="lg:col-span-6 space-y-6">
        {/* Template Switcher & Upload Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider mb-2 flex items-center gap-1.5 font-heading`}>
              <Layers className="w-4 h-4 text-amber-500" /> Active Certificate Template
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <label className={isDark
              ? 'cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all shadow-sm'
              : 'cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all shadow-sm'}>
              <Upload className="w-4 h-4 text-amber-500" />
              <span>{uploading ? 'Uploading...' : 'Upload PDF/Image'}</span>
              <input
                type="file"
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadPreset('rpto')}
                className={isDark
                  ? 'px-3.5 py-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-medium rounded-xl flex items-center gap-1.5 transition-all shadow-sm'
                  : 'px-3.5 py-2 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-amber-600 font-medium rounded-xl flex items-center gap-1.5 transition-all shadow-sm'}
                title="Reset to RPTO Drone Certificate Presets"
              >
                <Sparkles className="w-3.5 h-3.5" /> RPTO Preset
              </button>
              <button
                onClick={handleSaveConfigs}
                className="px-4 py-2 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" /> Save Coordinates
              </button>
            </div>
          </div>
        </div>

        {saveMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-500" /> {saveMsg}
          </div>
        )}

        {/* Coordinate Tuner Box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className={`text-base font-bold flex items-center gap-2 font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sliders className="w-5 h-5 text-amber-500" /> Coordinate & Style Tuner
            </h3>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              Canvas: 842 x 595 pt
            </span>
          </div>

          {/* Field Selection Tabs */}
          <div>
            <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider mb-2 flex items-center gap-1 font-heading`}>
              <Target className="w-3.5 h-3.5 text-amber-500" /> Select Field to Adjust
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {Object.keys(fieldLabels).map((fieldKey) => (
                <button
                  key={fieldKey}
                  onClick={() => setActiveField(fieldKey)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left truncate flex items-center justify-between ${activeField === fieldKey
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                    : isDark
                      ? 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm'
                    }`}
                >
                  <span className="truncate">{fieldLabels[fieldKey]}</span>
                  {activeField === fieldKey && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Active Field Controls Box */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'} space-y-5 shadow-inner`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Settings className="w-4 h-4" /> {fieldLabels[activeField]}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${isDark ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-white text-slate-700 border-slate-300'}`}>
                X: {Math.round(currentConf.x)} | Y: {Math.round(currentConf.y)} | Size: {currentConf.fontSize}pt
              </span>
            </div>

            {/* Live Text Field Input for Preview Testing */}
            <div>
              <label className={labelStyle}>
                <Type className="w-3.5 h-3.5 text-amber-500" /> Sample Text for {fieldLabels[activeField]}
              </label>
              <input
                type="text"
                value={formData[activeField] || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, [activeField]: e.target.value }))}
                className={inputStyle}
                placeholder={`Enter sample text for ${fieldLabels[activeField]}`}
              />
            </div>

            {/* Fine Nudge Arrow Pad */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Fine Nudge (1pt Precision)</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNudge(-1, 0)}
                  className={`p-2 rounded-lg text-xs transition-all font-bold ${isDark ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-300'}`}
                  title="Move Left 1pt"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNudge(1, 0)}
                  className={`p-2 rounded-lg text-xs transition-all font-bold ${isDark ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-300'}`}
                  title="Move Right 1pt"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNudge(0, 1)}
                  className={`p-2 rounded-lg text-xs transition-all font-bold ${isDark ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-300'}`}
                  title="Move Up 1pt"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNudge(0, -1)}
                  className={`p-2 rounded-lg text-xs transition-all font-bold ${isDark ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200' : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-300'}`}
                  title="Move Down 1pt"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* X Position Slider */}
            <div>
              <div className={`flex justify-between text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>X Position (Horizontal)</span>
                <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">{Math.round(currentConf.x)} pt</span>
              </div>
              <input
                type="range"
                min="0"
                max="842"
                step="1"
                value={currentConf.x || 400}
                onChange={(e) => handleConfigChange(activeField, 'x', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Y Position Slider */}
            <div>
              <div className={`flex justify-between text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>Y Position (Vertical baseline from bottom)</span>
                <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">{Math.round(currentConf.y)} pt</span>
              </div>
              <input
                type="range"
                min="0"
                max="595"
                step="1"
                value={currentConf.y || 300}
                onChange={(e) => handleConfigChange(activeField, 'y', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Font Size Slider & Direct Input */}
            <div>
              <div className={`flex justify-between items-center text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-amber-500" /> Font Size
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="4"
                    max="100"
                    value={currentConf.fontSize || 16}
                    onChange={(e) => handleConfigChange(activeField, 'fontSize', parseInt(e.target.value) || 4)}
                    className={isDark
                      ? 'w-16 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono text-right font-bold'
                      : 'w-16 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-amber-600 font-mono text-right font-bold shadow-sm'}
                  />
                  <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>pt</span>
                </div>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                step="1"
                value={currentConf.fontSize || 16}
                onChange={(e) => handleConfigChange(activeField, 'fontSize', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Color & Alignment */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelStyle}>
                  <Palette className="w-3.5 h-3.5 text-amber-500" /> Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={currentConf.color || '#000000'}
                    onChange={(e) => handleConfigChange(activeField, 'color', e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentConf.color || '#000000'}
                    onChange={(e) => handleConfigChange(activeField, 'color', e.target.value)}
                    className={isDark
                      ? 'bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono w-24'
                      : 'bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono w-24 shadow-sm'}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>
                  <AlignLeft className="w-3.5 h-3.5 text-amber-500" /> Alignment
                </label>
                <select
                  value={currentConf.align || 'left'}
                  onChange={(e) => handleConfigChange(activeField, 'align', e.target.value)}
                  className={selectStyle}
                >
                  <option value="left">Left Align</option>
                  <option value="center">Center Align</option>
                  <option value="right">Right Align</option>
                </select>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className={labelStyle}>
                <Type className="w-3.5 h-3.5 text-amber-500" /> Font Family
              </label>
              <select
                value={currentConf.font || 'Helvetica'}
                onChange={(e) => handleConfigChange(activeField, 'font', e.target.value)}
                className={selectStyle}
              >
                {fontsList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Canvas Preview */}
      <div className="lg:col-span-6 flex flex-col justify-start">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col justify-center">
          <PreviewCanvas
            formData={formData}
            fieldConfigs={fieldConfigs}
            selectedTemplate={selectedTemplate}
            activeField={activeField}
            setActiveField={setActiveField}
            onFieldChange={handleFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
