# Power Monitoring System (PMS) — Comprehensive User & Technical Reference Manual

---

## Document Overview

This manual provides complete operational and technical documentation for the **Power Monitoring System (PMS)**, organized into two comprehensive sections:

1. **Part 1: Basic Operational Guide**: Designed for plant operators, shift supervisors, maintenance teams, and facility managers. Focuses on intuitive concepts, daily operational workflows, understanding live KPI cards, monitoring peak demand, managing alarms, understanding electrical hierarchy mapping, configuring system settings, and generating compliance reports.
2. **Part 2: Advanced Technical Engineering Manual**: Designed for electrical engineers, power quality specialists, plant electrical heads, and energy auditors. Focuses on analytical vector formulations, True vs. Displacement Power Factor, IEEE 519-2022 harmonic limits, transformer K-Factor calculations, symmetrical components (Fortescue transformation), voltage unbalance derating factors, sliding window MDI algorithms, topological hierarchy rollup mathematics, Modbus SCADA register encoding, and backend settings persistence architecture.

---

# PART 1: BASIC OPERATIONAL GUIDE

## 1. Introduction: Purpose & Value of PMS

The **Power Monitoring System (PMS)** provides real-time visibility into the electrical distribution infrastructure of your commercial or industrial facility. It measures, aggregates, and logs electrical parameters across main incomers, medium-voltage substations, main distribution boards (MDBs), motor control centers (MCCs), and individual feeder meters.

### Core Operational Objectives
1. **Cost Optimization**: Eliminate electricity waste during high-rate Time-of-Use (TOU) tariff windows.
2. **Asset Protection**: Prevent thermal damage to transformers, cables, and motors caused by sustained overcurrent or excessive harmonics.
3. **Regulatory & Utility Compliance**: Avoid monthly penalty surcharges on electricity bills by keeping Power Factor above 0.95 and keeping maximum demand within contracted limits.
4. **Rapid Fault Triage**: Pinpoint the precise phase, sub-board, and millisecond timestamp when electrical disturbances or breaker trips occur.

---

## 2. Fundamental Electrical Parameters

### The Hydrodynamic Flow Concept: Voltage, Current, Power & Energy
To understand electricity intuitively without complex math, compare electrical flow to a pressurized water system:

| Parameter | Unit | Physical Analogy | Operational Interpretation |
| :--- | :---: | :--- | :--- |
| **Voltage (V)** | **Volts** | Water Pressure in the pipe | The electromotive force pushing charge through the cable. Standard 3-phase levels are 415V (Phase-to-Phase) or 230V/240V (Phase-to-Neutral). |
| **Current (I)** | **Amperes (A)** | Water Flow Rate through the pipe | The volume of electrical charge moving every second. Running more machinery draws higher current. |
| **Active Power (P)** | **Kilowatts (kW)** | Work Done by the water wheel | The real, instantaneous rate of useful work (torque, heat, or illumination). 1 kW = 1,000 Watts. |
| **Energy (E)** | **Kilowatt-Hours (kWh)** | Total Water Collected in the tank | Cumulative work over time (Power × Duration). **This is the primary quantity billed on utility invoices.** |

---

### Active vs. Reactive Power & Power Factor (PF)
Alternating current (AC) machinery with magnetic coils (motors, compressors, pumps, and transformers) draws two kinds of power:

1. **Active Power (kW)**: The productive power converting electrical energy into mechanical movement or light.
2. **Reactive Power (kVAR)**: Non-working power required to build and sustain the alternating magnetic fields inside coils.
3. **Apparent Power (kVA)**: The total vector sum of Active and Reactive power. The electric utility must supply this total capacity through their transmission lines and transformers.

#### Power Factor (PF) Importance
$$\text{Power Factor (PF)} = \frac{\text{Active Power (kW)}}{\text{Apparent Power (kVA)}}$$

