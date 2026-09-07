import React, { useState, useEffect, useRef } from 'react';
import type { HierarchyNode, DiscoveredPoint, NodeType } from '../types';
import { 
  Save, Plus, ArrowLeft, Database, ChevronDown, CheckCircle, 
  RefreshCw, Server, Wand2, Download, Upload, FileSpreadsheet, Trash2, 
  Search, Sun, Moon, Zap, Check, X, Eye, HelpCircle
} from 'lucide-react';
import { HelpManualModal } from './HelpManualModal';
import { exportHierarchyToCsv, downloadCsvTemplate, importHierarchyFromCsv } from '../utils/hierarchyCsv';
import { 
  autoConfigureWithPatterns, 
  autoMapNodeByName, 
  previewPatternMatches, 
  DEFAULT_PATTERN_CONFIG, 
  DEFAULT_PARAMETER_TOKENS,
  type NamePatternConfig,
  type PatternPreviewResult
} from '../utils/autoConfig';

interface Props {
  onClose: () => void;
  token?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isAdmin?: boolean;
}

const ELECTRICAL_PARAMETERS: { key: string; label: string; unit: string; hint: string }[] = [
  { key: 'voltage', label: 'Voltage (L-L / L-N)', unit: 'V', hint: 'Phase or line voltage' },
  { key: 'current', label: 'Current (Average / Line)', unit: 'A', hint: 'Phase or average current' },
  { key: 'activePower', label: 'Active Power', unit: 'kW', hint: 'Real electrical load power' },
  { key: 'reactivePower', label: 'Reactive Power', unit: 'kVAR', hint: 'Inductive/capacitive power' },
  { key: 'apparentPower', label: 'Apparent Power', unit: 'kVA', hint: 'Total vector sum power' },
  { key: 'powerFactor', label: 'Power Factor (PF)', unit: '-', hint: 'Cos phi (0.00 to 1.00)' },
  { key: 'frequency', label: 'System Frequency', unit: 'Hz', hint: 'Nominal 50.0 / 60.0 Hz' },
  { key: 'activeEnergy', label: 'Active Energy (Cumulative)', unit: 'kWh', hint: 'Total active energy counter' },
  { key: 'thdVoltage', label: 'THD - Voltage', unit: '%', hint: 'Total harmonic distortion V' },
  { key: 'thdCurrent', label: 'THD - Current', unit: '%', hint: 'Total harmonic distortion I' }
];

