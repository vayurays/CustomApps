using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PowerMonitoringSystem.Backend.Models;
using PowerMonitoringSystem.Backend.Services;

namespace PowerMonitoringSystem.Backend.Controllers;

[ApiController]
[Route("api/power-monitoring")]
[Authorize]
public class PowerMonitoringController : ControllerBase
{
    private readonly IPowerMonitoringService _service;
    private readonly ILogger<PowerMonitoringController> _logger;

    public PowerMonitoringController(IPowerMonitoringService service, ILogger<PowerMonitoringController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetHierarchy([FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetHierarchyAsync(mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get hierarchy");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private bool IsAdminUser()
    {
        if (User?.Identity == null || !User.Identity.IsAuthenticated)
            return false;

        if (User.IsInRole("Administrator") || User.IsInRole("Admin"))
            return true;

        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(roleClaim) && 
            (roleClaim.Equals("Administrator", StringComparison.OrdinalIgnoreCase) || 
             roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        var baseRoleClaim = User.FindFirst("BaseRole")?.Value;
        if (!string.IsNullOrEmpty(baseRoleClaim) && 
            (baseRoleClaim.Equals("Administrator", StringComparison.OrdinalIgnoreCase) || 
             baseRoleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        return false;
    }

    private bool CanAcknowledgeAlarms()
    {
        if (User?.Identity == null || !User.Identity.IsAuthenticated)
            return false;

        if (IsAdminUser())
            return true;

        if (User.IsInRole("Operator"))
            return true;

        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(roleClaim) && roleClaim.Equals("Operator", StringComparison.OrdinalIgnoreCase))
            return true;

        var baseRoleClaim = User.FindFirst("BaseRole")?.Value;
        if (!string.IsNullOrEmpty(baseRoleClaim) && baseRoleClaim.Equals("Operator", StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }

    [HttpPost("hierarchy")]
    public async Task<IActionResult> SaveHierarchy([FromBody] HierarchyNodeDto hierarchy)
    {
        // Enforce Administrator role check: non-admin (e.g. via Postman or script) is rejected
        if (!IsAdminUser())
        {
            _logger.LogWarning("Unauthorized attempt to save hierarchy by user '{User}'", User?.Identity?.Name ?? "Anonymous");
            return StatusCode(403, new { error = "Forbidden: Only Administrator role is authorized to modify or save system configuration." });
        }

        try
        {
            if (hierarchy == null) return BadRequest("Hierarchy cannot be empty");
            await _service.SaveHierarchyAsync(hierarchy);
            return Ok(new { success = true, message = "Hierarchy saved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save hierarchy");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        try
        {
            var result = await _service.GetSettingsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get settings");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("settings")]
    public async Task<IActionResult> SaveSettings([FromBody] PowerMonitoringSettingsDto settings)
    {
        if (!IsAdminUser())
        {
            _logger.LogWarning("Unauthorized attempt to save settings by user '{User}'", User?.Identity?.Name ?? "Anonymous");
            return StatusCode(403, new { error = "Forbidden: Only Administrator role is authorized to modify or save system settings." });
        }

        try
        {
            if (settings == null) return BadRequest("Settings cannot be empty");
            await _service.SaveSettingsAsync(settings);
            return Ok(new { success = true, message = "Settings saved successfully", settings });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save settings");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("discovered-items")]
    public async Task<IActionResult> GetDiscoveredItems()
    {
        try
        {
            var result = await _service.GetDiscoveredItemsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get discovered items");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("telemetry")]
    public async Task<IActionResult> GetTelemetry([FromQuery] string? nodeId, [FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetTelemetryAsync(nodeId ?? "p1", mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get telemetry");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("trends")]
    public async Task<IActionResult> GetTrends([FromQuery] string? nodeId, [FromQuery] string? timeframe, [FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetTrendsAsync(nodeId ?? "p1", timeframe ?? "24 Hours", mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get trends");
            return StatusCode(500, new { error = ex.Message });
        }
    }
    [HttpGet("energy")]
    public async Task<IActionResult> GetEnergy([FromQuery] string? nodeId, [FromQuery] string? period, [FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetEnergySummaryAsync(nodeId ?? "p1", period ?? "daily", mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get energy summary");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("quality")]
    public async Task<IActionResult> GetQuality([FromQuery] string? nodeId, [FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetPowerQualityAsync(nodeId ?? "p1", mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get power quality");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("alarms")]
    public async Task<IActionResult> GetAlarms([FromQuery] string? nodeId, [FromQuery] string? status, [FromQuery] string? severity, [FromQuery] string? mode = "live")
    {
        try
        {
            var result = await _service.GetAlarmsAsync(nodeId ?? "p1", status ?? "all", severity ?? "all", mode ?? "live");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get alarms");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("alarms/{id}/acknowledge")]
    public async Task<IActionResult> AcknowledgeAlarm(int id, [FromBody] AcknowledgeAlarmRequest? req)
    {
        if (!CanAcknowledgeAlarms())
        {
            return StatusCode(403, new { error = "Forbidden: Operator or Administrator role is required to acknowledge alarms." });
        }

        try
        {
            var username = User.Identity?.Name ?? req?.OperatorName ?? "Operator";
            var success = await _service.AcknowledgeAlarmAsync(id, username, req?.Comment);
            return Ok(new { success });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge alarm");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("alarms/acknowledge-all")]
    public async Task<IActionResult> AcknowledgeAllAlarms()
    {
        if (!CanAcknowledgeAlarms())
        {
            return StatusCode(403, new { error = "Forbidden: Operator or Administrator role is required to acknowledge alarms." });
        }

        try
        {
            var username = User.Identity?.Name ?? "Operator";
            var success = await _service.AcknowledgeAllAlarmsAsync(username);
            return Ok(new { success });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge all alarms");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("reports/templates")]
    public async Task<IActionResult> GetReportTemplates()
    {
        try
        {
            var result = await _service.GetReportTemplatesAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get report templates");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("reports/generate")]
    public async Task<IActionResult> GenerateReport([FromBody] GenerateReportRequest request, [FromQuery] string? mode = "live")
    {
        try
        {
            var targetMode = !string.IsNullOrEmpty(request.Mode) ? request.Mode : (mode ?? "live");
            var result = await _service.GenerateReportAsync(request, targetMode);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate report");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("reports/export")]
    public async Task<IActionResult> ExportReport([FromBody] GenerateReportRequest request, [FromQuery] string? mode = "live")
    {
        try
        {
            var format = request.Format?.ToLowerInvariant() ?? "csv";
            var targetMode = !string.IsNullOrEmpty(request.Mode) ? request.Mode : (mode ?? "live");
            var bytes = await _service.ExportReportBytesAsync(request, format, targetMode);
            var filename = $"PowerMonitoring_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(bytes, "text/csv", filename);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to export report");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