- **1.00 (Unity / Ideal)**: 100% of supplied electricity is performing real work.
- **0.95 to 0.99 (Optimal Industrial Standard)**: Efficient, compliant operation.
- **Below 0.90 (Suboptimal / Penalty Zone)**: The distribution system is carrying excessive reactive current. Utilities impose heavy monthly surcharge penalties. Automatic Power Factor Correction (APFC) capacitor banks are used to counteract inductive demand and restore PF above 0.95.

---

## 3. Screen Layout & Navigation

The interface provides an intuitive layout organized into four zones:

```
+-----------------------------------------------------------------------------------------+
| [PMS]  Plant Overview > Main Distribution Board (MDB-01)        [Live Mode] [19:45:12] ⚙ |  <-- Header
+-----------+-----------------------------------------------------------------------------+
| 📊 Overview|                                                                             |
| ⚡ Energy   |                           MAIN DASHBOARD WORKSPACE                          |
| 📉 Quality  |                  (Cards, Gauges, Live Trends & Charts)                     |
| 🔔 Alarms   |                                                                             |
| 📄 Reports  |                                                                             |
| ⚙ Settings |                                                                             |
| ❓ Help    |                                                                             |
+-----------+-----------------------------------------------------------------------------+
```

### Navigation Components
- **Top Header Bar**: Shows breadcrumb navigation (current selected board/meter), Live Mode status indicator, background WebSocket connectivity (`LIVE WS`), system clock, Help Manual access button, and theme switcher (Dark / Light).
- **Left Navigation Menu**: Provides 1-click access to the primary application views (Overview, Energy, Quality, Alarms, Reports), along with the Help button and Admin Settings.
- **Network Hierarchy Sidebar**: Displays the plant distribution tree. Selecting any parent board automatically sums up power and energy from all downstream sub-meters.

---

## 4. Reading Dashboard Charts & Visualizations

### The 8 Live KPI Cards
1. **Active Power (kW)**: Real electrical load currently drawn. Normal: Within facility base-load design.
2. **Total Current (A)**: Conductor current flow. Normal: Below 80% continuous breaker rating.
3. **Average Voltage (V)**: 3-Phase average supply voltage. Normal: 400V - 420V (L-L).
4. **Power Factor (PF)**: System electrical conversion efficiency. Target: 0.95 - 1.00.
5. **Frequency (Hz)**: Grid rotational speed. Normal: 49.85 Hz to 50.15 Hz (50Hz grid).
6. **Energy Today (kWh)**: Cumulative energy since midnight (00:00:00).
7. **THD Voltage (%)**: Voltage waveform distortion. Target: < 5.0% (IEEE 519 standard).
8. **THD Current (%)**: Harmonic current distortion from non-linear loads. Target: < 10% - 15%.

### Capacity & Demand Gauge (MDI Tracker)
- Tracks the rolling **15-minute Maximum Demand Indicator (MDI)** against contracted capacity:
  - 🟢 **0% - 75% (Green)**: Optimal reserve margin.
  - 🟡 **75% - 90% (Yellow)**: High demand caution. Avoid starting large motors simultaneously.
  - 🔴 **> 90% (Red Alert)**: Risk of exceeding contracted demand and incurring peak demand penalties.

---

## 5. Primary Application Views

### 1. Overview Dashboard
Central operations hub displaying real-time aggregated metrics for the selected branch, 1h/8h/24h trend charts, and 3-phase balance status.

### 2. Energy Analytics
Deep dive into historical consumption, peak vs. off-peak Time-of-Use (TOU) allocations, and feeder-by-feeder energy breakdown.

### 3. Power Quality
Monitors voltage sags, swells, harmonic spectrum up to the 25th order, and compliance with IEEE 519 standards.

### 4. Alarm Management
Inbox of all critical system warnings (overvoltage, overload, low PF, high THD) with priority badges and acknowledgment workflows.

### 5. Automated Reporting Engine
Generate executive summaries, daily shift logs, and IEEE 519 compliance reports in CSV, Excel, and PDF formats.

---

## 6. Electrical Network Hierarchy & Parameter Mapping

### The 6-Tier Hierarchy Tree Architecture
The PMS organizes the facility's power network into a 6-tier tree structure reflecting physical switchgear topology:

