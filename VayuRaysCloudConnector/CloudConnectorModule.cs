using Microsoft.Extensions.DependencyInjection;
using VayuRays.Core.Extensibility;

namespace VayuRaysCloudConnector;

public class CloudConnectorModule : IVayuModule
{
    public string Name => "CloudConnector";

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<ICloudConfigManager, CloudConfigManager>();
        
        // Register the background hosted service that actually handles MQTT logic
        services.AddHostedService<MqttCloudPublisher>();
    }
}
