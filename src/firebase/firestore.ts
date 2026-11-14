import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "./config";
import { Aircraft, Booking, Invoice, MemberApplication, ClubUser } from "../types";

// --- Users ---
export async function getUserProfile(uid: string): Promise<ClubUser | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? (userDoc.data() as ClubUser) : null;
}

export async function saveUserProfile(user: ClubUser): Promise<void> {
  await setDoc(doc(db, "users", user.uid), user, { merge: true });
}

// --- Aircraft Fleet ---
const DEFAULT_FLEET: Aircraft[] = [
  {
    id: "zk-tmc",
    registration: "ZK-TMC",
    callsign: "MOT11",
    model: "Piper PA-28-181 Archer II",
    hourlyRate: 310,
    status: "ground",
    squawk: "1200",
    altitudeFt: 0,
    groundSpeedKnots: 0,
    latitude: -41.0975,
    longitude: 173.0116,
    lastSeen: new Date().toISOString()
  },
  {
    id: "zk-mbx",
    registration: "ZK-MBX",
    callsign: "MOT12",
    model: "Cessna 172S Skyhawk SP",
    hourlyRate: 330,
    status: "air",
    squawk: "7000",
    altitudeFt: 2500,
    groundSpeedKnots: 110,
    latitude: -41.1350,
    longitude: 173.0450,
    lastSeen: new Date().toISOString()
  },
  {
    id: "zk-fow",
    registration: "ZK-FOW",
    callsign: "MOT14",
    model: "Tecnam P2008",
    hourlyRate: 245,
    status: "ground",
    squawk: "1200",
    altitudeFt: 0,
    groundSpeedKnots: 0,
    latitude: -41.0975,
    longitude: 173.0116,
    lastSeen: new Date().toISOString()
  }
];

export async function getFleet(): Promise<Aircraft[]> {
  try {
    const snap = await getDocs(collection(db, "aircraft"));
    if (snap.empty) {
      // Seed default club aircraft if empty
      for (const plane of DEFAULT_FLEET) {
        await setDoc(doc(db, "aircraft", plane.id), plane);
      }
      return DEFAULT_FLEET;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Aircraft));
  } catch {
    return DEFAULT_FLEET;
  }
}

export function subscribeToFleet(callback: (fleet: Aircraft[]) => void) {
  return onSnapshot(collection(db, "aircraft"), (snap) => {
    if (!snap.empty) {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Aircraft)));
    } else {
      callback(DEFAULT_FLEET);
    }
  }, () => {
    callback(DEFAULT_FLEET);
  });
}

export async function updateAircraftRadarData(aircraftId: string, updates: Partial<Aircraft>): Promise<void> {
  await updateDoc(doc(db, "aircraft", aircraftId), {
    ...updates,
    lastSeen: new Date().toISOString()
  });
}

// --- Bookings ---
export async function getBookings(): Promise<Booking[]> {
  try {
    const q = query(collection(db, "bookings"), orderBy("startTime", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
  } catch {
    return [];
  }
}

export function subscribeToBookings(callback: (bookings: Booking[]) => void) {
  const q = query(collection(db, "bookings"), orderBy("startTime", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
  }, () => {
    callback([]);
  });
}

export async function createBooking(booking: Omit<Booking, "id">): Promise<string> {
  const ref = doc(collection(db, "bookings"));
  await setDoc(ref, { ...booking, id: ref.id });
  return ref.id;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), { status: "cancelled" });
}

// --- Invoices ---
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
  } catch {
    return [];
  }
}

export async function createInvoice(invoice: Omit<Invoice, "id">): Promise<string> {
  const ref = doc(collection(db, "invoices"));
  await setDoc(ref, { ...invoice, id: ref.id });
  return ref.id;
}

export async function markInvoiceSynced(invoiceId: string, xeroId: string, invoiceNum: string): Promise<void> {
  await updateDoc(doc(db, "invoices", invoiceId), {
    status: "synced_to_xero",
    xeroInvoiceId: xeroId,
    xeroInvoiceNumber: invoiceNum
  });
}

// --- Membership Applications ---
export async function getMembershipApplications(): Promise<MemberApplication[]> {
  try {
    const q = query(collection(db, "membershipApplications"), orderBy("appliedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MemberApplication));
  } catch {
    return [];
  }
}

export async function createMembershipApplication(app: Omit<MemberApplication, "id">): Promise<string> {
  const ref = doc(collection(db, "membershipApplications"));
  await setDoc(ref, { ...app, id: ref.id });
  return ref.id;
}

export async function updateApplicationStatus(id: string, status: 'approved' | 'rejected', feePaid: boolean): Promise<void> {
  await updateDoc(doc(db, "membershipApplications", id), {
    status,
    feePaid
  });
}
