using System;
using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class ReportTemplateDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Energy";
    public List<string> SupportedFormats { get; set; } = new() { "pdf", "excel", "csv" };
}

public class GenerateReportRequest
{
    public string TemplateId { get; set; } = string.Empty;
    public string NodeId { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Format { get; set; } = "csv"; // csv | excel | json
    public string Mode { get; set; } = "live"; // demo | live
}

public class ReportResultDto
{
    public string Title { get; set; } = string.Empty;
    public string GeneratedAt { get; set; } = string.Empty;
    public string DateRange { get; set; } = string.Empty;
    public string NodeScope { get; set; } = string.Empty;
    public List<Dictionary<string, object>> Rows { get; set; } = new();
    public Dictionary<string, object> Summary { get; set; } = new();
}
