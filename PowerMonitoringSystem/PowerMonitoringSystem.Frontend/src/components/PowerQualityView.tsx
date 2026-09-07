import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import type { HierarchyNode, PowerQualityData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  selectedNode: HierarchyNode | null;
  token: string;
  theme?: 'light' | 'dark';
  dataMode?: 'demo' | 'live';
}

export const PowerQualityView: React.FC<Props> = ({ selectedNode, token, theme = 'dark', dataMode = 'live' }) => {
  const [data, setData] = useState<PowerQualityData | null>(null);

  const fetchQualityData = async () => {
    try {
      const nodeId = selectedNode?.id || 'p1';
      const res = await fetch(`/api/power-monitoring/quality?nodeId=${nodeId}&mode=${dataMode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch power quality data', e);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, [selectedNode?.id, token, dataMode]);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] text-slate-200">
      
      {/* Sub-header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131C2F] p-3 rounded-lg border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Activity className="mr-2 text-cyan-400" size={18} />
            Power Quality & Harmonics: <span className="ml-2 text-accent font-semibold">{selectedNode?.name || 'Plant A'}</span>
          </h2>
          <p className="text-xs text-slate-400">Harmonic distortion, voltage unbalance, sag & swell disturbance detection</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center border ${
            data?.ieee519Compliance === 'Pass'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          }`}>
            <CheckCircle size={14} className="mr-1.5" />
            IEEE 519: {data?.ieee519Compliance ?? 'Pass'}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-xs text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export PQ Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">THD - Voltage (Avg)</span>
          <div className="text-xl font-bold text-green-400 my-1">{data?.thdVoltageAvg ?? 2.1}%</div>
          <span className="text-[10px] text-slate-500">IEEE Limit: &le; 5.0%</span>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">THD - Current (Avg)</span>
          <div className="text-xl font-bold text-green-400 my-1">{data?.thdCurrentAvg ?? 3.5}%</div>
          <span className="text-[10px] text-slate-500">IEEE Limit: &le; 8.0%</span>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Voltage Unbalance</span>
          <div className="text-xl font-bold text-green-400 my-1">{data?.voltageUnbalancePercent ?? 0.3}%</div>
          <span className="text-[10px] text-slate-500">NEMA Limit: &le; 1.0%</span>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Current Unbalance</span>
          <div className="text-xl font-bold text-green-400 my-1">{data?.currentUnbalancePercent ?? 0.4}%</div>
          <span className="text-[10px] text-slate-500">Normal: &le; 5.0%</span>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Frequency Deviation</span>
          <div className="text-xl font-bold text-slate-100 my-1">+{data?.frequencyDeviationHz ?? 0.01} <span className="text-xs">Hz</span></div>
          <span className="text-[10px] text-slate-500">50.00 Hz Base</span>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Transformer K-Factor</span>
          <div className="text-xl font-bold text-blue-400 my-1">{data?.transformerKFactor ?? 2.4}</div>
          <span className="text-[10px] text-slate-500">Derating Optimal</span>
        </div>
      </div>
      {/* Row 2: Harmonics Spectrum & Phasor Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Harmonics Spectrum Analyzer */}
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4 lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                HARMONICS SPECTRUM ANALYZER (VOLTAGE % OF FUNDAMENTAL)
              </h3>
              <p className="text-[10px] text-slate-400">Dotted line indicates IEEE 519 statutory maximum limit (3.0%)</p>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">Orders: 1st - 25th</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.harmonics || []} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="order" stroke={theme === 'light' ? '#94A3B8' : '#64748B'} tick={{ fontSize: 11 }} />
                <YAxis stroke={theme === 'light' ? '#94A3B8' : '#64748B'} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#1E293B',
                    borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
                    color: theme === 'light' ? '#0f172a' : '#F1F5F9',
                    boxShadow: theme === 'light' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : undefined,
                    fontSize: 12
                  }}
                  formatter={(val: any) => [`${val}%`, 'Harmonic Level']}
                />
                <ReferenceLine y={3.0} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'IEEE 519 Limit (3%)', fill: '#EF4444', fontSize: 10, position: 'top' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3-Phase Vector Phasor & Sequence */}
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4 lg:col-span-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            3-PHASE VECTOR PHASOR
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center py-2">
            {/* Visual Vector Compass */}
            <div className="w-36 h-36 rounded-full border border-slate-700 relative flex items-center justify-center bg-slate-900/40">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              
              {/* R-Phase Vector (0 deg) */}
              <div className="absolute top-1/2 left-1/2 w-14 h-0.5 bg-red-500 origin-left" style={{ transform: 'rotate(0deg)' }}></div>
              <span className="absolute right-1 text-[10px] font-bold text-red-500">VR (0°)</span>

              {/* Y-Phase Vector (240 deg) */}
              <div className="absolute top-1/2 left-1/2 w-14 h-0.5 bg-yellow-400 origin-left" style={{ transform: 'rotate(120deg)' }}></div>
              <span className="absolute bottom-1 left-2 text-[10px] font-bold text-yellow-400">VY (240°)</span>

              {/* B-Phase Vector (120 deg) */}
              <div className="absolute top-1/2 left-1/2 w-14 h-0.5 bg-blue-500 origin-left" style={{ transform: 'rotate(240deg)' }}></div>
              <span className="absolute top-1 left-2 text-[10px] font-bold text-blue-500">VB (120°)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-slate-800">
            <div className="bg-slate-800/40 p-1.5 rounded"><span className="text-red-400 block font-bold">VR</span>239.5 V</div>
            <div className="bg-slate-800/40 p-1.5 rounded"><span className="text-yellow-400 block font-bold">VY</span>240.2 V</div>
            <div className="bg-slate-800/40 p-1.5 rounded"><span className="text-blue-400 block font-bold">VB</span>239.1 V</div>
          </div>
        </div>

      </div>
      {/* Row 3: Sag, Swell, and Disturbance Event Log */}
      <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <AlertTriangle size={15} className="mr-1.5 text-yellow-400" />
              VOLTAGE SAG (DIP) & SWELL DISTURBANCE CAPTURE LOG
            </h3>
            <p className="text-[10px] text-slate-400">Events classified per IEEE 1159 and evaluated against ITIC (CBEMA) ride-through envelopes</p>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            {data?.disturbances?.length ?? 0} Events Detected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-slate-700 bg-slate-800/30">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Phase</th>
                <th className="py-2.5 px-3">Depth / Peak</th>
                <th className="py-2.5 px-3">Voltage</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">ITIC Status</th>
                <th className="py-2.5 px-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!data?.disturbances || data.disturbances.length === 0) ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
                    <div className="font-semibold text-slate-300">No Disturbances Detected</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">All voltage and frequency profiles are within standard nominal limits.</div>
                  </td>
                </tr>
              ) : (
                data.disturbances.map((evt, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-300">{evt.id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.eventType === 'Sag' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        evt.eventType === 'Swell' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {evt.eventType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{evt.phase}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">{evt.magnitudePercent}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{evt.voltage} V</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{evt.durationMs} ms</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{new Date(evt.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      {evt.iticLimitExceeded ? (
                        <span className="text-[10px] text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-800 flex items-center w-max">
                          <ShieldAlert size={12} className="mr-1" /> Exceeded Limit
                        </span>
                      ) : (
                        <span className="text-[10px] text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-800 flex items-center w-max">
                          <CheckCircle size={12} className="mr-1" /> Within Envelope
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold ${
                        evt.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
