using System.Collections.Generic;
using System.Threading.Tasks;
using PowerMonitoringSystem.Backend.Models;

namespace PowerMonitoringSystem.Backend.Services;

public interface IPowerMonitoringService
{
    Task<HierarchyNodeDto?> GetHierarchyAsync(string mode = "live");
    Task SaveHierarchyAsync(HierarchyNodeDto hierarchy);
    Task<PowerMonitoringSettingsDto> GetSettingsAsync();
    Task SaveSettingsAsync(PowerMonitoringSettingsDto settings);
    Task<List<DiscoveredItemDto>> GetDiscoveredItemsAsync();
    Task<MeterTelemetryDto> GetTelemetryAsync(string nodeId, string mode = "live");
    Task<TrendSeriesDto> GetTrendsAsync(string nodeId, string timeframe, string mode = "live");
    Task<EnergySummaryDto> GetEnergySummaryAsync(string nodeId, string period, string mode = "live");
    Task<PowerQualityDto> GetPowerQualityAsync(string nodeId, string mode = "live");
    Task<List<PowerAlarmDto>> GetAlarmsAsync(string nodeId, string status, string severity, string mode = "live");
    Task<bool> AcknowledgeAlarmAsync(int alarmId, string username, string? comment);
    Task<bool> AcknowledgeAllAlarmsAsync(string username);
    Task<List<ReportTemplateDto>> GetReportTemplatesAsync();
    Task<ReportResultDto> GenerateReportAsync(GenerateReportRequest request, string mode = "live");
    Task<byte[]> ExportReportBytesAsync(GenerateReportRequest request, string format, string mode = "live");
}
