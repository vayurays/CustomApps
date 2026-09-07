# Power Monitoring System (PMS) — Layman's Complete User Guide & Help Manual

Welcome to the **Power Monitoring System (PMS)**! This guide is designed specifically for facility managers, plant operators, shift supervisors, maintenance technicians, and business owners who want to understand how their electrical energy is being consumed, detect electrical faults early, avoid utility penalty charges, and keep equipment running smoothly — **without needing a degree in electrical engineering**.

---

## Table of Contents

1. [Quick Start: What is PMS & Why Does It Matter?](#1-quick-start-what-is-pms--why-does-it-matter)
2. [Electrical Basics in Plain English (Simple Analogies)](#2-electrical-basics-in-plain-english-simple-analogies)
   - [The Water Pipe Analogy: Voltage, Current & Power](#the-water-pipe-analogy-voltage-current--power)
   - [The Beer Mug Analogy: Active, Reactive & Apparent Power](#the-beer-mug-analogy-active-reactive--apparent-power)
   - [Power Factor: Why Your Electricity Bill Might Have a Penalty](#power-factor-why-your-electricity-bill-might-have-a-penalty)
   - [Harmonics (THD): Electrical "Noise" & Turbulence](#harmonics-thd-electrical-noise--turbulence)
3. [Navigating the Screen Layout & Controls](#3-navigating-the-screen-layout--controls)
   - [The Top Header (Live Status, Time & Theme)](#the-top-header-live-status-time--theme)
   - [Live Mode vs. Demo Mode](#live-mode-vs-demo-mode)
   - [Network Hierarchy Sidebar (Plant -> Board -> Meter)](#network-hierarchy-sidebar-plant---board---meter)
   - [Navigation Menu (The 5 Core Tabs)](#navigation-menu-the-5-core-tabs)
4. [Mastering the Main Dashboard (Overview Tab)](#4-mastering-the-main-dashboard-overview-tab)
   - [The 8 Live KPI Cards Explained](#the-8-live-kpi-cards-explained)
   - [Capacity & Demand Gauge (MDI Tracker)](#capacity--demand-gauge-mdi-tracker)
   - [Interactive Trend Charts (Power vs. Current Over Time)](#interactive-trend-charts-power-vs-current-over-time)
   - [3-Phase Electrical Balance & Phasor Overview](#3-phase-electrical-balance--phasor-overview)
   - [Waveform & Harmonic Spectrum Display](#waveform--harmonic-spectrum-display)
5. [Energy Analytics & Cost View](#5-energy-analytics--cost-view)
   - [Time-of-Use (TOU) Electricity Tariffs (Peak vs. Off-Peak)](#time-of-use-tou-electricity-tariffs-peak-vs-off-peak)
   - [Consumption Comparisons (Today vs. Yesterday vs. Last Month)](#consumption-comparisons-today-vs-yesterday-vs-last-month)
   - [Departmental & Feeder Breakdown: Who Is Using the Most Power?](#departmental--feeder-breakdown-who-is-using-the-most-power)
6. [Power Quality (PQ) View](#6-power-quality-pq-view)
   - [Understanding Voltage Sags (Dips) and Swells (Surges)](#understanding-voltage-sags-dips-and-swells-surges)
   - [Harmonics Spectrum & IEEE 519 Statutory Limits](#harmonics-spectrum--ieee-519-statutory-limits)
   - [3-Phase Current & Voltage Unbalance](#3-phase-current--voltage-unbalance)
7. [Alarm Management & Troubleshooting](#7-alarm-management--troubleshooting)
   - [Alarm Severities (Critical, Warning, Info)](#alarm-severities-critical-warning-info)
   - [Common Electrical Alarms & Recommended Operator Actions](#common-electrical-alarms--recommended-operator-actions)
   - [How to Acknowledge Alarms and Add Operator Notes](#how-to-acknowledge-alarms-and-add-operator-notes)
8. [Reporting Engine (Generate & Export Data)](#8-reporting-engine-generate--export-data)
   - [Pre-Built Templates](#pre-built-templates)
   - [Generating and Exporting to CSV, Excel, and PDF](#generating-and-exporting-to-csv-excel-and-pdf)
9. [Configuration & Administration (For System Admins)](#9-configuration--administration-for-system-admins)
   - [How the Hierarchy Tree Works](#how-the-hierarchy-tree-works)
   - [Smart Auto-Configuration](#smart-auto-configuration)
   - [Bulk CSV Import / Export](#bulk-csv-import--export)
   - [Enabling / Disabling Demo Mode](#enabling--disabling-demo-mode)
10. [Frequently Asked Questions (FAQ) & Cheat Sheet](#10-frequently-asked-questions-faq--cheat-sheet)

---

## 1. Quick Start: What is PMS & Why Does It Matter?

The **Power Monitoring System (PMS)** is like the dashboard and check-engine light of your building or manufacturing facility. Just like your car's speedometer and temperature gauge show how your car is running, the PMS constantly measures the electrical "health", flow, and cost of electricity flowing through all your main circuit breakers, distribution panels, and power meters.

### Why do we need it?
1. **Stop Wasting Money**: Identifies machines that run unnecessarily during expensive peak-tariff electricity hours.
2. **Prevent Equipment Burnout**: Alerts you when motors or cables are overheating due to excessive electrical current or bad power quality.
3. **Avoid Utility Surcharges**: Most electrical utility companies heavily fine industrial facilities if their **Power Factor** drops below 0.90 or if they exceed their **Sanctioned Peak Demand (kVA)**.
4. **Faster Troubleshooting**: When a circuit breaker trips or a machine suddenly halts, the PMS shows you the exact voltage, current, and disturbance that caused it at that exact second.

---

## 2. Electrical Basics in Plain English (Simple Analogies)

You don't need to be an engineer to use this software. Here are 4 everyday analogies that make electrical terms simple to grasp.

### The Water Pipe Analogy: Voltage, Current & Power
Imagine electricity flowing like water through pipes into your factory:

```
[ Water Pump (Voltage V) ] =====> [ Pipe (Current A) ] =====> [ Water Wheel (Power kW) ]
```

- **Voltage (\(V\) in Volts)** = **Water Pressure**: How hard the electricity is being pushed through the wires. In a standard commercial or industrial building, normal line voltage is typically **415V** between phases (or **230V/240V** to neutral).
- **Current (\(I\) in Amperes / Amps)** = **Water Flow Rate**: How much electricity is physically flowing through the wire every second. More machines turned ON = higher current.
- **Active Power (\(kW\) in Kilowatts)** = **The Work Done**: How fast the water wheel is turning. 1 kW = 1,000 Watts. A standard 1-ton air conditioner uses around 1.2 kW of power.
- **Energy (\(kWh\) in Kilowatt-Hours)** = **Total Water Used Over Time**: If you run a 10 kW motor for 5 hours, you have consumed \(10 \times 5 = 50\text{ kWh}\) of electricity. **This is the exact number your utility company bills you for!**

---

### The Beer Mug Analogy: Active, Reactive & Apparent Power
When electricity powers equipment with magnets or coils (such as electric motors, air compressors, pumps, and transformers), not all electricity does physical work. Some is needed just to create magnetic fields.

Think of a freshly poured mug of beer:

```
  +-----------------------+
  |  FOAM / FROTH         |  ===> Reactive Power (kVAR)
  |  (Magnetizing Power)  |       Does no real work, but fills the glass!
  +-----------------------+
  |                       |
  |  LIQUID BEER          |  ===> Active Power (kW)
  |  (Real Working Power) |       Turns the motor, lights the bulbs.
  |                       |
  +-----------------------+
    \___________________/   ===> Apparent Power (kVA)
                                 Total size of the mug you must pay for.
```

- **Liquid Beer = Active Power (\(kW\))**: The actual beer you drink. This is the real, productive power that drives machinery, lifts elevators, and produces finished goods.
- **Foam / Froth = Reactive Power (\(kVAR\))**: You cannot drink the foam, but you cannot pour a proper draft beer without it! Motors and transformers require this reactive power to sustain their internal magnetic fields.
- **The Whole Mug = Apparent Power (\(kVA\))**: The total volume (beer + foam) that the glass must hold. The electric utility must size their transformers, substations, and cables to carry this entire total amount.

---

### Power Factor: Why Your Electricity Bill Might Have a Penalty
**Power Factor (\(PF\))** is simply the ratio of liquid beer to the whole glass:

$$\text{Power Factor} = \frac{\text{Liquid Beer (Active Power } kW\text{)}}{\text{Whole Mug (Apparent Power } kVA\text{)}}$$

- **1.00 (Ideal / Perfect)**: A full mug of pure liquid beer with virtually no foam. All electricity is doing useful work.
- **0.95 to 0.99 (Healthy Industrial Standard)**: Normal and efficient.
- **Below 0.90 (Poor / Expensive)**: Too much foam! The wires and transformers are clogged with magnetic reactive power.
  > **Financial Impact**: Electricity companies charge **hefty penalties** (or cancel rebates) when average monthly PF is below 0.90 or 0.95. If your dashboard shows PF in amber or red, your capacitor banks (APFC panels) need immediate inspection!

---

### Harmonics (THD): Electrical "Noise" & Turbulence
AC electricity is supposed to oscillate in a clean, smooth, beautiful wave (like calm ocean ripples), repeating 50 or 60 times a second (50 Hz or 60 Hz).

However, modern electronic equipment — such as variable speed drives (VFDs), computer servers, LED drivers, and battery chargers — draws power in choppy, rapid pulses instead of a smooth wave.

- **Total Harmonic Distortion (\(THD\))**: Measures how "distorted" or "bumpy" the electrical wave has become.
- **Think of a highway**:
  - **0% to 3% THD**: A newly paved, mirror-smooth asphalt highway. Cars (motors) glide effortlessly.
  - **5% to 8% THD**: Bumpy road with small potholes. Motors get hotter, vibrate, and hum.
  - **Above 8% to 10% THD**: Severe off-road conditions! Transformers overheat, electronic controllers reboot randomly, and circuit breakers may falsely trip.

---

## 3. Navigating the Screen Layout & Controls

The PMS interface is structured into four intuitive sections:

```
+-----------------------------------------------------------------------------------------+
| [PMS Logo]  Plant Overview > Main Distribution Board (MDB)     [Live Mode] [19:45:12] ⚙ |  <-- Top Header
+-----------+-----------------------------------------------------------------------------+
| 📊 Overview|                                                                             |
| ⚡ Energy   |                           MAIN DASHBOARD WORKSPACE                          |
| 📉 Quality  |                  (Cards, Gauges, Live Trends & Charts)                     |
| 🔔 Alarms   |                                                                             |
| 📄 Reports  |                                                                             |
| ⚙ Settings |                                                                             |
| (Nav Menu)|                                                                             |
+-----------+-----------------------------------------------------------------------------+
```

### The Top Header (Live Status, Time & Theme)
Located at the very top of the window:
- **Breadcrumb trail** (e.g., `Power Monitoring > Main Distribution Board > Feeder 01`): Shows exactly which panel or sub-meter you are currently inspecting.
- **Data Mode Indicator**:
  - **Live Mode (Green Pulse)**: Indicates that you are viewing **real-time field telemetry** directly from physical meters installed in the facility.
  - **Demo Mode (Amber)**: Only appears if the Administrator has enabled demo simulation for staff training.
- **Live WebSocket Status (`LIVE WS`)**: Shows a green pulsing circle when live streaming connection to the server is active.
- **Theme Switcher**: Click the Moon / Sun icon to toggle between comfortable **Dark Mode** (ideal for control rooms) and **Light Mode** (great for sunny offices).

### Live Mode vs. Demo Mode
- **Live Mode (Default)**: The PMS **always starts in Live mode by default**. Every number on the screen reflects the real voltage, current, and energy flowing right now in your facility.
- **Demo Mode (Simulated)**: An optional feature used for demonstrations and operator onboarding. When enabled in system settings, it allows you to simulate power outages, voltage spikes, and heavy equipment starts without touching physical machines.

### Network Hierarchy Sidebar (Plant -> Board -> Meter)
Click the menu icon on the top left or hover over the left edge to open the **Electrical Hierarchy Tree**:

```
🏭 Main Plant Facility (Root)
   ├── 🔌 Main Incomer Substation 11kV
   ├── ⚡ Main Distribution Board (MDB-01)
   │     ├── 🏢 Feeder 01: Office HVAC Chiller
   │     ├── ⚙️ Feeder 02: Production Line A Motors
   │     └── 💡 Feeder 03: Warehouse Lighting
   └── ⚡ Secondary Distribution Board (MDB-02)
```

- **Selecting Any Node Changes the Entire Screen**:
  - Click **Main Plant Facility**: You see total aggregated power and energy for the entire factory!
  - Click **Feeder 01 (HVAC Chiller)**: All charts, voltages, and currents instantly zoom in to show just the Chiller meter!
- **Pin / Auto-Hide**: Click the small Pin icon in the sidebar header to lock the tree open, or unpin it so it collapses automatically to give you maximum chart space.

---

## 4. Mastering the Main Dashboard (Overview Tab)

The **Overview Tab** is your everyday operational home screen.

### The 8 Live KPI Cards Explained

Across the top of the dashboard, you will find 8 high-priority summary cards:

| Card Label | Unit | What It Measures | Healthy Target | What To Do If Abnormal |
| :--- | :---: | :--- | :--- | :--- |
| **Active Power** | **kW** | Real electrical load currently being used right now. | Within contracted demand limit | If unexpectedly high, check for machines left idling or simultaneous motor starts. |
| **Total Current** | **A** | Total flow of electrical charge through the wires. | Below cable/breaker amp rating | If nearing 100%, cables will overheat. Shift non-critical loads. |
| **Average Voltage** | **V** | Average voltage supplied across the 3 phases. | 400V - 420V (L-L) or 230V - 240V (L-N) | If below 380V (Brownout) or above 440V (Surge), notify the electrical utility. |
| **Power Factor** | **PF** | Ratio of real working power to total supplied power. | **0.95 to 1.00** | If **below 0.90**, inspect Automatic Power Factor Correction (APFC) capacitor banks immediately. |
| **Frequency** | **Hz** | Speed of generator rotation in the power grid. | **49.8 Hz to 50.2 Hz** (for 50Hz grid) | Grid stability metric. If swinging widely, contact utility or switch to backup generator. |
| **Energy Today** | **kWh** | Cumulative electricity consumed since midnight today. | Matches daily production target | Compare with production output to check energy efficiency per unit produced. |
| **THD Voltage** | **%** | Wave distortion on the voltage supply. | **< 5.0%** (IEEE 519 standard) | If **> 5%**, sensitive computers and PLCs risk tripping or corrupting data. |
| **THD Current** | **%** | Wave distortion caused by connected non-linear loads. | **< 10.0% - 15.0%** | If high, consider installing passive harmonic filters or active power filters (APF). |

---

### Capacity & Demand Gauge (MDI Tracker)
The circular **Demand Gauge** tracks your **Maximum Demand Indicator (MDI)**:

- **Why Demand Matters**: Utilities don't just bill you for total kWh consumed; they also bill you for the **highest 15-minute power spike** reached during the month (Contract Demand in kVA or kW). If you exceed this limit even once, penalties can double your bill!
- **Reading the Gauge**:
  - 🟢 **Green Zone (0% - 75%)**: Safe operational zone.
  - 🟡 **Yellow Warning (75% - 90%)**: High load. Approaching peak limit.
  - 🔴 **Red Alert (> 90%)**: Imminent danger of demand penalty or main breaker trip! Stagger equipment starts.

---

### Interactive Trend Charts (Power vs. Current Over Time)
The central trend chart shows how power and current changed throughout the day:

- **Horizontal Axis (X-Axis)**: Time of day (e.g., 08:00, 12:00, 16:00).
- **Left Vertical Axis (Y1-Axis, Cyan/Blue line)**: Active Power in **kW**.
- **Right Vertical Axis (Y2-Axis, Amber/Orange line)**: Current in **Amperes**.
- **Timeframe Selector**:
  - Click **1 Hour**: Minute-by-minute view to investigate an immediate surge.
  - Click **8 Hours**: View the entire current work shift.
  - Click **24 Hours**: See day vs. night baselines.
  - Click **7 Days / 30 Days**: Identify weekly patterns (e.g., weekend shutdown vs. weekday production).
- **Pro Tip**: Hover your mouse anywhere on the curve to see the exact time and reading in a floating tooltip!

---

### 3-Phase Electrical Balance & Phasor Overview
In an industrial 3-phase facility, electricity arrives on three separate live wires: **Phase R (Red/Phase A)**, **Phase Y (Yellow/Phase B)**, and **Phase B (Blue/Phase C)**, plus a **Neutral** wire.

```
       Phase R (Red) -----\
       Phase Y (Yellow) ---- [ 3-Phase Machine / Load ]
       Phase B (Blue)   -----/
       Neutral (N)      ----- (Carries leftover unbalanced current)
```

- **Ideal State**: All 3 phases should carry approximately equal current (e.g., Phase R = 150A, Phase Y = 152A, Phase B = 148A).
- **Unbalance Alert**: If one phase is heavily loaded (e.g., Phase R = 220A) while another is lightly loaded (e.g., Phase B = 60A):
  1. The excess current returns through the **Neutral wire**, causing the neutral wire to heat up.
  2. 3-phase electric motors will vibrate violently and overheat.
  3. The PMS highlights Phase Balance with clear colored gauges so you can redistribute single-phase office or lighting loads evenly.

---

### Waveform & Harmonic Spectrum Display
- **Live Sine Wave**: Renders the actual alternating current waveform. If the wave looks like a smooth roller coaster, your power is clean. If it looks jagged, squashed, or spiky, non-linear harmonic distortion is present.
- **Harmonic Spectrum Bar Chart**: Shows harmonic frequencies up to the 15th or 25th order:
  - **H1 (Fundamental 50Hz/60Hz)**: The main, useful power wave (should be 100%).
  - **H3 (150Hz), H5 (250Hz), H7 (350Hz)**: Undesirable distortion harmonics. Keep each below statutory thresholds (marked by red dashed guidelines).

---

## 5. Energy Analytics & Cost View

Click **Energy** in the left navigation menu to open financial and consumption analytics.

### Time-of-Use (TOU) Electricity Tariffs (Peak vs. Off-Peak)
Most modern electricity tariffs change rates depending on the time of day:

```
  Hours:      00:00 - 06:00           06:00 - 18:00           18:00 - 22:00           22:00 - 24:00
  Zone:       🌙 Off-Peak             ☀️ Normal Peak          🔥 Super-Peak           🌙 Off-Peak
  Cost:       Lowest ($)              Standard ($$)           Highest ($$$$)          Lowest ($)
```

- The PMS automatically groups your kWh consumption into these color-coded tariff bands.
- **Actionable Insight**: Run energy-intensive batch operations (e.g., heavy furnace heating, water pumping, EV fleet charging) during **Off-Peak hours** to slash electricity costs by up to 30% to 40% without reducing production volume!

### Consumption Comparisons (Today vs. Yesterday vs. Last Month)
- **Today vs. Yesterday**: Immediately reveals if today's energy usage is abnormally high for the same production output.
- **Specific Energy Consumption (SEC)**: Calculates kWh per finished product (e.g., \(12.4\text{ kWh}/\text{ton}\)). If this number rises, machinery needs mechanical lubrication, filter replacement, or maintenance.

### Departmental & Feeder Breakdown: Who Is Using the Most Power?
The donut chart splits your total energy by department:
- 🔵 **HVAC & Chillers**: 42%
- 🟢 **Production Line Motors**: 35%
- 🟡 **Air Compressors**: 14%
- 🟣 **Lighting & Office**: 9%

---

## 6. Power Quality (PQ) View

Click **Quality** in the left menu to view the electrical "purity" and disturbance log.

### Understanding Voltage Sags (Dips) and Swells (Surges)
Short electrical disturbances lasting only milliseconds can reset sensitive robotic arms or crash server rooms:

- **Voltage Sag (Dip)**: Voltage suddenly drops to 70% or 80% of normal for a fraction of a second (often caused by a large motor starting nearby or a lightning strike on the utility grid).
- **Voltage Swell (Surge)**: Voltage spikes to 120% or 130% for a short duration (often caused by large loads turning off abruptly).
- **ITIC / CBEMA Curve**: An international standard plot shown in the PQ view:
  - Any disturbance dot falling **inside the green envelope** was tolerated safely by your equipment.
  - Any dot falling in the **red area** indicates a high probability that equipment crashed or reset.

---

## 7. Alarm Management & Troubleshooting

Click **Alarms** in the left menu to view real-time electrical alerts.

### Alarm Severities (Critical, Warning, Info)
- 🔴 **Critical (Red)**: Immediate danger! Examples: Breaker overload (> 100%), severe voltage sag (< 85%), or phase loss. Requires prompt operator attention.
- 🟡 **Warning (Amber)**: Parameter operating outside normal economic or safety range. Examples: Power Factor below 0.90, THD above 5%, or load above 80%.
- 🔵 **Info (Blue)**: Informational logs, such as scheduled maintenance reminders or breaker state changes.

### Common Electrical Alarms & Recommended Operator Actions

| Alarm Name | What Happened | Immediate Action |
| :--- | :--- | :--- |
| `LOW_POWER_FACTOR` | Power factor dropped below 0.90. | Check APFC panel; replace blown capacitor fuses. |
| `OVER_CURRENT_WARN` | Feeder current exceeded 85% of breaker rating. | Turn off non-essential equipment on this feeder. |
| `VOLTAGE_UNBALANCE` | One phase voltage differs by > 2% from others. | Check incoming utility supply; ensure single-phase loads are balanced. |
| `HIGH_THD_VOLTAGE` | Voltage distortion exceeded 5.0%. | Turn on active harmonic filter; inspect VFD chokes. |
| `PEAK_DEMAND_WARNING`| Current 15-min demand is at 92% of contracted limit. | Shed non-critical loads (e.g., pause water pumps or chillers for 15 mins). |

### How to Acknowledge Alarms and Add Operator Notes
1. Click the **Acknowledge** button next to the alarm.
2. Enter a brief comment (e.g., *"Notified electrician to reset Capacitor Bank 2"*).
3. The alarm switches from blinking to acknowledged with your username and timestamp recorded in the audit trail.

---

## 8. Reporting Engine (Generate & Export Data)

Click **Reports** in the left menu to produce professional reports for management or government energy auditors:

1. **Select a Pre-Built Template**:
   - *Daily Energy & Shift Consumption Log*
   - *Peak Demand & Load Factor Profile*
   - *IEEE 519 Power Quality & Harmonics Audit*
   - *Monthly Facility Energy Cost Summary*
2. **Choose Scope & Timeframe**: Pick any panel from the hierarchy and select a date range (e.g., Last 7 Days, Month-to-Date).
3. **Generate**: View the formatted report directly in your browser.
4. **Export**: Click **Export CSV**, **Export Excel**, or **Download PDF** to save the file for emails or monthly meetings.

---

## 9. Configuration & Administration (For System Admins)

*(Available to users with the Administrator role by clicking the Settings icon on the bottom-left).*

- **Tree Builder**: Add new buildings, switchboards, or sub-feeders with a simple visual hierarchy tree.
- **Smart Auto-Configure**: Scans connected SCADA / Modbus devices and automatically matches meter names (e.g., auto-detecting `Voltage_R`, `ActivePower_Total`, `Energy_Cumulative`).
- **Bulk CSV Import / Export**: Setting up 500+ meters? Don't click one-by-one! Download the PMS CSV template, paste your meter list in Excel, and click **Import CSV** to configure the entire plant in 10 seconds.
- **Enable / Disable Demo Mode**:
  - In the Configuration toolbar, check or uncheck **"Enable Demo Mode"**.
  - When **disabled**, operators only see Live real-time data, preventing confusion between simulation and real plant operations.
  - When **enabled**, the `[ Demo | Live ]` switcher appears on the dashboard header for testing.

---

## 10. Frequently Asked Questions (FAQ) & Cheat Sheet

### Q1: Why does my screen always open in Live Mode?
**A:** In mission-critical facilities, operators must always see the true, current state of their electrical network. The PMS is intentionally configured to always load **Live Mode** by default.

### Q2: Why is the Power Factor showing in Amber/Orange?
**A:** Your power factor has dropped below 0.90. This means your facility is drawing excessive reactive foam power. If left uncorrected, your upcoming utility electricity bill will include a surcharge penalty. Check your capacitor banks!

### Q3: What is the difference between kW and kWh?
**A:** 
- **kW (Kilowatt)** is the **speedometer** (how fast you are burning energy right now).
- **kWh (Kilowatt-Hour)** is the **odometer** (the total distance / total electricity consumed over time).

### Q4: Why is one phase showing much higher current than the others?
**A:** This indicates an **unbalanced load**. Electricians have connected too many single-phase loads (computers, air conditioners, lights) onto one phase wire instead of spreading them equally across all three phases (R, Y, B).

---

*Power Monitoring System (PMS) — Making Electrical Energy Visible, Efficient, and Reliable.*
