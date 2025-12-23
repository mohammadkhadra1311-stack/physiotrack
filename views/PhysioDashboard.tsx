
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { AppointmentStatus, PatientRecord, TreatmentPlan, Exercise, SymptomReport, UserRole, FileAsset, SocialLinks } from '../types';
import { suggestTreatmentPlan, analyzeSymptoms } from '../services/gemini';
import { ICONS } from '../constants';

const PhysioDashboard: React.FC = () => {
  const { appointments, slots, patients, updateAppointmentStatus, plans, assignPlan, deletePatient, symptomReports, t, language, currentUser, deleteAccount, requestReassignment, fileAssets, updatePhysioProfile } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<FileAsset | null>(null);
  
  const [verifiedPatientId, setVerifiedPatientId] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState(false);

  // Profile Edit State
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [socials, setSocials] = useState<SocialLinks>(currentUser?.socials || {});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const myPatients = useMemo(() => 
    patients.filter(p => p.assignedPhysioId === currentUser?.id),
    [patients, currentUser]
  );

  const myAppointments = useMemo(() => {
    const assignedPatientIds = new Set(myPatients.map(p => p.id));
    return appointments.filter(a => 
      a.physioId === currentUser?.id && 
      assignedPatientIds.has(a.patientId)
    );
  }, [appointments, currentUser, myPatients]);

  const tabs = [
    { id: 'overview', label: t('dashboard'), icon: 'Dashboard' as const },
    { id: 'appointments', label: t('bookings'), icon: 'Calendar' as const },
    { id: 'patients', label: language === 'ar' ? 'مرضاي' : 'My Patients', icon: 'Users' as const },
    { id: 'settings', label: t('settings'), icon: 'Logout' as const },
  ];

  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setAiAnalysisResult(null);
    setVerificationError(false);
    setEnteredCode('');
    if (verifiedPatientId !== patient.id) {
      setVerifiedPatientId(null);
    }
  };

  const verifyCode = () => {
    if (selectedPatient && enteredCode === selectedPatient.privacyCode) {
      setVerifiedPatientId(selectedPatient.id);
      setVerificationError(false);
    } else {
      setVerificationError(true);
    }
  };

  const handleStatusUpdate = async (appId: string, status: AppointmentStatus) => {
    setIsProcessing(true);
    await updateAppointmentStatus(appId, status);
    setIsProcessing(false);
  };

  const handleAiSuggest = async () => {
    if (!diagnosis || !selectedPatient) return;
    setIsProcessing(true);
    const suggested = await suggestTreatmentPlan(diagnosis);
    if (suggested) {
      const newPlan: TreatmentPlan = {
        id: `plan-${Date.now()}`,
        patientId: selectedPatient.id,
        exercises: suggested.map((ex: any, i: number) => ({
          ...ex,
          id: `ai-ex-${Date.now()}-${i}`
        })),
        notes: `AI Generated plan for: ${diagnosis}`,
        createdAt: Date.now()
      };
      assignPlan(selectedPatient.id, newPlan);
      setDiagnosis('');
    }
    setIsProcessing(false);
  };

  const handleAnalyzeSymptoms = async (report: SymptomReport) => {
    setIsProcessing(true);
    const analysis = await analyzeSymptoms(report);
    setAiAnalysisResult(analysis);
    setIsProcessing(false);
  };

  const handleDeleteAccount = () => {
    if (currentUser && window.confirm(t('deleteAccountWarning'))) {
      deleteAccount(currentUser.id, UserRole.PHYSIO);
    }
  };

  const handleReassign = () => {
    if (selectedPatient && currentUser && window.confirm(t('reassignDialog'))) {
      requestReassignment(selectedPatient.id, currentUser.id);
      setSelectedPatient({ ...selectedPatient, reassignmentRequest: { fromPhysioId: currentUser.id, status: 'PENDING' } });
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    await new Promise(r => setTimeout(r, 600));
    updatePhysioProfile(currentUser.id, bio, socials);
    setIsSavingProfile(false);
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('upcomingToday')}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {myAppointments.filter(a => a.status === AppointmentStatus.APPROVED).length}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('pendingRequests')}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {myAppointments.filter(a => a.status === AppointmentStatus.PENDING).length}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('activePatients')}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{myPatients.length}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('recentBookings')}</h3>
          <button className="text-teal-600 font-semibold text-sm hover:underline" onClick={() => setActiveTab('appointments')}>{t('viewAll')}</button>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {myAppointments.filter(a => a.status === AppointmentStatus.PENDING).map(app => {
            const patient = myPatients.find(p => p.id === app.patientId);
            if (!patient) return null;
            return (
              <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{patient.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(app.startTime).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    aria-label="Reject"
                    disabled={isProcessing}
                    onClick={() => handleStatusUpdate(app.id, AppointmentStatus.REJECTED)} 
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                  >
                    <ICONS.X />
                  </button>
                  <button 
                    aria-label="Approve"
                    disabled={isProcessing}
                    onClick={() => handleStatusUpdate(app.id, AppointmentStatus.APPROVED)} 
                    className="p-3 bg-teal-600 text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <ICONS.Check />
                  </button>
                </div>
              </div>
            );
          })}
          {myAppointments.filter(a => a.status === AppointmentStatus.PENDING).length === 0 && (
            <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic flex flex-col items-center gap-4">
               <ICONS.Calendar />
               <p>{t('noPending')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'مرضاي المسجلون' : 'My Assigned Patients'}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {myPatients.map(p => (
            <div key={p.id} onClick={() => handlePatientSelect(p)} className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${selectedPatient?.id === p.id ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 shadow-md ring-1 ring-teal-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-teal-100 dark:hover:border-teal-900 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-2xl flex items-center justify-center text-xl font-bold">
                   {p.name.charAt(0)}
                </div>
                <div>
                   <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider">{p.status}</span>
              </div>
            </div>
          ))}
          {myPatients.length === 0 && (
            <div className="p-20 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-200 flex flex-col items-center gap-4">
               <ICONS.Users />
               <p>{language === 'ar' ? 'لا يوجد مرضى معينون لك حالياً.' : 'No patients assigned to you yet.'}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-fit sticky top-8 overflow-hidden transition-colors duration-200 min-h-[400px]">
          {!selectedPatient ? (
             <div className="p-20 text-center text-slate-300 dark:text-slate-700 flex flex-col items-center justify-center h-full">
                <ICONS.Users />
                <p className="mt-4 font-bold uppercase tracking-widest text-xs">{t('patientDirectory')}</p>
             </div>
          ) : verifiedPatientId !== selectedPatient.id ? (
             <div className="p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 h-full">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('recordLocked')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('enterCode')}</p>
                <div className="w-full max-w-[240px]">
                   <input 
                      type="password"
                      maxLength={4}
                      value={enteredCode}
                      onChange={(e) => {setVerificationError(false); setEnteredCode(e.target.value.replace(/\D/g, ''));}}
                      onKeyPress={(e) => e.key === 'Enter' && verifyCode()}
                      className={`w-full text-center text-3xl tracking-[1rem] py-5 rounded-[1.5rem] border ${verificationError ? 'border-red-300 bg-red-50 dark:bg-red-900/10 text-red-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500'} outline-none shadow-inner transition-all`}
                      dir="ltr"
                   />
                   {verificationError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-bounce">{t('incorrectCode')}</p>}
                   <button onClick={verifyCode} className="w-full mt-6 bg-slate-900 dark:bg-teal-600 text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs shadow-lg">{t('unlockProfile')}</button>
                </div>
             </div>
          ) : (
            <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto max-h-[85vh] custom-scrollbar">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                {selectedPatient.reassignmentRequest?.status === 'PENDING' ? (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">{t('reassignPending')}</span>
                ) : (
                  <button 
                    onClick={handleReassign}
                    className="text-[10px] text-slate-400 hover:text-teal-600 font-black uppercase tracking-widest transition-all flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    {t('requestReassignment')}
                  </button>
                )}
              </div>

              {/* Shared Media Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">{t('sharedFiles')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {fileAssets.filter(f => f.patientId === selectedPatient.id).map(file => (
                    <div key={file.id} className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all shadow-sm" onClick={() => setPreviewMedia(file)}>
                       {file.mimeType.startsWith('image/') ? (
                         <img src={file.data} className="w-full h-full object-cover" alt={file.name} />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                       )}
                    </div>
                  ))}
                  {fileAssets.filter(f => f.patientId === selectedPatient.id).length === 0 && (
                    <p className="col-span-3 text-center text-[10px] text-slate-400 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 italic">{t('noMedia')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">{t('assessments')}</h4>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {symptomReports.filter(r => r.patientId === selectedPatient.id).map(report => (
                    <div key={report.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl transition-colors duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">{t('painLevel')}: {report.painLevel}/10</span>
                        <span className="text-[10px] text-slate-400">{new Date(report.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{report.painLocation}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{report.description}</p>
                      <div className="mt-4 flex gap-2">
                        <button 
                          disabled={isProcessing}
                          onClick={() => handleAnalyzeSymptoms(report)} 
                          className={`text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-teal-600 text-white px-3 py-2 rounded-lg hover:scale-[1.02] transition-all flex items-center gap-2 ${isProcessing ? 'opacity-50' : ''}`}
                        >
                          {isProcessing && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                          {t('aiInsight')}
                        </button>
                        <button onClick={() => setDiagnosis(report.description)} className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">{t('diagnosisBase')}</button>
                      </div>
                      {aiAnalysisResult && (
                        <div className="mt-4 p-5 bg-teal-50 dark:bg-teal-900/10 rounded-2xl text-xs text-slate-700 dark:text-slate-300 border border-teal-100 dark:border-teal-800 animate-in slide-in-from-top-2 duration-500 leading-relaxed shadow-inner">
                          {aiAnalysisResult}
                        </div>
                      )}
                    </div>
                  ))}
                  {symptomReports.filter(r => r.patientId === selectedPatient.id).length === 0 && (
                    <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest py-8 italic">No assessments submitted.</p>
                  )}
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <textarea 
                  value={diagnosis} 
                  disabled={isProcessing}
                  onChange={(e) => setDiagnosis(e.target.value)} 
                  className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-28 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-inner" 
                  placeholder="Enter diagnosis or notes for plan generation..."
                />
                <button 
                  disabled={isProcessing || !diagnosis}
                  onClick={handleAiSuggest} 
                  className={`w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg dark:shadow-none flex items-center justify-center gap-2 ${isProcessing || !diagnosis ? 'opacity-50 grayscale' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t('genExercises')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Preview Modal for Physio */}
      {previewMedia && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setPreviewMedia(null)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white truncate pr-4">{previewMedia.name}</h4>
              <button onClick={() => setPreviewMedia(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" aria-label="Close">
                <ICONS.X />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
               {previewMedia.mimeType.startsWith('image/') ? (
                 <img src={previewMedia.data} className="max-h-full object-contain" alt={previewMedia.name} />
               ) : (
                 <video src={previewMedia.data} controls className="max-h-full w-full" />
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{t('settings')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Manage your therapist profile and digital identity.</p>
          
          <div className="space-y-8">
             <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest">{t('therapist')}</div>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('bio')}</label>
                   <textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 h-32 shadow-inner transition-all" 
                      placeholder="Tell patients about your expertise..."
                   />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('linkedIn')}</label>
                      <input 
                        type="url" 
                        value={socials.linkedin || ''} 
                        onChange={(e) => setSocials({...socials, linkedin: e.target.value})} 
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                        placeholder="https://linkedin.com/in/..."
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('instagram')}</label>
                      <input 
                        type="url" 
                        value={socials.instagram || ''} 
                        onChange={(e) => setSocials({...socials, instagram: e.target.value})} 
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                        placeholder="https://instagram.com/..."
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('twitter')}</label>
                      <input 
                        type="url" 
                        value={socials.twitter || ''} 
                        onChange={(e) => setSocials({...socials, twitter: e.target.value})} 
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                        placeholder="https://twitter.com/..."
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('website')}</label>
                      <input 
                        type="url" 
                        value={socials.website || ''} 
                        onChange={(e) => setSocials({...socials, website: e.target.value})} 
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                        placeholder="https://..."
                      />
                   </div>
                </div>

                <button 
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  className={`w-full bg-slate-900 dark:bg-teal-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm ${isSavingProfile ? 'opacity-70 scale-95' : 'hover:scale-[1.01] active:scale-95'}`}
                >
                  {isSavingProfile && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t('saveProfile')}
                </button>
             </div>
          </div>
       </div>

       {/* Danger Zone: Delete Account */}
       <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-[2.5rem] p-10 transition-colors duration-200">
          <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {t('dangerZone')}
          </h3>
          <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-8 leading-relaxed font-medium">
            {t('deleteAccountWarning')}
          </p>
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {t('deleteAccount')}
          </button>
       </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs}>
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'appointments' && (
        <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
           <ICONS.Calendar />
           <p className="font-bold uppercase tracking-widest text-xs">Calendar View coming soon.</p>
        </div>
      )}
      {activeTab === 'patients' && renderPatients()}
      {activeTab === 'settings' && renderSettings()}
    </Layout>
  );
};

export default PhysioDashboard;
