import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState, signOutUser, checkIsAdmin } from './firebase/auth';
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
import { AdminPanel } from './components/AdminPanel';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');

  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [applications, setApplications] = useState<MemberApplication[]>([]);

  // Calculate admin privilege: true if logged-in email is admin, or if demo admin
  const isAdmin = Boolean(currentUser && (checkIsAdmin(currentUser.email) || (currentUser as any).isDemoAdmin));

  useEffect(() => {
    // 1. Subscribe to Firebase Authentication state
    const unsubscribeAuth = subscribeToAuthState((user) => {
      if (user) {
        setCurrentUser(user);
      }
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

  const refreshFleet = async () => {
    // Re-trigger snapshot / fleet state
    setFleet([...fleet]);
  };

  const refreshInvoices = async () => {
    const data = await getInvoices();
    setInvoices(data);
  };

  const refreshApplications = async () => {
    const data = await getMembershipApplications();
    setApplications(data);
  };

  const handleDemoAdminLogin = () => {
    const mockUser: any = {
      uid: 'motueka-admin-01',
      email: 'it@motuekaaeroclub.com',
      displayName: 'Lucas Bradley (Admin)',
      isDemoAdmin: true
    };
    setCurrentUser(mockUser);
    setActiveTab('admin');
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('radar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar with Motueka Aero branding & Auth */}
      <Navbar
        currentUser={currentUser}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
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

        {activeTab === 'admin' && (
          <AdminPanel
            fleet={fleet}
            applications={applications}
            invoices={invoices}
            onFleetRefresh={refreshFleet}
            onApplicationsRefresh={refreshApplications}
            onInvoicesRefresh={refreshInvoices}
          />
        )}
      </main>

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onDemoAdminLogin={handleDemoAdminLogin}
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
