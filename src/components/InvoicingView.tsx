import React, { useState } from 'react';
import { DollarSign, RefreshCw, Plus, CheckCircle, FileText } from 'lucide-react';
import { Invoice, Aircraft } from '../types';
import { createInvoice } from '../firebase/firestore';
import { syncInvoiceToXero, getXeroConfig } from '../services/xero';
import { User } from 'firebase/auth';

interface InvoicingViewProps {
  invoices: Invoice[];
  fleet: Aircraft[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefreshInvoices: () => void;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  invoices,
  fleet,
  currentUser,
  onOpenAuth,
  onRefreshInvoices
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(fleet[0]?.id || '');
  const [flightHours, setFlightHours] = useState('1.5');
  const [landingFee, setLandingFee] = useState('15');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const xeroConfig = getXeroConfig();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const plane = fleet.find(p => p.id === selectedAircraft);
    if (!plane) return;

    setSubmitting(true);
    try {
      const hours = parseFloat(flightHours) || 1;
      const landing = parseFloat(landingFee) || 0;
      const hireCost = hours * plane.hourlyRate;
      const total = hireCost + landing;

      const items = [
        {
          description: `Aircraft Hire: ${plane.registration} (${plane.model}) - ${hours} hrs`,
          quantity: hours,
          unitAmount: plane.hourlyRate,
          totalAmount: hireCost
        }
      ];

      if (landing > 0) {
        items.push({
          description: "NZMK Airfield Landing / Airways Fee",
          quantity: 1,
          unitAmount: landing,
          totalAmount: landing
        });
      }

      await createInvoice({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Club Pilot',
        userEmail: currentUser.email || 'pilot@motuekaaeroclub.com',
        items,
        totalAmount: total,
        status: 'draft',
        createdAt: new Date().toISOString()
      });

      setShowModal(false);
      onRefreshInvoices();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncToXero = async (invoice: Invoice) => {
    setSyncingId(invoice.id);
    try {
      await syncInvoiceToXero(invoice);
      onRefreshInvoices();
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Xero Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-sky-600" />
              Invoicing & Xero Sync
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              Xero Connected
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate flight hire invoices and push directly to {xeroConfig.organisationName}
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuth();
            } else {
              setShowModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No invoices generated yet</p>
            <p className="text-xs text-slate-400 mt-1">Generate an invoice from a flight hire or membership fee.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const isSynced = inv.status === 'synced_to_xero';
              const isSyncing = syncingId === inv.id;

              return (
                <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{inv.userName}</span>
                      <span className="text-xs text-slate-500">({inv.userEmail})</span>
                      {isSynced ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Synced to Xero ({inv.xeroInvoiceNumber})
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                          Draft (Unsynced)
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {inv.items.map((it, idx) => (
                        <p key={idx} className="text-xs text-slate-600">
                          • {it.description} — <span className="font-semibold">${it.totalAmount.toFixed(2)} NZD</span>
                        </p>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Created: {new Date(inv.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <div className="text-xl font-bold font-mono text-slate-900">
                      ${inv.totalAmount.toFixed(2)} NZD
                    </div>

                    {!isSynced && (
                      <button
                        onClick={() => handleSyncToXero(inv)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync to Xero
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Create Flight Invoice</h2>
            <p className="text-xs text-slate-500 mb-4">Calculate Hobbs flight time and sync with Xero</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Aircraft</label>
                <select
                  value={selectedAircraft}
                  onChange={(e) => setSelectedAircraft(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  {fleet.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.registration} — {p.model} (${p.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Flight Hours (Hobbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={flightHours}
                    onChange={(e) => setFlightHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Landing / Airway Fee ($)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={landingFee}
                    onChange={(e) => setLandingFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Estimated Total:</span>
                <span className="font-bold font-mono text-sky-700 text-lg">
                  ${(
                    (parseFloat(flightHours) || 0) * (fleet.find(p => p.id === selectedAircraft)?.hourlyRate || 0) +
                    (parseFloat(landingFee) || 0)
                  ).toFixed(2)} NZD
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium shadow disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