```
[ Tier 1: Plant ]             --> Entire facility / substation incomer
       │
[ Tier 2: MDB ]               --> Main Distribution Boards (Busbars, ACBs)
       │
[ Tier 3: SMDB ]              --> Sub-Main Distribution Boards (Shop floor, bays)
       │
[ Tier 4: MCC ]               --> Motor Control Centers (Starters, VFDs)
       │
[ Tier 5: Feeder ]            --> Dedicated feeder breaker lines
       │
[ Tier 6: Meter ]             --> Digital multi-function power meters
```

1. **Plant (Tier 1)**: Top-level site boundary. Aggregates all incoming mains from utility grids, transformers, diesel generators, and solar PV arrays.
2. **MDB - Main Distribution Board (Tier 2)**: Primary switchgear receiving stepped-down 415V power. Houses main Air Circuit Breakers (ACBs).
3. **SMDB - Sub-Main Distribution Board (Tier 3)**: Feeds major production departments, fabrication halls, or multi-story buildings.
4. **MCC - Motor Control Center (Tier 4)**: Centralized panel containing motor starters, variable speed drives, and automation contactors for heavy loads (compressors, pumps, blowers).
5. **Feeder (Tier 5)**: Dedicated cabling and breaker line supplying power to an individual manufacturing line or equipment cluster.
6. **Meter (Tier 6)**: Digital Multi-Function Meter (MFM) sampling raw analog voltages and currents via CTs/PTs and transmitting Modbus telemetry.

---

### The 10 Monitored Electrical Parameters
Every digital meter in the PMS hierarchy can be mapped to up to 10 standard telemetry parameters:

| Parameter Key | Display Name | Standard Unit | Operational Meaning & Monitoring Role |
| :--- | :--- | :---: | :--- |
| `voltage` | Voltage | **V** | 3-Phase average Line-to-Line (415V) or Line-to-Neutral (230V) potential. |
| `current` | Current | **A** | Total aggregate amperage drawn by the branch circuit conductors. |
| `activePower` | Active Power | **kW** | Real working electrical power converting into mechanical torque or heat. |
| `reactivePower` | Reactive Power | **kVAR** | Magnetizing quadrature power required for AC electromagnetic fields. |
| `apparentPower` | Apparent Power | **kVA** | Total electrical capacity demand carried by switchgear and transformers. |
| `powerFactor` | Power Factor | **PF** | Efficiency ratio (kW / kVA). Industrial benchmark is 0.95 to 1.00. |
| `frequency` | Frequency | **Hz** | Rotational speed of the electrical grid (nominal 50.0 Hz or 60.0 Hz). |
| `activeEnergy` | Active Energy | **kWh** | Cumulative energy counter used for billing, cost allocation, and audits. |
| `thdVoltage` | Voltage THD | **%** | Total harmonic voltage distortion (IEEE 519 acceptable limit < 5.0%). |
| `thdCurrent` | Current THD | **%** | Harmonic pollution generated by non-linear loads (rectifiers, VFDs). |

---

### Smart Auto-Configuration (1-Click Discovery)
Manual parameter-by-parameter binding is time-consuming for large plants. The PMS includes a **Smart Auto-Configuration Engine**:

- **Pattern Matching**: Automatically scans discovered SCADA tags and identifies meter names and parameter tokens using configurable delimiters (e.g. `_` or `-`).
- **Default Token Dictionaries**:
  - *Voltage*: `v_ll`, `v_ln`, `vry`, `vyb`, `vbr`, `voltage`, `volt`, `v`
  - *Current*: `curr`, `current`, `amp`, `amps`, `i_r`, `i_y`, `i_b`
  - *Active Power*: `act_pwr`, `active_power`, `p_tot`, `p_kw`, `kw`, `w`
  - *Reactive Power*: `react_pwr`, `reactive_power`, `q_tot`, `p_kvar`, `kvar`
  - *Power Factor*: `power_factor`, `p_factor`, `cosphi`, `pf`
  - *Frequency*: `frequency`, `freq`, `hz`
  - *Active Energy*: `active_energy`, `total_energy`, `tot_kwh`, `kwh`
  - *THD*: `thd_v`, `thd_u`, `thd_i`, `thd_ir`
