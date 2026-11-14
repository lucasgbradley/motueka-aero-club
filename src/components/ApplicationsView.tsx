import React, { useState } from 'react';
import { Users, Plus, Check, X, CheckCircle2 } from 'lucide-react';
import { MemberApplication } from '../types';
import { createMembershipApplication, updateApplicationStatus, createInvoice } from '../firebase/firestore';
import { syncInvoiceToXero } from '../services/xero';
import { User } from 'firebase/auth';

interface ApplicationsViewProps {
  applications: MemberApplication[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefreshApplications: () => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  currentUser: _currentUser,
  onOpenAuth: _onOpenAuth,
  onRefreshApplications
}) => {
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipType, setMembershipType] = useState<MemberApplication['membershipType']>('Full Flying');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getFee = (type: MemberApplication['membershipType']) => {
    switch (type) {
      case 'Full Flying': return 320;
      case 'Student': return 180;
      case 'Associate / Social': return 65;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createMembershipApplication({
        fullName,
        email,
        phone,
        membershipType,
        pilotLicenseNumber: licenseNumber || undefined,
        annualFee: getFee(membershipType),
        feePaid: false,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });

      setShowModal(false);
      onRefreshApplications();
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setLicenseNumber('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (app: MemberApplication) => {
    try {
      await updateApplicationStatus(app.id, 'approved', true);

      // Create membership fee invoice & sync to Xero
      const invId = await createInvoice({
        userId: app.id,
        userName: app.fullName,
        userEmail: app.email,
        items: [
          {
            description: `Motueka Aero Club Annual Membership Fee (${app.membershipType})`,
            quantity: 1,
            unitAmount: app.annualFee,
            totalAmount: app.annualFee
          }
        ],
        totalAmount: app.annualFee,
        status: 'draft',
        createdAt: new Date().toISOString()
      });

      await syncInvoiceToXero({
        id: invId,
        userId: app.id,
        userName: app.fullName,
        userEmail: app.email,
        items: [],
        totalAmount: app.annualFee,
        status: 'draft',
        createdAt: new Date().toISOString()
      });

      onRefreshApplications();
    } catch (err: any) {
      alert(err.message || 'Error approving application');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Member Applications & Fees
          </h1>
          <p className="text-sm text-slate-500">
            Process new pilot memberships, subscriptions, and automatic Xero fee invoicing
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Apply for Membership
        </button>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No member applications submitted yet</p>
            <p className="text-xs text-slate-400 mt-1">Submit an application to enroll a new pilot or social member.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{app.fullName}</span>
                    <span className="text-xs bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded">
                      {app.membershipType}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span>Email: {app.email}</span>
                    <span>Phone: {app.phone}</span>
                    {app.pilotLicenseNumber && <span>CAA License: {app.pilotLicenseNumber}</span>}
                    <span>Annual Fee: <strong className="text-slate-800">${app.annualFee} NZD</strong></span>
                    {app.feePaid && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fee Paid & Invoiced
                      </span>
                    )}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(app)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Bill via Xero
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'rejected', false).then(onRefreshApplications)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Motueka Aero Club Membership Application</h2>
            <p className="text-xs text-slate-500 mb-4">Join our vibrant aviation community</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Captain Jean Batten"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pilot@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+64 21 000 0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Membership Category</label>
                <select
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Full Flying">Full Flying Member ($320 / year)</option>
                  <option value="Student">Student Pilot Member ($180 / year)</option>
                  <option value="Associate / Social">Associate / Social Member ($65 / year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CAA License Number (Optional for students)</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. PPL 12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
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
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
