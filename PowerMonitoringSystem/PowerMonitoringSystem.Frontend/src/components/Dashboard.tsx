import React, { useState, useEffect } from 'react';
import { Settings, Maximize, Home, Activity, Zap, ChevronRight, ChevronDown, FileText, Bell, BarChart2, RefreshCw, Pin, PinOff, Sun, Moon, AlertCircle, HelpCircle } from 'lucide-react';
import type { HierarchyNode, MeterData, TrendPoint } from '../types';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { EnergyAnalyticsView } from './EnergyAnalyticsView';
import { PowerQualityView } from './PowerQualityView';
import { AlarmManagementView } from './AlarmManagementView';
import { ReportingEngineView } from './ReportingEngineView';
import { HelpManualModal } from './HelpManualModal';

interface Props {
  onOpenConfig: () => void;
  token?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isAdmin?: boolean;
}

const Gauge = ({ value, label, min, max, unit, color }: any) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] text-slate-400 mb-1">{label}</div>
      <div className="relative w-20 h-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-[6px] border-slate-700"></div>
        <div 
          className={`absolute top-0 left-0 w-20 h-20 rounded-full border-[6px] border-t-transparent border-r-transparent rotate-45 ${color}`}
          style={{ transform: `rotate(${45 + (percentage * 1.8)}deg)` }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center">
          <span className="text-lg font-bold leading-tight">{value}</span>
          <span className="text-[9px] text-slate-500">{unit}</span>
        </div>
      </div>
      <div className="flex justify-between w-full px-2 mt-1 text-[8px] text-slate-500">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
};
export const Dashboard: React.FC<Props> = ({ onOpenConfig, token = '', theme = 'dark', onToggleTheme, isAdmin = false }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'energy' | 'quality' | 'alarms' | 'reports'>('overview');
  const [telemetry, setTelemetry] = useState<MeterData | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('24 Hours');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  // Show Live by Default always
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('live');

  // Enable Demo Mode setting (controls visibility of Demo & Live switcher)
  const [enableDemoMode, setEnableDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('pms_enable_demo_mode') === 'true';
  });

  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const handleModeChange = (mode: 'demo' | 'live') => {
    setDataMode(mode);
  };

  // Fetch System Settings (Enable Demo Mode)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/power-monitoring/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const s = await res.json();
          const isDemoEnabled = !!s.enableDemoMode;
          setEnableDemoMode(isDemoEnabled);
          localStorage.setItem('pms_enable_demo_mode', String(isDemoEnabled));
          if (!isDemoEnabled && dataMode === 'demo') {
            setDataMode('live');
          }
        }
      } catch (e) {
        console.error('Failed to load power monitoring settings', e);
      }
    };
    fetchSettings();
  }, [token]);

  // Auto-hide and Pin state for Network Hierarchy
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    const stored = localStorage.getItem('pms_hierarchy_pinned');
    return stored === null ? true : stored === 'true';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem('pms_hierarchy_pinned', String(next));
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Hierarchy
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await fetch(`/api/power-monitoring/hierarchy?mode=${dataMode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data: HierarchyNode = await res.json();
          setHierarchy(data);
          setSelectedNode(data);
        }
      } catch (e) {
        console.error('Failed to load hierarchy', e);
      }
    };
    fetchHierarchy();
  }, [token, dataMode]);

  // Fetch Telemetry & Trends when Selected Node or Timeframe changes
  const fetchTelemetryAndTrends = async () => {
    if (!selectedNode) return;
    setLoading(true);
    try {
      const [telRes, trdRes] = await Promise.all([
        fetch(`/api/power-monitoring/telemetry?nodeId=${selectedNode.id}&mode=${dataMode}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/power-monitoring/trends?nodeId=${selectedNode.id}&timeframe=${encodeURIComponent(timeframe)}&mode=${dataMode}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (telRes.ok) {
        const tel = await telRes.json();
        setTelemetry(tel);
      }
      if (trdRes.ok) {
        const trd = await trdRes.json();
        setTrendData(trd.points || []);
      }
    } catch (e) {
      console.error('Failed to load telemetry and trends', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryAndTrends();
  }, [selectedNode?.id, timeframe, token, dataMode]);

  // WebSocket Live Streaming
  useEffect(() => {
    if (!token) return;

    let ws: WebSocket | null = null;
    let isMounted = true;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live?access_token=${token}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isMounted) setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update && update.pointIdentifier && selectedNode?.mappedPointId === update.pointIdentifier) {
            setTelemetry(prev => {
              if (!prev) return prev;
              const val = update.value ?? prev.currentAvg;
              return {
                ...prev,
                currentAvg: val,
                activePower: Math.round(val * 0.62 * 10) / 10
              };
            });
          }
        } catch { }
      };

      ws.onclose = () => {
        if (isMounted) {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        }
      };
    };

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [selectedNode?.mappedPointId, token]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const renderTree = (node: HierarchyNode, depth = 0) => {
    const isSelected = selectedNode?.id === node.id;
    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1.5 px-2 cursor-pointer hover:bg-slate-700/50 rounded text-sm transition-colors ${
            isSelected ? 'bg-accent/20 text-accent font-semibold' : 'text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            setSelectedNode(node);
            if (!isPinned) {
              setIsSidebarOpen(false);
            }
          }}
        >
          {node.children && node.children.length > 0 ? (
             <ChevronDown size={14} className="mr-1 shrink-0 text-slate-400" />
          ) : (
             <span className="w-4 inline-block"></span>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.children && (
          <div>
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-200 overflow-hidden font-sans text-sm relative">
      
      {/* Left Navigation Bar */}
      <div className="w-16 bg-[#131C2F] flex flex-col items-center py-4 border-r border-slate-800 z-20 shrink-0">
        <div className="text-accent mb-8" title="Power Monitoring System"><Zap size={28} /></div>
        <div className="flex flex-col space-y-6">
          <div className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'overview' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('overview')}>
            <Home size={22} /><span className="text-[9px] mt-1 font-medium">Overview</span>
          </div>
          <div className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'energy' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('energy')}>
            <BarChart2 size={22} /><span className="text-[9px] mt-1 font-medium">Energy</span>
          </div>
          <div className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'quality' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('quality')}>
            <Activity size={22} /><span className="text-[9px] mt-1 font-medium">Quality</span>
          </div>
          <div className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'alarms' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('alarms')}>
            <Bell size={22} /><span className="text-[9px] mt-1 font-medium">Alarms</span>
          </div>
          <div className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'reports' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('reports')}>
            <FileText size={22} /><span className="text-[9px] mt-1 font-medium">Reports</span>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center space-y-4">
          <div 
            className="flex flex-col items-center text-slate-500 hover:text-blue-400 cursor-pointer transition-colors" 
            onClick={() => setShowHelpModal(true)} 
            title="User Help Guide & Manual"
          >
            <HelpCircle size={22} /><span className="text-[9px] mt-1 font-medium">Help</span>
          </div>
          {isAdmin && (
            <div className="flex flex-col items-center text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" onClick={onOpenConfig} title="Configuration Settings (Administrator)">
              <Settings size={22} /><span className="text-[9px] mt-1">Settings</span>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy Sidebar - Pinned vs Auto-Hide */}
      {isPinned ? (
        <div className="w-60 bg-[#131C2F] border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-10">
          <div className="p-3 border-b border-slate-800 bg-[#151D2C] flex items-center justify-between">
            <h2 className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">NETWORK HIERARCHY</h2>
            <div className="flex items-center space-x-1">
              <button onClick={fetchTelemetryAndTrends} title="Refresh Tree" className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800/50 transition-colors">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={togglePin} 
                title="Unpin to auto-hide sidebar" 
                className="text-accent hover:text-blue-400 p-1 rounded hover:bg-slate-800/50 transition-colors"
              >
                <Pin size={13} className="fill-current -rotate-45" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {hierarchy ? renderTree(hierarchy) : <div className="text-xs text-slate-500 p-2">Loading tree...</div>}
          </div>
        </div>
      ) : (
        <>
          {/* Unpinned Collapsed Rail */}
          <div 
            className="w-9 bg-[#131C2F] border-r border-slate-800 flex flex-col items-center py-3 select-none cursor-pointer group hover:bg-[#1E293B] transition-colors relative z-10 shrink-0"
            onClick={() => setIsSidebarOpen(prev => !prev)}
            onMouseEnter={() => setIsSidebarOpen(true)}
            title="Click or hover to expand Network Hierarchy"
          >
            <div className="text-slate-400 group-hover:text-accent transition-colors mb-4">
              <PinOff size={14} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] tracking-widest font-semibold text-slate-400 group-hover:text-slate-200 transition-colors uppercase [writing-mode:vertical-rl] rotate-180">
                NETWORK HIERARCHY
              </span>
            </div>
            <div className="mt-auto text-slate-500 group-hover:text-slate-300">
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Flyout Slide-over Drawer when unpinned and hovered/opened */}
          {isSidebarOpen && (
            <div 
              className="absolute left-16 top-0 bottom-0 w-64 bg-[#131C2F] border-r border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-left duration-200"
              onMouseLeave={() => setIsSidebarOpen(false)}
            >
              <div className="p-3 border-b border-slate-800 bg-[#151D2C] flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">NETWORK HIERARCHY</h2>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Auto-hide</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={fetchTelemetryAndTrends} title="Refresh Tree" className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800/50 transition-colors">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <button 
                    onClick={togglePin} 
                    title="Pin sidebar to keep visible" 
                    className="text-slate-400 hover:text-accent p-1 rounded hover:bg-slate-800/50 transition-colors"
                  >
                    <PinOff size={13} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {hierarchy ? renderTree(hierarchy) : <div className="text-xs text-slate-500 p-2">Loading tree...</div>}
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-12 border-b border-slate-800 bg-[#131C2F] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center text-xs">
            <span className="text-slate-400">Power Monitoring</span>
            <ChevronRight size={14} className="mx-1 text-slate-600" />
            <span className="text-slate-200 font-semibold">{selectedNode?.name || 'Plant Overview'}</span>
            <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              {selectedNode?.type || 'Plant'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs">
            {/* Demo vs Live Mode Switcher - Visibility controlled by Enable Demo Mode setting */}
            {enableDemoMode ? (
              <div className="flex items-center p-0.5 rounded-lg border border-slate-700/80 bg-[#0B1120] text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => handleModeChange('demo')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all text-[11px] font-medium ${
                    dataMode === 'demo'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Demo Mode: Simulated power metrics, waveforms & disturbances for demonstration"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dataMode === 'demo' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`}></span>
                  <span>Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('live')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all text-[11px] font-medium ${
                    dataMode === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Live Mode: Real-time telemetry from configured meter hierarchy & SCADA points"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                  <span>Live</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold shadow-xs" title="System running in Live Mode">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Mode</span>
              </div>
            )}

            <div className={`flex items-center space-x-1.5 ${wsConnected ? 'text-green-400' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span>{wsConnected ? 'LIVE WS' : 'CONNECTING'}</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">{currentTime}</span>
            {/* Help Manual Button */}
            <button 
              onClick={() => setShowHelpModal(true)} 
              className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center space-x-1" 
              title="User Help Guide & Manual"
            >
              <HelpCircle size={15} />
              <span className="hidden sm:inline text-[11px] font-medium text-slate-300">Help</span>
            </button>

            {onToggleTheme && (
              <button 
                onClick={onToggleTheme} 
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors" 
                title={theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme'}
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>
            )}
            <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white" title="Fullscreen"><Maximize size={16} /></button>
          </div>
        </header>

        {/* Sub-menu Views */}
        {activeTab === 'energy' && (
          <EnergyAnalyticsView selectedNode={selectedNode} token={token} theme={theme} dataMode={dataMode} />
        )}

        {activeTab === 'quality' && (
          <PowerQualityView selectedNode={selectedNode} token={token} theme={theme} dataMode={dataMode} />
        )}

        {activeTab === 'alarms' && (
          <AlarmManagementView selectedNode={selectedNode} token={token} theme={theme} dataMode={dataMode} />
        )}

        {activeTab === 'reports' && (
          <ReportingEngineView selectedNode={selectedNode} token={token} theme={theme} dataMode={dataMode} />
        )}
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0B1120]">
            {/* Live Mode Unconfigured Banner */}
            {dataMode === 'live' && (!hierarchy?.children || hierarchy.children.length === 0) && (
              <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-amber-400 shrink-0" size={20} />
                  <div>
                    <div className="font-semibold text-xs text-amber-300">No Configured Meters in Live Mode</div>
                    <div className="text-[11px] text-amber-200/80">
                      You are in Live mode, but no distribution meters have been configured yet. Use the Settings button (Admin) to Auto-Configure or Import CSV.
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={onOpenConfig}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded text-xs transition-colors shrink-0 ml-3"
                  >
                    Configure Meters
                  </button>
                )}
              </div>
            )}
            {/* Row 1: KPI Cards (8 items) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { title: 'Voltage (Avg)', val: `${telemetry?.voltageAvg ?? 415} V`, sub1: '▲ 0.3%', sub2: 'Min 410 Max 420', status: 'Healthy', statColor: 'text-green-500' },
                { title: 'Current (Avg)', val: `${telemetry?.currentAvg ?? 126} A`, sub1: '▼ 1.2%', sub2: 'Min 110 Max 150', status: 'Healthy', statColor: 'text-green-500' },
                { title: 'Power Factor', val: `${telemetry?.powerFactor ?? 0.98}`, sub1: '▲ 0.01', sub2: 'Min 0.95 Max 1.00', status: 'Excellent', statColor: 'text-green-500' },
                { title: 'Frequency', val: `${telemetry?.frequency ?? 50.01} Hz`, sub1: '▲ 0.02', sub2: 'Min 49.90 Max 50.10', status: 'Stable', statColor: 'text-green-500' },
                { title: 'Active Power', val: `${telemetry?.activePower ?? 78.2} kW`, sub1: '▲ 3.4%', sub2: 'Capacity 68%', status: 'Normal', statColor: 'text-green-500' },
                { title: 'Apparent Power', val: `${telemetry?.apparentPower ?? 80.5} kVA`, sub1: '▲ 3.1%', sub2: 'Capacity 71%', status: 'Normal', statColor: 'text-green-500' },
                { title: 'Reactive Power', val: `${telemetry?.reactivePower ?? 12.1} kVAR`, sub1: '▲ 5.6%', sub2: 'Capacity 42%', status: 'Moderate', statColor: 'text-orange-400' },
                { title: 'Energy (Today)', val: `${(telemetry?.energyToday ?? 4562).toLocaleString()} kWh`, sub1: '▲ 8.2%', sub2: `Yest ${(telemetry?.energyYesterday ?? 4215).toLocaleString()} kWh`, status: 'Info', statColor: 'text-blue-500' },
              ].map((kpi, i) => (
                <div key={i} className="bg-[#151D2C] rounded border border-slate-800 p-2.5 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 flex items-center mb-1"><Zap size={10} className="mr-1" />{kpi.title}</div>
                  <div className="text-lg font-bold text-slate-100">{kpi.val}</div>
                  <div className="text-[10px] text-green-400 my-0.5">{kpi.sub1}</div>
                  <div className="text-[9px] text-slate-500">{kpi.sub2}</div>
                  <div className="flex items-center text-[10px] mt-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${kpi.statColor}`}></div>
                    <span className={kpi.statColor}>{kpi.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Health, Gauges, Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              
              {/* 3-Phase Health */}
              <div className="bg-[#151D2C] rounded border border-slate-800 p-3 lg:col-span-3 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">3-Phase Health</h3>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Balanced
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center relative py-2 min-h-[140px]">
                  {/* High Contrast Vector Diagram */}
                  <div className="w-28 h-28 rounded-full border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 relative flex items-center justify-center shadow-inner">
                    {/* SVG Phasor Lines & Delta Loop */}
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 112 112">
                      {/* Delta Loop dashed triangle connecting R(56, 18), Y(90, 80), B(22, 80) */}
                      <polygon points="56,20 90,80 22,80" fill="none" stroke={theme === 'light' ? '#CBD5E1' : '#334155'} strokeWidth="1" strokeDasharray="3,3" />
                      
                      {/* Center Hub */}
                      <circle cx="56" cy="56" r="4" fill={theme === 'light' ? '#94A3B8' : '#475569'} />
                      <circle cx="56" cy="56" r="2" fill="#FFFFFF" />

                      {/* R-Phase Vector (Up) */}
                      <line x1="56" y1="56" x2="56" y2="22" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="56" cy="22" r="3" fill="#EF4444" />

                      {/* Y-Phase Vector (Bottom-Right, 120 deg) */}
                      <line x1="56" y1="56" x2="88" y2="78" stroke={theme === 'light' ? '#D97706' : '#FBBF24'} strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="88" cy="78" r="3" fill={theme === 'light' ? '#D97706' : '#FBBF24'} />

                      {/* B-Phase Vector (Bottom-Left, 240 deg) */}
                      <line x1="56" y1="56" x2="24" y2="78" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="24" cy="78" r="3" fill="#3B82F6" />
                    </svg>

                    {/* Phase Badges positioned at vertices */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E293B] px-2 py-0.5 rounded-full border border-red-500/40 shadow-xs flex items-center space-x-1 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 text-white font-black text-[8px] flex items-center justify-center">R</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{telemetry?.vrY_LL ?? 414}V</span>
                    </div>

                    <div className="absolute -bottom-2 -right-4 bg-white dark:bg-[#1E293B] px-2 py-0.5 rounded-full border border-amber-500/40 shadow-xs flex items-center space-x-1 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 text-white font-black text-[8px] flex items-center justify-center">Y</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{telemetry?.vyB_LL ?? 416}V</span>
                    </div>

                    <div className="absolute -bottom-2 -left-4 bg-white dark:bg-[#1E293B] px-2 py-0.5 rounded-full border border-blue-500/40 shadow-xs flex items-center space-x-1 whitespace-nowrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white font-black text-[8px] flex items-center justify-center">B</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{telemetry?.vbR_LL ?? 415}V</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                  <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-2 rounded-md flex flex-col justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Voltage Imbalance</span>
                    <span className="text-emerald-600 dark:text-green-400 font-bold text-xs mt-0.5">{telemetry?.voltageImbalancePercent ?? 0.28}%</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-2 rounded-md flex flex-col justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Phase Sequence</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold text-xs mt-0.5">{telemetry?.phaseSequence ?? 'R - Y - B'}</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-2 rounded-md flex flex-col justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Current Imbalance</span>
                    <span className="text-emerald-600 dark:text-green-400 font-bold text-xs mt-0.5">{telemetry?.currentImbalancePercent ?? 1.98}%</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-2 rounded-md flex flex-col justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className="text-emerald-600 dark:text-green-400 font-bold text-xs mt-0.5 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                      {telemetry?.status ?? 'Healthy'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Electrical Gauges */}
              <div className="bg-[#151D2C] rounded border border-slate-800 p-3 lg:col-span-4 flex flex-col">
                <h3 className="text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Electrical Gauges</h3>
                <div className="grid grid-cols-3 gap-y-6">
                  <Gauge label="Voltage (Avg)" value={telemetry?.voltageAvg ?? 415} unit="V" min={380} max={460} color="border-green-500" />
                  <Gauge label="Current (Avg)" value={telemetry?.currentAvg ?? 126} unit="A" min={0} max={200} color="border-green-500" />
                  <Gauge label="Power Factor" value={telemetry?.powerFactor ?? 0.98} unit="PF" min={0} max={1} color="border-green-500" />
                  <Gauge label="Frequency" value={telemetry?.frequency ?? 50.01} unit="Hz" min={48} max={52} color="border-green-500" />
                  <Gauge label="Demand (kW)" value={telemetry?.demandKw ?? 82.0} unit="kW" min={0} max={150} color="border-yellow-400" />
                  <Gauge label="Load (%)" value={telemetry?.loadPercentage ?? 74} unit="%" min={0} max={100} color="border-yellow-400" />
                </div>
              </div>

              {/* Phase Wise Details */}
              <div className="bg-[#151D2C] rounded border border-slate-800 p-3 lg:col-span-5 flex flex-col">
                <h3 className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Phase Wise Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] text-left">
                    <thead className="text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-1.5 font-medium">Parameter</th>
                        <th className="py-1.5 font-medium text-red-500">R (Red)</th>
                        <th className="py-1.5 font-medium text-amber-600 dark:text-yellow-400">Y (Yellow)</th>
                        <th className="py-1.5 font-medium text-blue-500">B (Blue)</th>
                        <th className="py-1.5 font-medium text-slate-800 dark:text-slate-200">Avg/Total</th>
                        <th className="py-1.5 font-medium text-slate-500">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { l: 'Voltage (L-N)', r: telemetry?.vR_LN ?? 239, y: telemetry?.vY_LN ?? 240, b: telemetry?.vB_LN ?? 239, a: telemetry?.vR_LN ?? 239, u: 'V' },
                        { l: 'Voltage (L-L)', r: telemetry?.vrY_LL ?? 414, y: telemetry?.vyB_LL ?? 416, b: telemetry?.vbR_LL ?? 415, a: telemetry?.voltageAvg ?? 415, u: 'V' },
                        { l: 'Current', r: telemetry?.iR ?? 122, y: telemetry?.iY ?? 128, b: telemetry?.iB ?? 126, a: telemetry?.currentAvg ?? 126, u: 'A' },
                        { l: 'Power Factor', r: telemetry?.pfR ?? 0.98, y: telemetry?.pfY ?? 0.97, b: telemetry?.pfB ?? 0.99, a: telemetry?.powerFactor ?? 0.98, u: '-' },
                        { l: 'Active Power (kW)', r: telemetry?.powerR ?? 26.1, y: telemetry?.powerY ?? 26.5, b: telemetry?.powerB ?? 25.6, a: telemetry?.activePower ?? 78.2, u: 'kW' },
                        { l: 'Reactive Power (kVAR)', r: telemetry?.reactivePowerR ?? 4.3, y: telemetry?.reactivePowerY ?? 4.0, b: telemetry?.reactivePowerB ?? 3.8, a: telemetry?.reactivePower ?? 12.1, u: 'kVAR' },
                        { l: 'THD - Voltage (%)', r: telemetry?.thD_VR ?? 1.8, y: telemetry?.thD_VY ?? 1.9, b: telemetry?.thD_VB ?? 2.1, a: 1.9, u: '%' },
                        { l: 'THD - Current (%)', r: telemetry?.thD_IR ?? 3.2, y: telemetry?.thD_IY ?? 3.4, b: telemetry?.thD_IB ?? 3.0, a: 3.2, u: '%' },
                        { l: 'Neutral Current', r: '--', y: '--', b: '--', a: telemetry?.iNeutral ?? 5.2, u: 'A' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-1.5 text-slate-300">{row.l}</td>
                          <td className="py-1.5">{row.r}</td><td className="py-1.5">{row.y}</td><td className="py-1.5">{row.b}</td><td className="py-1.5 text-slate-200 font-bold">{row.a}</td><td className="py-1.5 text-slate-500">{row.u}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Row 3: Trends and Power Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {/* Realtime Trends */}
              <div className="bg-[#151D2C] rounded border border-slate-800 p-3 lg:col-span-3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Real-Time Trends</h3>
                  <div className="flex space-x-1">
                    {['15 Min', '1 Hour', '8 Hours', '24 Hours', '7 Days', '30 Days'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`text-[9px] px-2 py-0.5 rounded transition-all ${
                          timeframe === t ? 'bg-accent text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 flex-1 mt-2">
                  <div className="flex flex-col"><div className="text-[9px] text-slate-400 text-center mb-1">Voltage (V)</div><div className="flex-1 h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="monotone" dataKey="v" stroke="#4ADE80" dot={false} strokeWidth={1.5} /><YAxis domain={['dataMin - 5', 'dataMax + 5']} width={22} tick={{fontSize: 8}} axisLine={false} tickLine={false} /></LineChart></ResponsiveContainer></div></div>
                  <div className="flex flex-col"><div className="text-[9px] text-slate-400 text-center mb-1">Current (A)</div><div className="flex-1 h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="monotone" dataKey="c" stroke="#FBBF24" dot={false} strokeWidth={1.5} /><YAxis domain={['dataMin - 10', 'dataMax + 10']} width={22} tick={{fontSize: 8}} axisLine={false} tickLine={false} /></LineChart></ResponsiveContainer></div></div>
                  <div className="flex flex-col"><div className="text-[9px] text-slate-400 text-center mb-1">Active Power (kW)</div><div className="flex-1 h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="monotone" dataKey="kw" stroke="#60A5FA" dot={false} strokeWidth={1.5} /><YAxis domain={['dataMin - 5', 'dataMax + 5']} width={22} tick={{fontSize: 8}} axisLine={false} tickLine={false} /></LineChart></ResponsiveContainer></div></div>
                  <div className="flex flex-col"><div className="text-[9px] text-slate-400 text-center mb-1">Power Factor</div><div className="flex-1 h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="stepAfter" dataKey="pf" stroke="#C084FC" dot={false} strokeWidth={1.5} /><YAxis domain={[0.85, 1.0]} width={22} tick={{fontSize: 8}} axisLine={false} tickLine={false} /></LineChart></ResponsiveContainer></div></div>
                  <div className="flex flex-col"><div className="text-[9px] text-slate-400 text-center mb-1">Frequency (Hz)</div><div className="flex-1 h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><Line type="monotone" dataKey="hz" stroke="#2DD4BF" dot={false} strokeWidth={1.5} /><YAxis domain={[49.8, 50.2]} width={25} tick={{fontSize: 8}} axisLine={false} tickLine={false} /></LineChart></ResponsiveContainer></div></div>
                </div>
              </div>

              {/* Power Flow */}
              <div className="bg-[#151D2C] rounded border border-slate-800 p-3 lg:col-span-1 flex flex-col">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Power Flow</h3>
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="border border-slate-600 px-4 py-1.5 rounded bg-slate-800 text-[10px] w-32 text-center text-slate-300 flex items-center justify-center"><Zap size={12} className="mr-1"/> GRID</div>
                  <div className="h-4 w-[2px] bg-green-500"></div>
                  <div className="text-green-400 text-[10px] font-bold">{telemetry?.activePower ?? 28.5} kW</div>
                  <div className="h-4 w-[2px] bg-green-500"></div>
                  <div className="border border-slate-600 px-4 py-1.5 rounded bg-slate-800 text-[10px] w-32 text-center text-slate-300 flex items-center justify-center"><Home size={12} className="mr-1"/> LOAD</div>
                </div>
              </div>
            </div>

            {/* Bottom Status Legend */}
            <div className="flex justify-between items-center px-2 pb-2">
               <div className="flex items-center space-x-4 text-[9px] text-slate-500">
                 <span>STATUS LEGEND:</span>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>Healthy (Normal)</div>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>Warning</div>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>Critical</div>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>Information</div>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-500 mr-1"></div>Offline</div>
               </div>
               <div className="text-[9px] text-slate-500 flex space-x-4">
                 <span>All values are RMS unless specified</span>
                 <span>© 2026 Power Monitoring System</span>
               </div>
            </div>

          </div>
        )}

      </div>

      {/* Interactive User Help Manual Modal */}
      <HelpManualModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
};
