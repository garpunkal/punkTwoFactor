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
        private readonly IUserService _userService;       
        public const string Name = "Umbraco Two Factor Authentication";

        public UmbracoUserAppAuthenticator(IUserService userService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }
        
        public string ProviderName => Name;

        public Task<object> GetSetupDataAsync(Guid userOrMemberKey, string secret)
        {
            var user = _userService.GetByKey(userOrMemberKey);

            var twoFactorAuthenticator = new TwoFactorAuthenticator();
            SetupCode setupInfo = twoFactorAuthenticator.GenerateSetupCode("Umbraco Two Factor Authentication", user.Username, secret, false);
            return Task.FromResult<object>(new TwoFactorAuthInfo()
            {
                QrCodeSetupImageUrl = setupInfo.QrCodeSetupImageUrl,
                Secret = secret,
                ManualEntryKey = setupInfo.ManualEntryKey
            });
        }
      
        public bool ValidateTwoFactorPIN(string secret, string code)
        {
            var twoFactorAuthenticator = new TwoFactorAuthenticator();
            return twoFactorAuthenticator.ValidateTwoFactorPIN(secret, code);
        }

        public bool ValidateTwoFactorSetup(string secret, string token) 
            => ValidateTwoFactorPIN(secret, token);
    }
}