- **Preview Modal**: Displays the detected meters and mapped points for verification before applying changes to the live system.
- **Configurable Scope**: Supports *Rebuild hierarchy from discovered devices* or *Update existing nodes only* without changing tree topology.

---

### Bulk CSV Configuration (Import / Export)
For engineering teams managing hundreds or thousands of meters across complex facilities:

1. **Download CSV Template**: Exports a standardized 14-column spreadsheet:
   ```csv
   ParentId,NodeId,NodeName,NodeType,DeviceName,VoltagePoint,CurrentPoint,ActivePowerPoint,ReactivePowerPoint,PowerFactorPoint,FrequencyPoint,ActiveEnergyPoint,THDVoltagePoint,THDCurrentPoint
   ```
2. **Bulk Editing in Excel**: Populate meters, assign parent IDs to build the switchgear tree, and map SCADA register tags using Excel formulas or copy-paste.
3. **Import Hierarchy**: Upload the completed CSV. The system performs automated graph validation (verifying parent IDs and preventing circular dependencies) before committing.
4. **Full Backup Export**: Export the live hierarchy to CSV at any time for disaster recovery, audit documentation, or cloning across plant sites.

---

## 7. System Settings & Operational Mode Control

### Always "Live by Default" Architecture
In mission-critical industrial electrical systems, operators and technicians must never be misled by simulated numbers. Therefore:
- The PMS is engineered to **always initialize in Live Mode** upon every page load, application launch, and session start.
- All backend REST controllers and telemetry services default their data mode to `"live"`.

### "Enable Demo Mode" Master Setting
To prevent confusion during routine plant operations while still accommodating staff training drills:
- **Default State**: "Enable Demo Mode" is **disabled** out of the box.
- **UI Behavior**: When disabled, the **Demo/Live mode toggle is completely hidden** from the Dashboard header and navigation bars. Operators interact exclusively with real plant meters.
- **Training Mode**: When authorized personnel need to conduct drills, demonstrations, or interface testing, an administrator navigates to **Configuration**, ticks **"Enable Demo Mode"**, and clicks **Save Settings**. The mode switcher immediately becomes visible.
- **Database Persistence**: Settings are durably stored in the database (`AppSettings` table under key `PowerMonitoring_Settings`). Settings persist across server reboots, application upgrades, and synchronize across all operator workstations in real time.

---

## 8. Frequently Asked Questions & Operational Alarms

### Q: Why does the system always open in Live Mode?
**A**: In industrial facilities, operators must always inspect the true, physical state of their distribution network. The system is designed to initialize in Live Mode on every load to ensure operational safety.

### Q: How do I make the Demo Mode switch visible if I need to run a drill?
**A**: Navigate to the **Configuration** view, check the **"Enable Demo Mode"** box in the top toolbar, and click **Save Settings**. The Demo/Live switcher will immediately appear in the header.

