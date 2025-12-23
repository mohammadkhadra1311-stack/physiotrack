
import React from 'react';
import { UserRole } from './types';

export const ICONS = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Exercise: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 8 22 12 18 16"></polyline><polyline points="6 8 2 12 6 16"></polyline><line x1="2" y1="12" x2="22" y2="12"></line></svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Msk: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
  )
};

export const MOCK_EXERCISES = [
  { id: '1', name: 'Quadriceps Stretch', targetArea: 'Lower Body', description: 'Stand on one leg, pull your other heel toward your buttock.', reps: '10', sets: '3', frequency: 'Daily' },
  { id: '2', name: 'Shoulder External Rotation', targetArea: 'Shoulder', description: 'Hold a resistance band with both hands, elbows at 90 degrees.', reps: '15', sets: '2', frequency: 'Twice daily' },
  { id: '3', name: 'Hamstring Bridge', targetArea: 'Core/Legs', description: 'Lie on your back, knees bent, lift hips off the floor.', reps: '12', sets: '3', frequency: 'Daily' },
];

export interface MSKContent {
  id: string;
  type: 'FACT' | 'JOKE' | 'QUIZ' | 'GREETING';
  role: UserRole | 'BOTH';
  lang: 'en' | 'ar';
  text: string;
  options?: string[];
  answer?: number;
  explanation?: string;
}

export const MSK_CONTENT_POOL: MSKContent[] = [
  // --- ENGLISH CONTENT ---
  { id: 'en-t1', type: 'QUIZ', role: UserRole.PHYSIO, lang: 'en', text: 'Which muscle is primarily responsible for hip abduction?', options: ['Gluteus Maximus', 'Gluteus Medius', 'Adductor Longus', 'Iliopsoas'], answer: 1, explanation: 'The gluteus medius is the primary abductor of the hip, essential for pelvic stability during walking.' },
  { id: 'en-t2', type: 'FACT', role: UserRole.PHYSIO, lang: 'en', text: 'Clinical Pearl: The "Screw Home" mechanism involves external rotation of the tibia on the femur during knee extension.' },
  { id: 'en-t3', type: 'JOKE', role: UserRole.PHYSIO, lang: 'en', text: 'Why did the skeleton go to the party? He heard it was a hip joint.' },
  { id: 'en-p1', type: 'FACT', role: UserRole.PATIENT, lang: 'en', text: 'Did you know? Walking just 30 minutes a day significantly reduces lower back pain risk.' },
  { id: 'en-p2', type: 'JOKE', role: UserRole.PATIENT, lang: 'en', text: 'My physiotherapist told me I have a great posture. I told him it was just because I was trying to look taller.' },
  { id: 'en-p3', type: 'QUIZ', role: UserRole.PATIENT, lang: 'en', text: 'True or False: Pain is always a sign of tissue damage.', options: ['True', 'False'], answer: 1, explanation: 'False! Pain is a complex alarm system. Sometimes the alarm stays on even after the danger has passed.' },
  { id: 'en-b1', type: 'FACT', role: 'BOTH', lang: 'en', text: 'The human body has over 600 muscles!' },

  // --- ARABIC CONTENT ---
  { id: 'ar-t1', type: 'QUIZ', role: UserRole.PHYSIO, lang: 'ar', text: 'أي عضلة هي المسؤولة بشكل أساسي عن إبعاد الورك؟', options: ['الألوية الكبرى', 'الألوية الوسطى', 'المقربة الطويلة', 'الحرقفية الخصرية'], answer: 1, explanation: 'العضلة الألوية الوسطى هي المبعد الأساسي للورك، وهي ضرورية لاستقرار الحوض أثناء المشي.' },
  { id: 'ar-t2', type: 'FACT', role: UserRole.PHYSIO, lang: 'ar', text: 'حقيقة سريرية: تتضمن آلية "Screw Home" دورانًا خارجيًا للظنبوب على الفخذ أثناء مد الركبة.' },
  { id: 'ar-t3', type: 'JOKE', role: UserRole.PHYSIO, lang: 'ar', text: 'لماذا ذهب الهيكل العظمي إلى الحفلة؟ لأنه سمع أنها حفلة "مفصلية" (Hip Joint).' },
  { id: 'ar-p1', type: 'FACT', role: UserRole.PATIENT, lang: 'ar', text: 'هل تعلم؟ المشي لمدة 30 دقيقة فقط يومياً يقلل بشكل كبير من خطر آلام أسفل الظهر.' },
  { id: 'ar-p2', type: 'JOKE', role: UserRole.PATIENT, lang: 'ar', text: 'أخبرني المعالج أن قوامي ممتاز. قلت له هذا فقط لأنني أحاول أن أبدو أطول قامة.' },
  { id: 'ar-p3', type: 'QUIZ', role: UserRole.PATIENT, lang: 'ar', text: 'صح أم خطأ: الألم دائماً دليل على تلف في الأنسجة.', options: ['صح', 'خطأ'], answer: 1, explanation: 'خطأ! الألم هو نظام إنذار معقد. أحياناً يستمر الإنذار حتى بعد زوال الخطر.' },
  { id: 'ar-b1', type: 'FACT', role: 'BOTH', lang: 'ar', text: 'جسم الإنسان يحتوي على أكثر من 600 عضلة!' },
  { id: 'ar-b2', type: 'FACT', role: 'BOTH', lang: 'ar', text: 'العظام تتجدد باستمرار. تحصل على هيكل عظمي جديد بالكامل كل 10 سنوات تقريباً.' }
];
