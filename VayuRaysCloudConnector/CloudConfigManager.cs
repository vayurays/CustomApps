using System;
using System.IO;
using System.Text.Json;
using System.Threading;

namespace VayuRaysCloudConnector;

public interface ICloudConfigManager
{
    CloudConnectorConfig GetConfig();
    void SaveConfig(CloudConnectorConfig config);
}

public class CloudConfigManager : ICloudConfigManager
{
    private readonly string _configPath;
    private CloudConnectorConfig _currentConfig;
    private readonly ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();

    public CloudConfigManager()
    {
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
        catch
        {
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
            // Reload if modified externally? For now, assume this process is the only one editing.
            return _currentConfig;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public void SaveConfig(CloudConnectorConfig config)
    {
        _lock.EnterWriteLock();
        try
        {
            _currentConfig = config;
            SaveToFileInternal();
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }
}
