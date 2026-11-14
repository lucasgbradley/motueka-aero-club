import React from 'react';
import { Plane, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentUser: User | null;
  isAdmin: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSignOut
}) => {
  const tabs = [
    { id: 'radar', label: 'Fleet & Flightradar' },
    { id: 'bookings', label: 'Flight Bookings' },
    { id: 'invoicing', label: 'Invoices & Xero' },
    { id: 'members', label: 'Member Applications' },
    { id: 'reports', label: 'Club Reports' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin Controls' });
  }

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('radar')}>
            <div className="p-2 bg-sky-600 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Motueka Aero Club
                <span className="text-xs bg-sky-800 text-sky-200 px-2 py-0.5 rounded font-mono">NZMK</span>
              </span>
              <p className="text-xs text-slate-400">Operations & Fleet Portal</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const isTabAdmin = tab.id === 'admin';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? isTabAdmin
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-sky-600 text-white shadow'
                      : isTabAdmin
                      ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isTabAdmin && <Shield className="w-4 h-4" />}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    {isAdmin && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">{currentUser.email}</span>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-800 px-2 py-2 gap-1 bg-slate-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
              activeTab === tab.id
                ? tab.id === 'admin' ? 'bg-amber-600 text-white' : 'bg-sky-600 text-white'
                : tab.id === 'admin' ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {tab.id === 'admin' && <Shield className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
