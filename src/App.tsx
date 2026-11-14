import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState, signOutUser } from './firebase/auth';
import {
  subscribeToFleet,
  subscribeToBookings,
  getInvoices,
  getMembershipApplications
} from './firebase/firestore';
import { Aircraft, Booking, Invoice, MemberApplication } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { FleetRadarView } from './components/FleetRadarView';
import { BookingsView } from './components/BookingsView';
import { InvoicingView } from './components/InvoicingView';
import { ApplicationsView } from './components/ApplicationsView';
import { ReportingView } from './components/ReportingView';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');

  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [applications, setApplications] = useState<MemberApplication[]>([]);

  useEffect(() => {
    // 1. Subscribe to Firebase Authentication state
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });

    // 2. Subscribe to Firestore Fleet collection
    const unsubscribeFleet = subscribeToFleet((data) => {
      setFleet(data);
    });

    // 3. Subscribe to Firestore Bookings collection
    const unsubscribeBookings = subscribeToBookings((data) => {
      setBookings(data);
    });

    // 4. Initial load of Invoices & Applications
    refreshInvoices();
    refreshApplications();

    return () => {
      unsubscribeAuth();
      unsubscribeFleet();
      unsubscribeBookings();
    };
  }, []);

  const refreshInvoices = async () => {
    const data = await getInvoices();
    setInvoices(data);
  };

  const refreshApplications = async () => {
    const data = await getMembershipApplications();
    setApplications(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar with Motueka Aero branding & Auth */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={signOutUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'radar' && (
          <FleetRadarView fleet={fleet} onFleetUpdate={setFleet} />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
            fleet={fleet}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefreshBookings={() => {}}
          />
        )}

        {activeTab === 'invoicing' && (
          <InvoicingView
            invoices={invoices}
            fleet={fleet}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefreshInvoices={refreshInvoices}
          />
        )}

        {activeTab === 'members' && (
          <ApplicationsView
            applications={applications}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefreshApplications={refreshApplications}
          />
        )}

        {activeTab === 'reports' && (
          <ReportingView
            bookings={bookings}
            invoices={invoices}
            applications={applications}
            fleet={fleet}
          />
        )}
      </main>

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Motueka Aero Club Inc. Powered by Firebase (motueka-aero) & Xero Accounting.</p>
          <p className="mt-1 text-slate-400">Motueka Airfield (NZMK) • Tasman District, New Zealand</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
