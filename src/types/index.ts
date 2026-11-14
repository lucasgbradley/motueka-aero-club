export type UserRole = 'admin' | 'pilot' | 'student' | 'member';

export interface ClubUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  xeroContactId?: string;
}

export type AircraftStatus = 'air' | 'ground' | 'maintenance';

export interface Aircraft {
  id: string;
  registration: string; // e.g. "ZK-TMC", "ZK-MBX"
  callsign: string;
  model: string; // e.g. "Piper PA-28-181 Archer II", "Cessna 172S"
  hourlyRate: number;
  status: AircraftStatus;
  squawk?: string;
  altitudeFt?: number;
  groundSpeedKnots?: number;
  latitude?: number;
  longitude?: number;
  lastSeen?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  aircraftId: string;
  aircraftReg: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  purpose: 'Dual Training' | 'Solo Training' | 'Private Hire' | 'Maintenance';
  status: BookingStatus;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'draft' | 'synced_to_xero' | 'paid';
  xeroInvoiceId?: string;
  xeroInvoiceNumber?: string;
  createdAt: string;
}

export interface MemberApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  membershipType: 'Full Flying' | 'Student' | 'Associate / Social';
  pilotLicenseNumber?: string;
  medicalExpiry?: string;
  annualFee: number;
  feePaid: boolean;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}
