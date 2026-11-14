import React from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign, Users, Plane } from 'lucide-react';
import { Booking, Invoice, MemberApplication, Aircraft } from '../types';

interface ReportingViewProps {
  bookings: Booking[];
  invoices: Invoice[];
  applications: MemberApplication[];
  fleet: Aircraft[];
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  bookings,
  invoices,
  applications,
  fleet
}) => {
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const syncedBilled = invoices
    .filter(i => i.status === 'synced_to_xero')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const approvedMembers = applications.filter(a => a.status === 'approved').length;
  const pendingMembers = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-600" />
          Club Operations & Financial Reporting
        </h1>
        <p className="text-sm text-slate-500">
          Executive metrics, fleet utilization, and accounting synchronization status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${totalBilled.toFixed(2)} NZD
          </div>
          <span className="text-xs text-emerald-600 font-medium">
            ${syncedBilled.toFixed(2)} synced to Xero
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Flight Bookings</span>
            <div className="p-2.5 bg-sky-50 rounded-xl">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {bookings.length} Flights
          </div>
          <span className="text-xs text-sky-600 font-medium">
            {bookings.filter(b => b.status === 'confirmed').length} scheduled / active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Fleet</span>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {fleet.length} Aircraft
          </div>
          <span className="text-xs text-slate-500 font-medium">
            NZMK Airfield base
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Club Members</span>
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {approvedMembers} Approved
          </div>
          <span className="text-xs text-amber-600 font-medium">
            {pendingMembers} pending applications
          </span>
        </div>
      </div>

      {/* Fleet Utilization Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-600" />
          Fleet Aircraft Status & Utilization
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Aircraft Model</th>
                <th className="px-4 py-3">Hourly Rate</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Squawk Code</th>
                <th className="px-4 py-3">Assigned Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((plane) => {
                const planeBookings = bookings.filter(b => b.aircraftId === plane.id).length;
                return (
                  <tr key={plane.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{plane.registration}</td>
                    <td className="px-4 py-3">{plane.model}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-sky-700">${plane.hourlyRate}/hr</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        plane.status === 'air' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plane.status === 'air' ? 'Airborne' : 'Ground'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{plane.squawk || '1200'}</td>
                    <td className="px-4 py-3 font-mono">{planeBookings}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
