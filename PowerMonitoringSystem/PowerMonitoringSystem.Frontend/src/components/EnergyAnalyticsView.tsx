import React, { useState, useEffect } from 'react';
import { Zap, Calendar, Download, TrendingUp, DollarSign, CloudRain } from 'lucide-react';
import type { HierarchyNode, EnergyData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  selectedNode: HierarchyNode | null;
  token: string;
  theme?: 'light' | 'dark';
  dataMode?: 'demo' | 'live';
}

export const EnergyAnalyticsView: React.FC<Props> = ({ selectedNode, token, theme = 'dark', dataMode = 'live' }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [data, setData] = useState<EnergyData | null>(null);

  const fetchEnergyData = async () => {
    try {
      const nodeId = selectedNode?.id || 'p1';
      const res = await fetch(`/api/power-monitoring/energy?nodeId=${nodeId}&period=${period}&mode=${dataMode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch energy analytics', e);
    }
  };

  useEffect(() => {
    fetchEnergyData();
  }, [selectedNode?.id, period, token, dataMode]);

  const handleExportCsv = () => {
    if (!data) return;
    const csvRows = [
      ['Label', 'Current Consumption (kWh)', 'Previous Period (kWh)'],
      ...data.trendBars.map(b => [b.label, b.value, b.previousValue])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Energy_${selectedNode?.name || 'Plant'}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] text-slate-200">
      
      {/* Sub-header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131C2F] p-3 rounded-lg border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Zap className="mr-2 text-yellow-400" size={18} />
            Energy Analytics: <span className="ml-2 text-accent font-semibold">{selectedNode?.name || 'Plant A'}</span>
          </h2>
          <p className="text-xs text-slate-400">Consumption tracking, demand profiles, and tariff analytics</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Period Selector Tabs */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex space-x-1 border border-slate-700">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-xs capitalize font-medium transition-all ${
                  period === p ? 'bg-accent text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-xs text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (5 items) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Total Active Energy</span>
            <Zap size={14} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{data?.totalEnergyKwh?.toLocaleString() ?? '--'} <span className="text-xs font-normal text-slate-400">kWh</span></div>
          <div className="text-[10px] text-green-400 mt-1 flex items-center">
            <TrendingUp size={12} className="mr-1" /> +{data?.variancePercent ?? 3.4}% vs previous
          </div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Peak Demand (MDI)</span>
            <Zap size={14} className="text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{data?.peakDemandKw ?? '--'} <span className="text-xs font-normal text-slate-400">kW</span></div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center">
            <Calendar size={12} className="mr-1" /> Today 02:35 PM
          </div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Average Power Factor</span>
            <Zap size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{data?.averagePowerFactor ?? '--'}</div>
          <div className="text-[10px] text-green-400 mt-1">Optimal (Target &gt; 0.95)</div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Estimated Billing Cost</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${data?.estimatedCost?.toLocaleString() ?? '--'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Rate $0.12/kWh</div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Carbon Footprint</span>
            <CloudRain size={14} className="text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{data?.carbonFootprintKg?.toLocaleString() ?? '--'} <span className="text-xs font-normal text-slate-400">kg</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Factor: 0.82 kg CO₂e / kWh</div>
        </div>
      </div>

      {/* Row 2: Trend Chart & TOU Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main Consumption Histogram */}
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4 lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {period.toUpperCase()} CONSUMPTION PROFILE vs PREVIOUS PERIOD
            </h3>
            <span className="text-[10px] text-slate-400">Values in kWh</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trendBars || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke={theme === 'light' ? '#94A3B8' : '#64748B'} tick={{ fontSize: 11 }} />
                <YAxis stroke={theme === 'light' ? '#94A3B8' : '#64748B'} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#1E293B',
                    borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
                    color: theme === 'light' ? '#0f172a' : '#F1F5F9',
                    boxShadow: theme === 'light' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : undefined,
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="value" name="Current Period" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previousValue" name="Previous Period" fill={theme === 'light' ? '#94a3b8' : '#475569'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time-Of-Use Tariff Bands */}
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4 lg:col-span-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            TIME-OF-USE (TOU) TARIFF SPLIT
          </h3>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Peak Hours (06 PM - 10 PM)
                </span>
                <span className="font-bold">{data?.touBreakdown?.peakPercent ?? 38}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${data?.touBreakdown?.peakPercent ?? 38}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{data?.touBreakdown?.peakKwh?.toLocaleString() ?? '--'} kWh @ Peak Tariff</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Normal Hours (06 AM - 06 PM)
                </span>
                <span className="font-bold">{data?.touBreakdown?.normalPercent ?? 45}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data?.touBreakdown?.normalPercent ?? 45}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{data?.touBreakdown?.normalKwh?.toLocaleString() ?? '--'} kWh @ Standard Tariff</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Off-Peak Hours (10 PM - 06 AM)
                </span>
                <span className="font-bold">{data?.touBreakdown?.offPeakPercent ?? 17}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data?.touBreakdown?.offPeakPercent ?? 17}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{data?.touBreakdown?.offPeakKwh?.toLocaleString() ?? '--'} kWh @ Incentive Tariff</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 bg-slate-800/40 p-2 rounded mt-3">
            Tip: Shifting 10% load from Peak to Off-Peak saves estimated ₹ 3,400 monthly.
          </div>
        </div>

      </div>

      {/* Row 3: Sub-Distribution Breakdown Table */}
      <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          SUB-DISTRIBUTION LOAD & FEEDER CONTRIBUTION
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-slate-700 bg-slate-800/30">
              <tr>
                <th className="py-2.5 px-3">Sub-Board / Feeder</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Energy Consumption</th>
                <th className="py-2.5 px-3 text-right">Share (%)</th>
                <th className="py-2.5 px-3">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.subFeeders?.map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">{f.name}</td>
                  <td className="py-2.5 px-3"><span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-400">{f.type}</span></td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-200">{f.energyKwh?.toLocaleString()} kWh</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-accent">{f.percentage}%</td>
                  <td className="py-2.5 px-3">
                    <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, f.percentage)}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
