import React, { useState, useEffect, useRef } from 'react';
import { Eye, Move, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import axios from 'axios';

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfjsWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization notice:', e);
}

export default function PreviewCanvas({
  formData = {},
  fieldConfigs = {},
  selectedTemplate = 'default-template.pdf',
  activeField = null,
  setActiveField = null,
  onFieldChange = null,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pageSize, setPageSize] = useState({ width: 841.89, height: 595.28 });
  const [draggingField, setDraggingField] = useState(null);
  const [previewMode, setPreviewMode] = useState('canvas'); // 'canvas' or 'pdf'
  const [serverPdfUrl, setServerPdfUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfRenderedSuccess, setPdfRenderedSuccess] = useState(false);

  const isImageTemplate =
    selectedTemplate &&
    /\.(png|jpe?g)$/i.test(selectedTemplate);

  const isDefaultTemplate =
    !selectedTemplate ||
    selectedTemplate.toLowerCase() === 'default-template.pdf';

  // 1. Render PDF Template to Canvas background
  useEffect(() => {
    let isMounted = true;
    if (isDefaultTemplate || isImageTemplate) {
      setPdfRenderedSuccess(false);
      setPdfLoading(false);
      setPdfError(null);
      return;
    }

    async function loadPdfTemplate() {
      setPdfLoading(true);
      setPdfError(null);
      setPdfRenderedSuccess(false);

      try {
        const fileUrl = `/api/templates/file/${encodeURIComponent(selectedTemplate)}`;

        // Fetch binary data directly to avoid CORS/Range fetch issues
        const res = await fetch(fileUrl);
        if (!res.ok) {
          throw new Error(`Failed to load template file (${res.status} ${res.statusText})`);
        }
        const buffer = await res.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        if (!isMounted) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const width = unscaledViewport.width || 841.89;
        const height = unscaledViewport.height || 595.28;
        setPageSize({ width, height });

        const viewport = page.getViewport({ scale: 2.0 }); // High DPI scale

        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          if (isMounted) setPdfRenderedSuccess(true);
        }
      } catch (err) {
        console.warn('PDF.js canvas render notice:', err);
        if (isMounted) {
          setPdfError(err.message || 'Could not render PDF to canvas');
        }
      } finally {
        if (isMounted) setPdfLoading(false);
      }
    }

    loadPdfTemplate();

    return () => {
      isMounted = false;
    };
  }, [selectedTemplate, isImageTemplate, isDefaultTemplate]);

  // 2. Fetch Server PDF Preview when switching to 'pdf' mode
  const fetchServerPdfPreview = async () => {
    setGeneratingPdf(true);
    try {
      const res = await axios.post('/api/generate-single', {
        ...formData,
        templateFileName: selectedTemplate,
        customConfig: fieldConfigs,
        preview: true,
      });

      if (res.data.success && res.data.pdfBase64) {
        setServerPdfUrl(res.data.pdfBase64);
      }
    } catch (err) {
      console.error('Failed to generate server PDF preview:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (previewMode === 'pdf') {
      fetchServerPdfPreview();
    }
  }, [previewMode, selectedTemplate, fieldConfigs, formData]);

  const draggingFieldRef = useRef(draggingField);
  draggingFieldRef.current = draggingField;

  const fieldConfigsRef = useRef(fieldConfigs);
  fieldConfigsRef.current = fieldConfigs;

  const onFieldChangeRef = useRef(onFieldChange);
  onFieldChangeRef.current = onFieldChange;

  // 3. Mouse Dragging Logic for Coordinates
  const handleMouseDown = (fieldKey, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (setActiveField) setActiveField(fieldKey);
    setDraggingField(fieldKey);
  };

  useEffect(() => {
    if (!draggingField) return;

    const handleMouseMove = (e) => {
      const currentField = draggingFieldRef.current;
      if (!currentField || !containerRef.current || !onFieldChangeRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      // Convert DOM pixel coordinates to PDF point coordinates (0,0 at bottom-left)
      const pdfX = Math.round((offsetX / rect.width) * pageSize.width);
      const pdfY = Math.round(((rect.height - offsetY) / rect.height) * pageSize.height);

      // Clamp coordinates to valid range
      const clampedX = Math.max(0, Math.min(pageSize.width, pdfX));
      const clampedY = Math.max(0, Math.min(pageSize.height, pdfY));

      const currentConfigs = fieldConfigsRef.current || {};
      onFieldChangeRef.current(currentField, {
        ...(currentConfigs[currentField] || {}),
        x: clampedX,
        y: clampedY,
      });
    };

    const handleMouseUp = () => {
      setDraggingField(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingField, pageSize]);

  // Dynamic scale factor between container width and PDF page width
  const [scaleFactor, setScaleFactor] = useState(1.0);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && pageSize.width > 0) {
          setScaleFactor(rect.width / pageSize.width);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pageSize.width]);

  // Convert PDF coordinates to DOM percentage positions with 1:1 PDF-lib baseline parity
  const getPositionStyle = (fieldKey) => {
    const conf = fieldConfigs[fieldKey];
    if (!conf) return null;

    const leftPercent = (conf.x / pageSize.width) * 100;
    const topPercent = ((pageSize.height - conf.y) / pageSize.height) * 100;

    let transform = 'translate(0%, -78%)';
    if (conf.align === 'center') {
      transform = 'translate(-50%, -78%)';
    } else if (conf.align === 'right') {
      transform = 'translate(-100%, -78%)';
    }

    const scaledFontSize = Math.max(4, (conf.fontSize || 16) * scaleFactor);

    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      transform,
      color: conf.color || '#000000',
      fontSize: `${scaledFontSize}px`,
      lineHeight: '1',
      fontWeight: conf.fontWeight === 'bold' ? '700' : conf.fontWeight === 'semibold' ? '600' : conf.font?.includes('SemiBold') ? '600' : conf.font?.includes('Bold') ? '700' : '400',
      fontStyle: conf.font?.includes('Oblique') ? 'italic' : 'normal',
      fontFamily: conf.font?.includes('Times')
        ? 'serif'
        : conf.font?.includes('Courier')
          ? 'monospace'
          : conf.font?.includes('Gill')
            ? '"Gill Sans MT", "Gill Sans", sans-serif'
            : conf.font?.includes('Arial')
              ? 'Arial, sans-serif'
              : conf.font?.includes('Geometric')
                ? '"Montserrat", "Poppins", sans-serif'
                : 'sans-serif',
      textAlign: conf.align || 'left',
      whiteSpace: 'nowrap',
    };
  };

  const activeConf = activeField && fieldConfigs ? fieldConfigs[activeField] : null;
  const templateFileUrl = `/api/templates/file/${encodeURIComponent(selectedTemplate)}`;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Header & Mode Toggle Bar */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Eye className="w-4 h-4 text-amber-400" /> Live Canvas Preview & Visual Mapper
          </span>
          {draggingField && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-mono animate-pulse flex items-center gap-1">
              <Move className="w-3 h-3" /> Moving {draggingField}
            </span>
          )}
        </div>

        {/* Toggle Canvas vs Server PDF */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setPreviewMode('canvas')}
            className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all flex items-center gap-1 ${previewMode === 'canvas'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Eye className="w-3 h-3" /> Drag Canvas
          </button>
          <button
            onClick={() => setPreviewMode('pdf')}
            className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all flex items-center gap-1 ${previewMode === 'pdf'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <FileText className="w-3 h-3" /> Live Server PDF
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      {previewMode === 'canvas' ? (
        <div
          ref={containerRef}
          style={{ aspectRatio: `${pageSize.width} / ${pageSize.height}` }}
          className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-100 text-slate-900 transition-all duration-300 group cursor-crosshair"
        >
          {/* Background Option A: High-res PDF Canvas */}
          {!isDefaultTemplate && !isImageTemplate && (
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${pdfRenderedSuccess ? 'block' : 'hidden'
                }`}
            />
          )}

          {/* Background Option B: Direct PDF Embed Fallback if canvas render is loading or unavailable */}
          {!isDefaultTemplate && !isImageTemplate && !pdfRenderedSuccess && !pdfLoading && (
            <iframe
              src={`${templateFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title="Template Background PDF"
              className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-90"
            />
          )}

          {/* Background Option C: Image Template */}
          {isImageTemplate && (
            <img
              src={templateFileUrl}
              alt="Certificate Background"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* Background Option D: Fallback Default Vector Graphic ONLY if default-template selected */}
          {isDefaultTemplate && (
            <div className="absolute inset-0 bg-stone-50 p-6 flex flex-col justify-between pointer-events-none select-none">
              <div className="absolute inset-4 border-4 border-blue-900"></div>
              <div className="absolute inset-6 border-2 border-amber-600"></div>
              <div className="w-full text-center mt-6">
                <h2 className="text-2xl font-bold tracking-wider text-slate-900 uppercase font-serif">
                  Certificate of Achievement
                </h2>
                <p className="text-[10px] font-bold text-amber-700 tracking-widest mt-1 uppercase">
                  PROUDLY PRESENTED TO
                </p>
              </div>
              <div className="text-center my-auto">
                <p className="text-xs italic text-slate-600">
                  for successfully completing the training program and demonstrating excellence
                </p>
              </div>
              <div className="flex justify-between items-end px-10 pb-4 text-[10px]">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase">DATE & DURATION</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase">AUTHORIZED SIGNATURE</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {pdfLoading && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-amber-400 gap-2 z-20">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Loading Base Template...</span>
            </div>
          )}

          {/* Removed Crosshair Guidelines to reduce clutter */}

          {/* Dynamic Field Overlays with Drag Handlers */}
          {Object.keys(fieldConfigs).map((fieldKey) => {
            const style = getPositionStyle(fieldKey);
            if (!style) return null;

            const conf = (fieldConfigs && fieldConfigs[fieldKey]) || { x: 0, y: 0 };
            const rawVal = formData[fieldKey] || `[${fieldKey}]`;
            const val = fieldKey === 'candidateName' ? rawVal.toUpperCase() : rawVal;
            const isActive = activeField === fieldKey;

            return (
              <div
                key={fieldKey}
                style={style}
                onMouseDown={(e) => handleMouseDown(fieldKey, e)}
                onTouchStart={(e) => handleMouseDown(fieldKey, e)}
                className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing px-0 py-0 rounded transition-all z-20 ${isActive
                  ? 'z-30 drop-shadow-md cursor-grabbing'
                  : 'hover:ring-1 hover:ring-slate-500/30'
                  }`}
              >
                <span>{val}</span>

                {/* Selected Field Badge Indicator */}
                {isActive && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shadow-md whitespace-nowrap pointer-events-none">
                    X:{Math.round(conf.x)} Y:{Math.round(conf.y)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Server Rendered Live PDF View */
        <div
          style={{ aspectRatio: `${pageSize.width} / ${pageSize.height}` }}
          className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex items-center justify-center"
        >
          {generatingPdf ? (
            <div className="flex flex-col items-center gap-3 text-amber-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold text-slate-300">Generating Live Server PDF...</span>
            </div>
          ) : serverPdfUrl ? (
            <iframe
              src={`${serverPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title="Live Server PDF Preview"
              className="w-full h-full border-0"
            />
          ) : (
            <span className="text-xs text-slate-400">PDF preview loading...</span>
          )}
        </div>
      )}

      {/* Quick Instructional Note & Selected Template Pill */}
      <div className="w-full mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 gap-2">
        <span className="flex items-center gap-1 text-slate-300">
          <Move className="w-3 h-3 text-amber-400" /> Click and drag any text on the canvas to adjust coordinates.
        </span>
        <span className="font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
          Template: {selectedTemplate}
        </span>
      </div>
    </div>
  );
}
