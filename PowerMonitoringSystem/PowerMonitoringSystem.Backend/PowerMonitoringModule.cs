using Microsoft.Extensions.DependencyInjection;
using VayuRays.Core.Extensibility;
using PowerMonitoringSystem.Backend.Services;

namespace PowerMonitoringSystem.Backend;

public class PowerMonitoringModule : IVayuModule
{
    public string Name => "PowerMonitoringSystem";

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddScoped<IPowerMonitoringService, PowerMonitoringService>();
    }
}
