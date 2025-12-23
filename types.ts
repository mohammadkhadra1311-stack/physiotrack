
export enum UserRole {
  PHYSIO = 'PHYSIO',
  PATIENT = 'PATIENT'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  socials?: SocialLinks;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetArea: string;
  mediaUrl?: string;
  reps?: string;
  sets?: string;
  frequency?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  exercises: Exercise[];
  notes: string;
  createdAt: number;
}

export interface Slot {
  id: string;
  startTime: number;
  endTime: number;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  physioId: string;
  slotId: string;
  startTime: number;
  endTime: number;
  status: AppointmentStatus;
  reason?: string;
}

export interface ReassignmentRequest {
  fromPhysioId: string;
  status: 'PENDING' | 'ACCEPTED';
}

export interface FileAsset {
  id: string;
  patientId: string;
  name: string;
  mimeType: string;
  data: string; // Base64 or Blob URL
  timestamp: number;
}

export interface PatientRecord {
  id: string;
  name: string;
  email: string;
  currentPlanId?: string;
  status: 'active' | 'completed' | 'on-hold';
  privacyCode: string; // 4-digit numeric code
  assignedPhysioId?: string; // Links patient to a specific therapist
  reassignmentRequest?: ReassignmentRequest;
}

export interface SymptomReport {
  id: string;
  patientId: string;
  timestamp: number;
  painLocation: string;
  painLevel: number; // 1-10
  duration: string;
  description: string;
  aggravatingFactors: string;
}
