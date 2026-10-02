using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using Npgsql;

namespace VayuRaysCloudConnector;

/// <summary>
/// Cloud-side MQTT subscriber that receives telemetry and heartbeat messages
/// from the VayuRays Cloud Connector and writes them into TimescaleDB.
///
/// Deploy this as a standalone .NET Worker Service on the same VM as TimescaleDB,
/// or run it inside the VayuRays Service for local testing.
/// </summary>
public class TimescaleDbIngester : BackgroundService
{
    private readonly ILogger<TimescaleDbIngester> _logger;
    private readonly string _connectionString;
    private readonly string _brokerAddress;
    private readonly int _brokerPort;
    private IMqttClient? _mqttClient;

    public TimescaleDbIngester(ILogger<TimescaleDbIngester> logger)
    {
        _logger = logger;
        // These would come from appsettings.json or environment variables in production
        _connectionString = Environment.GetEnvironmentVariable("TIMESCALE_CONN")
            ?? "Host=localhost;Port=5432;Database=vayurays_cloud;Username=postgres;Password=postgres";
        _brokerAddress = Environment.GetEnvironmentVariable("MQTT_BROKER") ?? "localhost";
        _brokerPort = int.TryParse(Environment.GetEnvironmentVariable("MQTT_PORT"), out var p) ? p : 1883;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new MqttFactory();
        _mqttClient = factory.CreateMqttClient();

        _mqttClient.ApplicationMessageReceivedAsync += async e =>
        {
            try
            {
                var topic = e.ApplicationMessage.Topic;
                var payload = e.ApplicationMessage.ConvertPayloadToString();

                if (topic.EndsWith("/telemetry"))
                {
                    await IngestTelemetryAsync(payload);
                }
                else if (topic.EndsWith("/status"))
                {
                    await IngestStatusAsync(payload);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ingest MQTT message.");
            }
        };

        // Connect and subscribe
        var options = new MqttClientOptionsBuilder()
            .WithClientId("VayuRays_TimescaleIngester_" + Guid.NewGuid().ToString("N")[..8])
            .WithTcpServer(_brokerAddress, _brokerPort)
            .WithCleanSession()
            .Build();

        while (!stoppingToken.IsCancellationRequested)
        {
            if (!_mqttClient.IsConnected)
            {
                try
                {
                    await _mqttClient.ConnectAsync(options, stoppingToken);
                    // Subscribe to all VayuRays topics
                    await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
                        .WithTopic("vayurays/+/+/telemetry")
                        .Build(), stoppingToken);
                    await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
                        .WithTopic("vayurays/+/+/status")
                        .Build(), stoppingToken);

                    _logger.LogInformation("TimescaleDB Ingester connected to broker and subscribed.");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Ingester connection failed: {Message}. Retrying in 5s...", ex.Message);
                }
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }

        if (_mqttClient.IsConnected)
        {
            await _mqttClient.DisconnectAsync(new MqttClientDisconnectOptions(), cancellationToken: stoppingToken);
        }
    }

    private async Task IngestTelemetryAsync(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var timestamp = root.GetProperty("timestamp").GetString();
        var siteId = root.GetProperty("siteId").GetString();
        var deviceId = root.GetProperty("deviceId").GetString();
        var points = root.GetProperty("points");

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        // Batch insert all points from this message
        await using var batch = new NpgsqlBatch(conn);
        foreach (var point in points.EnumerateObject())
        {
            var cmd = new NpgsqlBatchCommand(
                "INSERT INTO telemetry (time, site_id, device_id, point_id, value) VALUES ($1, $2, $3, $4, $5)");
            cmd.Parameters.AddWithValue(DateTime.Parse(timestamp!).ToUniversalTime());
            cmd.Parameters.AddWithValue(siteId!);
            cmd.Parameters.AddWithValue(deviceId!);
            cmd.Parameters.AddWithValue(point.Name);
            cmd.Parameters.AddWithValue(point.Value.GetDouble());
            batch.BatchCommands.Add(cmd);
        }

        await batch.ExecuteNonQueryAsync();
        _logger.LogDebug("Ingested {Count} points for {Site}/{Device}.", points.EnumerateObject().Count(), siteId, deviceId);
    }

    private async Task IngestStatusAsync(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var timestamp = root.GetProperty("timestamp").GetString();
        var siteId = root.GetProperty("siteId").GetString();
        var deviceId = root.GetProperty("deviceId").GetString();
        var status = root.GetProperty("status").GetString();
        var pointCount = root.TryGetProperty("pointCount", out var pc) ? pc.GetInt32() : 0;
        var uptimeSeconds = root.TryGetProperty("uptimeSeconds", out var us) ? us.GetInt64() : 0;
        var publishSpeed = root.TryGetProperty("publishSpeed", out var ps) ? ps.GetString() : "Unknown";

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "INSERT INTO device_status (time, site_id, device_id, status, point_count, uptime_seconds, publish_speed) " +
            "VALUES ($1, $2, $3, $4, $5, $6, $7)", conn);

        cmd.Parameters.AddWithValue(DateTime.Parse(timestamp!).ToUniversalTime());
        cmd.Parameters.AddWithValue(siteId!);
        cmd.Parameters.AddWithValue(deviceId!);
        cmd.Parameters.AddWithValue(status!);
        cmd.Parameters.AddWithValue(pointCount);
        cmd.Parameters.AddWithValue(uptimeSeconds);
        cmd.Parameters.AddWithValue(publishSpeed ?? "Unknown");

        await cmd.ExecuteNonQueryAsync();
        _logger.LogDebug("Ingested status '{Status}' for {Site}/{Device}.", status, siteId, deviceId);
    }
}
