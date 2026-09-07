using System;
using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class PowerAlarmDto
{
    public int Id { get; set; }
    public int VPointId { get; set; }
    public string ParameterName { get; set; } = string.Empty;
    public string NodeName { get; set; } = string.Empty;
    public string Severity { get; set; } = "Warning"; // Critical | Warning | Info
    public double TriggerValue { get; set; }
    public double? ThresholdValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsActive { get; set; }
    public bool IsAcknowledged { get; set; }
    public string AcknowledgedBy { get; set; } = string.Empty;
    public DateTime? AcknowledgedAt { get; set; }
}

public class AcknowledgeAlarmRequest
{
    public int AlarmId { get; set; }
    public string OperatorName { get; set; } = "Operator";
    public string? Comment { get; set; }
}
