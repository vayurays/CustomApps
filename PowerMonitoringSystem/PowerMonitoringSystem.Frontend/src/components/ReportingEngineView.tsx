import React, { useState, useEffect } from 'react';
import { FileText, Download, Play, Calendar, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react';
import type { HierarchyNode, ReportTemplate, ReportResult } from '../types';

interface Props {
  selectedNode: HierarchyNode | null;
  token: string;
  theme?: 'light' | 'dark';
  dataMode?: 'demo' | 'live';
}

export const ReportingEngineView: React.FC<Props> = ({ selectedNode, token, theme: _theme = 'dark', dataMode = 'live' }) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('energy-consumption');
  const [dateRange, setDateRange] = useState<string>('7days');
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/power-monitoring/reports/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch (e) {
        console.error('Failed to load report templates', e);
      }
    };
    fetchTemplates();
  }, [token]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/power-monitoring/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          nodeId: selectedNode?.id || 'p1',
          format: 'json',
          mode: dataMode
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReportResult(data);
      }
    } catch (e) {
      console.error('Error generating report', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/power-monitoring/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          nodeId: selectedNode?.id || 'p1',
          format: 'csv',
          mode: dataMode
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${selectedTemplate}_${selectedNode?.name || 'Plant'}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error('Error downloading report', e);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] text-slate-200">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131C2F] p-3 rounded-lg border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <FileText className="mr-2 text-indigo-400" size={18} />
            Automated Reporting Engine: <span className="ml-2 text-accent font-semibold">{selectedNode?.name || 'Plant A'}</span>
          </h2>
          <p className="text-xs text-slate-400">Generate compliance, billing, load factor, and harmonics audit reports</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerate}
            className="flex items-center space-x-1.5 bg-accent hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-md shadow-accent/20"
          >
            <Play size={14} className={loading ? 'animate-spin' : ''} />
            <span>Generate Preview</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-xs text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export File</span>
          </button>
        </div>
      </div>

      {/* Row 1: Templates Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map(tpl => {
          const isSelected = selectedTemplate === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-accent/15 border-accent shadow-md shadow-accent/20'
                  : 'bg-[#151D2C] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded bg-slate-800 text-accent">
                  {tpl.id.includes('energy') ? <BarChart3 size={16} /> :
                   tpl.id.includes('quality') ? <ShieldCheck size={16} /> :
                   <FileText size={16} />}
                </div>
                {isSelected && <CheckCircle size={16} className="text-accent" />}
              </div>
              <h3 className="text-xs font-bold text-slate-100 mb-1">{tpl.name}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
            </div>
          );
        })}
      </div>

      {/* Row 2: Options Bar */}
      <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-slate-400">Date Range:</span>
          {['today', '7days', '30days', 'month'].map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-2.5 py-1 rounded text-xs capitalize ${
                dateRange === r ? 'bg-slate-700 text-white font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400">
          Target Scope: <span className="font-semibold text-slate-200">{selectedNode?.name || 'Plant A'} ({selectedNode?.type || 'Plant'})</span>
        </div>
      </div>

      {/* Row 3: Report Preview Display */}
      {reportResult && (
        <div className="bg-[#151D2C] rounded-lg border border-slate-800 p-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{reportResult.title}</h3>
              <p className="text-[11px] text-slate-400">Generated: {reportResult.generatedAt} | Scope: {reportResult.nodeScope}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded text-slate-200"
            >
              Print Preview
            </button>
          </div>

          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(reportResult.summary || {}).map(([k, v]) => (
              <div key={k} className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-accent">{String(v)}</span>
              </div>
            ))}
          </div>

          {/* Tabular Data Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-slate-700 bg-slate-800/40">
                <tr>
                  {reportResult.rows.length > 0 &&
                    Object.keys(reportResult.rows[0]).map(h => (
                      <th key={h} className="py-2.5 px-3 uppercase text-[10px] tracking-wider">{h.replace(/_/g, ' ')}</th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reportResult.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="py-2.5 px-3 text-slate-200">
                        {typeof val === 'string' && val === 'PASS' ? (
                          <span className="text-green-400 font-bold bg-green-950/40 px-2 py-0.5 rounded border border-green-800">PASS</span>
                        ) : typeof val === 'string' && val === 'WARNING' ? (
                          <span className="text-yellow-400 font-bold bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-800">WARNING</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!reportResult && (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs">Click "Generate Preview" to run analytics and render the report summary.</p>
        </div>
      )}

    </div>
  );
};
