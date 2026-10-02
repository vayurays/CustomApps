using System.IO;
using System.Threading.Tasks;
using Xunit;
using VayuRaysCloudConnector;
using System;

namespace VayuRaysCloudConnector.Tests;

public class CloudConfigManagerTests : IDisposable
{
    private readonly string _testConfigPath;

    public CloudConfigManagerTests()
    {
        var currentDir = AppDomain.CurrentDomain.BaseDirectory;
        _testConfigPath = Path.Combine(currentDir, "customApps", "CloudConnector", "cloud_config.json");
        
        // Clean up before test
        if (File.Exists(_testConfigPath))
            File.Delete(_testConfigPath);
    }

    public void Dispose()
    {
        // Clean up after test
        if (File.Exists(_testConfigPath))
            File.Delete(_testConfigPath);
    }

    [Fact]
    public void GetConfig_CreatesDefault_WhenFileDoesNotExist()
    {
        var manager = new CloudConfigManager();
        var config = manager.GetConfig();
        
        Assert.NotNull(config);
        Assert.Equal("localhost", config.BrokerAddress);
        Assert.True(File.Exists(_testConfigPath));
    }

    [Fact]
    public void SaveConfig_UpdatesConfigAndWritesToFile()
    {
        var manager = new CloudConfigManager();
        var config = new CloudConnectorConfig
        {
            BrokerAddress = "aws.iot.com",
            TelemetryTopic = "test/topic"
        };
        
        manager.SaveConfig(config);
        
        // Verify in-memory update
        var updatedConfig = manager.GetConfig();
        Assert.Equal("aws.iot.com", updatedConfig.BrokerAddress);
        Assert.Equal("test/topic", updatedConfig.TelemetryTopic);
        
        // Verify disk update
        var fileContent = File.ReadAllText(_testConfigPath);
        Assert.Contains("aws.iot.com", fileContent);
        Assert.Contains("test/topic", fileContent);
    }
}
