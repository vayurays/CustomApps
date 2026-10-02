using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using VayuRays.Core.Extensibility;

namespace VayuRaysCloudConnector;

public class MqttCloudPublisher : BackgroundService
{
    private readonly ILogger<MqttCloudPublisher> _logger;
    private readonly ILiveValuePublisher _valuePublisher;
    private readonly IMqttClient _mqttClient;
    private readonly ICloudConfigManager _configManager;
    private readonly Stopwatch _uptimeWatch = Stopwatch.StartNew();
    private DateTime _lastHeartbeatUtc = DateTime.MinValue;
    private int _selectedPointCount;

    // Thread-safe buffer for telemetry
    private ConcurrentDictionary<string, double> _telemetryBuffer = new();

    public MqttCloudPublisher(ILogger<MqttCloudPublisher> logger, ILiveValuePublisher valuePublisher, ICloudConfigManager configManager)
    {
        _logger = logger;
        _valuePublisher = valuePublisher;
        _configManager = configManager;

        var factory = new MqttFactory();
        _mqttClient = factory.CreateMqttClient();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _valuePublisher.OnPointUpdated += OnPointUpdated;

        while (!stoppingToken.IsCancellationRequested)
        {
            var config = _configManager.GetConfig();
            _selectedPointCount = config.SelectedPoints?.Count ?? 0;

            await TryConnectMqttAsync(config, stoppingToken);

            if (_mqttClient.IsConnected)
            {
                // ── Telemetry flush ──
                if (!_telemetryBuffer.IsEmpty)
                {
                    await PublishTelemetryAsync(config);
                }

                // ── Heartbeat / Status ──
                if (config.EnableHeartbeat)
                {
                    var sinceLast = (DateTime.UtcNow - _lastHeartbeatUtc).TotalSeconds;
                    if (sinceLast >= config.HeartbeatIntervalSeconds)
                    {
                        await PublishHeartbeatAsync(config);
                        _lastHeartbeatUtc = DateTime.UtcNow;
                    }
                }
            }

            // Wait for next cycle — driven by the chosen speed tier
            int delaySecs = config.PublishIntervalSeconds > 0 ? config.PublishIntervalSeconds : 5;
            await Task.Delay(TimeSpan.FromSeconds(delaySecs), stoppingToken);
        }

        _valuePublisher.OnPointUpdated -= OnPointUpdated;

        // Graceful disconnect — publish an "offline" status first
        if (_mqttClient.IsConnected)
        {
            try
            {
                var config = _configManager.GetConfig();
                await PublishStatusAsync(config, "offline");
            }
            catch { /* best-effort */ }

            await _mqttClient.DisconnectAsync(new MqttClientDisconnectOptions(), cancellationToken: stoppingToken);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  MQTT Connection
    // ═══════════════════════════════════════════════════════════════

    private async Task TryConnectMqttAsync(CloudConnectorConfig config, CancellationToken cancellationToken)
    {
        if (_mqttClient.IsConnected) return;
        if (string.IsNullOrEmpty(config.BrokerAddress)) return;

        try
        {
            var optionsBuilder = new MqttClientOptionsBuilder()
                .WithClientId(config.ClientId)
                .WithTcpServer(config.BrokerAddress, config.BrokerPort)
                .WithCleanSession();

            if (!string.IsNullOrEmpty(config.Username))
                optionsBuilder.WithCredentials(config.Username, config.Password);

            if (config.UseTls)
            {
                optionsBuilder.WithTls(new MqttClientOptionsBuilderTlsParameters
                {
                    UseTls = true,
                    CertificateValidationHandler = _ => true
                });
            }

            // Set Last Will & Testament so cloud knows immediately if we crash
            var lwt = JsonSerializer.Serialize(new
            {
                timestamp = DateTime.UtcNow.ToString("O"),
                siteId = config.SiteId,
                deviceId = config.DeviceId,
                status = "offline",
                reason = "unexpected_disconnect"
            });
            optionsBuilder.WithWillTopic(config.ResolveTopic(config.StatusTopic))
                          .WithWillPayload(lwt)
                          .WithWillQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce)
                          .WithWillRetain(true);

            var options = optionsBuilder.Build();
            await _mqttClient.ConnectAsync(options, cancellationToken);
            _logger.LogInformation("CloudConnector connected to MQTT broker {Broker}:{Port} (Speed: {Speed})",
                config.BrokerAddress, config.BrokerPort, config.PublishSpeed);

            // Publish initial "online" status immediately after connecting
            await PublishStatusAsync(config, "online");
            _lastHeartbeatUtc = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("CloudConnector failed to connect to MQTT broker: {Message}", ex.Message);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  Point Update Handler (event from ILiveValuePublisher)
    // ═══════════════════════════════════════════════════════════════

    private void OnPointUpdated(object? sender, PointValueChangedEventArgs e)
    {
        var config = _configManager.GetConfig();
        if (e.Update.PointIdentifier != null
            && config.SelectedPoints != null
            && config.SelectedPoints.Contains(e.Update.PointIdentifier)
            && e.Update.Value.HasValue)
        {
            _telemetryBuffer[e.Update.PointIdentifier] = e.Update.Value.Value;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  Telemetry Publish
    // ═══════════════════════════════════════════════════════════════

    private async Task PublishTelemetryAsync(CloudConnectorConfig config)
    {
        var oldBuffer = Interlocked.Exchange(ref _telemetryBuffer, new ConcurrentDictionary<string, double>());
        if (oldBuffer.IsEmpty) return;

        try
        {
            var pointsToPublish = new Dictionary<string, double>(oldBuffer);

            var payload = new
            {
                timestamp = DateTime.UtcNow.ToString("O"),
                siteId = config.SiteId,
                deviceId = config.DeviceId,
                points = pointsToPublish
            };

            var json = JsonSerializer.Serialize(payload);
            var topic = config.ResolveTopic(config.TelemetryTopic);

            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(json)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce)
                .Build();

            await _mqttClient.PublishAsync(message);
            _logger.LogDebug("CloudConnector published {Count} points to {Topic}.", pointsToPublish.Count, topic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish telemetry to cloud MQTT broker.");

            // Requeue failed points
            foreach (var kvp in oldBuffer)
            {
                _telemetryBuffer.TryAdd(kvp.Key, kvp.Value);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  Heartbeat / Status Publish
    // ═══════════════════════════════════════════════════════════════

    private Task PublishHeartbeatAsync(CloudConnectorConfig config)
    {
        return PublishStatusAsync(config, "online");
    }

    private async Task PublishStatusAsync(CloudConnectorConfig config, string status)
    {
        try
        {
            var payload = new
            {
                timestamp = DateTime.UtcNow.ToString("O"),
                siteId = config.SiteId,
                deviceId = config.DeviceId,
                status = status,
                pointCount = _selectedPointCount,
                uptimeSeconds = (long)_uptimeWatch.Elapsed.TotalSeconds,
                publishSpeed = config.PublishSpeed.ToString()
            };

            var json = JsonSerializer.Serialize(payload);
            var topic = config.ResolveTopic(config.StatusTopic);

            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(json)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce)
                .WithRetainFlag(true) // Retained so new subscribers immediately see the last status
                .Build();

            await _mqttClient.PublishAsync(message);
            _logger.LogDebug("CloudConnector published status '{Status}' to {Topic}.", status, topic);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish heartbeat/status.");
        }
    }
}
