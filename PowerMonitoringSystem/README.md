# PowerMonitoringSystem - VayuRays Custom SCADA Plugin Application

`PowerMonitoringSystem` is an electrical power monitoring and energy analytics plugin for the **VayuRays SCADA** platform. It provides real-time 3-phase electrical telemetry, dynamic hierarchy tree rollups (Plant -> MDB -> SMDB -> MCC -> Feeder -> Meter), Power Quality analysis with Sag/Swell & Harmonics detection (IEEE 519), Energy analytics with Time-of-Use (TOU) tariffs, electrical alarm management, and automated compliance reporting.

---

## 📁 Repository Structure

```
c:\TT\CustomApps\PowerMonitoringSystem\
├── PowerMonitoringSystem.Backend/     # .NET 10 Class Library (Backend API)
│   ├── Controllers/
│   │   └── PowerMonitoringController.cs # REST API endpoints
│   ├── Models/
│   │   ├── HierarchyModels.cs         # Electrical tree & mapping DTOs
│   │   ├── TelemetryModels.cs         # 3-Phase voltage, current, power DTOs
│   │   ├── EnergyModels.cs            # TOU, demand & energy summary DTOs
│   │   ├── QualityModels.cs           # Harmonics, Sag/Swell & Phasor DTOs
│   │   ├── AlarmModels.cs             # Alarms & acknowledgment DTOs
│   │   └── ReportModels.cs            # Template & report export DTOs
│   ├── Services/
│   │   ├── IPowerMonitoringService.cs
│   │   └── PowerMonitoringService.cs  # Business logic & telemetry rollups
│   ├── PowerMonitoringModule.cs       # IVayuModule plugin entry point
│   └── PowerMonitoringSystem.Backend.csproj
│
├── PowerMonitoringSystem.Frontend/    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main Overview dashboard & context bar
│   │   │   ├── EnergyAnalyticsView.tsx# Energy & TOU analytics view
│   │   │   ├── PowerQualityView.tsx   # Harmonics, Sag/Swell & Phasor view
│   │   │   ├── AlarmManagementView.tsx# Active alarm triage & ack view
│   │   │   ├── ReportingEngineView.tsx# Report generation & export view
│   │   │   └── Configuration.tsx      # Electrical hierarchy editor & mapping
│   │   ├── types.ts                   # Unified TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── manifest.json                      # Plugin metadata (Name, Icon)
├── build.bat                          # One-click build & package script
└── README.md
```

---

## 🚀 Key Features

1. **Hierarchy-Aware Scoping & Upstream Rollup**:
   - Electrical distribution tree: `Plant` &rarr; `MDB` &rarr; `SMDB` &rarr; `MCC` &rarr; `Feeder` &rarr; `Meter`.
   - Selecting a parent board rolls up active power (\(kW\)) and energy (\(kWh\)) from all downstream child meters.
2. **Real-time 3-Phase Telemetry & Gauges**:
   - Live \(V_{LN}, V_{LL}, I_{phase}, I_{neutral}, kW, kVAR, kVA, PF, Hz\), unbalance percentages, and vector phasors.
   - Streaming updates via `/ws/live?access_token=<JWT>`.
3. **Power Quality, Sag/Swell & Harmonics (IEEE 519)**:
   - Harmonics spectrum analyzer (Fundamental through 25th/50th order) against statutory limit lines.
   - Voltage Sag (Dip) and Voltage Swell disturbance log with duration (ms), depth/peak %, and ITIC (CBEMA) curve status.
4. **Energy Analytics & Time-Of-Use (TOU)**:
   - Consumption profiling (Daily, Weekly, Monthly, Yearly).
   - Peak Demand (MDI) tracking and sub-feeder energy breakdown.
   - TOU tariff band splits (Peak, Normal, Off-Peak) and carbon emissions calculation.
5. **Electrical Alarm Management**:
   - Real-time overvoltage, overcurrent, imbalance, and low PF alerts backed by VayuRays `IAlarmService`.
   - Single-click and bulk operator acknowledgment.
6. **Automated Reporting Engine**:
   - Pre-configured compliance templates (Daily Energy, Peak Demand Profile, IEEE 519 Harmonics, Health Audit).
   - Instant in-browser preview and export to CSV, Excel, and PDF.

---

## 🛠️ Building the Custom App

Run the `build.bat` script:
```cmd
c:\TT\CustomApps\PowerMonitoringSystem\build.bat
```

This automatically compiles the .NET 10 DLL, builds Vite web assets, and creates the bundle in:
`c:\TT\CustomApps\PowerMonitoringSystem\dist_package\PowerMonitoringSystem\`

---

## 📦 Deployment to VayuRays Service

1. Copy the output bundle into the host service's `customApps` directory:
   ```cmd
   xcopy "c:\TT\CustomApps\PowerMonitoringSystem\dist_package\PowerMonitoringSystem" "C:\TT\VayuRays\VayuRays.Service\customApps\PowerMonitoringSystem\" /E /I /Y
   ```

2. Restart the VayuRays Service. The host will:
   - Dynamically load `PowerMonitoringSystem.dll` into `AssemblyLoadContext`.
   - Register `/api/power-monitoring/*` routes into ASP.NET Core MVC.
   - Serve static assets under `/apps/PowerMonitoringSystem/index.html`.
   - Display **PowerMonitoringSystem** in the SCADA navigation tree!