interface SearchablePointSelectProps {
  value: string;
  points: DiscoveredPoint[];
  onChange: (pointId: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchablePointSelect: React.FC<SearchablePointSelectProps> = ({
  value,
  points,
  onChange,
  placeholder = '-- Unmapped (Auto-Rollup / Inferred) --',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedPoint = points.find(p => p.id === value);

  const filteredPoints = React.useMemo(() => {
    if (!search.trim()) return points.slice(0, 100);
    const q = search.toLowerCase().trim();
    return points.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.registerOrInstance && p.registerOrInstance.toLowerCase().includes(q)) ||
        (p.deviceIp && p.deviceIp.toLowerCase().includes(q)) ||
        (p.protocol && p.protocol.toLowerCase().includes(q)) ||
        (p.unit && p.unit.toLowerCase().includes(q))
      );
    }).slice(0, 100);
  }, [points, search]);

  const totalMatches = React.useMemo(() => {
    if (!search.trim()) return points.length;
    const q = search.toLowerCase().trim();
    return points.filter(p => (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.registerOrInstance && p.registerOrInstance.toLowerCase().includes(q)) ||
      (p.deviceIp && p.deviceIp.toLowerCase().includes(q))
    )).length;
  }, [points, search]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Combobox Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-[#131C2F] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs flex items-center justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors focus-within:border-accent"
      >
        <div className="truncate flex items-center space-x-1.5 flex-1 min-w-0 pr-1">
          {selectedPoint ? (
            <>
              <span className="text-[11px] shrink-0">
                {selectedPoint.itemType === 'Device' ? '🖥️' : '⚡'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {selectedPoint.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                ({selectedPoint.registerOrInstance || selectedPoint.id})
              </span>
              {selectedPoint.unit && (
                <span className="text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono shrink-0">
                  [{selectedPoint.unit}]
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0 text-slate-400">
          {selectedPoint && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-red-500 rounded transition-colors text-slate-400"
              title="Clear mapping"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown size={13} className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#131C2F] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-72 animate-in fade-in slide-in-from-top-1 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] flex items-center space-x-1.5 shrink-0">
            <Search size={13} className="text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search points by name, tag, register, or IP..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Matches Count Header */}
          <div className="px-2.5 py-1 bg-slate-100/70 dark:bg-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
            <span>
              {search ? `${totalMatches} matching points` : `${points.length} total points available`}
            </span>
            {totalMatches > 100 && (
              <span className="italic text-[9px]">showing top 100 matches</span>
            )}
          </div>

          {/* Points List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-56">
            {/* Unmap Option */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between text-slate-500 dark:text-slate-400 transition-colors ${
                !value ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-semibold text-indigo-600 dark:text-indigo-400' : ''
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs">⚪</span>
                <span className="truncate italic">{placeholder}</span>
              </div>
              {!value && <Check size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0 ml-1.5" />}
            </div>

            {/* Filtered Points */}
            {filteredPoints.length > 0 ? (
              filteredPoints.map((p) => {
                const isSelected = p.id === value;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onChange(p.id);
                      setIsOpen(false);
                    }}
                    className={`px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                      <span className="text-[11px] shrink-0">
                        {p.itemType === 'Device' ? '🖥️' : '⚡'}
                      </span>
                      <div className="truncate flex flex-col min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {p.name}
                          </span>
                          {p.unit && (
                            <span className="text-[9px] bg-slate-200/80 dark:bg-slate-700/60 px-1 py-0.2 rounded font-mono text-slate-600 dark:text-slate-300 shrink-0">
                              {p.unit}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {p.registerOrInstance ? `Reg: ${p.registerOrInstance}` : `ID: ${p.id}`}
                          {p.deviceIp ? ` • ${p.deviceIp}` : ''}
                          {p.protocol ? ` • ${p.protocol}` : ''}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0 ml-1.5" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                No points matching "{search}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Configuration: React.FC<Props> = ({ 
  onClose, 
  token = '', 
  theme = 'dark', 
  onToggleTheme, 
  isAdmin = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 p-6 text-center">
        <div className="bg-white dark:bg-[#131C2F] border border-slate-200 dark:border-slate-800 p-8 rounded-xl max-w-md shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20">
            <Database size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            You do not have permission to access the Power Monitoring System configuration. Only users with the Administrator role are authorized to view and modify network hierarchies and device mappings.
          </p>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-md"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const [hierarchy, setHierarchy] = useState<HierarchyNode>({
    id: 'plant-root',
    name: 'Main Plant Facility',
    type: 'Plant',
    children: []
  });

  const [discoveredPoints, setDiscoveredPoints] = useState<DiscoveredPoint[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [enableDemoMode, setEnableDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('pms_enable_demo_mode') === 'true';
  });

  const [showPatternModal, setShowPatternModal] = useState<boolean>(false);
  const [patternConfig, setPatternConfig] = useState<NamePatternConfig>(DEFAULT_PATTERN_CONFIG);
  const [previewData, setPreviewData] = useState<PatternPreviewResult | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [hRes, dRes, sRes] = await Promise.all([
          fetch('/api/power-monitoring/hierarchy', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/power-monitoring/discovered-items', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/power-monitoring/settings', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
        ]);

        if (hRes.ok) {
          const hData = await hRes.json();
          setHierarchy(hData);
          setSelectedNodeId(hData.id);
        }

        if (dRes.ok) {
          const dData = await dRes.json();
          setDiscoveredPoints(dData);
        }

        if (sRes && sRes.ok) {
          const sData = await sRes.json();
          const isDemoEnabled = !!sData.enableDemoMode;
          setEnableDemoMode(isDemoEnabled);
          localStorage.setItem('pms_enable_demo_mode', String(isDemoEnabled));
        }
      } catch (e) {
        console.error('Failed to load configuration data', e);
      }
    };

    loadInitialData();
  }, [token]);

  const handleToggleDemoMode = async (enabled: boolean) => {
    setEnableDemoMode(enabled);
    localStorage.setItem('pms_enable_demo_mode', String(enabled));
    try {
      const res = await fetch('/api/power-monitoring/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enableDemoMode: enabled })
      });
      if (res.ok) {
        showNotification(
          enabled
            ? 'Demo Mode enabled! Demo & Live switcher is now visible on the Dashboard.'
            : 'Demo Mode disabled. Dashboard will strictly display Live telemetry.',
          'success'
        );
      }
    } catch {
      // Will also be persisted on handleSave
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [hRes, sRes] = await Promise.all([
        fetch('/api/power-monitoring/hierarchy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(hierarchy)
        }),
        fetch('/api/power-monitoring/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ enableDemoMode })
        })
      ]);

      if (hRes.ok && (!sRes || sRes.ok)) {
        localStorage.setItem('pms_enable_demo_mode', String(enableDemoMode));
        showNotification('Hierarchy & Settings saved successfully to system database!', 'success');
      } else {
        const err = !hRes.ok ? await hRes.json() : await sRes.json();
        showNotification(err.error || 'Failed to save configuration', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error saving configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update live preview when pattern configuration or points change
  useEffect(() => {
    if (showPatternModal) {
      const prev = previewPatternMatches(discoveredPoints, patternConfig);
      setPreviewData(prev);
    }
  }, [showPatternModal, patternConfig, discoveredPoints]);

  // Auto-Map Selected Node by Name Pattern
  const handleAutoMapSelectedNode = () => {
    if (!selectedNode) return;
    try {
      const result = autoMapNodeByName(selectedNode, discoveredPoints, patternConfig);
      setHierarchy(updateNode(hierarchy, selectedNode.id, { parameterMappings: result.updatedMappings }));
      if (result.mappedCount > 0) {
        showNotification(`Auto-mapped ${result.mappedCount} parameters for "${selectedNode.name}" based on name pattern!`, 'success');
      } else {
        showNotification(`No matching points found for "${selectedNode.name}". You can customize pattern tokens in Smart Auto-Configure.`, 'info');
      }
    } catch (e: any) {
      showNotification(`Failed to auto-map node: ${e.message}`, 'error');
    }
  };

  // Smart Auto-Configuration via Name Patterns
  const handleApplyPatternAutoConfig = () => {
    try {
      const result = autoConfigureWithPatterns(discoveredPoints, patternConfig, hierarchy);
      setHierarchy(result.hierarchy);
      setShowPatternModal(false);
      showNotification(`Smart Auto-Configuration: Configured ${result.configuredMetersCount} meters with ${result.mappedPointsCount} points mapped!`, 'success');
    } catch (e: any) {
      showNotification(`Auto-configuration failed: ${e.message}`, 'error');
    }
  };

  const handleUpdateParamTokens = (paramKey: string, rawText: string) => {
    const tokens = rawText.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    setPatternConfig(prev => ({
      ...prev,
      parameterTokens: {
        ...prev.parameterTokens,
        [paramKey]: tokens
      }
    }));
  };

  // CSV Export
  const handleExportCsv = () => {
    try {
      const csvData = exportHierarchyToCsv(hierarchy);
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvData);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `PowerMonitoring_Hierarchy_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Hierarchy exported to CSV.', 'info');
    } catch (e: any) {
      showNotification(`Export failed: ${e.message}`, 'error');
    }
  };

  // CSV Import File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const parsedHierarchy = importHierarchyFromCsv(text, discoveredPoints);
        setHierarchy(parsedHierarchy);
        setSelectedNodeId(parsedHierarchy.id);
        showNotification('Successfully imported hierarchy from CSV! Click "Save Configuration" to persist.', 'success');
      } catch (err: any) {
        showNotification(`CSV Import Error: ${err.message}`, 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const updateNode = (tree: HierarchyNode, id: string, updates: Partial<HierarchyNode>): HierarchyNode => {
    if (tree.id === id) {
      return { ...tree, ...updates };
    }
    if (tree.children) {
      return { ...tree, children: tree.children.map(child => updateNode(child, id, updates)) };
    }
    return tree;
  };

  const updateParameterMapping = (nodeId: string, paramKey: string, pointId: string) => {
    setHierarchy(prev => {
      const updateTree = (tree: HierarchyNode): HierarchyNode => {
        if (tree.id === nodeId) {
          const current = { ...(tree.parameterMappings || {}) };
          if (pointId) {
            current[paramKey] = pointId;
          } else {
            delete current[paramKey];
          }
          return { ...tree, parameterMappings: current };
        }
        if (tree.children) {
          return { ...tree, children: tree.children.map(updateTree) };
        }
        return tree;
      };
      return updateTree(prev);
    });
  };

  const addNode = (parentId: string, type: NodeType) => {
    const newNode: HierarchyNode = {
      id: `node-${Date.now().toString().slice(-5)}`,
      name: `New ${type}`,
      type,
      children: [],
      parameterMappings: {}
    };

    const addToParent = (tree: HierarchyNode): HierarchyNode => {
      if (tree.id === parentId) {
        return { ...tree, children: [...(tree.children || []), newNode] };
      }
      if (tree.children) {
        return { ...tree, children: tree.children.map(addToParent) };
      }
      return tree;
    };

    setHierarchy(addToParent(hierarchy));
    setSelectedNodeId(newNode.id);
  };

  const deleteNode = (nodeId: string) => {
    if (hierarchy.id === nodeId) {
      showNotification('Cannot delete root plant node.', 'error');
      return;
    }

    const removeRecursive = (tree: HierarchyNode): HierarchyNode => {
      if (!tree.children) return tree;
      return {
        ...tree,
        children: tree.children.filter(c => c.id !== nodeId).map(removeRecursive)
      };
    };

    setHierarchy(removeRecursive(hierarchy));
    setSelectedNodeId(hierarchy.id);
    showNotification('Node deleted from hierarchy.', 'info');
  };

  const findNode = (tree: HierarchyNode, id: string): HierarchyNode | null => {
    if (tree.id === id) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const countMetersRecursive = (node: HierarchyNode): { total: number; mapped: number } => {
    let total = 1;
    let mapped = Object.keys(node.parameterMappings || {}).length > 0 || !!node.mappedPointId ? 1 : 0;
    if (node.children) {
      for (const child of node.children) {
        const res = countMetersRecursive(child);
        total += res.total;
        mapped += res.mapped;
      }
    }
    return { total, mapped };
  };

  const stats = countMetersRecursive(hierarchy);
  const selectedNode = selectedNodeId ? findNode(hierarchy, selectedNodeId) : null;

  const renderConfigTree = (node: HierarchyNode, depth = 0): React.ReactNode => {
    const isSelected = selectedNodeId === node.id;
    const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.type.toLowerCase().includes(searchQuery.toLowerCase());
    const mappedParamsCount = Object.keys(node.parameterMappings || {}).length;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1.5 px-3 cursor-pointer rounded-lg text-xs mb-1 transition-all ${
            !matchesSearch ? 'opacity-35' : ''
          } ${
            isSelected 
              ? 'bg-accent/20 text-accent font-bold border border-accent/40 shadow-xs' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          style={{ marginLeft: `${depth * 14}px` }}
          onClick={() => setSelectedNodeId(node.id)}
        >
          {node.children && node.children.length > 0 ? (
             <ChevronDown size={14} className="mr-1.5 text-slate-400 shrink-0" />
          ) : (
             <span className="w-5 inline-block"></span>
          )}
          <span className="truncate flex-1">{node.name}</span>
          
          <span className="ml-2 text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shrink-0">
            {node.type}
          </span>

          {mappedParamsCount > 0 && (
            <span className="ml-1.5 text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center shrink-0" title={`${mappedParamsCount} parameters mapped`}>
              <Check size={10} className="mr-0.5" />
              {mappedParamsCount}
            </span>
          )}
        </div>
        {node.children && (
          <div>
            {node.children.map(child => renderConfigTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const availableChildTypes: Record<NodeType, NodeType[]> = {
    'Plant': ['MDB', 'SMDB'],
    'MDB': ['SMDB', 'MCC', 'Feeder'],
    'SMDB': ['MCC', 'Feeder', 'Meter'],
    'MCC': ['Feeder', 'Meter'],
    'Feeder': ['Meter'],
    'Meter': []
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans text-sm">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Top Main Toolbar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2F] flex items-center justify-between px-4 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Return to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Zap size={16} className="text-accent mr-1.5" />
              Network Hierarchy & Meter Configuration
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bulk configure up to 1,000+ meters & map electrical parameters (Plant &rarr; MDB &rarr; Feeder &rarr; Meter)
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Smart Auto-Config */}
          <button
            onClick={() => setShowPatternModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs"
            title="Configure name patterns & auto-detect meters and electrical parameters"
          >
            <Wand2 size={14} />
            <span>Smart Auto-Configure</span>
          </button>

          {/* Download Template */}
          <button
            onClick={downloadCsvTemplate}
            className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs transition-colors"
            title="Download blank CSV template for 1000+ meter hierarchy"
          >
            <FileSpreadsheet size={14} />
            <span>Template</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs transition-colors"
            title="Import meter hierarchy and points from CSV / Excel"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs transition-colors"
            title="Export hierarchy and parameter mappings to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Enable Demo Mode Toggle */}
          <label 
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer text-xs select-none hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            title="Enable Demo Mode: When checked, users can toggle between Live and Demo simulation on the dashboard. When unchecked, Demo mode is hidden."
          >
            <input
              type="checkbox"
              checked={enableDemoMode}
              onChange={(e) => handleToggleDemoMode(e.target.checked)}
              className="rounded text-accent focus:ring-accent h-3.5 w-3.5 cursor-pointer"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">Enable Demo Mode</span>
          </label>

          {/* Help Manual Button */}
          <button 
            onClick={() => setShowHelpModal(true)} 
            className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 rounded-md text-xs transition-colors" 
            title="User Help Guide & Manual"
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </button>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button 
              onClick={onToggleTheme} 
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" 
              title={theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}

          {/* Save Configuration */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 bg-accent hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-md shadow-accent/20 ml-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {statusMessage && (
        <div className={`py-1.5 px-4 text-xs font-medium flex items-center justify-between border-b ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
          statusMessage.type === 'error' 
            ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' :
            'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
        }`}>
          <div className="flex items-center">
            <CheckCircle size={14} className="mr-2" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Main Workspace Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Electrical Distribution Tree */}
        <div className="w-5/12 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#131C2F]">
          {/* Tree Header & Search */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                ELECTRICAL DISTRIBUTION TREE
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                {stats.total} Nodes ({stats.mapped} Mapped)
              </span>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search meter, feeder, panel or node type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/80 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Tree List */}
          <div className="p-3 flex-1 overflow-y-auto">
            {renderConfigTree(hierarchy)}
          </div>
        </div>

        {/* Right Panel: Selected Node 10-Point Parameter Mapper & Editor */}
        <div className="w-7/12 flex flex-col bg-slate-50 dark:bg-[#0F172A] overflow-y-auto">
          {selectedNode ? (
            <div className="p-6 space-y-6 max-w-2xl">
              
              {/* Header Card */}
              <div className="bg-white dark:bg-[#131C2F] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedNode.name}
                    </h2>
                    <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full border border-accent/30 font-medium">
                      {selectedNode.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Node ID: {selectedNode.id}</p>
                </div>

                {selectedNode.id !== hierarchy.id && (
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded text-xs transition-colors border border-red-200 dark:border-red-900/30"
                    title="Remove this node and its children"
                  >
                    <Trash2 size={13} />
                    <span>Delete Node</span>
                  </button>
                )}
              </div>

              {/* General Properties */}
              <div className="bg-white dark:bg-[#131C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Node Properties
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Node Name</label>
                    <input 
                      type="text" 
                      value={selectedNode.name}
                      onChange={(e) => setHierarchy(updateNode(hierarchy, selectedNode.id, { name: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Classification Type</label>
                    <select
                      value={selectedNode.type}
                      onChange={(e) => setHierarchy(updateNode(hierarchy, selectedNode.id, { type: e.target.value as NodeType }))}
                      className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent"
                    >
                      <option value="Plant">Plant (Facility Root)</option>
                      <option value="MDB">MDB (Main Distribution Board / Substation)</option>
                      <option value="SMDB">SMDB (Sub-Main Distribution Board)</option>
                      <option value="MCC">MCC (Motor Control Center)</option>
                      <option value="Feeder">Feeder (Outgoing Circuit)</option>
                      <option value="Meter">Meter (Energy Meter / Instrument)</option>
                    </select>
                  </div>
                </div>

                {/* Primary Device Link */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Primary Instrument Device Association
                  </label>
                  <SearchablePointSelect
                    value={selectedNode.mappedPointId || ''}
                    points={discoveredPoints}
                    onChange={(newId) => setHierarchy(updateNode(hierarchy, selectedNode.id, { mappedPointId: newId }))}
                    placeholder="-- No Primary Device Link (Aggregates Child Feeders) --"
                  />
                </div>
              </div>

              {/* 10-Point Electrical Parameter Mapping Grid */}
              <div className="bg-white dark:bg-[#131C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                      <Database size={14} className="mr-1.5 text-accent" />
                      10-Parameter Live Electrical Point Mapping
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Map individual SCADA points to electrical telemetry channels. If unmapped, parent nodes roll up child values.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleAutoMapSelectedNode}
                      className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded text-xs font-medium transition-colors shadow-xs"
                      title={`Scan discovered points matching "${selectedNode.name}" name pattern and auto-fill 10 parameters`}
                    >
                      <Wand2 size={12} />
                      <span>Auto-Map from Name Pattern</span>
                    </button>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                      {Object.keys(selectedNode.parameterMappings || {}).length} / 10 Mapped
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {ELECTRICAL_PARAMETERS.map(param => {
                    const mappedId = selectedNode.parameterMappings?.[param.key] || '';

                    return (
                      <div key={param.key} className="pt-2 flex items-center justify-between gap-4">
                        <div className="w-1/3">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                            {param.label}
                            <span className="ml-1.5 text-[9px] text-slate-400 font-normal">[{param.unit}]</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{param.hint}</span>
                        </div>

                        <div className="w-2/3">
                          <SearchablePointSelect
                            value={mappedId}
                            points={discoveredPoints}
                            onChange={(newId) => updateParameterMapping(selectedNode.id, param.key, newId)}
                            placeholder="-- Unmapped (Auto-Rollup / Inferred) --"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Child Nodes */}
              <div className="bg-white dark:bg-[#131C2F] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Add Downstream Child Circuit / Meter
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Add lower level distribution panels or child instruments under this node.
                </p>

                <div className="flex flex-wrap gap-2">
                  {availableChildTypes[selectedNode.type]?.map(type => (
                    <button 
                      key={type}
                      onClick={() => addNode(selectedNode.id, type)}
                      className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-slate-800 dark:text-slate-200"
                    >
                      <Plus size={13} className="text-accent" />
                      <span>Add {type}</span>
                    </button>
                  ))}
                  {(!availableChildTypes[selectedNode.type] || availableChildTypes[selectedNode.type].length === 0) && (
                    <span className="text-xs text-slate-400 italic">Terminal meters cannot have child nodes.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Server size={44} className="mb-3 opacity-30" />
              <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">No node selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Select a meter or circuit from the left hierarchy tree to inspect properties, assign SCADA instruments, or map the 10 electrical parameters.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Smart Auto-Configure & Name Pattern Modal */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#131C2F] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                  <Wand2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Smart Auto-Configure via Name Patterns
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-mono font-normal">
                      Tag Matching Engine
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Matches meters and automatically binds 10 electrical parameters based on SCADA tag naming conventions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPatternModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
              
              {/* 1. Target Scope */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  1. Execution Scope
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPatternConfig(prev => ({ ...prev, scope: 'rebuild' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      patternConfig.scope === 'rebuild'
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0B1120]'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>Rebuild Entire Tree</span>
                      {patternConfig.scope === 'rebuild' && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Groups all discovered points by meter prefix and builds the distribution tree (Plant &rarr; MDB &rarr; Feeder &rarr; Meter).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPatternConfig(prev => ({ ...prev, scope: 'updateExisting' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      patternConfig.scope === 'updateExisting'
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0B1120]'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>Update Existing Tree Nodes Only</span>
                      {patternConfig.scope === 'updateExisting' && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Preserves existing hierarchy structure and searches matching points for each existing node by name.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Meter Delimiter */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Meter Prefix Delimiter
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Character separating the meter identifier from parameter name (e.g. <code className="text-indigo-500 font-mono">MTR01_KW</code> vs <code className="text-indigo-500 font-mono">MTR01.KW</code>).
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Underscore ( _ )', value: '_', example: 'MTR01_KW' },
                    { label: 'Dot ( . )', value: '.', example: 'MTR01.KW' },
                    { label: 'Hyphen ( - )', value: '-', example: 'MTR01-KW' },
                    { label: 'Colon ( : )', value: ':', example: 'MTR01:KW' },
                    { label: 'Slash ( / )', value: '/', example: 'MTR01/KW' }
                  ].map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setPatternConfig(prev => ({ ...prev, delimiter: d.value }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                        patternConfig.delimiter === d.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{d.label}</span>
                      <span className="opacity-60 text-[10px]">({d.example})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Parameter Keyword Tokens */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    3. Electrical Parameter Keyword Tokens (Comma-Separated)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPatternConfig(prev => ({ ...prev, parameterTokens: DEFAULT_PARAMETER_TOKENS }))}
                    className="text-[10px] text-indigo-500 hover:underline"
                  >
                    Reset Keywords to Defaults
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Points containing any of these keywords for a meter will automatically be bound to that parameter channel.
                </p>

                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {ELECTRICAL_PARAMETERS.map(param => (
                    <div key={param.key} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px] text-slate-800 dark:text-slate-200">
                          {param.label} <span className="text-slate-400">[{param.unit}]</span>
                        </span>
                      </div>
                      <input
                        type="text"
                        value={(patternConfig.parameterTokens[param.key] || []).join(', ')}
                        onChange={e => handleUpdateParamTokens(param.key, e.target.value)}
                        placeholder="e.g. kw, p_tot, active_power"
                        className="bg-white dark:bg-[#131C2F] border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Live Match Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye size={13} className="text-indigo-500" />
                    <span>4. Pattern Detection Preview</span>
                  </label>
                  {previewData && (
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        {previewData.detectedMeterCount} Meters Detected
                      </span>
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                        {previewData.totalMappedPointsCount} Points Matched
                      </span>
                    </div>
                  )}
                </div>

                {previewData && previewData.sampleMatches.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-1.5 px-3">Meter Identified</th>
                          <th className="py-1.5 px-3">Parameter</th>
                          <th className="py-1.5 px-3">Matching SCADA Point</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#131C2F]">
                        {previewData.sampleMatches.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                              {s.meterName}
                            </td>
                            <td className="py-1.5 px-3 text-indigo-600 dark:text-indigo-400 font-medium">
                              {s.parameter}
                            </td>
                            <td className="py-1.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {s.pointName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400">
                    No points matched the currently selected delimiter and keywords. Try changing the delimiter or keyword tokens.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <button
                type="button"
                onClick={() => setPatternConfig(DEFAULT_PATTERN_CONFIG)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Reset to Default Setup
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPatternModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPatternAutoConfig}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <Wand2 size={13} />
                  <span>Execute Auto-Configuration</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Interactive User Help Manual Modal */}
      <HelpManualModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} theme={theme} />
    </div>
  );
};
