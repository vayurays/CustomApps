using System;
using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class PowerQualityDto
{
    public double ThdVoltageAvg { get; set; }
    public double ThdCurrentAvg { get; set; }
    public double VoltageUnbalancePercent { get; set; }
    public double CurrentUnbalancePercent { get; set; }
    public double FrequencyDeviationHz { get; set; }
    public double TransformerKFactor { get; set; }
    public string Ieee519Compliance { get; set; } = "Pass"; // Pass | Marginal | Fail

    public List<HarmonicOrderDto> Harmonics { get; set; } = new();
    public PhasorDiagramDto PhasorDiagram { get; set; } = new();
    public List<PowerQualityDisturbanceDto> Disturbances { get; set; } = new();
}

public class HarmonicOrderDto
{
    public string Order { get; set; } = string.Empty; // "Fundamental", "3rd", "5th", etc.
    public double Value { get; set; } // % of fundamental
    public double Limit { get; set; } // IEEE 519 limit (e.g. 3.0%)
    public string Status { get; set; } = "Normal"; // Normal | Warning | Exceeded
}

public class PhasorDiagramDto
{
    public PhasorVectorDto VR { get; set; } = new() { Angle = 0, Magnitude = 240, Color = "#EF4444" };
    public PhasorVectorDto VY { get; set; } = new() { Angle = 240, Magnitude = 240, Color = "#F59E0B" };
    public PhasorVectorDto VB { get; set; } = new() { Angle = 120, Magnitude = 240, Color = "#3B82F6" };

    public PhasorVectorDto IR { get; set; } = new() { Angle = 345, Magnitude = 120, Color = "#DC2626" };
    public PhasorVectorDto IY { get; set; } = new() { Angle = 225, Magnitude = 125, Color = "#D97706" };
    public PhasorVectorDto IB { get; set; } = new() { Angle = 105, Magnitude = 122, Color = "#2563EB" };
}

public class PhasorVectorDto
{
    public double Angle { get; set; } // Degrees (0 - 360)
    public double Magnitude { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class PowerQualityDisturbanceDto
{
    public string Id { get; set; } = string.Empty;
    public string EventType { get; set; } = "Sag"; // Sag | Swell | Interruption | Transient
    public string Phase { get; set; } = "R"; // R | Y | B | 3-Phase
    public double MagnitudePercent { get; set; } // e.g. 68% for sag, 124% for swell
    public double Voltage { get; set; }
    public double DurationMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Severity { get; set; } = "Warning"; // Critical | Warning | Info
    public string Status { get; set; } = "Resolved"; // Active | Resolved
    public bool IticLimitExceeded { get; set; }
    public string Description { get; set; } = string.Empty;
}
