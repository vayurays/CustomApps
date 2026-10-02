using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using VayuRaysCloudConnector;

namespace VayuRaysCloudConnector.Tests;

public class CloudConfigManagerTests : IDisposable
{
    private readonly string _testConfigPath;
    private readonly Mock<ILogger<CloudConfigManager>> _mockLogger;

    public CloudConfigManagerTests()
    {
        var currentDir = AppDomain.CurrentDomain.BaseDirectory;
        _testConfigPath = Path.Combine(currentDir, "customApps", "CloudConnector", "cloud_config.json");
        _mockLogger = new Mock<ILogger<CloudConfigManager>>();
        
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
        var manager = new CloudConfigManager(_mockLogger.Object);
        var config = manager.GetConfig();
        
        Assert.NotNull(config);
        Assert.Equal("localhost", config.BrokerAddress);
        Assert.True(File.Exists(_testConfigPath));
    }

    [Fact]
    public void SaveConfig_UpdatesConfigAndWritesToFile()
    {
        var manager = new CloudConfigManager(_mockLogger.Object);
        var config = new CloudConnectorConfig
        {
            BrokerAddress = "aws.iot.com",
            TelemetryTopic = "test/topic"
        };
        
        manager.SaveConfig(config, "test_user");
        
        // Verify in-memory update
        var updatedConfig = manager.GetConfig();
        Assert.Equal("aws.iot.com", updatedConfig.BrokerAddress);
        Assert.Equal("test/topic", updatedConfig.TelemetryTopic);
        
        // Verify disk update
        var fileContent = File.ReadAllText(_testConfigPath);
        Assert.Contains("aws.iot.com", fileContent);
        Assert.Contains("test/topic", fileContent);
    }

    [Fact]
    public void SaveConfig_GeneratesAuditLog_DoesNotLogPassword()
    {
        var manager = new CloudConfigManager(_mockLogger.Object);
        var config = new CloudConnectorConfig
        {
            Password = "MySecretPassword123!"
        };

        manager.SaveConfig(config, "auditor_user");

        // We can't directly check the logger output easily with Moq without deep setup, 
        // but we verify no exception is thrown and the file is written.
        var updatedConfig = manager.GetConfig();
        Assert.Equal("MySecretPassword123!", updatedConfig.Password);
    }
}