### Q: What is the practical difference between kW and kWh?
**A**: **kW (Kilowatt)** is the instantaneous rate of power consumption (like a vehicle's speedometer reading in km/h). **kWh (Kilowatt-Hour)** is the cumulative energy consumed over time (like the odometer reading in km). Utility companies bill based on total kWh consumed and peak kVA/kW demand reached.

### Q: Why is Phase R current significantly higher than Phases Y and B?
**A**: This indicates an **unbalanced load**. Single-phase loads (such as server racks, lighting circuits, or air conditioners) have been disproportionately connected to Phase R. Redistribution across all three phases is recommended to prevent neutral conductor heating and motor torque losses.

---

# PART 2: ADVANCED TECHNICAL ENGINEERING MANUAL

## 1. 3-Phase Vector Formulations & True Power Factor

### Balanced 3-Phase Power Vectors
In balanced 3-phase alternating current systems:

$$\text{Apparent Power } (S) = \sqrt{3} \cdot V_{\text{LL}} \cdot I_L = \sqrt{P^2 + Q^2} \quad [\text{kVA}]$$
$$\text{Active Power } (P) = \sqrt{3} \cdot V_{\text{LL}} \cdot I_L \cdot \cos(\varphi) = \sum_{i=1}^3 V_{\text{ph}, i} \cdot I_{\text{ph}, i} \cdot \cos(\varphi_i) \quad [\text{kW}]$$
$$\text{Reactive Power } (Q) = \sqrt{3} \cdot V_{\text{LL}} \cdot I_L \cdot \sin(\varphi) = \sqrt{S^2 - P^2} \quad [\text{kVAR}]$$

---

### True Power Factor vs. Displacement Power Factor (DPF)
In modern power networks with non-linear loads (Variable Frequency Drives, UPS systems, LED drivers, and switch-mode power supplies), current waveforms are non-sinusoidal.

$$\text{Displacement Power Factor (DPF)} = \cos(\varphi_1)$$

Where $\varphi_1$ is the phase displacement angle between fundamental voltage and fundamental current waveforms.

$$\text{True Power Factor} = \frac{P}{S} = \frac{P_1}{\sqrt{P_1^2 + Q_1^2 + D^2}} = \text{DPF} \cdot \frac{1}{\sqrt{1 + \text{THD}_I^2}}$$

Where $D$ is the Distortion Reactive Power resulting from harmonic currents.

> **Engineering Implication**: Even if an Automatic Power Factor Correction (APFC) capacitor bank corrects fundamental displacement to $\text{DPF} = 0.99$, if the total current harmonic distortion is $\text{THD}_I = 35\%$ (typical for 6-pulse unchoked VFDs), the **True Power Factor cannot exceed 0.93**! Standard capacitor banks cannot correct harmonic distortion and risk catastrophic parallel resonance.

---

## 2. Harmonics Spectrum, IEEE 519-2022 Compliance & Transformer K-Factor

### Total Harmonic Distortion (THD) Calculations

$$\text{THD}_V = \frac{\sqrt{\sum_{h=2}^{50} V_h^2}}{V_1} \times 100\%$$

$$\text{Total Demand Distortion (TDD)} = \frac{\sqrt{\sum_{h=2}^{50} I_h^2}}{I_{L,\text{max}}} \times 100\%$$

Where $I_{L,\text{max}}$ is the maximum demand load current calculated over rolling 15-minute intervals. TDD prevents false alarms during light plant loading.

### IEEE 519-2022 Voltage Distortion Limits
- **Bus Voltage $\le 1.0\text{ kV}$**: Maximum Individual Harmonic $\le 3.0\%$, Total Harmonic Distortion $\text{THD}_V \le 5.0\%$.
- **Bus Voltage $1.0\text{ kV} < V \le 69\text{ kV}$**: Individual $\le 1.5\%$, $\text{THD}_V \le 8.0\%$.

---

### Transformer K-Factor Calculation
Harmonic currents cause severe overheating in distribution transformers due to increased eddy current losses proportional to $(h \cdot I_h)^2$:

$$K = \frac{\sum_{h=1}^{50} I_h^2 \cdot h^2}{\sum_{h=1}^{50} I_h^2}$$

#### K-Factor Classification
- **K-1**: Standard resistive/linear loads (incandescent, linear heating).
- **K-4**: Commercial buildings with up to 20% electronic ballasts and induction heaters.
- **K-13**: Modern industrial plants with VFDs, robotic controllers, and high server density.
- **K-20**: Severe non-linear harmonic environments (welders, arc furnaces, SCR controllers).

---

## 3. Power Quality Events (IEC 61000-4-30 Class A) & ITIC / CBEMA Evaluation

The PMS implements event detection complying with **IEC 61000-4-30 Class A** testing standards.

### Event Characteristics
| Phenomenon | Threshold (% $U_{\text{nom}}$) | Typical Duration | Root Cause |
| :--- | :---: | :---: | :--- |
| **Voltage Sag (Dip)** | $10\% \le U < 90\%$ | $0.5\text{ cycle}$ to $1\text{ min}$ | Direct-on-line motor starts, utility transmission line faults, phase-to-ground short circuits. |
| **Voltage Swell** | $110\% < U \le 180\%$ | $0.5\text{ cycle}$ to $1\text{ min}$ | Abrupt shedding of large loads, single line-to-ground faults on ungrounded delta systems. |
| **Transient (Impulsive)** | $> 180\%$ (several kV) | $1\,\mu\text{s}$ to $10\text{ ms}$ | Atmospheric lightning strikes, vacuum contactor switching, power factor capacitor energization. |
| **Interruption** | $< 10\%$ | $> 10\text{ ms}$ | Circuit breaker opening, automatic recloser trip-out, bus tie transfer dead-band. |

### ITIC (Information Technology Industry Council) Curve
The ITIC (CBEMA) curve maps voltage magnitude against duration on a logarithmic timescale:
- **Acceptable Region**: Power supply DC bus holdup capacitors sustain logic circuitry through the sag.
- **Interruption / Shutdown Region**: DC bus voltage drops below low-voltage cutoff threshold, initiating PLC processor halt or VFD undervoltage fault.
- **Damage Region**: High-energy transient overvoltage exceeds metal-oxide varistor (MOV) energy absorption capability.

---

## 4. Symmetrical Components & Unbalance Analysis

Unbalanced 3-phase vectors ($V_R, V_Y, V_B$) are decomposed into symmetrical components using Fortescue's transformation matrix:

$$\begin{bmatrix} V_0 \\ V_1 \\ V_2 \end{bmatrix} = \frac{1}{3} \begin{bmatrix} 1 & 1 & 1 \\ 1 & a & a^2 \\ 1 & a^2 & a \end{bmatrix} \begin{bmatrix} V_R \\ V_Y \\ V_B \end{bmatrix}$$

Where $a = e^{j 120^\circ} = -0.5 + j 0.866$.

### Component Sequences
1. **Positive Sequence ($V_1$)**: Balanced phasors with normal R-Y-B phase rotation creating forward motor torque.
2. **Negative Sequence ($V_2$)**: Balanced phasors with reversed R-B-Y phase rotation creating counter-torque and severe rotor surface heating ($2 \cdot f_{\text{slip}}$).
3. **Zero Sequence ($V_0$)**: Identical in phase and magnitude, returning through the neutral conductor ($I_N = 3 \cdot I_0$).

### Voltage Unbalance Factor (VUF)
$$\text{VUF (\%)} = \frac{\|V_2\|}{\|V_1\|} \times 100\%$$

#### NEMA MG-1 Induction Motor Derating
When Voltage Unbalance exceeds 1%, electric motors must be derated according to the NEMA derating curve:
- **1% VUF**: Derating factor = 1.00 (Normal).
- **2% VUF**: Derating factor = 0.95 (5% derating; motor temperature rise increases by ~25%).
- **3% VUF**: Derating factor = 0.88 (12% derating).
- **5% VUF**: Derating factor = 0.75 (Operation above 5% unbalance is not recommended).

---

## 5. Maximum Demand Integration Algorithms

### Rolling (Sliding) Window Demand Calculation
$$\text{Demand}(t) = \frac{1}{T_{\text{int}}} \int_{t - T_{\text{int}}}^t P(\tau) \, d\tau$$

Where:
- $T_{\text{int}} = 15\text{ minutes} = 900\text{ seconds}$ (standard utility billing period).
- The sliding window updates every sub-interval (e.g., $\Delta t = 15\text{ seconds}$).
- If $\text{Demand}(t) > \text{Sanctioned Demand}$, the PMS triggers early-warning load-shedding relays to disengage non-critical loads before the 15-minute window completes.

---

## 6. Hierarchy Rollup Mathematics & SCADA Ingestion Architecture

### Topological Parent-Child Vector Rollup Formulations
When power flows through switchgear, parent distribution nodes (Plant, MDB, SMDB, MCC) aggregate real, reactive, and apparent energy according to conservation of energy laws:

1. **Real Active Power Rollup**:
   $$P_{\text{parent}} = \sum_{k=1}^n P_{\text{child}, k} \quad [\text{kW}]$$

2. **Reactive Power Rollup**:
   $$Q_{\text{parent}} = \sum_{k=1}^n Q_{\text{child}, k} \quad [\text{kVAR}]$$
   Accounts for negative reactive power from capacitive banks canceling positive reactive power from inductive motors.

3. **Apparent Power Vector Sum**:
   $$S_{\text{parent}} = \sqrt{\left(\sum_{k=1}^n P_{\text{child}, k}\right)^2 + \left(\sum_{k=1}^n Q_{\text{child}, k}\right)^2} \quad [\text{kVA}]$$
   *Note: Apparent power is NOT the scalar sum of child apparent powers ($S_{\text{parent}} \neq \sum S_k$) due to phase angle divergence.*

4. **Aggregate Node Power Factor**:
   $$\text{PF}_{\text{parent}} = \frac{P_{\text{parent}}}{S_{\text{parent}}} = \cos\left(\arctan\left(\frac{Q_{\text{parent}}}{P_{\text{parent}}}\right)\right)$$

5. **Cumulative Active Energy Rollup**:
   $$E_{\text{parent}}(t) = \sum_{k=1}^n E_{\text{child}, k}(t) \quad [\text{kWh}]$$

---

### Modbus SCADA Telemetry & Register Byte Formats
The PMS polling driver communicates with field digital meters via RS-485 serial loops (Modbus RTU) or Ethernet networks (Modbus TCP):

1. **IEEE 754 32-Bit Floating Point Formats**:
   - **Big-Endian (ABCD)**: High-order word first, standard in Schneider Electric PM5000 / PM8000 and Siemens PAC series.
   - **Word-Swapped (CDAB)**: Low-order word first, standard in Socomec Diris and Selec meters.
2. **Scaled Integer with CT/PT Transformation**:
   High-voltage meters report raw secondary integers requiring ratio multiplication:
   $$V_{\text{primary}} = V_{\text{secondary}} \times \left(\frac{\text{PT}_{\text{primary}}}{\text{PT}_{\text{secondary}}}\right)$$
   $$I_{\text{primary}} = I_{\text{secondary}} \times \left(\frac{\text{CT}_{\text{primary}}}{\text{CT}_{\text{secondary}}}\right)$$
3. **Sub-Second WebSocket Telemetry Streaming**:
   Browser clients establish persistent WebSockets to `/ws/live?access_token=<jwt>`. The telemetry engine processes raw Modbus inputs and pushes live values every 1,000 milliseconds.

---

### Backend Database Architecture & Settings Persistence
All system settings and hierarchy configurations are stored durably in the backend relational database:

1. **AppSettings Entity**:
   Stored in `AppSettings` table under key `PowerMonitoring_Settings`:
   ```json
   {
     "enableDemoMode": false,
     "defaultMode": "live",
     "refreshIntervalSeconds": 5,
     "contractDemandKw": 1500.0,
     "voltageTolerancePercent": 5.0,
     "frequencyToleranceHz": 0.2
   }
   ```
2. **REST Management Endpoints**:
   - `GET /api/power-monitoring/settings`: Returns current system settings.
   - `POST /api/power-monitoring/settings`: Atomically updates settings in `AppSettings` and broadcasts changes over WebSockets.
   - `GET /api/power-monitoring/hierarchy`: Fetches the active 6-tier network tree with rollup statistics.
   - `POST /api/power-monitoring/hierarchy`: Saves validated Directed Acyclic Graph (DAG) hierarchy.
3. **Graph Validation & Directed Acyclic Graph (DAG) Integrity**:
   The import parser executes cycle detection using topological sorting ($O(V + E)$). Any circular references or orphan node structures are rejected with descriptive line numbers.

---

*Power Monitoring System (PMS) — Engineering Documentation & Operational Reference Manual.*
