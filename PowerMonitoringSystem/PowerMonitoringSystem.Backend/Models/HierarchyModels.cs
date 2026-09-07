using System.Collections.Generic;

namespace PowerMonitoringSystem.Backend.Models;

public class HierarchyNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Plant"; // Plant | MDB | SMDB | MCC | Feeder | Meter
    public List<HierarchyNodeDto> Children { get; set; } = new();
    public string? MappedPointId { get; set; }
    public int? MappedDeviceId { get; set; }
    public Dictionary<string, string> ParameterMappings { get; set; } = new();
}

public class DiscoveredItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Protocol { get; set; } = "Modbus";
    public string DeviceIp { get; set; } = string.Empty;
    public string RegisterOrInstance { get; set; } = string.Empty;
    public string ItemType { get; set; } = "Point"; // "Device" or "Point"
    public string? Unit { get; set; }
    public double? PresentValue { get; set; }
}
