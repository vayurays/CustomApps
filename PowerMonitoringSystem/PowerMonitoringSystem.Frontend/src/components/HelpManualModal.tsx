import React, { useState } from 'react';
import { 
  X, Search, BookOpen, Zap, TrendingUp, Activity, 
  Settings, HelpCircle, Info, Printer, Cpu, ShieldCheck, 
  Network, Database, Sliders, CheckCircle2, 
  Layers, FileSpreadsheet
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

type ManualLevel = 'basic' | 'advanced';
type BasicCategory = 'core-metrics' | 'charts' | 'views' | 'hierarchy-settings' | 'faq';
type AdvancedCategory = 'math-formulas' | 'harmonics-ieee' | 'pq-disturbances' | 'unbalance-phasors' | 'hierarchy-scada';

export const HelpManualModal: React.FC<Props> = ({ isOpen, onClose, theme = 'dark' }) => {
  const [level, setLevel] = useState<ManualLevel>('basic');
  const [basicCategory, setBasicCategory] = useState<BasicCategory>('core-metrics');
  const [advCategory, setAdvCategory] = useState<AdvancedCategory>('math-formulas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#162032] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Power Monitoring System (PMS) — User & Technical Guide
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operational guides, electrical hierarchy mapping, system settings, power quality compliance, and technical references.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Level Switcher (Basic vs Advanced) */}
            <div className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200/80 dark:bg-slate-900 text-xs font-medium mr-2">
              <button
                type="button"
                onClick={() => { setLevel('basic'); setSearchQuery(''); }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-all text-xs ${
                  level === 'basic'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen size={13} />
                <span>Basic Manual</span>
              </button>
              <button
                type="button"
                onClick={() => { setLevel('advanced'); setSearchQuery(''); }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-all text-xs ${
                  level === 'advanced'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu size={13} />
                <span>Advanced Technical</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Close Manual"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Navigation & Search */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#0F172A] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Categories for Basic */}
          {level === 'basic' ? (
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => { setBasicCategory('core-metrics'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  basicCategory === 'core-metrics' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Zap size={14} />
                <span>Core Metrics</span>
              </button>
              <button
                onClick={() => { setBasicCategory('charts'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  basicCategory === 'charts' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <TrendingUp size={14} />
                <span>Reading Dashboard Charts</span>
              </button>
              <button
                onClick={() => { setBasicCategory('views'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  basicCategory === 'views' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Activity size={14} />
                <span>Operational Features</span>
              </button>
              <button
                onClick={() => { setBasicCategory('hierarchy-settings'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  basicCategory === 'hierarchy-settings' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Network size={14} />
                <span>Hierarchy & Settings</span>
              </button>
              <button
                onClick={() => { setBasicCategory('faq'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  basicCategory === 'faq' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle size={14} />
                <span>FAQ & Alarms</span>
              </button>
            </div>
          ) : (
            /* Categories for Advanced Technical */
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => { setAdvCategory('math-formulas'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  advCategory === 'math-formulas' && !searchQuery ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Cpu size={14} />
                <span>Formulas & Phasors</span>
              </button>
              <button
                onClick={() => { setAdvCategory('harmonics-ieee'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  advCategory === 'harmonics-ieee' && !searchQuery ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Activity size={14} />
                <span>Harmonics & IEEE 519</span>
              </button>
              <button
                onClick={() => { setAdvCategory('pq-disturbances'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  advCategory === 'pq-disturbances' && !searchQuery ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Sags, Swells & ITIC</span>
              </button>
              <button
                onClick={() => { setAdvCategory('unbalance-phasors'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  advCategory === 'unbalance-phasors' && !searchQuery ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Zap size={14} />
                <span>Unbalance & Symmetrical</span>
              </button>
              <button
                onClick={() => { setAdvCategory('hierarchy-scada'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  advCategory === 'hierarchy-scada' && !searchQuery ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Database size={14} />
                <span>Rollup Math & SCADA</span>
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guide & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#111927]">

          {/* ======================================================== */}
          {/* SECTION A: BASIC OPERATIONAL MANUAL                       */}
          {/* ======================================================== */}
          {level === 'basic' && (
            <>
              {/* Category 1: Core Metrics */}
              {(basicCategory === 'core-metrics' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-amber-500">⚡</span>
                      <span>Fundamental Electrical Parameters & Operational Metrics</span>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Clear operational definitions and practical analogies for everyday plant monitoring.
                    </p>
                  </div>

                  {/* Flow Analogy */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>The Hydrodynamic Flow Concept: Voltage, Current, Power & Energy</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      To build an intuitive grasp of how electricity flows through switchboards, compare it to a pressurized water system:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-xs">Voltage (V)</div>
                        <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">Electrical Pressure</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The electromotive force pushing charge through conductors. Standard 3-phase industrial level is 415V (L-L) or 230V/240V (L-N).
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-amber-600 dark:text-amber-400 font-bold text-xs">Current (A)</div>
                        <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">Flow Rate</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The rate of electrical charge movement. Turning on additional motors or lighting banks increases current demand (Amperes).
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">Active Power (kW)</div>
                        <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">Rate of Work Done</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The actual instantaneous power converting electricity into physical torque, light, or thermal heat (1 kW = 1,000 Watts).
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-purple-600 dark:text-purple-400 font-bold text-xs">Energy (kWh)</div>
                        <div className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">Cumulative Consumption</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Total work accumulated over time (kW × hours). <b>This is the primary quantity billed on utility electricity invoices.</b>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Power Factor Analogy */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Active vs. Reactive Power & Power Factor (PF)</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Inductive equipment (induction motors, air compressors, chokes, and transformers) requires two components of alternating current:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-amber-700 dark:text-amber-300 font-bold text-xs">Active Power (kW) — Productive</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The real working power that spins shafts, drives belts, and powers computer servers.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-slate-700 dark:text-slate-300 font-bold text-xs">Reactive Power (kVAR) — Magnetizing</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Non-working power required to build and collapse the internal magnetic field in motor stator coils every AC cycle.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-blue-700 dark:text-blue-300 font-bold text-xs">Apparent Power (kVA) — Total Supplied</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The vector sum of Active and Reactive power. Cables and transformers must be sized to carry this total magnitude.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                      <div className="font-semibold">⚡ Power Factor Operational Significance</div>
                      <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/90">
                        Power Factor is the efficiency ratio: <code>PF = kW / kVA</code>. Values range from 0.00 to 1.00. Industrial targets are <b>0.95 to 0.99</b>. If PF drops below <b>0.90</b>, utilities impose severe penalty surcharges. Automatic Power Factor Correction (APFC) capacitor banks counteract this inductive demand.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 2: Reading Dashboard Charts */}
              {(basicCategory === 'charts' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-blue-500">📊</span>
                      <span>How to Read Dashboard Charts & Gauges</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">1. Active Power (kW) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Current operational real electrical demand.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">🟢 Normal: Within facility base-load profile. Spikes indicate machines idling or uncoordinated starts.</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-amber-600 dark:text-amber-400">2. Total Current (Amperes) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Aggregate conductor current flow.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">🟢 Normal: Kept under 80% of busbar or breaker continuous rating to prevent thermal degradation.</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">3. Average Voltage (Volts) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">3-Phase average line or phase voltage.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">🟢 Normal: ±5% of nominal (400V - 420V L-L). Low voltage forces induction motors to draw excess current.</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-purple-600 dark:text-purple-400">4. Power Factor (PF) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">System electrical conversion efficiency.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">🟢 Target: 0.95 - 1.00. If &lt; 0.90, check capacitor steps and contactor status on APFC panels.</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-cyan-600 dark:text-cyan-400">5. Grid Frequency (Hz) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Synchronous AC rotational frequency.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">🟢 Normal: 49.85 Hz to 50.15 Hz (for 50Hz grid). Wide swings signal grid instability or generator load hunting.</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="font-semibold text-green-600 dark:text-green-400">6. Energy Today (kWh) Card</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Daily cumulative kWh counter since 00:00:00.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Enables tracking specific energy consumption (kWh per ton or unit produced).</div>
                    </div>
                  </div>

                  {/* Demand MDI Gauge */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Capacity & Maximum Demand Indicator (MDI) Gauge</div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Tracks rolling 15-minute integrated demand against your contracted maximum demand limit:
                    </p>
                    <div className="flex items-center space-x-3 text-xs pt-1">
                      <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>0% - 75%: Optimal Reserve</span></span>
                      <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>75% - 90%: Peak Load Caution</span></span>
                      <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span>&gt; 90%: Risk of Demand Surcharge Penalty</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 3: Operational Views */}
              {(basicCategory === 'views' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-emerald-500">🧭</span>
                      <span>Application Views & Operator Workflows</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">⚡ Overview Dashboard</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Operational status overview. Shows the 8 live KPI cards, interactive 1h/8h/24h/7d trend plots, phase balance gauges, and the network hierarchy tree with upstream aggregation.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">📊 Energy Analytics View</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Evaluates energy usage profiles across Time-of-Use (TOU) tariff windows (Peak, Normal, Off-Peak). Features sub-feeder breakdown to pinpoint energy-intensive areas.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">📉 Power Quality View</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Monitors voltage sags, swells, and harmonic spectrum up to the 25th order against IEEE 519 standards.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">🔔 Alarm Management View</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Real-time alarm inbox with Critical, Warning, and Info classification. Provides acknowledgment workflows and audit trails.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 md:col-span-2 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">📄 Automated Reporting Engine</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Generates standard compliance and accounting reports (Daily Shift Log, Peak Demand Profile, IEEE 519 Compliance, Monthly Energy Audit) with CSV, Excel, and PDF export.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 4: Electrical Hierarchy, Node Mapping & Settings (NEW!) */}
              {(basicCategory === 'hierarchy-settings' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-blue-500">🏢</span>
                      <span>Electrical Network Hierarchy, Parameter Mapping & System Settings</span>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      How power distribution nodes are organized, how Modbus SCADA parameters are bound to meters, and how application settings operate.
                    </p>
                  </div>

                  {/* 6-Tier Hierarchy Tree */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <Layers size={16} className="text-blue-500" />
                      <span>The 6-Tier Electrical Network Topology</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Every electrical network in the facility is structured as a hierarchical tree. Higher-level distribution points automatically aggregate the energy and power consumption of all child equipment downstream:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-blue-600 dark:text-blue-400">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>Tier 1: Plant (Facility Root)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          The top-level site or building boundary. Aggregates all incoming mains from utility transformers, generators, and solar arrays.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span>Tier 2: MDB (Main Switchboard)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Main Distribution Board receiving utility 11kV/415V stepped-down busbars. Houses Air Circuit Breakers (ACBs).
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          <span>Tier 3: SMDB (Sub-Main Board)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Sub-Main Distribution Boards feeding individual production bays, workshops, or office blocks.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Tier 4: MCC (Motor Control Center)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Dedicated panels housing motor starters, Variable Frequency Drives (VFDs), soft starters, and HVAC chillers.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-600 dark:text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Tier 5: Feeder (Dedicated Line)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Branch breaker circuit delivering 3-phase or 1-phase power directly to a specific production line or sub-panel.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-bold text-purple-600 dark:text-purple-400">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span>Tier 6: Meter (Digital Instrument)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Multi-Function Meter (MFM) or Digital Power Analyzer with Modbus/Ethernet sampling live electrical parameters.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 10 Standard Parameter Mappings */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <Sliders size={16} className="text-emerald-500" />
                      <span>The 10 Standard Electrical Parameters Mapped to Every Meter</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      When configuring a meter in the PMS Configuration screen, up to 10 standard electrical telemetry points can be assigned:
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            <th className="py-2 px-2.5">Parameter Key</th>
                            <th className="py-2 px-2.5">Display Name</th>
                            <th className="py-2 px-2.5">Unit</th>
                            <th className="py-2 px-2.5">Operational Significance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                          <tr>
                            <td className="py-1.5 px-2.5 text-blue-600 dark:text-blue-400 font-bold">voltage</td>
                            <td className="py-1.5 px-2.5 font-sans">Voltage</td>
                            <td className="py-1.5 px-2.5">V (Volts)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">3-Phase average Line-to-Line or Line-to-Neutral potential.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-amber-600 dark:text-amber-400 font-bold">current</td>
                            <td className="py-1.5 px-2.5 font-sans">Current</td>
                            <td className="py-1.5 px-2.5">A (Amperes)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Total conductor amperage drawn by the connected machine.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-emerald-600 dark:text-emerald-400 font-bold">activePower</td>
                            <td className="py-1.5 px-2.5 font-sans">Active Power</td>
                            <td className="py-1.5 px-2.5">kW (Kilowatts)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Real power producing mechanical work, light, or heat.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-400 font-bold">reactivePower</td>
                            <td className="py-1.5 px-2.5 font-sans">Reactive Power</td>
                            <td className="py-1.5 px-2.5">kVAR</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Magnetizing power needed for induction motor windings.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-indigo-600 dark:text-indigo-400 font-bold">apparentPower</td>
                            <td className="py-1.5 px-2.5 font-sans">Apparent Power</td>
                            <td className="py-1.5 px-2.5">kVA</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Total electrical capacity required on cables and switchgear.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-purple-600 dark:text-purple-400 font-bold">powerFactor</td>
                            <td className="py-1.5 px-2.5 font-sans">Power Factor</td>
                            <td className="py-1.5 px-2.5">PF (0 - 1.00)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">System efficiency ratio (Active kW / Apparent kVA).</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-cyan-600 dark:text-cyan-400 font-bold">frequency</td>
                            <td className="py-1.5 px-2.5 font-sans">Frequency</td>
                            <td className="py-1.5 px-2.5">Hz (Hertz)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Grid synchronous frequency (nominal 50.0 Hz or 60.0 Hz).</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-green-600 dark:text-green-400 font-bold">activeEnergy</td>
                            <td className="py-1.5 px-2.5 font-sans">Active Energy</td>
                            <td className="py-1.5 px-2.5">kWh</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Accumulated consumption used for billing and accounting.</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-rose-600 dark:text-rose-400 font-bold">thdVoltage</td>
                            <td className="py-1.5 px-2.5 font-sans">Voltage THD</td>
                            <td className="py-1.5 px-2.5">% (Percent)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Total harmonic voltage distortion (IEEE 519 limit &lt; 5.0%).</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 text-orange-600 dark:text-orange-400 font-bold">thdCurrent</td>
                            <td className="py-1.5 px-2.5 font-sans">Current THD</td>
                            <td className="py-1.5 px-2.5">% (Percent)</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-500 dark:text-slate-400">Harmonic pollution created by non-linear drives/rectifiers.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Smart Auto-Configure & CSV Bulk Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auto-Configuration */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                        <Cpu size={15} className="text-purple-500" />
                        <span>Smart Auto-Configuration (1-Click Discovery)</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Eliminate manual tag-by-tag mapping. The built-in discovery engine analyzes discovered SCADA tags and automatically binds them using smart pattern matching:
                      </p>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                        <li><b>Token Matching:</b> Recognizes tags like <code>MTR_01_KW</code>, <code>FEEDER_2_V_LL</code>, <code>MAIN_KWH</code>.</li>
                        <li><b>Configurable Delimiter:</b> Supports underscore (<code>_</code>), hyphen (<code>-</code>), or dots.</li>
                        <li><b>Preview Before Applying:</b> Shows matched meters and parameters in an interactive verification dialog before committing.</li>
                        <li><b>Flexible Scope:</b> Choose between <i>"Rebuild hierarchy from discovered devices"</i> or <i>"Update existing nodes only"</i>.</li>
                      </ul>
                    </div>

                    {/* Bulk CSV Management */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-2xs">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                        <FileSpreadsheet size={15} className="text-emerald-500" />
                        <span>Bulk CSV Import & Export</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Quickly configure hundreds or thousands of meters using Microsoft Excel or CSV spreadsheet workflows:
                      </p>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                        <li><b>Download Template:</b> Get a pre-formatted CSV with all 14 standard columns: <code>ParentId, NodeId, NodeName, NodeType, DeviceName, VoltagePoint...</code></li>
                        <li><b>Bulk Import:</b> Upload your completed CSV. The system validates parent-child relationships and reports any missing nodes.</li>
                        <li><b>Full Backup Export:</b> Export the entire active electrical hierarchy to CSV at any time for disaster recovery or audits.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Settings Management & Demo Mode */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <Settings size={16} className="text-blue-500" />
                      <span>System Settings & Operational Mode Control</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <CheckCircle2 size={15} className="text-emerald-500" />
                          <span>Always "Live by Default" Architecture</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          In real-world industrial environments, displaying simulated data by accident is a safety and operational risk. PMS is engineered to <b>always default to Live Mode</b> across the frontend dashboard and backend telemetry services.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Sliders size={15} className="text-indigo-500" />
                          <span>"Enable Demo Mode" Master Setting</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Located in the Configuration screen toolbar (or through <code>/api/power-monitoring/settings</code>).
                        </p>
                        <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                          <li><b>When Disabled (Default):</b> The Demo/Live mode switcher toggle is <b>completely hidden</b> from the Dashboard and Configuration views. Operators only see real, live plant telemetry.</li>
                          <li><b>When Enabled:</b> Authorized administrators can toggle to Demo Mode for staff training, demonstrations, or testing without affecting live telemetry.</li>
                          <li><b>Database Persistence:</b> This setting is saved directly to the database in the <code>AppSettings</code> table under key <code>PowerMonitoring_Settings</code>. It persists across server restarts, browser refreshes, and applies uniformly to all connected operators.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Category 5: FAQ & Alarms */}
              {(basicCategory === 'faq' || searchQuery) && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-purple-500">❓</span>
                      <span>Frequently Asked Questions & Alarms</span>
                    </h3>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Q: Why does the system always open in Live Mode?</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      In industrial facilities, operators must always inspect the true, physical state of their distribution network. The system is designed to initialize in Live Mode on every load.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Q: How do I make the Demo Mode switch visible if I need to run a drill?</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Navigate to the <b>Configuration</b> tab, check the <b>"Enable Demo Mode"</b> box in the top toolbar, and click <b>Save Settings</b>. The Demo/Live switcher will immediately appear in the header for testing.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Q: What is the practical difference between kW and kWh?</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      <b>kW (Kilowatt)</b> represents instantaneous rate of power consumption (like vehicle speed in km/h). <b>kWh (Kilowatt-Hour)</b> represents total energy consumed over time (like odometer distance traveled in km).
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Q: Why is Phase R current significantly higher than Phases Y and B?</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      This indicates an <b>unbalanced load</b>. Single-phase loads (such as server racks, lighting circuits, or air conditioners) have been disproportionately connected to Phase R. Redistribution across all three phases is recommended to prevent neutral conductor heating and motor torque losses.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* SECTION B: ADVANCED TECHNICAL MANUAL (ENGINEERING LEVEL) */}
          {/* ======================================================== */}
          {level === 'advanced' && (
            <>
              {/* Category 1: Mathematical Formulations & Phasors */}
              {(advCategory === 'math-formulas' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-indigo-500">🔬</span>
                      <span>3-Phase Power Vectors, True PF & Mathematical Formulations</span>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Analytical definitions, power triangle vector math, and displacement vs. distortion calculations.
                    </p>
                  </div>

                  {/* Vector Mathematics */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">3-Phase Balanced Vector Formulations</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">Apparent Power (S)</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">S = √3 × V_LL × I_L</div>
                        <div className="text-slate-800 dark:text-slate-200">S = √(P² + Q²)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Units: kVA (Kilovolt-Amperes). Total vector sum supplied by transformer.</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">Active Power (P)</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">P = √3 × V_LL × I_L × cos(φ)</div>
                        <div className="text-slate-800 dark:text-slate-200">P = Σ (V_ph × I_ph × cos φ)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Units: kW (Kilowatts). Real thermodynamic / mechanical power converted.</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-amber-600 dark:text-amber-400 font-bold">Reactive Power (Q)</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">Q = √3 × V_LL × I_L × sin(φ)</div>
                        <div className="text-slate-800 dark:text-slate-200">Q = √(S² - P²)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Units: kVAR (Kilovolt-Amperes Reactive). Inductive (+) or Capacitive (-) quadrature power.</div>
                      </div>
                    </div>
                  </div>

                  {/* True PF vs Displacement PF */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">True Power Factor vs. Displacement Power Factor (DPF)</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      In the presence of non-linear loads and harmonics, the conventional <code>cos(φ)</code> is merely the <b>Displacement Power Factor (DPF)</b>. The meter calculates <b>True Power Factor</b> as:
                    </p>
                    <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-300">
                      True PF = P / S = DPF × [ 1 / √(1 + THD_I²) ]
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <b>Engineering Implication:</b> If an APFC capacitor bank corrects fundamental displacement to <code>DPF = 0.99</code>, but total current harmonic distortion is <code>THD_I = 35%</code> (common with unchoked VFDs), the <b>True PF drops to ~0.93</b>! Standard capacitor banks cannot correct distortion power factor and may fail due to harmonic resonance.
                    </p>
                  </div>
                </div>
              )}

              {/* Category 2: Harmonics & IEEE 519 */}
              {(advCategory === 'harmonics-ieee' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-indigo-500">📉</span>
                      <span>Harmonics Spectrum, IEEE 519-2022 & Transformer K-Factor</span>
                    </h3>
                  </div>

                  {/* THD Formulas */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Total Harmonic Distortion (THD) Calculations</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-rose-600 dark:text-rose-400 font-bold">Voltage THD (THD_V)</div>
                        <div className="text-slate-800 dark:text-slate-200 mt-1">THD_V = [ √(Σ(h=2..50) V_h²) / V_1 ] × 100%</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                          <b>IEEE 519 Standard Limit:</b> ≤ 5.0% for bus voltage &lt; 1kV. Maximum individual harmonic voltage must not exceed 3.0%.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-orange-600 dark:text-orange-400 font-bold">Current THD & TDD (Total Demand Distortion)</div>
                        <div className="text-slate-800 dark:text-slate-200 mt-1">TDD = [ √(Σ(h=2..50) I_h²) / I_L_max ] × 100%</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                          Calculated relative to maximum demand load current (I_L) rather than instantaneous fundamental to avoid false high percentages at light loads.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transformer K-Factor */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Transformer K-Factor & Eddy Current Losses</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Higher harmonic frequencies induce excessive eddy current heating in transformer windings proportional to <code>(h × I_h)²</code>:
                    </p>
                    <div className="p-2.5 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
                      K-Factor = Σ(h=1..50) [ I_h² × h² ] / Σ(h=1..50) [ I_h² ]
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700"><b>K-1:</b> Linear Resistive Load</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700"><b>K-4:</b> Induction Heaters, Fluorescent</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700"><b>K-13:</b> VFDs, Data Centers, Robotics</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700"><b>K-20:</b> Severe Rectifier & SCR Loads</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 3: PQ Disturbances & ITIC */}
              {(advCategory === 'pq-disturbances' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-indigo-500">🛡️</span>
                      <span>Power Quality Events (IEC 61000-4-30 Class A) & ITIC (CBEMA) Evaluation</span>
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Classification of Voltage Disturbances</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            <th className="py-2 px-3">Event Type</th>
                            <th className="py-2 px-3">Voltage Magnitude (% Un)</th>
                            <th className="py-2 px-3">Duration</th>
                            <th className="py-2 px-3">Primary Root Causes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-blue-600 dark:text-blue-400">Voltage Sag (Dip)</td>
                            <td className="py-2 px-3">10% - 90%</td>
                            <td className="py-2 px-3">10 ms to 1 minute</td>
                            <td className="py-2 px-3">Large motor direct-on-line start, utility line fault, recloser operation.</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">Voltage Swell</td>
                            <td className="py-2 px-3">110% - 180%</td>
                            <td className="py-2 px-3">10 ms to 1 minute</td>
                            <td className="py-2 px-3">Sudden disconnection of major industrial load, ground fault on adjacent phase.</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-purple-600 dark:text-purple-400">Transient (Spike)</td>
                            <td className="py-2 px-3">&gt; 180% to several kV</td>
                            <td className="py-2 px-3">&lt; 10 ms (microsecond range)</td>
                            <td className="py-2 px-3">Capacitor bank switching, lightning strikes, inductive load de-energization.</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">Interruption</td>
                            <td className="py-2 px-3">&lt; 10%</td>
                            <td className="py-2 px-3">&gt; 10 ms</td>
                            <td className="py-2 px-3">Circuit breaker trip, bus transfer failure, transmission line trip.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ITIC Curve */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">ITIC (CBEMA) Curve Immunity Envelope</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      The Power Quality View maps every detected disturbance event dot on duration vs. remaining voltage axes:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                        <b>Green Zone:</b> Equipment continues normal operation (power supply internal holdup capacitor sustains DC bus).
                      </div>
                      <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                        <b>Marginal Zone:</b> Drive undervoltage ride-through activates; potential PLC digital input flicker.
                      </div>
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300">
                        <b>Prohibited Red Zone:</b> Hardware shutdown, drive lockouts, or semiconductor damage.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 4: Symmetrical Components & Unbalance */}
              {(advCategory === 'unbalance-phasors' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-indigo-500">⚡</span>
                      <span>Symmetrical Components (Fortescue) & Voltage/Current Unbalance Factor</span>
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Fortescue Transformation for 3-Phase Systems</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Any unbalanced 3-phase set of phasors is mathematically decomposed into 3 symmetrical balanced components using operator <code>a = e^(j 120°) = -0.5 + j 0.866</code>:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">Positive Sequence (V_1)</div>
                        <div className="text-slate-800 dark:text-slate-200 mt-1">V_1 = 1/3 [ V_R + a·V_Y + a²·V_B ]</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">Normal forward rotating magnetic field driving the motor rotor in forward direction.</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-rose-600 dark:text-rose-400 font-bold">Negative Sequence (V_2)</div>
                        <div className="text-slate-800 dark:text-slate-200 mt-1">V_2 = 1/3 [ V_R + a²·V_Y + a·V_B ]</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">Counter-rotating field at double slip frequency (100Hz). Causes severe motor rotor heating and torque loss.</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="text-purple-600 dark:text-purple-400 font-bold">Zero Sequence (V_0)</div>
                        <div className="text-slate-800 dark:text-slate-200 mt-1">V_0 = 1/3 [ V_R + V_Y + V_B ]</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">Flows equally in all 3 phases and returns directly through the neutral conductor: I_N = 3 · I_0.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Voltage Unbalance Factor (VUF) & NEMA Derating Factor</div>
                    <div className="p-2.5 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-300">
                      VUF (%) = [ |V_negative| / |V_positive| ] × 100%
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <b>Motor Engineering Warning:</b> A mere <b>2% Voltage Unbalance</b> induces approximately <b>12% to 15% Current Unbalance</b>, resulting in a 25% temperature rise in motor stator windings. Per NEMA MG-1 standards, induction motors must be derated when VUF exceeds 1.0%.
                    </p>
                  </div>
                </div>
              )}

              {/* Category 5: Hierarchy Rollup Math & SCADA Telemetry Architecture */}
              {(advCategory === 'hierarchy-scada' || searchQuery) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-indigo-500">⚙️</span>
                      <span>Hierarchy Rollup Math, Modbus Telemetry & Settings Persistence Architecture</span>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Mathematical proofs for topological rollups, high-speed telemetry ingestion, DAG validation, and database storage.
                    </p>
                  </div>

                  {/* Rollup Mathematics */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                      <Network size={16} className="text-indigo-500" />
                      <span>Topological Parent-Child Rollup Vector Formulations</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      When power flows through an electrical branch, parent switchgear nodes (Plant, MDB, SMDB, MCC) aggregate real, reactive, and apparent energy according to conservation of energy:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">Active Power & Energy Rollup</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">P_parent = Σ(k=1..n) P_child,k</div>
                        <div className="text-slate-800 dark:text-slate-200">E_parent(t) = Σ(k=1..n) E_child,k(t)</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                          Linear scalar sum of all real thermodynamic work performed by downstream sub-feeders and motors.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-amber-600 dark:text-amber-400 font-bold">Reactive Power Rollup</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">Q_parent = Σ(k=1..n) Q_child,k</div>
                        <div className="text-slate-800 dark:text-slate-200">Q_net = Q_inductive - Q_capacitive</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                          Algebraic sum accounting for capacitor bank negative VAR cancellation against motor inductive VARs.
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">Apparent Power Vector Sum</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">S_parent = √[ (Σ P_k)² + (Σ Q_k)² ]</div>
                        <div className="text-rose-500 dark:text-rose-400 text-[10px] font-sans">
                          <b>Critical:</b> Apparent power is NOT the scalar sum of sub-meter kVAs due to differing phase angles!
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <div className="text-purple-600 dark:text-purple-400 font-bold">Aggregate Node Power Factor</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">PF_parent = P_parent / S_parent</div>
                        <div className="text-slate-800 dark:text-slate-200">PF_parent = cos[ arctan(Q_parent / P_parent) ]</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                          True synthesized power factor representing overall electrical health at the upstream busbar.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modbus & SCADA Register Ingestion */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Modbus RTU/TCP Ingestion & Register Byte Formats</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Field meters communicate via RS-485 serial networks (Modbus RTU) or Ethernet LANs (Modbus TCP). The telemetry engine reads holding registers using Function Codes 03/04:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="font-bold text-blue-600 dark:text-blue-400">IEEE 754 32-Bit Floating Point Formats</div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          Most modern multi-function meters encode measurements across two consecutive 16-bit registers:
                        </p>
                        <ul className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                          <li><b>Big-Endian (ABCD):</b> High-order word first, standard in Schneider PM5000 / PM8000 series.</li>
                          <li><b>Word-Swapped (CDAB):</b> Low-order word first, standard in Socomec Diris and Selec meters.</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">Scaled Integer with CT/PT Transformation</div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          High-voltage meters report raw secondary values requiring ratio multiplication:
                        </p>
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px] text-slate-800 dark:text-slate-200 mt-1">
                          V_primary = V_secondary × (PT_primary / PT_secondary)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Architecture & AppSettings Database Persistence */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <Database size={16} className="text-indigo-500" />
                      <span>Database Storage, AppSettings Entity & REST Endpoints</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      System settings (including Demo Mode visibility) and hierarchy configurations are stored durably in the backend relational store:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">AppSettings Key: PowerMonitoring_Settings</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Serialized as atomic JSON within the database:
                        </p>
                        <pre className="p-2 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-mono text-slate-800 dark:text-slate-200 mt-1 overflow-x-auto">
{`{
  "enableDemoMode": false,
  "defaultMode": "live",
  "refreshIntervalSeconds": 5,
  "contractDemandKw": 1500.0,
  "voltageTolerancePercent": 5.0,
  "frequencyToleranceHz": 0.2
}`}
                        </pre>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#162032] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="font-bold text-blue-600 dark:text-blue-400">Settings API Endpoints</div>
                        <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 mt-1">
                          <li><code>GET /api/power-monitoring/settings</code>: Fetches active configuration flags.</li>
                          <li><code>POST /api/power-monitoring/settings</code>: Updates settings transactionally and broadcasts change event via WebSockets.</li>
                          <li><code>GET /api/power-monitoring/hierarchy</code>: Returns complete multi-tier network tree with rollup statistics.</li>
                          <li><code>POST /api/power-monitoring/hierarchy</code>: Saves validated hierarchy DAG.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131C2F] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Info size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Complete technical documentation is also maintained in <code>USER_HELP_GUIDE.md</code>.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
