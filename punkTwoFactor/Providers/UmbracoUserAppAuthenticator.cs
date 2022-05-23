using Google.Authenticator;
using punkTwoFactor.Models;
using System;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace punkTwoFactor.Providers
{
    public class UmbracoUserAppAuthenticator : ITwoFactorProvider
    {
        private readonly TwoFactorConfig _twoFactorConfig;
        private readonly IUserService _userService;       

        public UmbracoUserAppAuthenticator(TwoFactorConfig twoFactorConfig, IUserService userService)
        {
            _twoFactorConfig = twoFactorConfig ?? throw new ArgumentNullException(nameof(twoFactorConfig));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        public string ProviderName => _twoFactorConfig.ProviderName;

        public Task<object> GetSetupDataAsync(Guid userOrMemberKey, string secret)
        {
            var user = _userService.GetByKey(userOrMemberKey);

            var twoFactorAuthenticator = new TwoFactorAuthenticator();
            SetupCode setupInfo = twoFactorAuthenticator.GenerateSetupCode(_twoFactorConfig.Issuer, user.Username, secret, false);

            return Task.FromResult<object>(new TwoFactorAuthInfo()
            {
                QrCodeSetupImageUrl = setupInfo.QrCodeSetupImageUrl,
                ManualEntryKey = setupInfo.ManualEntryKey,
                Secret = secret,
            });
        }
      
        public bool ValidateTwoFactorPIN(string secret, string code)
            => new TwoFactorAuthenticator().ValidateTwoFactorPIN(secret, code);

        public bool ValidateTwoFactorSetup(string secret, string token) 
            => ValidateTwoFactorPIN(secret, token);
    }
}
