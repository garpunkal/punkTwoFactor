using Microsoft.Extensions.DependencyInjection;
using punkTwoFactor.Providers;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.BackOffice.Security;
using Umbraco.Extensions;

namespace punkTwoFactor.Extensions
{
    public static class UmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddTwoFactorAuthentication(this IUmbracoBuilder builder, Models.TwoFactorConfig config)
        {
            if (config == null) config = new Models.TwoFactorConfig();
            var identityBuilder = new BackOfficeIdentityBuilder(builder.Services);
            identityBuilder.AddTwoFactorProvider<UmbracoUserAppAuthenticator>(config.ProviderName);
            builder.Services.Configure<TwoFactorLoginViewOptions>(config.ProviderName, options => { options.SetupViewPath = config.View; });
            return builder;
        }
    }
}