using System;
using Microsoft.AspNetCore.Mvc;

namespace VayuRaysCloudConnector;

[ApiController]
[Route("api/customapps/cloudconnector")]
public class CloudConnectorController : ControllerBase
{
    private readonly ICloudConfigManager _configManager;

    public CloudConnectorController(ICloudConfigManager configManager)
    {
        _configManager = configManager;
    }

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        try
        {
            var config = _configManager.GetConfig();
            return Ok(config);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error reading config: {ex.Message}");
        }
    }

    [HttpPost("config")]
    public IActionResult SaveConfig([FromBody] CloudConnectorConfig config)
    {
        if (config == null)
            return BadRequest("Invalid configuration.");

        try
        {
            _configManager.SaveConfig(config);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error saving config: {ex.Message}");
        }
    }
}
