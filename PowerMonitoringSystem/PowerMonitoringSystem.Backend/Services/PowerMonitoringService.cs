using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using VayuRays.Core;
using VayuRays.Core.Extensibility;
using VayuRays.Core.Models;
using PowerMonitoringSystem.Backend.Models;

namespace PowerMonitoringSystem.Backend.Services;

public class PowerMonitoringService : IPowerMonitoringService
{
    private const string HierarchySettingKey = "PowerMonitoring_Hierarchy";
    private const string SettingsKey = "PowerMonitoring_Settings";
    private readonly VayuDbContext _db;
    private readonly ILogger<PowerMonitoringService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public PowerMonitoringService(VayuDbContext db, ILogger<PowerMonitoringService> logger, IServiceProvider serviceProvider)
    {
        _db = db;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task<HierarchyNodeDto?> GetHierarchyAsync(string mode = "live")
    {
        try
        {
            var setting = await _db.AppSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == HierarchySettingKey);

            if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
            {
                var deserialized = JsonSerializer.Deserialize<HierarchyNodeDto>(setting.Value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (deserialized != null)
                {
                    return deserialized;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load hierarchy from AppSettings.");
        }

        if (mode.Equals("live", StringComparison.OrdinalIgnoreCase))
        {
            return new HierarchyNodeDto
            {
                Id = "live-root",
                Name = "Configured Distribution Network",
                Type = "Plant",
                Children = new List<HierarchyNodeDto>()
            };
        }

        return CreateDefaultHierarchy();
    }

    public async Task SaveHierarchyAsync(HierarchyNodeDto hierarchy)
    {
        var json = JsonSerializer.Serialize(hierarchy, new JsonSerializerOptions { WriteIndented = false });

        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == HierarchySettingKey);
        if (setting == null)
        {
            setting = new AppSetting
            {
                Key = HierarchySettingKey,
                Value = json
            };
            _db.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = json;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<PowerMonitoringSettingsDto> GetSettingsAsync()
    {
        try
        {
            var setting = await _db.AppSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == SettingsKey);

            if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
            {
                var deserialized = JsonSerializer.Deserialize<PowerMonitoringSettingsDto>(setting.Value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (deserialized != null)
                {
                    return deserialized;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load settings from AppSettings.");
        }

        return new PowerMonitoringSettingsDto { EnableDemoMode = false };
    }

    public async Task SaveSettingsAsync(PowerMonitoringSettingsDto settings)
    {
        var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = false });

        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == SettingsKey);
        if (setting == null)
        {
            setting = new AppSetting
            {
                Key = SettingsKey,
                Value = json
            };
            _db.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = json;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<List<DiscoveredItemDto>> GetDiscoveredItemsAsync()
    {
        var result = new List<DiscoveredItemDto>();

        try
        {
            var devices = await _db.SavedDevices
                .AsNoTracking()
                .Where(d => !d.IsDisabled)
                .ToListAsync();

            foreach (var dev in devices)
            {
                result.Add(new DiscoveredItemDto
                {
                    Id = $"dev-{dev.Id}",
                    Name = dev.Name,
                    Protocol = dev.Protocol.ToString(),
                    DeviceIp = !string.IsNullOrEmpty(dev.Address) ? dev.Address : dev.DeviceId.ToString(),
                    RegisterOrInstance = dev.DeviceId.ToString(),
                    ItemType = "Device",
                    Unit = "Meter Device",
                    PresentValue = null
                });
            }

            var points = await _db.VPoints
                .AsNoTracking()
                .Include(p => p.Unit)
                .Include(p => p.SavedDevice)
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            foreach (var p in points)
            {
                var pointName = !string.IsNullOrWhiteSpace(p.UserFriendlyName)
                    ? p.UserFriendlyName
                    : (!string.IsNullOrWhiteSpace(p.Name) ? p.Name : p.PointIdentifier);

                result.Add(new DiscoveredItemDto
                {
                    Id = p.Id.ToString(),
                    Name = pointName,
                    Protocol = p.SavedDevice != null ? p.SavedDevice.Protocol.ToString() : "BACnet",
                    DeviceIp = p.SavedDevice?.Address ?? (!string.IsNullOrEmpty(p.DeviceName) ? p.DeviceName : "Local"),
                    RegisterOrInstance = p.PointIdentifier,
                    ItemType = "Point",
                    Unit = p.Unit?.Symbol ?? "N/A",
                    PresentValue = p.OutValue
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting discovered items.");
        }

        if (result.Count == 0)
        {
            result.Add(new DiscoveredItemDto { Id = "dp-1", Name = "Main Incomer 1 (PM-101)", Protocol = "Modbus", DeviceIp = "192.168.1.50", RegisterOrInstance = "40001", ItemType = "Device", Unit = "Meter" });
            result.Add(new DiscoveredItemDto { Id = "dp-2", Name = "Main Incomer 2 (PM-102)", Protocol = "BACnet", DeviceIp = "192.168.1.51", RegisterOrInstance = "DEV:1002", ItemType = "Device", Unit = "Meter" });
            result.Add(new DiscoveredItemDto { Id = "dp-3", Name = "Chiller Plant Feeder", Protocol = "Modbus", DeviceIp = "192.168.1.52", RegisterOrInstance = "40001", ItemType = "Device", Unit = "Meter" });
            result.Add(new DiscoveredItemDto { Id = "dp-4", Name = "Lighting Sub-Distribution", Protocol = "Modbus", DeviceIp = "192.168.1.53", RegisterOrInstance = "40001", ItemType = "Device", Unit = "Meter" });
        }

        return result;
    }
    public async Task<MeterTelemetryDto> GetTelemetryAsync(string nodeId, string mode = "live")
    {
        var hierarchy = await GetHierarchyAsync(mode);
        var node = (hierarchy != null ? FindNode(hierarchy, nodeId) : null) ?? hierarchy ?? CreateDefaultHierarchy();

        var metrics = await ResolveNodeLiveMetricsAsync(node, mode);

        double vAvg = metrics.V;
        double iAvg = metrics.I;
        double actPwr = metrics.Kw;
        double pFactor = metrics.Pf;
        double freq = metrics.Hz;
        double appPwr = metrics.Kva;
        double reactPwr = metrics.Kvar;
        double energyToday = metrics.Kwh;

        bool isLive = mode.Equals("live", StringComparison.OrdinalIgnoreCase);

        double vrLn, vyLn, vbLn, vryLl, vybLl, vbrLl;
        double ir, iy, ib, ineu;
        double pwrR, pwrY, pwrB;
        double reactR, reactY, reactB;
        double pfR, pfY, pfB;
        double thdVr, thdVy, thdVb, thdIr, thdIy, thdIb;
        double vUnbal, iUnbal;

        if (isLive)
        {
            vrLn = vAvg > 0 ? Math.Round(vAvg / 1.732, 1) : 0.0;
            vyLn = vrLn;
            vbLn = vrLn;

            vryLl = Math.Round(vAvg, 1);
            vybLl = vryLl;
            vbrLl = vryLl;

            ir = Math.Round(iAvg / 3.0, 1);
            iy = ir;
            ib = ir;
            ineu = 0.0;

            pwrR = Math.Round(actPwr / 3.0, 1);
            pwrY = pwrR;
            pwrB = pwrR;

            reactR = Math.Round(reactPwr / 3.0, 1);
            reactY = reactR;
            reactB = reactR;

            pfR = Math.Round(pFactor, 2);
            pfY = pfR;
            pfB = pfR;

            thdVr = Math.Round(metrics.ThdV, 2);
            thdVy = thdVr;
            thdVb = thdVr;
            thdIr = Math.Round(metrics.ThdI, 2);
            thdIy = thdIr;
            thdIb = thdIr;

            vUnbal = 0.0;
            iUnbal = 0.0;
        }
        else
        {
            vrLn = Math.Round(vAvg / 1.732, 1);
            vyLn = Math.Round(vrLn + 0.5, 1);
            vbLn = Math.Round(vrLn - 0.3, 1);

            vryLl = Math.Round(vAvg, 1);
            vybLl = Math.Round(vAvg + 1.2, 1);
            vbrLl = Math.Round(vAvg - 0.8, 1);

            ir = Math.Round(iAvg * 0.98, 1);
            iy = Math.Round(iAvg * 1.02, 1);
            ib = Math.Round(iAvg * 1.00, 1);
            ineu = Math.Round(Math.Abs(ir - iy) * 0.4 + 4.2, 1);

            pwrR = Math.Round(actPwr * 0.334, 1);
            pwrY = Math.Round(actPwr * 0.339, 1);
            pwrB = Math.Round(actPwr * 0.327, 1);

            reactR = Math.Round(reactPwr * 0.35, 1);
            reactY = Math.Round(reactPwr * 0.33, 1);
            reactB = Math.Round(reactPwr * 0.32, 1);

            pfR = Math.Round(pFactor, 2);
            pfY = Math.Round(pFactor - 0.01, 2);
            pfB = Math.Round(pFactor + 0.01, 2);

            thdVr = 1.8;
            thdVy = 1.9;
            thdVb = 2.1;
            thdIr = 3.2;
            thdIy = 3.4;
            thdIb = 3.0;

            vUnbal = Math.Round((Math.Max(Math.Abs(vryLl - vAvg), Math.Max(Math.Abs(vybLl - vAvg), Math.Abs(vbrLl - vAvg))) / Math.Max(1.0, vAvg)) * 100, 2);
            iUnbal = Math.Round((Math.Max(Math.Abs(ir - iAvg), Math.Max(Math.Abs(iy - iAvg), Math.Abs(ib - iAvg))) / Math.Max(1.0, iAvg)) * 100, 2);
        }

        string status;
        int healthScore;
        if (isLive && !metrics.IsConfigured)
        {
            status = "Unconfigured";
            healthScore = 0;
        }
        else if (isLive && !metrics.IsOnline)
        {
            status = "Offline / No Data";
            healthScore = 50;
        }
        else
        {
            status = (vUnbal > 2.0 || iUnbal > 5.0 || pFactor < 0.85) ? "Warning" : "Healthy";
            healthScore = (int)Math.Clamp(100 - (vUnbal * 8 + iUnbal * 3 + (1.0 - Math.Max(0.5, pFactor)) * 50), 50, 99);
        }

        return new MeterTelemetryDto
        {
            NodeId = node.Id,
            NodeName = node.Name,
            NodeType = node.Type,
            VoltageAvg = Math.Round(vAvg, 1),
            CurrentAvg = Math.Round(iAvg, 1),
            PowerFactor = Math.Round(pFactor, 2),
            Frequency = Math.Round(freq, 2),
            ActivePower = Math.Round(actPwr, 1),
            ApparentPower = Math.Round(appPwr, 1),
            ReactivePower = Math.Round(reactPwr, 1),
            EnergyToday = Math.Round(energyToday, 1),
            EnergyYesterday = Math.Round(energyToday * 0.95, 1),
            EnergyMonth = Math.Round(energyToday * 24, 0),
            DemandKw = Math.Round(actPwr * 1.06, 1),
            LoadPercentage = Math.Round(Math.Min(98, actPwr > 0 ? (actPwr / 120.0) * 100 : 0), 0),
            Status = status,
            HealthScore = healthScore,
            IsOnline = metrics.IsOnline,
            LastUpdated = DateTime.UtcNow,

            VR_LN = vrLn,
            VY_LN = vyLn,
            VB_LN = vbLn,
            VRY_LL = vryLl,
            VYB_LL = vybLl,
            VBR_LL = vbrLl,

            IR = ir,
            IY = iy,
            IB = ib,
            INeutral = ineu,

            PowerR = pwrR,
            PowerY = pwrY,
            PowerB = pwrB,

            ReactivePowerR = reactR,
            ReactivePowerY = reactY,
            ReactivePowerB = reactB,

            PFR = pfR,
            PFY = pfY,
            PFB = pfB,

            THD_VR = thdVr,
            THD_VY = thdVy,
            THD_VB = thdVb,
            THD_IR = thdIr,
            THD_IY = thdIy,
            THD_IB = thdIb,

            VoltageImbalancePercent = vUnbal,
            CurrentImbalancePercent = iUnbal,
            PhaseSequence = "R - Y - B"
        };
    }

    public async Task<TrendSeriesDto> GetTrendsAsync(string nodeId, string timeframe, string mode = "live")
    {
        var hierarchy = await GetHierarchyAsync(mode);
        var node = (hierarchy != null ? FindNode(hierarchy, nodeId) : null) ?? hierarchy ?? CreateDefaultHierarchy();
        var metrics = await ResolveNodeLiveMetricsAsync(node, mode);

        var points = new List<TrendPointDto>();
        var now = DateTime.Now;

        if (mode.Equals("live", StringComparison.OrdinalIgnoreCase))
        {
            int? historyPointId = null;
            if (node.ParameterMappings != null && node.ParameterMappings.TryGetValue("activePower", out var pStr) && int.TryParse(pStr, out int pid))
            {
                historyPointId = pid;
            }
            else if (!string.IsNullOrEmpty(node.MappedPointId) && int.TryParse(node.MappedPointId, out int mpid))
            {
                historyPointId = mpid;
            }

            if (historyPointId.HasValue)
            {
                try
                {
                    var histories = await _db.PointHistories
                        .AsNoTracking()
                        .Where(h => h.VPointId == historyPointId.Value && !h.IsDeleted)
                        .OrderByDescending(h => h.Timestamp)
                        .Take(12)
                        .ToListAsync();

                    if (histories.Count > 0)
                    {
                        histories.Reverse();
                        foreach (var h in histories)
                        {
                            double kw = Math.Round(h.Value, 1);
                            double pf = metrics.Pf > 0 ? metrics.Pf : 0.98;
                            double v = metrics.V > 0 ? metrics.V : 415.0;
                            double c = v > 0 ? Math.Round((kw * 1000) / (1.732 * v * Math.Max(0.5, pf)), 1) : 0;
                            points.Add(new TrendPointDto
                            {
                                Time = h.Timestamp.ToLocalTime().ToString("hh:mm tt"),
                                V = v,
                                C = c,
                                Kw = kw,
                                Pf = pf,
                                Hz = metrics.Hz > 0 ? metrics.Hz : 50.0
                            });
                        }
                        return new TrendSeriesDto { Points = points };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to query PointHistories in live mode");
                }
            }

            for (int i = 5; i >= 0; i--)
            {
                var t = now.AddMinutes(-i * 10);
                points.Add(new TrendPointDto
                {
                    Time = t.ToString("hh:mm tt"),
                    V = metrics.V,
                    C = metrics.I,
                    Kw = metrics.Kw,
                    Pf = metrics.Pf,
                    Hz = metrics.Hz
                });
            }
            return new TrendSeriesDto { Points = points };
        }

        int sampleCount = 6;
        TimeSpan step = timeframe switch
        {
            "15 Min" => TimeSpan.FromMinutes(2.5),
            "1 Hour" => TimeSpan.FromMinutes(10),
            "8 Hours" => TimeSpan.FromHours(1.3),
            "24 Hours" => TimeSpan.FromHours(4),
            "7 Days" => TimeSpan.FromDays(1.1),
            "30 Days" => TimeSpan.FromDays(5),
            _ => TimeSpan.FromHours(4)
        };

        var rng = new Random(node.Id.GetHashCode());
        for (int i = sampleCount - 1; i >= 0; i--)
        {
            var t = now - (step * i);
            double vNoise = (rng.NextDouble() - 0.5) * 6.0;
            double iNoise = (rng.NextDouble() - 0.5) * 12.0;
            double kwNoise = (rng.NextDouble() - 0.5) * 8.0;
            double pfNoise = (rng.NextDouble() - 0.5) * 0.03;
            double hzNoise = (rng.NextDouble() - 0.5) * 0.08;

            points.Add(new TrendPointDto
            {
                Time = t.ToString(timeframe.Contains("Day") ? "ddd" : "hh tt"),
                V = Math.Round(metrics.V + vNoise, 1),
                C = Math.Round(metrics.I + iNoise, 1),
                Kw = Math.Round(metrics.Kw + kwNoise, 1),
                Pf = Math.Round(Math.Clamp(metrics.Pf + pfNoise, 0.85, 0.99), 2),
                Hz = Math.Round(metrics.Hz + hzNoise, 2)
            });
        }

        return new TrendSeriesDto { Points = points };
    }
    public async Task<EnergySummaryDto> GetEnergySummaryAsync(string nodeId, string period, string mode = "live")
    {
        var hierarchy = await GetHierarchyAsync(mode);
        var node = (hierarchy != null ? FindNode(hierarchy, nodeId) : null) ?? hierarchy ?? CreateDefaultHierarchy();
        var metrics = await ResolveNodeLiveMetricsAsync(node, mode);

        double baseKw = metrics.Kw;
        double basePf = metrics.Pf > 0 ? metrics.Pf : 0.98;
        double dailyFactor = metrics.Kwh > 0 ? metrics.Kwh : baseKw * 14.5;
        double totalKwh = period switch
        {
            "daily" => Math.Round(dailyFactor, 1),
            "weekly" => Math.Round(dailyFactor * 6.8, 1),
            "monthly" => Math.Round(dailyFactor * 28.5, 0),
            "yearly" => Math.Round(dailyFactor * 340, 0),
            _ => Math.Round(dailyFactor, 1)
        };

        double peakDemand = Math.Round(baseKw * 1.12, 1);
        double carbonKg = Math.Round(totalKwh * 0.82, 1);
        double cost = Math.Round(totalKwh * 8.50, 0);

        var bars = new List<EnergyBarDto>();
        if (period == "weekly")
        {
            string[] days = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
            double[] ratios = { 1.05, 0.98, 1.10, 0.92, 1.08, 0.84, 0.72 };
            for (int i = 0; i < days.Length; i++)
            {
                bars.Add(new EnergyBarDto
                {
                    Label = days[i],
                    Value = Math.Round(dailyFactor * ratios[i], 0),
                    PreviousValue = Math.Round(dailyFactor * (ratios[i] * 0.96), 0)
                });
            }
        }
        else if (period == "monthly")
        {
            string[] weeks = { "Week 1", "Week 2", "Week 3", "Week 4" };
            for (int i = 0; i < weeks.Length; i++)
            {
                bars.Add(new EnergyBarDto
                {
                    Label = weeks[i],
                    Value = Math.Round(dailyFactor * 7 * (0.95 + i * 0.03), 0),
                    PreviousValue = Math.Round(dailyFactor * 7 * 0.94, 0)
                });
            }
        }
        else if (period == "yearly")
        {
            string[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
            for (int i = 0; i < months.Length; i++)
            {
                bars.Add(new EnergyBarDto
                {
                    Label = months[i],
                    Value = Math.Round(dailyFactor * 28 * (0.9 + (i % 4) * 0.06), 0),
                    PreviousValue = Math.Round(dailyFactor * 28 * 0.92, 0)
                });
            }
        }
        else
        {
            string[] intervals = { "00-04", "04-08", "08-12", "12-16", "16-20", "20-24" };
            double[] ratios = { 0.4, 0.6, 1.3, 1.4, 1.2, 0.7 };
            for (int i = 0; i < intervals.Length; i++)
            {
                bars.Add(new EnergyBarDto
                {
                    Label = intervals[i],
                    Value = Math.Round((dailyFactor / 6) * ratios[i], 0),
                    PreviousValue = Math.Round((dailyFactor / 6) * (ratios[i] * 0.95), 0)
                });
            }
        }

        var subFeeders = new List<SubFeederEnergyDto>();
        if (node.Children != null && node.Children.Count > 0)
        {
            double sumChildKw = 0;
            var childMetricsList = new List<(HierarchyNodeDto child, NodeElectricalMetrics m)>();
            foreach (var child in node.Children)
            {
                var m = await ResolveNodeLiveMetricsAsync(child, mode);
                childMetricsList.Add((child, m));
                sumChildKw += m.Kw;
            }

            foreach (var (child, m) in childMetricsList)
            {
                double share = sumChildKw > 0 ? (m.Kw / sumChildKw) * 100.0 : (100.0 / node.Children.Count);
                subFeeders.Add(new SubFeederEnergyDto
                {
                    NodeId = child.Id,
                    Name = child.Name,
                    Type = child.Type,
                    EnergyKwh = Math.Round(totalKwh * (share / 100.0), 1),
                    Percentage = Math.Round(share, 1)
                });
            }
        }
        else
        {
            subFeeders.Add(new SubFeederEnergyDto { NodeId = node.Id, Name = node.Name, Type = node.Type, EnergyKwh = totalKwh, Percentage = 100 });
        }

        return new EnergySummaryDto
        {
            TotalEnergyKwh = totalKwh,
            TotalReactiveKvarh = Math.Round(totalKwh * 0.28, 1),
            TotalApparentKvah = Math.Round(totalKwh / Math.Max(0.1, basePf), 1),
            AveragePowerFactor = Math.Round(basePf, 2),
            PeakDemandKw = peakDemand,
            PeakDemandTime = DateTime.Now.Date.AddHours(14).AddMinutes(35),
            CarbonFootprintKg = carbonKg,
            EstimatedCost = cost,
            VariancePercent = 3.4,
            TrendBars = bars,
            TouBreakdown = new TouBreakdownDto
            {
                PeakKwh = Math.Round(totalKwh * 0.38, 1),
                NormalKwh = Math.Round(totalKwh * 0.45, 1),
                OffPeakKwh = Math.Round(totalKwh * 0.17, 1),
                PeakPercent = 38,
                NormalPercent = 45,
                OffPeakPercent = 17
            },
            SubFeeders = subFeeders
        };
    }

    public async Task<PowerQualityDto> GetPowerQualityAsync(string nodeId, string mode = "live")
    {
        var hierarchy = await GetHierarchyAsync(mode);
        var node = (hierarchy != null ? FindNode(hierarchy, nodeId) : null) ?? hierarchy ?? CreateDefaultHierarchy();
        var metrics = await ResolveNodeLiveMetricsAsync(node, mode);
        var nodeName = node.Name;

        bool isLive = mode.Equals("live", StringComparison.OrdinalIgnoreCase);

        if (isLive)
        {
            var liveHarmonics = new List<HarmonicOrderDto>
            {
                new() { Order = "3rd", Value = Math.Round(metrics.ThdV * 0.4, 2), Limit = 3.0, Status = "Normal" },
                new() { Order = "5th", Value = Math.Round(metrics.ThdV * 0.6, 2), Limit = 3.0, Status = metrics.ThdV * 0.6 > 3.0 ? "Warning" : "Normal" },
                new() { Order = "7th", Value = Math.Round(metrics.ThdV * 0.3, 2), Limit = 3.0, Status = "Normal" },
                new() { Order = "9th", Value = Math.Round(metrics.ThdV * 0.1, 2), Limit = 1.5, Status = "Normal" },
                new() { Order = "11th", Value = Math.Round(metrics.ThdV * 0.15, 2), Limit = 2.0, Status = "Normal" },
                new() { Order = "13th", Value = Math.Round(metrics.ThdV * 0.1, 2), Limit = 2.0, Status = "Normal" }
            };

            var liveDisturbances = new List<PowerQualityDisturbanceDto>();
            try
            {
                var sagSwellAlarms = await _db.AlarmHistories
                    .AsNoTracking()
                    .Include(a => a.VPoint)
                    .Include(a => a.AlarmRule)
                    .Where(a => a.AlarmRule != null && 
                                (a.AlarmRule.Message.Contains("Sag") || a.AlarmRule.Message.Contains("Swell") || a.AlarmRule.Message.Contains("Voltage")))
                    .OrderByDescending(a => a.TimestampUtc)
                    .Take(5)
                    .ToListAsync();

                foreach (var a in sagSwellAlarms)
                {
                    bool isSwell = a.AlarmRule?.Message?.Contains("Swell") ?? false;
                    liveDisturbances.Add(new PowerQualityDisturbanceDto
                    {
                        Id = $"PQ-{a.Id}",
                        EventType = isSwell ? "Swell" : "Sag",
                        Phase = "3-Phase",
                        MagnitudePercent = isSwell ? 115.0 : 82.0,
                        Voltage = a.TriggerValue,
                        DurationMs = 120,
                        Timestamp = a.TimestampUtc,
                        Severity = a.AlarmRule?.Severity.ToString() ?? "Warning",
                        Status = a.IsActive ? "Active" : "Resolved",
                        IticLimitExceeded = false,
                        Description = a.AlarmRule?.Message ?? "Voltage disturbance"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to query real disturbances for power quality");
            }

            return new PowerQualityDto
            {
                ThdVoltageAvg = Math.Round(metrics.ThdV, 2),
                ThdCurrentAvg = Math.Round(metrics.ThdI, 2),
                VoltageUnbalancePercent = 0.0,
                CurrentUnbalancePercent = 0.0,
                FrequencyDeviationHz = Math.Round(Math.Abs(metrics.Hz - 50.0), 2),
                TransformerKFactor = 1.2,
                Ieee519Compliance = (metrics.ThdV <= 5.0 && metrics.ThdI <= 5.0) ? "Pass" : "Warning",
                Harmonics = liveHarmonics,
                PhasorDiagram = new PhasorDiagramDto(),
                Disturbances = liveDisturbances
            };
        }

        var harmonics = new List<HarmonicOrderDto>
        {
            new() { Order = "3rd", Value = 2.1, Limit = 3.0, Status = "Normal" },
            new() { Order = "5th", Value = 3.5, Limit = 3.0, Status = "Warning" },
            new() { Order = "7th", Value = 1.2, Limit = 3.0, Status = "Normal" },
            new() { Order = "9th", Value = 0.4, Limit = 1.5, Status = "Normal" },
            new() { Order = "11th", Value = 0.8, Limit = 2.0, Status = "Normal" },
            new() { Order = "13th", Value = 0.5, Limit = 2.0, Status = "Normal" },
            new() { Order = "17th", Value = 0.3, Limit = 1.5, Status = "Normal" },
            new() { Order = "19th", Value = 0.2, Limit = 1.5, Status = "Normal" },
            new() { Order = "23rd", Value = 0.1, Limit = 1.0, Status = "Normal" },
            new() { Order = "25th", Value = 0.1, Limit = 1.0, Status = "Normal" }
        };

        var disturbances = new List<PowerQualityDisturbanceDto>
        {
            new()
            {
                Id = "EVT-101",
                EventType = "Sag",
                Phase = "B",
                MagnitudePercent = 74.2,
                Voltage = 178.0,
                DurationMs = 180,
                Timestamp = DateTime.UtcNow.AddMinutes(-34),
                Severity = "Warning",
                Status = "Resolved",
                IticLimitExceeded = false,
                Description = $"Voltage dip on Phase B affecting {nodeName}"
            },
            new()
            {
                Id = "EVT-102",
                EventType = "Swell",
                Phase = "R",
                MagnitudePercent = 117.8,
                Voltage = 282.7,
                DurationMs = 75,
                Timestamp = DateTime.UtcNow.AddHours(-3),
                Severity = "Warning",
                Status = "Resolved",
                IticLimitExceeded = false,
                Description = $"Temporary voltage rise during capacitor bank switching on {nodeName}"
            },
            new()
            {
                Id = "EVT-103",
                EventType = "Sag",
                Phase = "3-Phase",
                MagnitudePercent = 58.0,
                Voltage = 240.7,
                DurationMs = 320,
                Timestamp = DateTime.UtcNow.AddHours(-26),
                Severity = "Critical",
                Status = "Resolved",
                IticLimitExceeded = true,
                Description = $"Upstream 33kV utility transmission grid sag on {nodeName}"
            }
        };

        return new PowerQualityDto
        {
            ThdVoltageAvg = 2.1,
            ThdCurrentAvg = 3.5,
            VoltageUnbalancePercent = 0.3,
            CurrentUnbalancePercent = 0.4,
            FrequencyDeviationHz = 0.01,
            TransformerKFactor = 2.4,
            Ieee519Compliance = "Pass",
            Harmonics = harmonics,
            PhasorDiagram = new PhasorDiagramDto(),
            Disturbances = disturbances
        };
    }
    public async Task<List<PowerAlarmDto>> GetAlarmsAsync(string nodeId, string status, string severity, string mode = "live")
    {
        var result = new List<PowerAlarmDto>();

        try
        {
            var dbAlarms = await _db.AlarmHistories
                .AsNoTracking()
                .Include(a => a.VPoint)
                .Include(a => a.AlarmRule)
                .OrderByDescending(a => a.TimestampUtc)
                .Take(50)
                .ToListAsync();

            foreach (var a in dbAlarms)
            {
                var pointName = a.VPoint?.UserFriendlyName ?? a.VPoint?.Name ?? $"Point #{a.VPointId}";
                var sev = a.AlarmRule != null ? a.AlarmRule.Severity.ToString() : "Warning";

                if (!string.IsNullOrEmpty(status) && status.ToLowerInvariant() == "active" && !a.IsActive)
                    continue;

                if (!string.IsNullOrEmpty(severity) && severity.ToLowerInvariant() != "all" && !sev.Equals(severity, StringComparison.OrdinalIgnoreCase))
                    continue;

                result.Add(new PowerAlarmDto
                {
                    Id = a.Id,
                    VPointId = a.VPointId,
                    ParameterName = pointName,
                    NodeName = a.VPoint?.DeviceName ?? "Electrical Meter",
                    Severity = sev,
                    TriggerValue = a.TriggerValue,
                    ThresholdValue = a.AlarmRule?.ThresholdValue,
                    Unit = a.VPoint?.Unit?.Symbol ?? "",
                    Message = a.AlarmRule?.Message ?? $"Alarm triggered on {pointName}",
                    Timestamp = a.TimestampUtc,
                    ResolvedAt = a.ResolvedAtUtc,
                    IsActive = a.IsActive,
                    IsAcknowledged = a.IsAcknowledged,
                    AcknowledgedBy = a.AcknowledgedBy,
                    AcknowledgedAt = a.AcknowledgedAtUtc
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load real AlarmHistories from database.");
        }

        if (result.Count == 0 && mode.Equals("demo", StringComparison.OrdinalIgnoreCase))
        {
            result.Add(new PowerAlarmDto
            {
                Id = 1,
                VPointId = 101,
                ParameterName = "Current Phase Y",
                NodeName = "Feeder-03 (PM-101)",
                Severity = "Critical",
                TriggerValue = 128.0,
                ThresholdValue = 120.0,
                Unit = "A",
                Message = "Current 128 A exceeds continuous thermal limit 120 A",
                Timestamp = DateTime.UtcNow.AddMinutes(-2),
                IsActive = true,
                IsAcknowledged = false
            });

            result.Add(new PowerAlarmDto
            {
                Id = 2,
                VPointId = 102,
                ParameterName = "Power Factor",
                NodeName = "Feeder-03 (PM-101)",
                Severity = "Warning",
                TriggerValue = 0.87,
                ThresholdValue = 0.90,
                Unit = "PF",
                Message = "Operating power factor 0.87 below minimum threshold 0.90",
                Timestamp = DateTime.UtcNow.AddMinutes(-14),
                IsActive = true,
                IsAcknowledged = true,
                AcknowledgedBy = "Operator",
                AcknowledgedAt = DateTime.UtcNow.AddMinutes(-10)
            });

            result.Add(new PowerAlarmDto
            {
                Id = 3,
                VPointId = 103,
                ParameterName = "Voltage Fluctuation",
                NodeName = "MCC-01",
                Severity = "Warning",
                TriggerValue = 428.5,
                ThresholdValue = 425.0,
                Unit = "V",
                Message = "Voltage variation detected outside nominal ±5% band",
                Timestamp = DateTime.UtcNow.AddMinutes(-32),
                IsActive = true,
                IsAcknowledged = false
            });
        }

        if (!string.IsNullOrEmpty(severity) && !severity.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            result = result.Where(a => a.Severity.Equals(severity, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrEmpty(status) && status.Equals("active", StringComparison.OrdinalIgnoreCase))
        {
            result = result.Where(a => a.IsActive).ToList();
        }

        return result;
    }

    public async Task<bool> AcknowledgeAlarmAsync(int alarmId, string username, string? comment)
    {
        try
        {
            var alarm = await _db.AlarmHistories.FindAsync(alarmId);
            if (alarm != null)
            {
                alarm.IsAcknowledged = true;
                alarm.AcknowledgedBy = username;
                alarm.AcknowledgedAtUtc = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(comment))
                {
                    _db.AlarmComments.Add(new AlarmComment
                    {
                        AlarmHistoryId = alarmId,
                        Username = username,
                        CommentText = comment,
                        TimestampUtc = DateTime.UtcNow
                    });
                }

                await _db.SaveChangesAsync();
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge alarm {AlarmId}", alarmId);
        }

        return true;
    }

    public async Task<bool> AcknowledgeAllAlarmsAsync(string username)
    {
        try
        {
            var unacked = await _db.AlarmHistories
                .Where(a => a.IsActive && !a.IsAcknowledged)
                .ToListAsync();

            foreach (var a in unacked)
            {
                a.IsAcknowledged = true;
                a.AcknowledgedBy = username;
                a.AcknowledgedAtUtc = DateTime.UtcNow;
            }

            if (unacked.Count > 0)
            {
                await _db.SaveChangesAsync();
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge all alarms");
            return false;
        }
    }

    public Task<List<ReportTemplateDto>> GetReportTemplatesAsync()
    {
        var templates = new List<ReportTemplateDto>
        {
            new() { Id = "energy-consumption", Name = "Daily / Monthly Energy Consumption Report", Description = "Aggregated active energy (kWh), peak demand, estimated tariff billing, and carbon footprint.", Category = "Energy" },
            new() { Id = "demand-profile", Name = "Maximum Demand & Load Profile Report", Description = "15/30-minute window peak demand analysis, power factor at peak, and load factor utilization.", Category = "Demand" },
            new() { Id = "power-quality-ieee519", Name = "Power Quality & Harmonics Compliance (IEEE 519) Report", Description = "Measured THD-V, THD-I, and individual harmonic orders against IEEE 519 statutory limits.", Category = "Power Quality" },
            new() { Id = "health-audit", Name = "Switchboard Health & Alarm History Audit Report", Description = "Comprehensive audit of voltage stability, trips, active alarm duration, and equipment health score.", Category = "Maintenance" }
        };

        return Task.FromResult(templates);
    }

    public async Task<ReportResultDto> GenerateReportAsync(GenerateReportRequest request, string mode = "live")
    {
        var targetMode = !string.IsNullOrEmpty(request.Mode) ? request.Mode : mode;
        var hierarchy = await GetHierarchyAsync(targetMode);
        var node = (hierarchy != null ? FindNode(hierarchy, request.NodeId) : null) ?? hierarchy ?? CreateDefaultHierarchy();

        var start = request.StartDate ?? DateTime.UtcNow.AddDays(-7);
        var end = request.EndDate ?? DateTime.UtcNow;

        var rows = new List<Dictionary<string, object>>();
        var summary = new Dictionary<string, object>();

        if (request.TemplateId == "power-quality-ieee519")
        {
            var pq = await GetPowerQualityAsync(node.Id, targetMode);
            rows.Add(new() { ["Parameter"] = "THD Voltage (Avg)", ["Measured"] = $"{pq.ThdVoltageAvg} %", ["IEEE519_Limit"] = "5.0 %", ["Compliance"] = pq.ThdVoltageAvg <= 5.0 ? "PASS" : "FAIL" });
            rows.Add(new() { ["Parameter"] = "THD Current (Avg)", ["Measured"] = $"{pq.ThdCurrentAvg} %", ["IEEE519_Limit"] = "5.0 %", ["Compliance"] = pq.ThdCurrentAvg <= 5.0 ? "PASS" : "FAIL" });
            rows.Add(new() { ["Parameter"] = "Voltage Unbalance", ["Measured"] = $"{pq.VoltageUnbalancePercent} %", ["IEEE519_Limit"] = "1.0 %", ["Compliance"] = "PASS" });
            rows.Add(new() { ["Parameter"] = "Current Unbalance", ["Measured"] = $"{pq.CurrentUnbalancePercent} %", ["IEEE519_Limit"] = "5.0 %", ["Compliance"] = "PASS" });
            foreach (var h in pq.Harmonics.Take(6))
            {
                rows.Add(new() { ["Parameter"] = $"{h.Order} Harmonic", ["Measured"] = $"{h.Value} %", ["IEEE519_Limit"] = $"{h.Limit} %", ["Compliance"] = h.Status == "Warning" ? "WARNING" : "PASS" });
            }

            summary["OverallStatus"] = pq.Ieee519Compliance;
            summary["EvaluatedNode"] = node.Name;
            summary["TransformerKFactor"] = pq.TransformerKFactor;
        }
        else
        {
            var energy = await GetEnergySummaryAsync(node.Id, "weekly", targetMode);
            foreach (var b in energy.TrendBars)
            {
                rows.Add(new()
                {
                    ["Date"] = b.Label,
                    ["Energy_kWh"] = b.Value,
                    ["Previous_kWh"] = b.PreviousValue,
                    ["Variance_Pct"] = Math.Round(((b.Value - b.PreviousValue) / Math.Max(1, b.PreviousValue)) * 100, 1),
                    ["Est_Cost_INR"] = Math.Round(b.Value * 8.5, 0)
                });
            }

            summary["TotalEnergy_kWh"] = energy.TotalEnergyKwh;
            summary["PeakDemand_kW"] = energy.PeakDemandKw;
            summary["AveragePF"] = energy.AveragePowerFactor;
            summary["TotalCost_INR"] = energy.EstimatedCost;
            summary["Carbon_kgCO2"] = energy.CarbonFootprintKg;
        }

        return new ReportResultDto
        {
            Title = request.TemplateId == "power-quality-ieee519"
                ? "Power Quality & Harmonics Compliance (IEEE 519) Report"
                : "Energy Consumption & Demand Profile Report",
            GeneratedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss 'UTC'"),
            DateRange = $"{start:yyyy-MM-dd} to {end:yyyy-MM-dd}",
            NodeScope = $"{node.Name} ({node.Type})",
            Rows = rows,
            Summary = summary
        };
    }

    public async Task<byte[]> ExportReportBytesAsync(GenerateReportRequest request, string format, string mode = "live")
    {
        var data = await GenerateReportAsync(request, mode);
        var sb = new StringBuilder();

        sb.AppendLine($"# {data.Title}");
        sb.AppendLine($"# Scope: {data.NodeScope}");
        sb.AppendLine($"# Date Range: {data.DateRange}");
        sb.AppendLine($"# Generated At: {data.GeneratedAt}");
        sb.AppendLine();

        if (data.Rows.Count > 0)
        {
            var headers = data.Rows[0].Keys.ToList();
            sb.AppendLine(string.Join(",", headers));

            foreach (var row in data.Rows)
            {
                var values = headers.Select(h => row.TryGetValue(h, out var v) ? $"\"{v}\"" : "");
                sb.AppendLine(string.Join(",", values));
            }
        }

        sb.AppendLine();
        sb.AppendLine("# Summary Statistics");
        foreach (var kvp in data.Summary)
        {
            sb.AppendLine($"# {kvp.Key},{kvp.Value}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private class NodeElectricalMetrics
    {
        public double V { get; set; }
        public double I { get; set; }
        public double Kw { get; set; }
        public double Pf { get; set; }
        public double Hz { get; set; }
        public double Kvar { get; set; }
        public double Kva { get; set; }
        public double Kwh { get; set; }
        public double ThdV { get; set; }
        public double ThdI { get; set; }
        public bool IsConfigured { get; set; }
        public bool IsOnline { get; set; }
    }

    private static void CollectMeters(HierarchyNodeDto root, List<HierarchyNodeDto> meters)
    {
        if (root.Children == null || root.Children.Count == 0)
        {
            meters.Add(root);
        }
        else
        {
            foreach (var child in root.Children)
            {
                CollectMeters(child, meters);
            }
        }
    }

    private static double GetParamValue(HierarchyNodeDto node, Dictionary<int, double> pointValues, string paramKey, double defaultVal)
    {
        if (node.ParameterMappings != null && node.ParameterMappings.TryGetValue(paramKey, out var pidStr) && int.TryParse(pidStr, out int pid))
        {
            if (pointValues.TryGetValue(pid, out double val)) return val;
        }
        return defaultVal;
    }

    private async Task<NodeElectricalMetrics> ResolveNodeLiveMetricsAsync(HierarchyNodeDto node, string mode = "live")
    {
        bool isLive = mode.Equals("live", StringComparison.OrdinalIgnoreCase);

        var meters = new List<HierarchyNodeDto>();
        CollectMeters(node, meters);

        var pointIds = new HashSet<int>();
        foreach (var m in meters)
        {
            if (m.ParameterMappings != null)
            {
                foreach (var kvp in m.ParameterMappings.Values)
                {
                    if (int.TryParse(kvp, out int pid)) pointIds.Add(pid);
                }
            }
            if (!string.IsNullOrEmpty(m.MappedPointId) && int.TryParse(m.MappedPointId, out int mpid))
            {
                pointIds.Add(mpid);
            }
        }

        if (node.ParameterMappings != null)
        {
            foreach (var kvp in node.ParameterMappings.Values)
            {
                if (int.TryParse(kvp, out int pid)) pointIds.Add(pid);
            }
        }
        if (!string.IsNullOrEmpty(node.MappedPointId) && int.TryParse(node.MappedPointId, out int npid))
        {
            pointIds.Add(npid);
        }

        var pointValues = new Dictionary<int, double>();
        if (pointIds.Count > 0)
        {
            try
            {
                var pts = await _db.VPoints
                    .AsNoTracking()
                    .Where(p => pointIds.Contains(p.Id))
                    .Select(p => new { p.Id, p.OutValue })
                    .ToListAsync();

                foreach (var p in pts)
                {
                    pointValues[p.Id] = p.OutValue ?? 0.0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load live VPoints for node {NodeId}", node.Id);
            }
        }

        if (isLive)
        {
            if (meters.Count == 0 && (node.ParameterMappings == null || node.ParameterMappings.Count == 0) && string.IsNullOrEmpty(node.MappedPointId))
            {
                return new NodeElectricalMetrics { IsConfigured = false, IsOnline = false };
            }

            if (meters.Count <= 1)
            {
                var target = meters.Count == 1 ? meters[0] : node;
                double v = GetParamValue(target, pointValues, "voltage", 0.0);
                double i = GetParamValue(target, pointValues, "current", 0.0);
                double kw = GetParamValue(target, pointValues, "activePower", 0.0);
                if (kw == 0.0 && !string.IsNullOrEmpty(target.MappedPointId) && int.TryParse(target.MappedPointId, out int mpid) && pointValues.TryGetValue(mpid, out double mv))
                {
                    kw = mv;
                }
                double pf = GetParamValue(target, pointValues, "powerFactor", kw > 0 ? 0.98 : 0.0);
                double hz = GetParamValue(target, pointValues, "frequency", (kw > 0 || v > 0) ? 50.0 : 0.0);
                double kvar = GetParamValue(target, pointValues, "reactivePower", kw > 0 && pf > 0 ? Math.Round(kw * Math.Tan(Math.Acos(Math.Clamp(pf, 0.1, 1.0))), 1) : 0.0);
                double kva = GetParamValue(target, pointValues, "apparentPower", kw > 0 && pf > 0 ? Math.Round(kw / pf, 1) : 0.0);
                double kwh = GetParamValue(target, pointValues, "activeEnergy", kw > 0 ? Math.Round(kw * 14.5, 1) : 0.0);
                double thdV = GetParamValue(target, pointValues, "thdVoltage", 0.0);
                double thdI = GetParamValue(target, pointValues, "thdCurrent", 0.0);

                bool hasAny = v > 0 || i > 0 || kw > 0 || kwh > 0;
                return new NodeElectricalMetrics
                {
                    V = v,
                    I = i,
                    Kw = kw,
                    Pf = pf,
                    Hz = hz,
                    Kvar = kvar,
                    Kva = kva,
                    Kwh = kwh,
                    ThdV = thdV,
                    ThdI = thdI,
                    IsConfigured = true,
                    IsOnline = hasAny
                };
            }
            else
            {
                double totalKw = 0;
                double totalKvar = 0;
                double totalKva = 0;
                double totalCurrent = 0;
                double totalKwh = 0;
                double sumVoltage = 0;
                int countVoltage = 0;
                double sumFreq = 0;
                int countFreq = 0;
                double sumThdV = 0;
                int countThdV = 0;
                double sumThdI = 0;
                int countThdI = 0;
                bool anyOnline = false;

                foreach (var m in meters)
                {
                    double v = GetParamValue(m, pointValues, "voltage", 0.0);
                    double i = GetParamValue(m, pointValues, "current", 0.0);
                    double kw = GetParamValue(m, pointValues, "activePower", 0.0);
                    if (kw == 0.0 && !string.IsNullOrEmpty(m.MappedPointId) && int.TryParse(m.MappedPointId, out int mpid) && pointValues.TryGetValue(mpid, out double mv))
                    {
                        kw = mv;
                    }
                    double pf = GetParamValue(m, pointValues, "powerFactor", kw > 0 ? 0.98 : 0.0);
                    double hz = GetParamValue(m, pointValues, "frequency", 0.0);
                    double kvar = GetParamValue(m, pointValues, "reactivePower", kw > 0 && pf > 0 ? kw * Math.Tan(Math.Acos(Math.Clamp(pf, 0.1, 1.0))) : 0.0);
                    double kva = GetParamValue(m, pointValues, "apparentPower", kw > 0 && pf > 0 ? kw / pf : 0.0);
                    double kwh = GetParamValue(m, pointValues, "activeEnergy", kw > 0 ? kw * 14.5 : 0.0);
                    double thdV = GetParamValue(m, pointValues, "thdVoltage", 0.0);
                    double thdI = GetParamValue(m, pointValues, "thdCurrent", 0.0);

                    if (kw > 0 || v > 0 || i > 0) anyOnline = true;

                    totalKw += kw;
                    totalKvar += kvar;
                    totalKva += kva;
                    totalCurrent += i;
                    totalKwh += kwh;

                    if (v > 0) { sumVoltage += v; countVoltage++; }
                    if (hz > 0) { sumFreq += hz; countFreq++; }
                    if (thdV > 0) { sumThdV += thdV; countThdV++; }
                    if (thdI > 0) { sumThdI += thdI; countThdI++; }
                }

                double avgV = countVoltage > 0 ? Math.Round(sumVoltage / countVoltage, 1) : 0.0;
                double avgHz = countFreq > 0 ? Math.Round(sumFreq / countFreq, 2) : 0.0;
                double avgPf = totalKva > 0 ? Math.Round(Math.Clamp(totalKw / totalKva, 0.0, 1.0), 2) : 0.0;
                double avgThdV = countThdV > 0 ? Math.Round(sumThdV / countThdV, 2) : 0.0;
                double avgThdI = countThdI > 0 ? Math.Round(sumThdI / countThdI, 2) : 0.0;

                return new NodeElectricalMetrics
                {
                    V = avgV,
                    I = Math.Round(totalCurrent, 1),
                    Kw = Math.Round(totalKw, 1),
                    Pf = avgPf,
                    Hz = avgHz,
                    Kvar = Math.Round(totalKvar, 1),
                    Kva = Math.Round(totalKva, 1),
                    Kwh = Math.Round(totalKwh, 1),
                    ThdV = avgThdV,
                    ThdI = avgThdI,
                    IsConfigured = true,
                    IsOnline = anyOnline
                };
            }
        }
        else
        {
            if (!string.IsNullOrEmpty(node.MappedPointId) && int.TryParse(node.MappedPointId, out var pointId) && pointValues.TryGetValue(pointId, out double val) && val > 0)
            {
                return new NodeElectricalMetrics
                {
                    V = 415.0,
                    I = Math.Round(val, 1),
                    Kw = Math.Round(val * 0.62, 1),
                    Pf = 0.98,
                    Hz = 50.01,
                    Kvar = Math.Round(val * 0.62 * 0.15, 1),
                    Kva = Math.Round(val * 0.62 / 0.98, 1),
                    Kwh = Math.Round(val * 0.62 * 14.5 + 1200, 1),
                    ThdV = 1.9,
                    ThdI = 3.2,
                    IsConfigured = true,
                    IsOnline = true
                };
            }

            return new NodeElectricalMetrics
            {
                V = 415.0,
                I = 126.0,
                Kw = 78.2,
                Pf = 0.98,
                Hz = 50.01,
                Kvar = 12.1,
                Kva = 80.5,
                Kwh = 78.2 * 14.5 + 1200,
                ThdV = 1.9,
                ThdI = 3.2,
                IsConfigured = true,
                IsOnline = true
            };
        }
    }

    private static HierarchyNodeDto? FindNode(HierarchyNodeDto root, string id)
    {
        if (root.Id == id) return root;
        if (root.Children != null)
        {
            foreach (var child in root.Children)
            {
                var found = FindNode(child, id);
                if (found != null) return found;
            }
        }
        return null;
    }

    private static HierarchyNodeDto CreateDefaultHierarchy()
    {
        return new HierarchyNodeDto
        {
            Id = "p1",
            Name = "Plant A",
            Type = "Plant",
            Children = new List<HierarchyNodeDto>
            {
                new()
                {
                    Id = "mdb-1",
                    Name = "MDB-01 (Main Substation)",
                    Type = "MDB",
                    Children = new List<HierarchyNodeDto>
                    {
                        new()
                        {
                            Id = "mcc-1",
                            Name = "MCC-01 (Motor Control Center)",
                            Type = "MCC",
                            Children = new List<HierarchyNodeDto>
                            {
                                new()
                                {
                                    Id = "f1",
                                    Name = "Feeder-03 (PM-101)",
                                    Type = "Feeder",
                                    Children = new List<HierarchyNodeDto>
                                    {
                                        new()
                                        {
                                            Id = "m1",
                                            Name = "Power Meter PM-101",
                                            Type = "Meter",
                                            MappedPointId = "101"
                                        }
                                    }
                                },
                                new()
                                {
                                    Id = "f2",
                                    Name = "Feeder-04 (Chiller 1)",
                                    Type = "Feeder",
                                    Children = new List<HierarchyNodeDto>
                                    {
                                        new()
                                        {
                                            Id = "m2",
                                            Name = "Power Meter PM-102",
                                            Type = "Meter",
                                            MappedPointId = "102"
                                        }
                                    }
                                }
                            }
                        },
                        new()
                        {
                            Id = "smdb-1",
                            Name = "SMDB-01 (Floor 1 & 2)",
                            Type = "SMDB",
                            Children = new List<HierarchyNodeDto>
                            {
                                new()
                                {
                                    Id = "f3",
                                    Name = "Lighting DB",
                                    Type = "Feeder",
                                    Children = new List<HierarchyNodeDto>()
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}

