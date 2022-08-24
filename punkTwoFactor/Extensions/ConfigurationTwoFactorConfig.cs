using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using punkTwoFactor.Models;

namespace punkTwoFactor.Extensions
{
    public static class ConfigurationTwoFactorConfig
    {
        public static TwoFactorConfig ConfigureTwoFactorConfig(
            this IServiceCollection services, IConfiguration config, string configName = "punkTwoFactor")
        {
            services.Configure<TwoFactorConfig>(config.GetSection(configName));
            TwoFactorConfig twoFactorConfig = new();
            config.GetSection(configName).Bind(twoFactorConfig);
            return twoFactorConfig;
        }
    }
}
