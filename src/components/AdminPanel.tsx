import React, { useState } from 'react';
import { Shield, Plane, Plus, DollarSign, Users, ExternalLink, CheckCircle } from 'lucide-react';
import { Aircraft, MemberApplication, Invoice } from '../types';
import { updateAircraftRadarData } from '../firebase/firestore';
import { getXeroConfig, saveXeroConfig } from '../services/xero';

interface AdminPanelProps {
  fleet: Aircraft[];
  applications: MemberApplication[];
  invoices: Invoice[];
  onFleetRefresh: () => void;
  onApplicationsRefresh: () => void;
  onInvoicesRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  fleet,
  applications,
  invoices,
  onFleetRefresh,
  onApplicationsRefresh: _onApplicationsRefresh,
  onInvoicesRefresh: _onInvoicesRefresh
}) => {
  const [showAddPlane, setShowAddPlane] = useState(false);
  const [reg, setReg] = useState('');
  const [callsign, setCallsign] = useState('');
  const [model, setModel] = useState('');
  const [rate, setRate] = useState('320');
  const [savingPlane, setSavingPlane] = useState(false);

  const [xeroConfig, setXeroConfig] = useState(getXeroConfig());
  const [savedXero, setSavedXero] = useState(false);

  const handleRateChange = async (plane: Aircraft, newRateStr: string) => {
    const newRate = parseFloat(newRateStr);
    if (isNaN(newRate) || newRate <= 0) return;
    await updateAircraftRadarData(plane.id, { hourlyRate: newRate });
    onFleetRefresh();
  };

  const handleStatusChange = async (plane: Aircraft, newStatus: Aircraft['status']) => {
    await updateAircraftRadarData(plane.id, { status: newStatus });
    onFleetRefresh();
  };

  const handleSaveXero = (e: React.FormEvent) => {
    e.preventDefault();
    saveXeroConfig(xeroConfig);
    setSavedXero(true);
    setTimeout(() => setSavedXero(false), 3000);
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const unsyncedInvoices = invoices.filter(i => i.status !== 'synced_to_xero');

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-600/30 border border-sky-500/40 rounded-xl">
            <Shield className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Motueka Aero Club — Admin Control Center</h1>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Fleet rates, Xero accounting credentials, member approvals, and Firebase backend settings
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fleet Aircraft</span>
            <Plane className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{fleet.length} Aircraft</div>
          <span className="text-xs text-slate-400">Manage rates & maintenance status below</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Applications</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{pendingApps.length} Awaiting Review</div>
          <span className="text-xs text-slate-400">Process under "Member Applications" tab</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Unsynced Invoices</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{unsyncedInvoices.length} Pending</div>
          <span className="text-xs text-slate-400">Ready to sync to Xero Accounting</span>
        </div>
      </div>

      {/* 1. Fleet Aircraft Rate & Status Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-600" />
              Fleet Rates & Operational Status
            </h2>
            <p className="text-xs text-slate-500">Edit hourly wet hire rates and toggle maintenance grounding</p>
          </div>
          <button
            onClick={() => setShowAddPlane(!showAddPlane)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </button>
        </div>

        {showAddPlane && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSavingPlane(true);
              try {
                const newId = reg.toLowerCase().replace(/[^a-z0-9]/g, '');
                await updateAircraftRadarData(newId, {
                  id: newId,
                  registration: reg.toUpperCase(),
                  callsign: callsign.toUpperCase() || reg.toUpperCase(),
                  model: model || 'General Aviation',
                  hourlyRate: parseFloat(rate) || 300,
                  status: 'ground',
                  squawk: '1200',
                  altitudeFt: 0,
                  groundSpeedKnots: 0
                });
                onFleetRefresh();
                setShowAddPlane(false);
                setReg('');
                setCallsign('');
                setModel('');
              } finally {
                setSavingPlane(false);
              }
            }}
            className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Registration (e.g. ZK-ABC)</label>
              <input
                required
                value={reg}
                onChange={e => setReg(e.target.value)}
                placeholder="ZK-..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Callsign (e.g. MOT15)</label>
              <input
                value={callsign}
                onChange={e => setCallsign(e.target.value)}
                placeholder="MOT15"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Model (e.g. Cessna 152)</label>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Cessna 152"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-slate-600 mb-1">Rate ($/hr)</label>
                <input
                  type="number"
                  required
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={savingPlane}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-sm self-end"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Aircraft</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Hourly Rate (NZD)</th>
                <th className="px-4 py-3">Flightradar Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((plane) => (
                <tr key={plane.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {plane.registration}
                    <span className="text-xs text-slate-400 font-normal ml-2">({plane.callsign})</span>
                  </td>
                  <td className="px-4 py-3">{plane.model}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">$</span>
                      <input
                        type="number"
                        defaultValue={plane.hourlyRate}
                        onBlur={(e) => handleRateChange(plane, e.target.value)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded font-mono text-sm focus:border-sky-500"
                      />
                      <span className="text-xs text-slate-400">/hr</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={plane.status}
                      onChange={(e) => handleStatusChange(plane, e.target.value as any)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        plane.status === 'air'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : plane.status === 'maintenance'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="ground">On Ground (NZMK)</option>
                      <option value="air">In Air (Flightradar)</option>
                      <option value="maintenance">Maintenance Grounded</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    Squawk: <strong className="font-mono text-slate-700">{plane.squawk || '1200'}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Xero Accounting Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-sky-600" />
          Xero Accounting Integration Settings
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Connect Motueka Aero Club invoices and membership fee billing directly to your Xero organization
        </p>

        <form onSubmit={handleSaveXero} className="space-y-4 max-w-xl text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Xero Organization Name</label>
            <input
              type="text"
              value={xeroConfig.organisationName}
              onChange={(e) => setXeroConfig({ ...xeroConfig, organisationName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xero Client ID</label>
              <input
                type="text"
                value={xeroConfig.clientId}
                onChange={(e) => setXeroConfig({ ...xeroConfig, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xero Tenant ID</label>
              <input
                type="text"
                value={xeroConfig.tenantId}
                onChange={(e) => setXeroConfig({ ...xeroConfig, tenantId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Update Xero Settings
            </button>
            {savedXero && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                <CheckCircle className="w-4 h-4" /> Settings Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3. Firebase & Domain Whitelist Help */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-sky-600" />
          Firebase Project & Domain Whitelist
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Project ID: <strong className="font-mono text-slate-700">motueka-aero</strong> • Web App ID: <strong className="font-mono text-slate-700">1:193902400352:web:42f52e16da959f52164405</strong>
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <p>
            <strong>If Google Sign-In closes immediately:</strong> Ensure your hosting domain is added to Authorized Domains in Firebase:
          </p>
          <div className="flex items-center gap-3">
            <code className="bg-white px-2.5 py-1 rounded border border-slate-300 font-mono text-slate-800">
              {window.location.hostname}
            </code>
            <a
              href="https://console.firebase.google.com/project/motueka-aero/authentication/settings"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
            >
              Open Firebase Authorized Domains <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
