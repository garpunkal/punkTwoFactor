using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using punkTwoFactor.Models;
using punkTwoFactor.Providers;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Security;
using Umbraco.Extensions;

namespace punkTwoFactor.Composers
{
    public class PunkTwoFactorComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            var configSection = builder.Config.GetSection(TwoFactorConfig.ConfigName);
            builder.Services.Configure<TwoFactorConfig>(configSection);

            var twoFactorConfig = configSection.Get<TwoFactorConfig>() ?? new TwoFactorConfig();

            var identityBuilder = new BackOfficeIdentityBuilder(builder.Services);
            identityBuilder.AddTwoFactorProvider<UmbracoUserAppAuthenticator>(twoFactorConfig.ProviderName);
        }
    }
}
