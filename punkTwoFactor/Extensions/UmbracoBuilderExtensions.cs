using Microsoft.Extensions.DependencyInjection;
using punkTwoFactor.Models;
using punkTwoFactor.Providers;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Security;
using Umbraco.Extensions;

namespace punkTwoFactor.Extensions
{
    public static class UmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBackOfficeTwoFactorAuthentication(this IUmbracoBuilder builder, TwoFactorConfig? config = null)
        {
            config ??= new TwoFactorConfig();

            builder.Services.Configure<TwoFactorConfig>(options =>
            {
                options.ProviderName = config.ProviderName;
                options.Issuer = config.Issuer;
            });

            var identityBuilder = new BackOfficeIdentityBuilder(builder.Services);
            identityBuilder.AddTwoFactorProvider<UmbracoUserAppAuthenticator>(config.ProviderName);

            return builder;
        }

        public static IUmbracoBuilder AddMemberTwoFactorAuthentication(this IUmbracoBuilder builder, TwoFactorConfig? config = null)
        {
            config ??= new TwoFactorConfig();

            builder.Services.Configure<TwoFactorConfig>(options =>
            {
                options.ProviderName = config.ProviderName;
                options.Issuer = config.Issuer;
            });

            var identityBuilder = new MemberIdentityBuilder(builder.Services);
            identityBuilder.AddTwoFactorProvider<UmbracoUserAppAuthenticator>(config.ProviderName);

            return builder;
        }
    }
}