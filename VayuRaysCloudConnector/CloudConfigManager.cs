using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Logging;

namespace VayuRaysCloudConnector;

public interface ICloudConfigManager
{
    CloudConnectorConfig GetConfig();
    void SaveConfig(CloudConnectorConfig config, string modifiedBy);
}

public class CloudConfigManager : ICloudConfigManager
{
    private readonly ILogger<CloudConfigManager> _logger;
    private readonly string _configPath;
    private CloudConnectorConfig _currentConfig;
    private readonly ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();

    public CloudConfigManager(ILogger<CloudConfigManager> logger)
    {
        _logger = logger;
        var currentDir = AppDomain.CurrentDomain.BaseDirectory;
        _configPath = Path.Combine(currentDir, "customApps", "CloudConnector", "cloud_config.json");
        LoadFromFile();
    }

    private void LoadFromFile()
    {
        _lock.EnterWriteLock();
        try
        {
            if (File.Exists(_configPath))
            {
                var json = File.ReadAllText(_configPath);
                _currentConfig = JsonSerializer.Deserialize<CloudConnectorConfig>(json) ?? new CloudConnectorConfig();
            }
            else
            {
                _currentConfig = new CloudConnectorConfig();
                SaveToFileInternal();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load cloud configuration from disk. Falling back to defaults.");
            _currentConfig = new CloudConnectorConfig();
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    private void SaveToFileInternal()
    {
        var dir = Path.GetDirectoryName(_configPath);
        if (dir != null && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }
        var json = JsonSerializer.Serialize(_currentConfig, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_configPath, json);
    }

    public CloudConnectorConfig GetConfig()
    {
        _lock.EnterReadLock();
        try
        {
            return _currentConfig;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public void SaveConfig(CloudConnectorConfig newConfig, string modifiedBy)
    {
        _lock.EnterWriteLock();
        try
        {
            // Cyber Security Requirement: Generate an exact audit trail of what was changed before overwriting.
            GenerateAuditLog(_currentConfig, newConfig, modifiedBy);

            _currentConfig = newConfig;
            SaveToFileInternal();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SECURITY AUDIT: User '{User}' failed to save cloud configuration.", modifiedBy);
            throw;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    /// <summary>
    /// Generates a detailed audit log of changes as per cyber security recommendations.
    /// Masks sensitive information like passwords.
    /// </summary>
    private void GenerateAuditLog(CloudConnectorConfig oldConfig, CloudConnectorConfig newConfig, string modifiedBy)
    {
        var changes = new List<string>();

        if (oldConfig.BrokerAddress != newConfig.BrokerAddress)
            changes.Add($"BrokerAddress changed from '{oldConfig.BrokerAddress}' to '{newConfig.BrokerAddress}'");
            
        if (oldConfig.BrokerPort != newConfig.BrokerPort)
            changes.Add($"BrokerPort changed from {oldConfig.BrokerPort} to {newConfig.BrokerPort}");
            
        if (oldConfig.SiteId != newConfig.SiteId)
            changes.Add($"SiteId changed from '{oldConfig.SiteId}' to '{newConfig.SiteId}'");
            
        if (oldConfig.DeviceId != newConfig.DeviceId)
            changes.Add($"DeviceId changed from '{oldConfig.DeviceId}' to '{newConfig.DeviceId}'");

        if (oldConfig.Username != newConfig.Username)
            changes.Add($"Username changed from '{oldConfig.Username}' to '{newConfig.Username}'");

        // SECURITY: Never log the actual password text, just that it was modified.
        if (oldConfig.Password != newConfig.Password)
            changes.Add("Password was MODIFIED (value redacted for security)");

        if (oldConfig.UseTls != newConfig.UseTls)
            changes.Add($"UseTls changed from {oldConfig.UseTls} to {newConfig.UseTls}");

        if (oldConfig.PublishSpeed != newConfig.PublishSpeed)
            changes.Add($"PublishSpeed changed from {oldConfig.PublishSpeed} to {newConfig.PublishSpeed}");

        if (oldConfig.EnableHeartbeat != newConfig.EnableHeartbeat)
            changes.Add($"EnableHeartbeat changed from {oldConfig.EnableHeartbeat} to {newConfig.EnableHeartbeat}");

        if (oldConfig.HeartbeatIntervalSeconds != newConfig.HeartbeatIntervalSeconds)
            changes.Add($"HeartbeatIntervalSeconds changed from {oldConfig.HeartbeatIntervalSeconds} to {newConfig.HeartbeatIntervalSeconds}");

        // Audit points array changes
        var oldPoints = oldConfig.SelectedPoints ?? new List<string>();
        var newPoints = newConfig.SelectedPoints ?? new List<string>();
        
        var addedPoints = newPoints.Except(oldPoints).ToList();
        var removedPoints = oldPoints.Except(newPoints).ToList();
        
        if (addedPoints.Any())
            changes.Add($"Points ADDED to cloud sync: [{string.Join(", ", addedPoints)}]");
            
        if (removedPoints.Any())
            changes.Add($"Points REMOVED from cloud sync: [{string.Join(", ", removedPoints)}]");

        if (changes.Any())
        {
            // Write a high-priority, structured audit log to the native ILogger
            var auditMessage = string.Join("; ", changes);
            _logger.LogWarning("SECURITY AUDIT: Cloud Connector configuration modified by User: '{User}'. Changes applied: {Changes}", modifiedBy, auditMessage);
        }
        else
        {
            _logger.LogInformation("SECURITY AUDIT: Cloud Connector save requested by User: '{User}', but no fields were modified.", modifiedBy);
        }
    }
}
