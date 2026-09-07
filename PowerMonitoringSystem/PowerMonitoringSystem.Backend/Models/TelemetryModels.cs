using System;
using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class MeterTelemetryDto
{
    public string NodeId { get; set; } = string.Empty;
    public string NodeName { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty;

    // Overall / Average Metrics
    public double VoltageAvg { get; set; }
    public double CurrentAvg { get; set; }
    public double PowerFactor { get; set; }
    public double Frequency { get; set; }
    public double ActivePower { get; set; } // kW
    public double ApparentPower { get; set; } // kVA
    public double ReactivePower { get; set; } // kVAR
    public double EnergyToday { get; set; } // kWh
    public double EnergyYesterday { get; set; } // kWh
    public double EnergyMonth { get; set; } // kWh
    public double DemandKw { get; set; }
    public double LoadPercentage { get; set; }

    // Status & Health
    public string Status { get; set; } = "Healthy"; // Healthy | Warning | Critical
    public int HealthScore { get; set; } = 95; // 0 - 100
    public bool IsOnline { get; set; } = true;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Phase-Wise Breakdown
    public double VR_LN { get; set; }
    public double VY_LN { get; set; }
    public double VB_LN { get; set; }
    public double VRY_LL { get; set; }
    public double VYB_LL { get; set; }
    public double VBR_LL { get; set; }

    public double IR { get; set; }
    public double IY { get; set; }
    public double IB { get; set; }
    public double INeutral { get; set; }

    public double PowerR { get; set; }
    public double PowerY { get; set; }
    public double PowerB { get; set; }

    public double ReactivePowerR { get; set; }
    public double ReactivePowerY { get; set; }
    public double ReactivePowerB { get; set; }

    public double PFR { get; set; }
    public double PFY { get; set; }
    public double PFB { get; set; }

    public double THD_VR { get; set; }
    public double THD_VY { get; set; }
    public double THD_VB { get; set; }
    public double THD_IR { get; set; }
    public double THD_IY { get; set; }
    public double THD_IB { get; set; }

    public double VoltageImbalancePercent { get; set; }
    public double CurrentImbalancePercent { get; set; }
    public string PhaseSequence { get; set; } = "R - Y - B";
}

public class TrendSeriesDto
{
    public List<TrendPointDto> Points { get; set; } = new();
}

public class TrendPointDto
{
    public string Time { get; set; } = string.Empty;
    public double V { get; set; }
    public double C { get; set; }
    public double Kw { get; set; }
    public double Pf { get; set; }
    public double Hz { get; set; }
}
