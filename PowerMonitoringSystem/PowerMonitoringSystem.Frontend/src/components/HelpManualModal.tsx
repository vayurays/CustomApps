import React, { useState } from 'react';
import { 
  X, Search, BookOpen, Zap, TrendingUp, Activity, 
  Settings, HelpCircle, Info, Printer
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type HelpCategory = 'basics' | 'charts' | 'views' | 'admin' | 'faq';

export const HelpManualModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>('basics');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#111927] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#162032] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Power Monitoring System (PMS) — User Help Guide</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">Layman Edition</span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand electricity metrics, read charts with confidence, avoid penalty surcharges, and troubleshoot alarms.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Close Manual"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar & Category Navigation */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-[#0F172A] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Categories */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setActiveCategory('basics'); setSearchQuery(''); }}
              className={'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (activeCategory === 'basics' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}
            >
              <Zap size={14} />
              <span>Electricity Basics</span>
            </button>
            <button
              onClick={() => { setActiveCategory('charts'); setSearchQuery(''); }}
              className={'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (activeCategory === 'charts' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}
            >
              <TrendingUp size={14} />
              <span>Reading Charts</span>
            </button>
            <button
              onClick={() => { setActiveCategory('views'); setSearchQuery(''); }}
              className={'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (activeCategory === 'views' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}
            >
              <Activity size={14} />
              <span>Features & Views</span>
            </button>
            <button
              onClick={() => { setActiveCategory('admin'); setSearchQuery(''); }}
              className={'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (activeCategory === 'admin' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}
            >
              <Settings size={14} />
              <span>Setup & Modes</span>
            </button>
            <button
              onClick={() => { setActiveCategory('faq'); setSearchQuery(''); }}
              className={'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (activeCategory === 'faq' && !searchQuery ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')}
            >
              <HelpCircle size={14} />
              <span>FAQ & Alarms</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">

          {/* TAB 1: ELECTRICITY BASICS */}
          {(activeCategory === 'basics' || searchQuery) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-amber-400">⚡</span>
                  <span>1. Electrical Concepts in Plain English (No Engineering Degree Needed)</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Understanding what the numbers on the screen mean using everyday analogies.
                </p>
              </div>

              {/* Water Pipe Analogy */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="font-semibold text-white text-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>The Water Pipe Analogy: Voltage, Current & Power</span>
                </div>
                <p className="text-slate-300">
                  Imagine electricity flowing like water through pipes into your building:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-blue-400 font-bold text-xs">Voltage (V)</div>
                    <div className="text-white font-semibold text-xs mt-0.5">Water Pressure</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      How hard electricity is pushed through wires. Typically 415V (Phase-to-Phase) or 230V/240V (to Neutral).
                    </p>
                  </div>
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-bold text-xs">Current (A)</div>
                    <div className="text-white font-semibold text-xs mt-0.5">Water Flow Rate</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      How much electricity physically flows every second. More machines running = higher current (Amps).
                    </p>
                  </div>
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold text-xs">Active Power (kW)</div>
                    <div className="text-white font-semibold text-xs mt-0.5">Water Wheel Turning</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The real, productive work being done right now. 1 kW = 1,000 Watts (e.g. running a 1-ton AC uses ~1.2 kW).
                    </p>
                  </div>
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-purple-400 font-bold text-xs">Energy (kWh)</div>
                    <div className="text-white font-semibold text-xs mt-0.5">Total Water Used</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cumulative power consumed over time (kW × Hours). <b>This is the exact number your utility bills you for!</b>
                    </p>
                  </div>
                </div>
              </div>

              {/* Beer Mug Analogy */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="font-semibold text-white text-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>The Beer Mug Analogy: Active vs Reactive Power & Power Factor</span>
                </div>
                <p className="text-slate-300">
                  When electricity powers machines with magnetic coils (motors, pumps, transformers), not all electricity does physical work. Some is needed to create magnetic fields:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-amber-300 font-bold text-xs">🍺 Liquid Beer = Active Power (kW)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The real drink you enjoy! This is the real working power that spins conveyor belts and illuminates lights.
                    </p>
                  </div>
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-slate-300 font-bold text-xs">☁️ Foam / Froth = Reactive Power (kVAR)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      You cannot drink the foam, but you cannot pour a draft beer without it! Motors require this to sustain magnetic fields.
                    </p>
                  </div>
                  <div className="p-3 bg-[#162032] rounded-lg border border-slate-800">
                    <div className="text-blue-300 font-bold text-xs">🥛 Whole Glass = Apparent Power (kVA)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The total volume (beer + foam) that the utility company must supply through their transformers and cables.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
                  <div className="font-semibold">⚠️ Why is Power Factor (PF) So Important?</div>
                  <p className="mt-0.5 text-[11px] text-amber-300/90">
                    Power Factor is the ratio of liquid beer to the whole glass. <b>1.00 is perfect (zero foam).</b> If your PF drops below <b>0.90</b>, your utility company will hit you with <b>heavy monthly surcharge penalties</b>! Maintain capacitor banks (APFC) to keep PF above 0.95.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: READING CHARTS */}
          {(activeCategory === 'charts' || searchQuery) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-blue-400">📊</span>
                  <span>2. How to Read Every Chart & Gauge on the Dashboard</span>
                </h3>
              </div>

              {/* 8 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-blue-400">1. Active Power (kW)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Real electrical load working right now.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Normal: Within your contracted demand. If high, check for machines left idling.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-amber-400">2. Total Current (Amps)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Total flow of electrical charge through cables.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Normal: Well below circuit breaker rating. If near 100%, cables will overheat.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400">3. Average Voltage (Volts)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Supply voltage across phases.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Normal: 400V - 420V (L-L) or 230V - 240V (L-N). Low voltage causes extra current draw.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-purple-400">4. Power Factor (PF)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Electrical efficiency ratio (0.00 to 1.00).</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Target: 0.95 - 1.00. If <b>below 0.90</b>, turn ON capacitor banks to avoid fines.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-cyan-400">5. Frequency (Hz)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Speed of grid generator rotation.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Normal: 49.8 Hz to 50.2 Hz (50Hz grid). Wide swings indicate power grid instability.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-green-400">6. Energy Today (kWh)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Cumulative electricity consumed since midnight.</div>
                  <div className="text-[11px] text-slate-400 mt-1">Compare against daily production units to calculate energy cost per product made.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-rose-400">7. THD Voltage (%)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Distortion in voltage wave.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Target: Below 5.0% (IEEE 519). High THD causes sensitive PLCs to reboot.</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-orange-400">8. THD Current (%)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Harmonic current distortion from non-linear loads.</div>
                  <div className="text-[11px] text-slate-400 mt-1">🟢 Target: &lt; 10% - 15%. If high, active harmonic filters may be needed.</div>
                </div>
              </div>

              {/* Demand Gauge & 3-Phase */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-semibold text-white text-sm">Capacity & Demand Gauge (MDI Tracker)</div>
                <p className="text-slate-300 text-xs">
                  Tracks your <b>Maximum Demand Indicator (MDI)</b>. The utility measures the highest 15-minute power spike in the month:<br/>
                  - 🟢 0% - 75%: Safe Normal.<br/>
                  - 🟡 75% - 90%: Approaching Limit. Avoid starting large motors simultaneously.<br/>
                  - 🔴 &gt; 90%: Danger of Demand Surcharge Penalties!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & VIEWS */}
          {(activeCategory === 'views' || searchQuery) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-emerald-400">🧭</span>
                  <span>3. Navigating the 5 Core Feature Views</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">⚡ 1. Overview Dashboard</div>
                  <p className="text-xs text-slate-300">
                    Real-time operations center. Features 8 KPI cards, demand gauge, live trends, and distribution tree scoping. Selecting any parent board sums up power from all child meters automatically!
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">📊 2. Energy Analytics View</div>
                  <p className="text-xs text-slate-300">
                    Breaks down energy costs by <b>Time-of-Use (TOU)</b> tariff bands (Peak, Normal, Off-Peak). Shows department/feeder splits so you know which machine is consuming the most power.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">📉 3. Power Quality (PQ) View</div>
                  <p className="text-xs text-slate-300">
                    Tracks voltage disturbances (Sags & Swells) that cause machines to crash. Displays harmonic spectrum bars up to the 25th order and IEEE 519 compliance thresholds.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">🔔 4. Alarm Management View</div>
                  <p className="text-xs text-slate-300">
                    Real-time electrical alert triage. Filter by Critical, Warning, or Info. Operators can click <b>Acknowledge</b> to sign off alarms and record corrective maintenance comments.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 md:col-span-2">
                  <div className="font-bold text-white text-sm">📄 5. Automated Reporting Engine</div>
                  <p className="text-xs text-slate-300">
                    Select from pre-built templates (Daily Energy, Peak Demand Profile, IEEE 519 Compliance, Monthly Cost Audit). Generate on-screen reports and export to <b>CSV, Excel, or PDF</b>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP & MODES */}
          {(activeCategory === 'admin' || searchQuery) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-indigo-400">⚙️</span>
                  <span>4. System Configuration, Live vs Demo Mode</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400">Live Mode (Default Always)</div>
                  <p className="text-slate-300 mt-1">
                    PMS <b>always loads in Live Mode by default</b>. Telemetry flows in real time directly from physical meters installed across your plant.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="font-semibold text-amber-400">Demo Mode (Training & Simulation)</div>
                  <p className="text-slate-300 mt-1">
                    Controlled by the <b>"Enable Demo Mode"</b> setting in Configuration. When disabled, the Demo/Live switcher is hidden to prevent operator confusion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & TROUBLESHOOTING */}
          {(activeCategory === 'faq' || searchQuery) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-purple-400">❓</span>
                  <span>5. Frequently Asked Questions & Troubleshooting</span>
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-xs sm:text-sm">Q: Why is my Power Factor showing in Amber or Red?</div>
                  <p className="text-xs text-slate-300 mt-1">
                    <b>A:</b> Your Power Factor is below 0.90 or 0.95. Your facility is drawing excessive reactive "foam" power. <b>Action:</b> Have maintenance inspect your APFC capacitor banks immediately.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-xs sm:text-sm">Q: What is the difference between kW and kWh?</div>
                  <p className="text-xs text-slate-300 mt-1">
                    <b>A:</b> <b>kW</b> is the <i>speedometer</i> (how fast electricity is being consumed right now). <b>kWh</b> is the <i>odometer</i> (the total energy consumed over time that appears on your bill).
                  </p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-xs sm:text-sm">Q: What should I do when an alarm rings?</div>
                  <p className="text-xs text-slate-300 mt-1">
                    <b>A:</b> Go to the <b>Alarms</b> tab. Read the trigger message. If it is <b>Critical</b> (Red), notify the electrical technician on duty. Click <b>Acknowledge</b> and type a brief note.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#131C2F] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Info size={14} className="text-blue-400" />
            <span>Need full technical documentation? Check <code>USER_HELP_GUIDE.md</code> in project root.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors shadow-xs"
          >
            Got It, Close Help
          </button>
        </div>

      </div>
    </div>
  );
};
