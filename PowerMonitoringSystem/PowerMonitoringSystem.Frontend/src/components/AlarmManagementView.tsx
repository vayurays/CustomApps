import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, RefreshCw, CheckCheck } from 'lucide-react';
import type { HierarchyNode, PowerAlarm } from '../types';

interface Props {
  selectedNode: HierarchyNode | null;
  token: string;
  theme?: 'light' | 'dark';
  dataMode?: 'demo' | 'live';
}

export const AlarmManagementView: React.FC<Props> = ({ selectedNode, token, theme: _theme = 'dark', dataMode = 'live' }) => {
  const [alarms, setAlarms] = useState<PowerAlarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const nodeId = selectedNode?.id || 'p1';
      const res = await fetch(`/api/power-monitoring/alarms?nodeId=${nodeId}&status=${filterStatus}&severity=${filterSeverity}&mode=${dataMode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlarms(data);
      }
    } catch (e) {
      console.error('Failed to load alarms', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, [selectedNode?.id, filterSeverity, filterStatus, token, dataMode]);

  const handleAcknowledge = async (id: number) => {
    try {
      const res = await fetch(`/api/power-monitoring/alarms/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ operatorName: 'Operator', comment: 'Acknowledged via Power Monitoring System' })
      });
      if (res.ok) {
        setActionSuccess(`Alarm #${id} acknowledged.`);
        fetchAlarms();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error('Error acknowledging alarm', e);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      const res = await fetch('/api/power-monitoring/alarms/acknowledge-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionSuccess('All active alarms acknowledged.');
        fetchAlarms();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error('Error acknowledging all alarms', e);
    }
  };

  const criticalCount = alarms.filter(a => a.severity.toLowerCase() === 'critical').length;
  const warningCount = alarms.filter(a => a.severity.toLowerCase() === 'warning').length;
  const unackedCount = alarms.filter(a => !a.isAcknowledged).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] text-slate-200">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131C2F] p-3 rounded-lg border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Bell className="mr-2 text-rose-500" size={18} />
            Electrical Alarm Management: <span className="ml-2 text-accent font-semibold">{selectedNode?.name || 'Plant A'}</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time threshold violation alarms, trip alerts, and operator acknowledgment</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center space-x-1.5 bg-accent hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-md shadow-accent/20"
          >
            <CheckCheck size={14} />
            <span>Acknowledge All</span>
          </button>

          <button
            onClick={fetchAlarms}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-xs text-slate-300 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-4 py-2 rounded-lg text-xs flex items-center">
          <CheckCircle size={14} className="mr-2" />
          {actionSuccess}
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3">
          <span className="text-[11px] text-slate-400">Total Visible Alarms</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{alarms.length}</div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3">
          <span className="text-[11px] text-slate-400">Critical Alerts</span>
          <div className="text-2xl font-bold text-red-500 mt-1">{criticalCount}</div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3">
          <span className="text-[11px] text-slate-400">Warnings</span>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{warningCount}</div>
        </div>

        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3">
          <span className="text-[11px] text-slate-400">Unacknowledged</span>
          <div className="text-2xl font-bold text-orange-400 mt-1">{unackedCount}</div>
        </div>
      </div>

      {/* Alarms Table */}
      <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div className="flex space-x-2">
            {['all', 'critical', 'warning'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`text-xs px-2.5 py-1 rounded capitalize ${
                  filterSeverity === s ? 'bg-slate-700 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            {['all', 'active'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-2.5 py-1 rounded capitalize ${
                  filterStatus === st ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 border-b border-slate-700 bg-slate-800/30">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Parameter / Feeder</th>
                <th className="py-2.5 px-3">Message</th>
                <th className="py-2.5 px-3 text-right">Trigger Value</th>
                <th className="py-2.5 px-3 text-right">Limit</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Ack Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
                    <div className="font-semibold text-slate-300">No Alarms Found</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {dataMode === 'live'
                        ? 'No active or historical alarms recorded for configured meters.'
                        : 'No alarms matching the selected filters.'}
                    </div>
                  </td>
                </tr>
              ) : (
                alarms.map((a, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center ${
                      a.severity.toLowerCase() === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {a.severity.toLowerCase() === 'critical' ? (
                        <AlertCircle size={12} className="mr-1" />
                      ) : (
                        <AlertTriangle size={12} className="mr-1" />
                      )}
                      {a.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-200">{a.parameterName}</div>
                    <div className="text-[10px] text-slate-500">{a.nodeName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs">{a.message}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400">
                    {a.triggerValue} {a.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                    {a.thresholdValue ?? '--'} {a.unit}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    {a.isAcknowledged ? (
                      <span className="text-green-400 text-[10px] flex items-center">
                        <CheckCircle size={12} className="mr-1" /> Ack by {a.acknowledgedBy || 'Operator'}
                      </span>
                    ) : (
                      <span className="text-orange-400 text-[10px] font-semibold">Unacknowledged</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {!a.isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(a.id)}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded text-[11px] text-slate-200 transition-colors"
                      >
                        Ack
                      </button>
                    )}
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
