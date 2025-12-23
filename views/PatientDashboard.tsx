
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { AppointmentStatus, Exercise, SymptomReport, UserRole, FileAsset, User } from '../types';
import { ICONS } from '../constants';

const PatientDashboard: React.FC = () => {
  const { appointments, slots, plans, bookSlot, currentUser, updateAppointmentStatus, submitSymptomReport, symptomReports, patients, updatePrivacyCode, t, language, physios, assignPhysio, darkMode, deleteAccount, handleReassignmentResponse, fileAssets, uploadFileAsset } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingReason, setBookingReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(new Set());
  const [showCode, setShowCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewMedia, setPreviewMedia] = useState<FileAsset | null>(null);
  const [viewingPhysio, setViewingPhysio] = useState<User | null>(null);

  const [symptomForm, setSymptomForm] = useState({
    painLocation: '',
    painLevel: 5,
    duration: '',
    description: '',
    aggravatingFactors: ''
  });

  const myProfile = patients.find(p => p.id === currentUser?.id);
  const assignedPhysio = physios.find(p => p.id === myProfile?.assignedPhysioId);
  const reassignment = myProfile?.reassignmentRequest;
  const myMedia = fileAssets.filter(f => f.patientId === currentUser?.id);

  const tabs = [
    { id: 'overview', label: t('myHealth'), icon: 'Dashboard' as const },
    { id: 'symptoms', label: t('symptomCheck'), icon: 'Dashboard' as const },
    { id: 'booking', label: t('bookVisit'), icon: 'Calendar' as const },
    { id: 'media', label: t('media'), icon: 'Msk' as const },
    { id: 'exercises', label: t('myExercises'), icon: 'Exercise' as const },
    { id: 'privacy', label: t('privacy'), icon: 'Users' as const },
  ];

  const myAppointments = appointments.filter(a => a.patientId === currentUser?.id);
  const myPlans = plans.filter(p => p.patientId === currentUser?.id);
  const myExercises = myPlans.length > 0 ? myPlans[myPlans.length - 1].exercises : [];

  const handleBook = async () => {
    if (selectedSlot && currentUser && assignedPhysio) {
      setIsProcessing(true);
      const success = await bookSlot(selectedSlot, currentUser.id, bookingReason, assignedPhysio.id);
      setIsProcessing(false);
      if (success) {
        setSelectedSlot(null);
        setBookingReason('');
        setActiveTab('overview');
      } else {
        alert("This slot was just booked by someone else. Please select another time.");
      }
    }
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setIsProcessing(true);
      await submitSymptomReport({ ...symptomForm, patientId: currentUser.id });
      setIsProcessing(false);
      setSymptomForm({ painLocation: '', painLevel: 5, duration: '', description: '', aggravatingFactors: '' });
      setActiveTab('overview');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    if (!assignedPhysio) {
      alert(language === 'ar' ? 'يرجى اختيار معالج أولاً لمشاركة الملفات.' : 'Please select a therapist first to share files.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await uploadFileAsset({
        patientId: currentUser.id,
        name: file.name,
        mimeType: file.type,
        data: base64
      });
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => setIsProcessing(false);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = () => {
    if (currentUser && window.confirm(t('deleteAccountWarning'))) {
      deleteAccount(currentUser.id, UserRole.PATIENT);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {reassignment?.status === 'PENDING' && (
        <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-700 rounded-[2.5rem] p-8 shadow-lg flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <div className="flex-1 text-center md:text-start">
            <h3 className="text-xl font-black text-teal-900 dark:text-teal-100">{t('reassignNotification')}</h3>
            <p className="text-teal-700 dark:text-teal-300 text-sm mt-1 font-medium">Provider transfer request from {physios.find(p => p.id === reassignment.fromPhysioId)?.name}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => handleReassignmentResponse(currentUser!.id, false)} className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">{t('declineTransfer')}</button>
             <button onClick={() => handleReassignmentResponse(currentUser!.id, true)} className="px-6 py-3 rounded-2xl bg-teal-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-teal-700 shadow-md transition-all">{t('agreeToTransfer')}</button>
          </div>
        </div>
      )}

      {reassignment?.status === 'ACCEPTED' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-500">
          <h3 className="text-2xl font-black text-amber-900 dark:text-amber-400 mb-2 uppercase tracking-tighter">{t('pickNewTherapist')}</h3>
          <p className="text-amber-700 dark:text-amber-500 mb-8 font-medium">Select from the available providers below to complete your transfer.</p>
          <button onClick={() => setActiveTab('privacy')} className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-700 transition-all shadow-xl">{t('choosePhysio')}</button>
        </div>
      )}

      {!assignedPhysio && !reassignment && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-[2.5rem] p-8 text-center shadow-sm animate-pulse">
          <h3 className="text-xl font-black text-amber-900 dark:text-amber-400 mb-2 uppercase tracking-tighter">{t('noPhysioSelected')}</h3>
          <p className="text-amber-700 dark:text-amber-500 text-sm mb-6 font-medium">{t('selectProvider')}</p>
          <button onClick={() => setActiveTab('privacy')} className="bg-amber-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md">{t('choosePhysio')}</button>
        </div>
      )}

      <div className="bg-teal-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-[2rem] bg-teal-500 border-4 border-teal-400/50 flex items-center justify-center text-3xl font-black shadow-inner`}>
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">{currentUser?.name}</h2>
            <p className="text-teal-100 mt-2 text-lg font-medium opacity-90">
              {assignedPhysio ? (
                <span 
                  onClick={() => setViewingPhysio(assignedPhysio)} 
                  className="cursor-pointer underline decoration-teal-300/50 underline-offset-8 hover:text-white hover:decoration-white transition-all"
                >
                  {t('myProvider')}: {assignedPhysio.name}
                </span>
              ) : t('noPhysioSelected')}
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={() => setActiveTab('symptoms')} className="flex-1 md:flex-none bg-teal-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border border-teal-400/30 hover:bg-teal-400 transition-all shadow-lg active:scale-95">{t('symptomCheck')}</button>
          <button onClick={() => setActiveTab('booking')} className="flex-1 md:flex-none bg-white text-teal-600 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0" disabled={!assignedPhysio}>{t('bookVisit')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="text-teal-600"><ICONS.Calendar /></div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('bookings')}</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {myAppointments.map(app => (
              <div key={app.id} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div>
                   <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{new Date(app.startTime).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric' })}</p>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${app.status === AppointmentStatus.APPROVED ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>{app.status}</span>
              </div>
            ))}
            {myAppointments.length === 0 && (
              <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic flex flex-col items-center gap-4 opacity-50">
                 <ICONS.Calendar />
                 <p className="text-xs font-black uppercase tracking-widest">{t('noPending')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSymptomCheck = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">{t('howFeeling')}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">{t('shareSymptoms')}</p>
      <form onSubmit={handleSymptomSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">{t('painLocation')}</label>
            <input type="text" required value={symptomForm.painLocation} onChange={e => setSymptomForm({...symptomForm, painLocation: e.target.value})} className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-all" disabled={isProcessing} placeholder="e.g. Lower Back" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">{t('duration')}</label>
            <input type="text" required value={symptomForm.duration} onChange={e => setSymptomForm({...symptomForm, duration: e.target.value})} className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-all" disabled={isProcessing} placeholder="e.g. 2 weeks" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">{t('painLevel')} ({symptomForm.painLevel})</label>
          <input type="range" min="1" max="10" value={symptomForm.painLevel} onChange={e => setSymptomForm({...symptomForm, painLevel: parseInt(e.target.value)})} className="w-full accent-teal-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer h-2" disabled={isProcessing} />
          <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
            <span>Mild</span>
            <span>Severe</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">{t('furtherDesc')}</label>
          <textarea value={symptomForm.description} onChange={e => setSymptomForm({...symptomForm, description: e.target.value})} className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 h-40 shadow-inner transition-all" disabled={isProcessing} />
        </div>
        <button type="submit" disabled={isProcessing} className={`w-full bg-slate-900 dark:bg-teal-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${isProcessing ? 'opacity-70 cursor-wait scale-95' : 'hover:scale-[1.01] active:scale-95'}`}>
          {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {t('submitAssessment')}
        </button>
      </form>
    </div>
  );

  const renderBooking = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 max-w-2xl mx-auto shadow-sm transition-colors duration-200 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">{t('bookSession')}</h2>
      {!assignedPhysio ? (
        <div className="py-12 text-center text-red-500 font-black uppercase tracking-widest text-xs flex flex-col items-center gap-4">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <p>{t('noPhysioSelected')}</p>
        </div>
      ) : (
        <>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">{t('selectSlot')} ({t('myProvider')}: {assignedPhysio.name})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slots.filter(s => !s.isBooked).map(slot => (
              <button
                key={slot.id}
                disabled={isProcessing}
                onClick={() => setSelectedSlot(slot.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${selectedSlot === slot.id ? 'bg-teal-600 border-teal-600 text-white shadow-xl translate-y-[-4px]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 shadow-sm'}`}
              >
                <p className="font-black text-lg tracking-tight">{new Date(slot.startTime).toLocaleDateString()}</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mt-1">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </button>
            ))}
            {slots.filter(s => !s.isBooked).length === 0 && <p className="col-span-2 text-center text-slate-400 py-12 italic text-xs font-black uppercase tracking-widest">No available slots currently.</p>}
          </div>
          {selectedSlot && (
            <div className="mt-10 space-y-4 animate-in fade-in duration-500 slide-in-from-bottom-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('visitReason')}</label>
              <textarea 
                value={bookingReason} 
                disabled={isProcessing}
                onChange={(e) => setBookingReason(e.target.value)} 
                className="w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 shadow-inner" 
                placeholder="Briefly describe why you are visiting..." 
              />
              <button 
                onClick={handleBook} 
                disabled={isProcessing}
                className={`w-full bg-teal-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${isProcessing ? 'opacity-70 cursor-wait scale-95' : 'hover:scale-[1.01] active:scale-95'}`}
              >
                {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('confirmBooking')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('media')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('mediaDesc')}</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-xs"
        >
          {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
          {t('uploadMedia')}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {myMedia.map(file => (
          <div key={file.id} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-xl cursor-pointer" onClick={() => setPreviewMedia(file)}>
            <div className="aspect-square bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
               {file.mimeType.startsWith('image/') ? (
                 <img src={file.data} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               ) : (
                 <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-[10px] uppercase font-black tracking-widest text-teal-600">Video</span>
                 </div>
               )}
            </div>
            <div className="p-5">
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate uppercase tracking-tight">{file.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{new Date(file.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="absolute inset-0 bg-teal-600/0 group-hover:bg-teal-600/10 transition-all flex items-center justify-center pointer-events-none">
               <span className="bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-2xl translate-y-4 group-hover:translate-y-0">{t('preview')}</span>
            </div>
          </div>
        ))}
        {myMedia.length === 0 && (
          <div className="col-span-full py-24 text-center flex flex-col items-center gap-4 text-slate-300 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 transition-all duration-500">
             <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-50">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <p className="font-black uppercase tracking-widest text-xs">{t('noMedia')}</p>
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setPreviewMedia(null)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h4 className="font-black text-slate-900 dark:text-white truncate pr-4 uppercase tracking-tight">{previewMedia.name}</h4>
              <button onClick={() => setPreviewMedia(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" aria-label="Close">
                <ICONS.X />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
               {previewMedia.mimeType.startsWith('image/') ? (
                 <img src={previewMedia.data} className="max-h-full object-contain" alt={previewMedia.name} />
               ) : (
                 <video src={previewMedia.data} controls autoPlay className="max-h-full w-full" />
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">{t('choosePhysio')}</h2>
          <div className="grid gap-6">
             {physios
                .filter(p => p.id !== myProfile?.assignedPhysioId)
                .map(p => (
               <div 
                key={p.id}
                className={`p-6 rounded-[2.5rem] border-2 transition-all text-start flex items-center justify-between group ${myProfile?.assignedPhysioId === p.id ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 shadow-sm'}`}
               >
                 <div className="flex items-center gap-5 cursor-pointer flex-1" onClick={() => setViewingPhysio(p)}>
                   <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-105 transition-transform">
                     {p.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none group-hover:text-teal-600 transition-colors">{p.name}</p>
                     <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">{p.email}</p>
                     <button className="text-[9px] font-black uppercase tracking-widest text-teal-600 mt-3 hover:underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {t('viewProfile')}
                     </button>
                   </div>
                 </div>
                 <button 
                    onClick={() => {
                      if (window.confirm(`${t('physioAssigned')} ${p.name}?`)) {
                        assignPhysio(currentUser!.id, p.id);
                        setActiveTab('overview');
                      }
                    }}
                    className="bg-slate-900 dark:bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    {language === 'ar' ? 'اختيار' : 'Select'}
                  </button>
               </div>
             ))}
             {physios.filter(p => p.id !== myProfile?.assignedPhysioId).length === 0 && (
               <p className="text-center text-slate-400 italic py-8 text-xs font-black uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">No other therapists available yet.</p>
             )}
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 text-center shadow-sm transition-colors duration-200">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{t('privacyAccess')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">{t('dataEncrypted')}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-10 mb-10 border border-slate-100 dark:border-slate-800 shadow-inner">
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t('currentCode')}</p>
             <span className="text-6xl font-mono font-black tracking-[1.5rem] text-slate-900 dark:text-white ml-6" dir="ltr">{showCode ? myProfile?.privacyCode : "••••"}</span>
             <div className="mt-8">
               <button onClick={() => setShowCode(!showCode)} className="text-teal-600 dark:text-teal-400 font-black uppercase tracking-widest text-[10px] hover:underline transition-all">{showCode ? t('privacyNote') : t('viewAll')}</button>
             </div>
          </div>
          <button onClick={() => updatePrivacyCode(currentUser!.id, Math.floor(1000 + Math.random() * 9000).toString())} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95">{t('resetCode')}</button>
       </div>

       {/* Danger Zone: Delete Account */}
       <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-[3rem] p-10 transition-colors duration-200">
          <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {t('dangerZone')}
          </h3>
          <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-8 leading-relaxed font-medium">
            {t('deleteAccountWarning')}
          </p>
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {t('deleteAccount')}
          </button>
       </div>
    </div>
  );

  const renderExercises = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('homeProgram')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myExercises.map((ex, idx) => {
          const isCompleted = completedExerciseIds.has(ex.id);
          return (
            <div key={ex.id || idx} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-2xl transition-all ${isCompleted ? 'opacity-60 grayscale scale-95' : ''}`}>
              <div className="h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden shadow-inner">
                <img src={`https://picsum.photos/400/300?sig=${ex.id || idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={ex.name} />
                <div className="absolute top-4 left-4">
                   <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg text-teal-600">{ex.targetArea}</span>
                </div>
              </div>
              <div className="p-8">
                <h4 className={`text-2xl font-black tracking-tight transition-all ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>{ex.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed font-medium">{ex.description}</p>
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{ex.sets} sets • {ex.reps} reps</p>
                  <button 
                    aria-label="Complete Exercise"
                    onClick={() => {
                      const next = new Set(completedExerciseIds);
                      if (next.has(ex.id)) next.delete(ex.id); else next.add(ex.id);
                      setCompletedExerciseIds(next);
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isCompleted ? 'bg-green-500 text-white' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white hover:scale-110'}`}
                  >
                    <ICONS.Check />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {myExercises.length === 0 && (
          <div className="col-span-full py-32 text-center text-slate-400 dark:text-slate-600 italic bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4 opacity-50">
             <ICONS.Exercise />
             <p className="text-xs font-black uppercase tracking-widest">No exercises assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs}>
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'symptoms' && renderSymptomCheck()}
      {activeTab === 'booking' && renderBooking()}
      {activeTab === 'media' && renderMedia()}
      {activeTab === 'exercises' && renderExercises()}
      {activeTab === 'privacy' && renderPrivacy()}

      {/* Therapist Profile Viewer Modal */}
      {viewingPhysio && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setViewingPhysio(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('therapistInfo')}</h4>
              <button onClick={() => setViewingPhysio(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" aria-label="Close">
                <ICONS.X />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
               <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-28 h-28 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-[2.5rem] flex items-center justify-center text-5xl font-black mb-6 shadow-inner ring-8 ring-teal-50 dark:ring-teal-900/10">
                    {viewingPhysio.name.charAt(0)}
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{viewingPhysio.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{viewingPhysio.email}</p>
               </div>

               <div className="space-y-10">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-3 ml-1">{t('aboutMe')}</h5>
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed italic font-medium shadow-inner">
                      {viewingPhysio.bio || (language === 'ar' ? 'لم تتم إضافة سيرة ذاتية بعد.' : 'No bio added yet.')}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-6 ml-1">{t('socialLinks')}</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingPhysio.socials?.linkedin && (
                        <a href={viewingPhysio.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-500 hover:scale-[1.02] transition-all group shadow-sm">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all font-black text-lg shadow-sm">L</div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{t('linkedIn')}</span>
                        </a>
                      )}
                      {viewingPhysio.socials?.instagram && (
                        <a href={viewingPhysio.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-pink-500 hover:scale-[1.02] transition-all group shadow-sm">
                          <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all font-black text-lg shadow-sm">I</div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-pink-500 transition-colors">{t('instagram')}</span>
                        </a>
                      )}
                      {viewingPhysio.socials?.twitter && (
                        <a href={viewingPhysio.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-sky-500 hover:scale-[1.02] transition-all group shadow-sm">
                          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all font-black text-lg shadow-sm">T</div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-sky-500 transition-colors">{t('twitter')}</span>
                        </a>
                      )}
                      {viewingPhysio.socials?.website && (
                        <a href={viewingPhysio.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-teal-500 hover:scale-[1.02] transition-all group shadow-sm">
                          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all font-black text-lg shadow-sm">W</div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-teal-500 transition-colors">{t('website')}</span>
                        </a>
                      )}
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
               <button 
                  onClick={() => setViewingPhysio(null)}
                  className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:scale-[0.98] transition-transform shadow-xl"
               >
                 {t('close')}
               </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PatientDashboard;
