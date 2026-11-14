import React, { useState } from 'react';
import { Plane, Radio, RefreshCw, Compass, CheckCircle2 } from 'lucide-react';
import { Aircraft } from '../types';
import { syncAircraftWithRadar } from '../services/flightradar';

interface FleetRadarViewProps {
  fleet: Aircraft[];
  onFleetUpdate?: (updated: Aircraft[]) => void;
}

export const FleetRadarView: React.FC<FleetRadarViewProps> = ({ fleet, onFleetUpdate }) => {
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const handleSyncRadar = async (plane: Aircraft) => {
    setPollingId(plane.id);
    try {
      const updated = await syncAircraftWithRadar(plane);
      if (onFleetUpdate) {
        onFleetUpdate(fleet.map(p => p.id === updated.id ? updated : p));
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } finally {
      setPollingId(null);
    }
  };

  const handleSyncAll = async () => {
    setPollingId('all');
    try {
      const updatedList: Aircraft[] = [];
      for (const plane of fleet) {
        const u = await syncAircraftWithRadar(plane);
        updatedList.push(u);
      }
      if (onFleetUpdate) {
        onFleetUpdate(updatedList);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } finally {
      setPollingId(null);
    }
  };

  const airborneCount = fleet.filter(p => p.status === 'air').length;
  const groundCount = fleet.filter(p => p.status === 'ground').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Banners */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-600 animate-pulse" />
            Live Fleet Radar & ADS-B Tracking
          </h1>
          <p className="text-sm text-slate-500">
            Real-time Flightradar24 / ADS-B transponder telemetry for Motueka Aero Club fleet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Updated: {lastRefreshed}
          </span>
          <button
            onClick={handleSyncAll}
            disabled={pollingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${pollingId === 'all' ? 'animate-spin' : ''}`} />
            Poll Flightradar API
          </button>
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Airborne Flights</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{airborneCount} Aircraft</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Plane className="w-6 h-6 text-emerald-600 rotate-45" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Ground (NZMK)</span>
            <div className="text-2xl font-bold text-slate-700 mt-1">{groundCount} Aircraft</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-slate-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Airfield Base</span>
            <div className="text-base font-bold text-slate-800 mt-1">Motueka Airfield (NZMK)</div>
            <span className="text-xs text-slate-400">Elev 40ft • Nelson/Tasman</span>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl">
            <Compass className="w-6 h-6 text-sky-600" />
          </div>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fleet.map((aircraft) => {
          const isAirborne = aircraft.status === 'air';
          const isPolling = pollingId === aircraft.id || pollingId === 'all';

          return (
            <div
              key={aircraft.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                isAirborne ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-slate-900 font-mono">
                      {aircraft.registration}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-semibold">
                      {aircraft.callsign || 'NO CALLSIGN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{aircraft.model}</p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isAirborne
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAirborne ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {isAirborne ? 'IN AIR' : 'ON GROUND'}
                </span>
              </div>

              {/* Transponder & Radar Data */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Squawk Code</span>
                    <div className="text-lg font-mono font-bold text-slate-800">
                      {aircraft.squawk || '1200'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Hourly Rate</span>
                    <div className="text-lg font-mono font-bold text-sky-700">
                      ${aircraft.hourlyRate}/hr
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Baro Altitude</span>
                    <div className="text-sm font-semibold text-slate-700">
                      {isAirborne ? `${aircraft.altitudeFt} ft MSL` : 'Ground (40 ft)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Ground Speed</span>
                    <div className="text-sm font-semibold text-slate-700">
                      {isAirborne ? `${aircraft.groundSpeedKnots} kts` : '0 kts'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-400">
                    Lat: {aircraft.latitude?.toFixed(4)}, Lon: {aircraft.longitude?.toFixed(4)}
                  </span>
                  <button
                    onClick={() => handleSyncRadar(aircraft)}
                    disabled={isPolling}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
                    Poll ADS-B
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
