using System;
using System.Collections.Generic;

namespace VayuRaysCloudConnector;

/// <summary>
/// Three pre-defined cloud publish speeds.
/// Economy  = 30s  — Cost-efficient, for non-critical monitoring / energy billing.
/// Standard =  5s  — Good balance of latency and cost.
/// RealTime =  1s  — For BESS, grid dispatch, and critical control loops.
/// </summary>
public enum CloudPublishSpeed
{
    /// <summary>Publishes every 30 seconds. Lowest cloud cost.</summary>
    Economy = 30,

    /// <summary>Publishes every 5 seconds. Default.</summary>
    Standard = 5,

    /// <summary>Publishes every 1 second. Lowest latency.</summary>
    RealTime = 1
}

public class CloudConnectorConfig
{
    // ── Connection ──
    public string BrokerAddress { get; set; } = "localhost";
    public int BrokerPort { get; set; } = 1883;
    public string ClientId { get; set; } = "VayuRays_CloudConnector_" + Guid.NewGuid().ToString("N")[..8];
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public bool UseTls { get; set; } = false;

    // ── Identity ──
    /// <summary>Physical site / plant identifier (e.g., "mumbai-plant-01").</summary>
    public string SiteId { get; set; } = "default-site";

    /// <summary>Logical gateway / device identifier (e.g., "BESS1").</summary>
    public string DeviceId { get; set; } = "VayuRays_Gateway";

    // ── Topics ──
    /// <summary>MQTT topic for telemetry. Tokens {siteId} and {deviceId} are replaced at publish time.</summary>
    public string TelemetryTopic { get; set; } = "vayurays/{siteId}/{deviceId}/telemetry";

    /// <summary>MQTT topic for heartbeat / status messages.</summary>
    public string StatusTopic { get; set; } = "vayurays/{siteId}/{deviceId}/status";

    // ── Speed ──
    /// <summary>Configurable publish speed tier. Maps to a publish interval in seconds.</summary>
    public CloudPublishSpeed PublishSpeed { get; set; } = CloudPublishSpeed.Standard;

    /// <summary>Derived publish interval from the speed tier.</summary>
    public int PublishIntervalSeconds => (int)PublishSpeed;

    // ── Heartbeat ──
    /// <summary>Send periodic heartbeat/status messages to the cloud.</summary>
    public bool EnableHeartbeat { get; set; } = true;

    /// <summary>Heartbeat interval in seconds.</summary>
    public int HeartbeatIntervalSeconds { get; set; } = 60;

    // ── Point Selection ──
    /// <summary>List of PointIdentifiers to push to the cloud. Empty = nothing pushed.</summary>
    public List<string> SelectedPoints { get; set; } = new List<string>();

    /// <summary>Resolves {siteId} and {deviceId} tokens in a topic template.</summary>
    public string ResolveTopic(string topicTemplate)
    {
        return topicTemplate
            .Replace("{siteId}", SiteId)
            .Replace("{deviceId}", DeviceId);
    }
}
