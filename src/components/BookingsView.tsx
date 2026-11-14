import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { Booking, Aircraft } from '../types';
import { createBooking, cancelBooking } from '../firebase/firestore';
import { User } from 'firebase/auth';

interface BookingsViewProps {
  bookings: Booking[];
  fleet: Aircraft[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefreshBookings: () => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  fleet,
  currentUser,
  onOpenAuth,
  onRefreshBookings
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(fleet[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState<Booking['purpose']>('Dual Training');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const plane = fleet.find(p => p.id === selectedAircraft);
    if (!plane) return;

    setSubmitting(true);
    setError(null);

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(`${date}T${endTime}:00`).toISOString();

      await createBooking({
        userId: currentUser.uid,
        userEmail: currentUser.email || 'pilot@motuekaaeroclub.com',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Club Pilot',
        aircraftId: plane.id,
        aircraftReg: plane.registration,
        startTime: startIso,
        endTime: endIso,
        purpose,
        status: 'confirmed',
        notes
      });

      setShowModal(false);
      onRefreshBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this flight booking?')) return;
    try {
      await cancelBooking(id);
      onRefreshBookings();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            Aircraft Bookings & Schedule
          </h1>
          <p className="text-sm text-slate-500">
            Book club aircraft for private hire, dual instruction, or solo flights
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
          New Flight Booking
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No scheduled bookings yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Flight Booking" to schedule an aircraft flight.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);

              return (
                <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-sky-50 rounded-xl text-sky-700 font-mono font-bold text-sm shrink-0">
                      {b.aircraftReg}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{b.userName}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {b.purpose}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {b.notes && <p className="text-xs text-slate-600 mt-1 italic">"{b.notes}"</p>}
                    </div>
                  </div>

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors self-start sm:self-auto flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Book an Aircraft</h2>
            <p className="text-xs text-slate-500 mb-4">Motueka Aero Club fleet scheduling</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {error}
              </div>
            )}

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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Flight Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Dual Training">Dual Training (With Instructor)</option>
                  <option value="Solo Training">Solo Training</option>
                  <option value="Private Hire">Private Hire / Cross-Country</option>
                  <option value="Maintenance">Maintenance Test Flight</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Route</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Local circuit practice or flight to Takaka"
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
                  {submitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
