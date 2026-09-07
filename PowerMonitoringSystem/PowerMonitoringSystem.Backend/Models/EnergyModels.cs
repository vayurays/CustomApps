using System;
using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class EnergySummaryDto
{
    public double TotalEnergyKwh { get; set; }
    public double TotalReactiveKvarh { get; set; }
    public double TotalApparentKvah { get; set; }
    public double AveragePowerFactor { get; set; }
    public double PeakDemandKw { get; set; }
    public DateTime PeakDemandTime { get; set; }
    public double CarbonFootprintKg { get; set; }
    public double EstimatedCost { get; set; }
    public double VariancePercent { get; set; }

    public List<EnergyBarDto> TrendBars { get; set; } = new();
    public TouBreakdownDto TouBreakdown { get; set; } = new();
    public List<SubFeederEnergyDto> SubFeeders { get; set; } = new();
}

public class EnergyBarDto
{
    public string Label { get; set; } = string.Empty;
    public double Value { get; set; }
    public double PreviousValue { get; set; }
}

public class TouBreakdownDto
{
    public double PeakKwh { get; set; }
    public double NormalKwh { get; set; }
    public double OffPeakKwh { get; set; }
    public double PeakPercent { get; set; }
    public double NormalPercent { get; set; }
    public double OffPeakPercent { get; set; }
}

public class SubFeederEnergyDto
{
    public string NodeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double EnergyKwh { get; set; }
    public double Percentage { get; set; }
}
