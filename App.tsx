
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  User, 
  UserRole, 
  Appointment, 
  Slot, 
  Exercise, 
  TreatmentPlan, 
  AppointmentStatus,
  PatientRecord,
  SymptomReport,
  FileAsset,
  SocialLinks
} from './types';
import { MOCK_EXERCISES } from './constants';
import { translations } from './translations';
import PhysioDashboard from './views/PhysioDashboard';
import PatientDashboard from './views/PatientDashboard';
import Login from './views/Login';
import MSKCharacter from './components/MSKCharacter';

// --- Context ---
interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  t: (key: keyof typeof translations.en) => string;
  appointments: Appointment[];
  slots: Slot[];
  exercises: Exercise[];
  patients: PatientRecord[];
  physios: User[];
  plans: TreatmentPlan[];
  symptomReports: SymptomReport[];
  fileAssets: FileAsset[];
  isMSKEnabled: boolean;
  setIsMSKEnabled: (val: boolean) => void;
  bookSlot: (slotId: string, patientId: string, reason: string, physioId: string) => Promise<boolean>;
  updateAppointmentStatus: (appId: string, status: AppointmentStatus) => Promise<void>;
  createSlot: (startTime: number, duration: number) => void;
  assignPlan: (patientId: string, plan: TreatmentPlan) => void;
  deletePatient: (patientId: string) => void;
  submitSymptomReport: (report: Omit<SymptomReport, 'id' | 'timestamp'>) => Promise<void>;
  uploadFileAsset: (asset: Omit<FileAsset, 'id' | 'timestamp'>) => Promise<void>;
  updatePrivacyCode: (patientId: string, newCode: string) => void;
  assignPhysio: (patientId: string, physioId: string) => void;
  requestReassignment: (patientId: string, fromPhysioId: string) => void;
  handleReassignmentResponse: (patientId: string, accepted: boolean) => void;
  updatePhysioProfile: (physioId: string, bio: string, socials: SocialLinks) => void;
  deleteAccount: (userId: string, role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// Helper for persistence
const usePersistedState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = usePersistedState<User | null>('pt_user', null);
  const [language, setLanguage] = usePersistedState<'en' | 'ar'>('pt_lang', 'en');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [isMSKEnabled, setIsMSKEnabled] = usePersistedState<boolean>('pt_msk', true);
  
  // Persistence for clinical and app data
  const [appointments, setAppointments] = usePersistedState<Appointment[]>('pt_apps', []);
  const [slots, setSlots] = usePersistedState<Slot[]>('pt_slots', []);
  const [physios, setPhysios] = usePersistedState<User[]>('pt_physios', []);
  const [patients, setPatients] = usePersistedState<PatientRecord[]>('pt_patients', []);
  const [plans, setPlans] = usePersistedState<TreatmentPlan[]>('pt_plans', []);
  const [symptomReports, setSymptomReports] = usePersistedState<SymptomReport[]>('pt_reports', []);
  const [fileAssets, setFileAssets] = usePersistedState<FileAsset[]>('pt_files', []);
  const [exercises] = useState<Exercise[]>(MOCK_EXERCISES);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Ensure current user is tracked in registries
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.PATIENT) {
        setPatients(prev => {
          if (prev.some(p => p.id === currentUser.id)) return prev;
          return [...prev, {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            status: 'active',
            privacyCode: Math.floor(1000 + Math.random() * 9000).toString()
          }];
        });
      } else if (currentUser.role === UserRole.PHYSIO) {
        setPhysios(prev => {
          if (prev.some(p => p.id === currentUser.id)) return prev;
          return [...prev, currentUser];
        });
      }
    }
  }, [currentUser, setPatients, setPhysios]);

  // Initial Slots Generation if empty
  useEffect(() => {
    if (slots.length === 0) {
      const today = new Date();
      today.setHours(9, 0, 0, 0);
      const initialSlots: Slot[] = [];
      for (let i = 0; i < 8; i++) {
        const start = today.getTime() + (i * 3600000);
        initialSlots.push({
          id: `slot-${i}`,
          startTime: start,
          endTime: start + 3600000,
          isBooked: false
        });
      }
      setSlots(initialSlots);
    }
  }, [slots.length, setSlots]);

  const bookSlot = async (slotId: string, patientId: string, reason: string, physioId: string) => {
    await new Promise(r => setTimeout(r, 800));
    let success = false;
    setSlots(currentSlots => {
      const slotIndex = currentSlots.findIndex(s => s.id === slotId);
      if (slotIndex !== -1 && !currentSlots[slotIndex].isBooked) {
        success = true;
        const newSlots = [...currentSlots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], isBooked: true };
        
        const newApp: Appointment = {
          id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          patientId,
          physioId,
          slotId,
          startTime: newSlots[slotIndex].startTime,
          endTime: newSlots[slotIndex].endTime,
          status: AppointmentStatus.PENDING,
          reason
        };
        
        setAppointments(prev => [...prev, newApp]);
        return newSlots;
      }
      return currentSlots;
    });
    return success;
  };

  const updateAppointmentStatus = async (appId: string, status: AppointmentStatus) => {
    await new Promise(r => setTimeout(r, 400));
    setAppointments(prev => {
      const app = prev.find(a => a.id === appId);
      if (!app) return prev;
      const updated = prev.map(a => a.id === appId ? { ...a, status } : a);
      if (status === AppointmentStatus.REJECTED || status === AppointmentStatus.CANCELLED) {
        setSlots(currentSlots => currentSlots.map(s => s.id === app.slotId ? { ...s, isBooked: false } : s));
      }
      return updated;
    });
  };

  const createSlot = (startTime: number, durationMinutes: number) => {
    const newSlot: Slot = {
      id: `slot-${Date.now()}`,
      startTime,
      endTime: startTime + (durationMinutes * 60000),
      isBooked: false
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const assignPlan = (patientId: string, plan: TreatmentPlan) => {
    setPlans(prev => [...prev, plan]);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, currentPlanId: plan.id } : p));
  };

  const deletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setAppointments(prev => prev.filter(a => a.patientId !== patientId));
    setPlans(prev => prev.filter(p => p.patientId !== patientId));
    setSymptomReports(prev => prev.filter(r => r.patientId !== patientId));
    setFileAssets(prev => prev.filter(f => f.patientId !== patientId));
  };

  const submitSymptomReport = async (reportData: Omit<SymptomReport, 'id' | 'timestamp'>) => {
    await new Promise(r => setTimeout(r, 500));
    const newReport: SymptomReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      timestamp: Date.now()
    };
    setSymptomReports(prev => [newReport, ...prev]);
  };

  const uploadFileAsset = async (assetData: Omit<FileAsset, 'id' | 'timestamp'>) => {
    await new Promise(r => setTimeout(r, 800));
    const newAsset: FileAsset = {
      ...assetData,
      id: `file-${Date.now()}`,
      timestamp: Date.now()
    };
    setFileAssets(prev => [newAsset, ...prev]);
  };

  const updatePrivacyCode = (patientId: string, newCode: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, privacyCode: newCode } : p));
  };

  const assignPhysio = (patientId: string, physioId: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedPhysioId: physioId, reassignmentRequest: undefined } : p));
  };

  const requestReassignment = (patientId: string, fromPhysioId: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, reassignmentRequest: { fromPhysioId, status: 'PENDING' } } : p));
  };

  const handleReassignmentResponse = (patientId: string, accepted: boolean) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      if (accepted) {
        return { ...p, reassignmentRequest: { ...p.reassignmentRequest!, status: 'ACCEPTED' } };
      } else {
        return { ...p, reassignmentRequest: undefined };
      }
    }));
  };

  const updatePhysioProfile = (physioId: string, bio: string, socials: SocialLinks) => {
    setPhysios(prev => prev.map(p => p.id === physioId ? { ...p, bio, socials } : p));
    if (currentUser?.id === physioId) {
      setCurrentUser(prev => prev ? { ...prev, bio, socials } : null);
    }
  };

  const deleteAccount = (userId: string, role: UserRole) => {
    if (role === UserRole.PATIENT) {
      deletePatient(userId);
    } else {
      setPhysios(prev => prev.filter(p => p.id !== userId));
      setAppointments(prev => prev.filter(a => a.physioId !== userId));
      setPatients(prev => prev.map(p => p.assignedPhysioId === userId ? { ...p, assignedPhysioId: undefined } : p));
    }
    logout();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pt_user');
  };

  const contextValue: AppContextType = {
    currentUser,
    setCurrentUser,
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    t,
    appointments,
    slots,
    exercises,
    patients,
    physios,
    plans,
    symptomReports,
    fileAssets,
    isMSKEnabled,
    setIsMSKEnabled,
    bookSlot,
    updateAppointmentStatus,
    createSlot,
    assignPlan,
    deletePatient,
    submitSymptomReport,
    uploadFileAsset,
    updatePrivacyCode,
    assignPhysio,
    requestReassignment,
    handleReassignmentResponse,
    updatePhysioProfile,
    deleteAccount,
    logout
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {!currentUser ? (
          <Login />
        ) : currentUser.role === UserRole.PHYSIO ? (
          <PhysioDashboard />
        ) : (
          <PatientDashboard />
        )}
        <MSKCharacter />
      </div>
    </AppContext.Provider>
  );
};

export default App;
