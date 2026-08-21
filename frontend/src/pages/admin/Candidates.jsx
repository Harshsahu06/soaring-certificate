import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Printer, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import RegistrationFormPDF from '../../components/RegistrationFormPDF';
import SkillTestReportPDF from '../../components/SkillTestReportPDF';
import ProgressTestReportPDF from '../../components/ProgressTestReportPDF';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidateToPrint, setSelectedCandidateToPrint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Print States
  const printRef = useRef();
  const skillPrintRef = useRef();
  const progressPrintRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: '',
    onAfterPrint: () => setSelectedCandidateToPrint(null)
  });

  const handleSkillPrint = useReactToPrint({
    contentRef: skillPrintRef,
    documentTitle: 'Skill_Test_Report',
    onAfterPrint: () => setReportModalConfig(null)
  });

  const handleProgressPrint = useReactToPrint({
    contentRef: progressPrintRef,
    documentTitle: 'Progress_Test_Report',
    onAfterPrint: () => setReportModalConfig(null)
  });

  const [reportModalConfig, setReportModalConfig] = useState(null);
  const [testDetails, setTestDetails] = useState({
    instructor: 'Aditya Agrawal',
    date: new Date().toLocaleDateString('en-GB'),
    duration: '00:30',
    type: 'Fixed Wing',
    dayNight: 'Day',
    comments: 'NIL',
    // Defaults for all SAT/UNSAT rows
    item1: 'Sat', item2: 'Sat', item3: 'Sat', item4: 'Sat', item5: 'Sat',
    item6: 'Sat', item7: 'Sat', item8: 'Sat', item9: 'Sat', item10: 'Sat',
    item1_1: 'Sat', item1_2: 'Sat', item1_3: 'Sat', item1_4: 'Sat',
    item2_1: 'Sat', item2_2: 'Sat', item2_3: 'Sat', item2_4: 'Sat', item2_5: 'Sat',
    item3_1: 'Sat', item4_1: 'Sat', overall: 'Sat'
  });

  const triggerPrint = (candidate) => {
    setSelectedCandidateToPrint(candidate);
    setTimeout(() => handlePrint(), 100);
  };

  const [formData, setFormData] = useState({
    rollNo: '',
    fullName: '',
    permanentAddress: '',
    phoneNumber: '',
    emailAddress: '',
    maximumQualification: '',
    dateOfBirth: '',
    aadharNumber: '',
    secondaryIdNumber: '',
    organizationOrIndividual: 'INDIVIDUAL',
    check4Photographs: false,
    check10thCertificate: false,
    checkAadhar: false,
    checkSecondaryIdType: '',
    checkSelfAttested: false,
    checkMedicalFitness: false,
    batch: ''
  });

  const fetchData = async () => {
    try {
      const [candRes, batchRes] = await Promise.all([
        axios.get(`/api/admin/candidates`),
        axios.get(`/api/admin/batches`)
      ]);
      setCandidates(candRes.data);
      setBatches(batchRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const dataToSave = { ...formData, status: 'Draft' };
      if (!dataToSave.batch) {
        delete dataToSave.batch;
      }
      if (editingId) {
        await axios.put(`/api/admin/candidates/${editingId}`, dataToSave);
      } else {
        await axios.post(`/api/admin/candidates`, dataToSave);
      }
      setShowModal(false);
      setEditingId(null);
      fetchData();
      // Reset form
      setFormData({
        rollNo: '', fullName: '', permanentAddress: '', phoneNumber: '', emailAddress: '',
        maximumQualification: '', dateOfBirth: '', aadharNumber: '', secondaryIdNumber: '',
        organizationOrIndividual: 'INDIVIDUAL', check4Photographs: false, check10thCertificate: false,
        checkAadhar: false, checkSecondaryIdType: '', checkSelfAttested: false, checkMedicalFitness: false, batch: ''
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batch) return alert("Please select a batch");
    try {
      setIsSubmitting(true);
      const dataToSave = { ...formData, status: 'Completed' };
      if (editingId) {
        await axios.put(`/api/admin/candidates/${editingId}`, dataToSave);
      } else {
        await axios.post(`/api/admin/candidates`, dataToSave);
      }
      setShowModal(false);
      setEditingId(null);
      fetchData();
      // Reset form
      setFormData({
        rollNo: '', fullName: '', permanentAddress: '', phoneNumber: '', emailAddress: '',
        maximumQualification: '', dateOfBirth: '', aadharNumber: '', secondaryIdNumber: '',
        organizationOrIndividual: 'INDIVIDUAL', check4Photographs: false, check10thCertificate: false,
        checkAadhar: false, checkSecondaryIdType: '', checkSelfAttested: false, checkMedicalFitness: false, batch: ''
      });
    } catch (error) {
      console.error('Error saving candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate._id);
    setFormData({
      rollNo: candidate.rollNo || '',
      fullName: candidate.fullName || '',
      permanentAddress: candidate.permanentAddress || '',
      phoneNumber: candidate.phoneNumber || '',
      emailAddress: candidate.emailAddress || '',
      maximumQualification: candidate.maximumQualification || '',
      dateOfBirth: candidate.dateOfBirth || '',
      aadharNumber: candidate.aadharNumber || '',
      secondaryIdNumber: candidate.secondaryIdNumber || '',
      organizationOrIndividual: candidate.organizationOrIndividual || 'INDIVIDUAL',
      check4Photographs: candidate.check4Photographs || false,
      check10thCertificate: candidate.check10thCertificate || false,
      checkAadhar: candidate.checkAadhar || false,
      checkSecondaryIdType: candidate.checkSecondaryIdType || '',
      checkSelfAttested: candidate.checkSelfAttested || false,
      checkMedicalFitness: candidate.checkMedicalFitness || false,
      batch: candidate.batch ? (candidate.batch._id || candidate.batch) : ''
    });
    setShowModal(true);
  };

  const filteredCandidates = candidates.filter(c => {
    const term = searchQuery.toLowerCase();
    const nameMatch = c.fullName?.toLowerCase().includes(term);
    const batchMatch = c.batch?.batchName?.toLowerCase().includes(term);
    const emailMatch = c.emailAddress?.toLowerCase().includes(term);
    return nameMatch || batchMatch || emailMatch;
  });

  const handleDelete = async (id) => {
    const pwd = window.prompt('Enter deletion password:');
    if (pwd) {
      try {
        setDeletingId(id);
        await axios.delete(`/api/admin/candidates/${id}`, { data: { password: pwd } });
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting candidate');
        console.error('Error deleting candidate:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Candidates Registration</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search by Name or Batch..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white w-full md:w-64"
          />
          <button
            onClick={async () => {
              setEditingId(null);
              let newRollNo = '';
              try {
                const res = await axios.get(`/api/admin/next-rollno`);
                newRollNo = res.data.rollNo;
              } catch (e) {
                console.error(e);
              }
              setFormData({
                rollNo: newRollNo,
                fullName: '', permanentAddress: '', phoneNumber: '', emailAddress: '',
                maximumQualification: '', dateOfBirth: '', aadharNumber: '', secondaryIdNumber: '',
                organizationOrIndividual: 'INDIVIDUAL', check4Photographs: false, check10thCertificate: false,
                checkAadhar: false, checkSecondaryIdType: '', checkSelfAttested: false, checkMedicalFitness: false, batch: ''
              });
              setShowModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Register Candidate
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
                <th className="p-4">Name</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">UIN</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></td></tr>
              ) : filteredCandidates.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">No candidates found</td></tr>
              ) : (
                filteredCandidates.map(candidate => (
                  <tr key={candidate._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {candidate.fullName}
                      {candidate.status === 'Draft' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300">Draft</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500">{candidate.rollNo || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {candidate.batch ? candidate.batch.batchName : 'No Batch'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>{candidate.phoneNumber}</div>
                      <div className="text-xs">{candidate.emailAddress}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500">{candidate.uin || 'Not Assigned'}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(candidate)} className="text-blue-500 hover:text-blue-700 p-2" title="Edit Candidate">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => {
                        setReportModalConfig({ candidate, type: 'skill' });
                        setTestDetails(prev => ({ ...prev, type: 'Fixed Wing' })); // reset type default
                      }} className="text-emerald-500 hover:text-emerald-700 p-2" title="Print Skill Test Report">
                        <span className="text-xs font-bold border border-emerald-500 rounded px-1">ST</span>
                      </button>
                      <button onClick={() => {
                        setReportModalConfig({ candidate, type: 'progress' });
                        setTestDetails(prev => ({ ...prev, type: 'Theory' })); // reset type default
                      }} className="text-indigo-500 hover:text-indigo-700 p-2" title="Print Progress Test Report">
                        <span className="text-xs font-bold border border-indigo-500 rounded px-1">PT</span>
                      </button>
                      <button onClick={() => triggerPrint(candidate)} className="text-amber-500 hover:text-amber-700 p-2" title="Print Registration Form">
                        <Printer className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(candidate._id)} className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50" title="Delete" disabled={deletingId === candidate._id}>
                        {deletingId === candidate._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
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
      </div>

      <RegistrationFormPDF ref={printRef} candidate={selectedCandidateToPrint} />

      {/* Modal for Registration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 dark:text-white">{editingId ? 'Edit Candidate' : 'Register New Candidate'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Assign to Batch</label>
                  <select required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})}>
                    <option value="">Select a batch</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                  </select>
                </div>
                
                {/* Information */}
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Roll No</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                    value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} /></div>
                    
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Full Name (10th Cert)</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Phone Number</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Email Address</label>
                  <input required type="email" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Maximum Qualification</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.maximumQualification} onChange={e => setFormData({...formData, maximumQualification: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Date of Birth</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Aadhar Number</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.aadharNumber} onChange={e => setFormData({...formData, aadharNumber: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">P,R,D,V/ Secondary ID Number</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.secondaryIdNumber} onChange={e => setFormData({...formData, secondaryIdNumber: e.target.value})} /></div>
                
                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Organization Name / Individual</label>
                  <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.organizationOrIndividual} onChange={e => setFormData({...formData, organizationOrIndividual: e.target.value})} /></div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Permanent Address</label>
                  <textarea required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} rows="2" />
                </div>
              </div>

              {/* Checklists */}
              <div className="border-t pt-4 dark:border-slate-700">
                <h4 className="font-semibold mb-3 dark:text-white">Checklist (Official Use)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm dark:text-slate-300">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.check4Photographs} onChange={e => setFormData({...formData, check4Photographs: e.target.checked})} /> 4 Photographs</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.check10thCertificate} onChange={e => setFormData({...formData, check10thCertificate: e.target.checked})} /> Original 10th Certificate</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.checkAadhar} onChange={e => setFormData({...formData, checkAadhar: e.target.checked})} /> Original Aadhar</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.checkSelfAttested} onChange={e => setFormData({...formData, checkSelfAttested: e.target.checked})} /> Self-Attested Copy of Docs</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.checkMedicalFitness} onChange={e => setFormData({...formData, checkMedicalFitness: e.target.checked})} /> Medical Fitness Certificate</label>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium mr-2">Secondary ID:</span>
                    {['Passport', 'Voter ID', 'Driving License', 'Ration Card'].map(type => (
                      <label key={type} className="flex items-center gap-1">
                        <input type="radio" name="secId" checked={formData.checkSecondaryIdType === type} onChange={() => setFormData({...formData, checkSecondaryIdType: type})} /> {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" disabled={isSavingDraft || isSubmitting}>
                  Cancel
                </button>
                <button type="button" onClick={saveDraft} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center gap-2" disabled={isSavingDraft || isSubmitting}>
                  {isSavingDraft && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2" disabled={isSavingDraft || isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : (editingId ? 'Update Candidate' : 'Save Candidate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Components */}
      {reportModalConfig?.type === 'skill' && (
        <SkillTestReportPDF ref={skillPrintRef} candidate={reportModalConfig.candidate} testDetails={testDetails} />
      )}
      {reportModalConfig?.type === 'progress' && (
        <ProgressTestReportPDF ref={progressPrintRef} candidate={reportModalConfig.candidate} testDetails={testDetails} />
      )}

      {/* Modal for Filling Test Reports */}
      {reportModalConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {reportModalConfig.type === 'skill' ? 'Fill Skill Test Details' : 'Fill Progress Test Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Instructor Name</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={testDetails.instructor}
                  onChange={e => setTestDetails({...testDetails, instructor: e.target.value})}
                >
                  <option value="Aditya Agrawal">Aditya Agrawal</option>
                  <option value="Lalit Nagapurkar">Lalit Nagapurkar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Date of Test</label>
                <input 
                  type="text" 
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={testDetails.date}
                  onChange={e => setTestDetails({...testDetails, date: e.target.value})}
                />
              </div>

              {reportModalConfig.type === 'skill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Test Time (Day/Night)</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={testDetails.dayNight}
                      onChange={e => setTestDetails({...testDetails, dayNight: e.target.value})}
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Duration (Hrs)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={testDetails.duration}
                      onChange={e => setTestDetails({...testDetails, duration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Type of Test</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={testDetails.type}
                      onChange={e => setTestDetails({...testDetails, type: e.target.value})}
                    >
                      <option value="Fixed Wing">Fixed Wing</option>
                      <option value="RotaryWing">RotaryWing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {reportModalConfig.type === 'progress' && (
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Type of Test</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={testDetails.type}
                    onChange={e => setTestDetails({...testDetails, type: e.target.value})}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Simulator">Simulator</option>
                    <option value="RPA">RPA</option>
                  </select>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Comments</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={testDetails.comments}
                  onChange={e => setTestDetails({...testDetails, comments: e.target.value})}
                />
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2 dark:text-white">Assessments (Mark UNSAT if applicable, defaults to SAT)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {reportModalConfig.type === 'skill' ? (
                  ['Flight Planning', 'Precautions before flight', 'Pre-flight Checks', 'Take off', 'General handling', 'Emergency handling', 'Landing', 'Airmanship', 'Situational awareness', 'Documentation'].map((label, idx) => {
                    const key = `item${idx + 1}`;
                    return (
                      <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <span className="dark:text-slate-300">{label}</span>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 dark:text-white cursor-pointer"><input type="radio" name={key} checked={testDetails[key] === 'Sat'} onChange={() => setTestDetails({...testDetails, [key]: 'Sat'})} /> Sat</label>
                          <label className="flex items-center gap-1 dark:text-white cursor-pointer"><input type="radio" name={key} checked={testDetails[key] === 'Unsat'} onChange={() => setTestDetails({...testDetails, [key]: 'Unsat'})} /> Unsat</label>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  [
                    {k: 'item1_1', l: 'Knowledge of control'}, {k: 'item1_2', l: 'Pre-Flight Checklist'}, {k: 'item1_3', l: 'Pre-Flight Inspection'}, {k: 'item1_4', l: 'Flight Planning'},
                    {k: 'item2_1', l: 'Takeoff and Landing'}, {k: 'item2_2', l: 'Basic Control'}, {k: 'item2_3', l: 'Climb and Descent'}, {k: 'item2_4', l: 'Pitch, Roll and Yaw'}, {k: 'item2_5', l: 'Flying in Disorientation'},
                    {k: 'item3_1', l: 'Situational Awareness'}, {k: 'item4_1', l: 'Airmanship'}, {k: 'overall', l: 'OVERALL PROGRESS'}
                  ].map(({k, l}) => (
                    <div key={k} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <span className="dark:text-slate-300 font-medium">{l}</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 dark:text-white cursor-pointer"><input type="radio" name={k} checked={testDetails[k] === 'Sat'} onChange={() => setTestDetails({...testDetails, [k]: 'Sat'})} /> Sat</label>
                        <label className="flex items-center gap-1 dark:text-white cursor-pointer"><input type="radio" name={k} checked={testDetails[k] === 'Unsat'} onChange={() => setTestDetails({...testDetails, [k]: 'Unsat'})} /> Unsat</label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
              <button type="button" onClick={() => setReportModalConfig(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (reportModalConfig.type === 'skill') {
                    setTimeout(() => handleSkillPrint(), 100);
                  } else {
                    setTimeout(() => handleProgressPrint(), 100);
                  }
                }} 
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
