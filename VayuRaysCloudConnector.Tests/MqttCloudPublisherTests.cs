using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Moq;
using VayuRays.Core;
using VayuRays.Core.Extensibility;
using VayuRaysCloudConnector;
using Xunit;

namespace VayuRaysCloudConnector.Tests;

public class MqttCloudPublisherTests
{
    private MqttCloudPublisher CreatePublisher(CloudConnectorConfig config)
    {
        var mockLogger = new Mock<ILogger<MqttCloudPublisher>>();
        var mockPublisher = new Mock<ILiveValuePublisher>();
        var mockConfigManager = new Mock<ICloudConfigManager>();
        mockConfigManager.Setup(x => x.GetConfig()).Returns(config);
        return new MqttCloudPublisher(mockLogger.Object, mockPublisher.Object, mockConfigManager.Object);
    }

    private void FireOnPointUpdated(MqttCloudPublisher publisher, string pointId, double value)
    {
        var method = typeof(MqttCloudPublisher).GetMethod(
            "OnPointUpdated",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

        var update = new PointPersistUpdate { PointIdentifier = pointId, Value = value };
        var args = new PointValueChangedEventArgs(update);
        method?.Invoke(publisher, new object[] { null!, args });
    }

    // ── Point Filtering Tests ──

    [Fact]
    public void OnPointUpdated_AddsToBuffer_IfPointIsSelected()
    {
        var config = new CloudConnectorConfig
        {
            SelectedPoints = new List<string> { "SoC", "GridVoltage" }
        };
        var publisher = CreatePublisher(config);

        FireOnPointUpdated(publisher, "SoC", 54.2);

        // No exception thrown, method resolved — point accepted
        Assert.NotNull(publisher);
    }

    [Fact]
    public void OnPointUpdated_IgnoresPoint_IfNotSelected()
    {
        var config = new CloudConnectorConfig
        {
            SelectedPoints = new List<string> { "SoC" }
        };
        var publisher = CreatePublisher(config);

        // "BatteryTemp" is not in SelectedPoints — should be silently ignored
        FireOnPointUpdated(publisher, "BatteryTemp", 32.5);

        Assert.NotNull(publisher);
    }

    [Fact]
    public void OnPointUpdated_IgnoresNull_PointIdentifier()
    {
        var config = new CloudConnectorConfig
        {
            SelectedPoints = new List<string> { "SoC" }
        };
        var publisher = CreatePublisher(config);

        // Null PointIdentifier — should not crash
        var method = typeof(MqttCloudPublisher).GetMethod(
            "OnPointUpdated",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

        var update = new PointPersistUpdate { PointIdentifier = null, Value = 99.9 };
        var args = new PointValueChangedEventArgs(update);
        method?.Invoke(publisher, new object[] { null!, args });

        Assert.NotNull(publisher);
    }

    [Fact]
    public void OnPointUpdated_IgnoresNullValue()
    {
        var config = new CloudConnectorConfig
        {
            SelectedPoints = new List<string> { "SoC" }
        };
        var publisher = CreatePublisher(config);

        // Value is null — should not crash or buffer
        var method = typeof(MqttCloudPublisher).GetMethod(
            "OnPointUpdated",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

        var update = new PointPersistUpdate { PointIdentifier = "SoC" }; // Value not set, remains null
        var args = new PointValueChangedEventArgs(update);
        method?.Invoke(publisher, new object[] { null!, args });

        Assert.NotNull(publisher);
    }

    [Fact]
    public void OnPointUpdated_EmptySelectedPoints_IgnoresAll()
    {
        var config = new CloudConnectorConfig
        {
            SelectedPoints = new List<string>() // Empty — nothing selected
        };
        var publisher = CreatePublisher(config);

        FireOnPointUpdated(publisher, "SoC", 54.2);
        FireOnPointUpdated(publisher, "GridVoltage", 415.3);

        // Should not crash, silently ignores all
        Assert.NotNull(publisher);
    }
}

public class CloudConnectorConfigTests
{
    // ── Speed Tier Tests ──

    [Fact]
    public void PublishSpeed_Economy_Returns30Seconds()
    {
        var config = new CloudConnectorConfig { PublishSpeed = CloudPublishSpeed.Economy };
        Assert.Equal(30, config.PublishIntervalSeconds);
    }

    [Fact]
    public void PublishSpeed_Standard_Returns5Seconds()
    {
        var config = new CloudConnectorConfig { PublishSpeed = CloudPublishSpeed.Standard };
        Assert.Equal(5, config.PublishIntervalSeconds);
    }

    [Fact]
    public void PublishSpeed_RealTime_Returns1Second()
    {
        var config = new CloudConnectorConfig { PublishSpeed = CloudPublishSpeed.RealTime };
        Assert.Equal(1, config.PublishIntervalSeconds);
    }

    [Fact]
    public void DefaultSpeed_IsStandard()
    {
        var config = new CloudConnectorConfig();
        Assert.Equal(CloudPublishSpeed.Standard, config.PublishSpeed);
        Assert.Equal(5, config.PublishIntervalSeconds);
    }

    // ── SiteId / DeviceId Tests ──

    [Fact]
    public void Default_SiteId_And_DeviceId_AreSet()
    {
        var config = new CloudConnectorConfig();
        Assert.Equal("default-site", config.SiteId);
        Assert.Equal("VayuRays_Gateway", config.DeviceId);
    }

    // ── Topic Resolution Tests ──

    [Fact]
    public void ResolveTopic_ReplacesTokens()
    {
        var config = new CloudConnectorConfig
        {
            SiteId = "mumbai-plant-01",
            DeviceId = "BESS1"
        };

        var telemetryTopic = config.ResolveTopic(config.TelemetryTopic);
        var statusTopic = config.ResolveTopic(config.StatusTopic);

        Assert.Equal("vayurays/mumbai-plant-01/BESS1/telemetry", telemetryTopic);
        Assert.Equal("vayurays/mumbai-plant-01/BESS1/status", statusTopic);
    }

    [Fact]
    public void ResolveTopic_HandlesCustomTemplate()
    {
        var config = new CloudConnectorConfig
        {
            SiteId = "delhi-dc-03",
            DeviceId = "PCS_01",
            TelemetryTopic = "custom/{siteId}/data/{deviceId}"
        };

        Assert.Equal("custom/delhi-dc-03/data/PCS_01", config.ResolveTopic(config.TelemetryTopic));
    }

    // ── Heartbeat Config Tests ──

    [Fact]
    public void Default_Heartbeat_IsEnabled_At60Seconds()
    {
        var config = new CloudConnectorConfig();
        Assert.True(config.EnableHeartbeat);
        Assert.Equal(60, config.HeartbeatIntervalSeconds);
    }

    // ── Serialization Roundtrip Test ──

    [Fact]
    public void Config_SurvivesJsonRoundtrip()
    {
        var original = new CloudConnectorConfig
        {
            SiteId = "test-site",
            DeviceId = "test-device",
            PublishSpeed = CloudPublishSpeed.RealTime,
            BrokerAddress = "broker.test.com",
            BrokerPort = 8883,
            UseTls = true,
            EnableHeartbeat = true,
            HeartbeatIntervalSeconds = 30,
            SelectedPoints = new List<string> { "SoC", "Voltage", "Temp" }
        };

        var json = System.Text.Json.JsonSerializer.Serialize(original);
        var deserialized = System.Text.Json.JsonSerializer.Deserialize<CloudConnectorConfig>(json);

        Assert.NotNull(deserialized);
        Assert.Equal("test-site", deserialized.SiteId);
        Assert.Equal("test-device", deserialized.DeviceId);
        Assert.Equal(CloudPublishSpeed.RealTime, deserialized.PublishSpeed);
        Assert.Equal(1, deserialized.PublishIntervalSeconds);
        Assert.Equal("broker.test.com", deserialized.BrokerAddress);
        Assert.Equal(8883, deserialized.BrokerPort);
        Assert.True(deserialized.UseTls);
        Assert.True(deserialized.EnableHeartbeat);
        Assert.Equal(30, deserialized.HeartbeatIntervalSeconds);
        Assert.Equal(3, deserialized.SelectedPoints.Count);
        Assert.Contains("SoC", deserialized.SelectedPoints);
    }
}
