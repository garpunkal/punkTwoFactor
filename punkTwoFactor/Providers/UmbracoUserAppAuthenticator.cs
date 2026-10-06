using Google.Authenticator;
using Microsoft.Extensions.Options;
using punkTwoFactor.Models;
using System;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace punkTwoFactor.Providers
{
    public class UmbracoUserAppAuthenticator : ITwoFactorProvider
    {
        private readonly TwoFactorConfig _twoFactorConfig;
        private readonly IUserService _userService;
        private readonly IMemberService? _memberService;

        public UmbracoUserAppAuthenticator(
            IOptions<TwoFactorConfig> twoFactorConfig,
            IUserService userService,
            IMemberService? memberService = null)
        {
            _twoFactorConfig = twoFactorConfig?.Value ?? throw new ArgumentNullException(nameof(twoFactorConfig));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _memberService = memberService;
        }

        public string ProviderName => _twoFactorConfig.ProviderName;

        public async Task<ISetupTwoFactorModel> GetSetupDataAsync(Guid userOrMemberKey, string secret)
        {
            string? username = null;

            IUser? user = await _userService.GetAsync(userOrMemberKey);
            if (user != null)
            {
                username = user.Username;
            }
            else if (_memberService != null)
            {
                var member = _memberService.GetById(userOrMemberKey);
                username = member?.Username;
            }

            if (string.IsNullOrWhiteSpace(username))
            {
                throw new InvalidOperationException($"Could not find user or member with key: {userOrMemberKey}");
            }

            var twoFactorAuthenticator = new TwoFactorAuthenticator();
            SetupCode setupInfo = twoFactorAuthenticator.GenerateSetupCode(_twoFactorConfig.Issuer, username, secret, false);

            return new TwoFactorAuthInfo
            {
                QrCodeSetupImageUrl = setupInfo.QrCodeSetupImageUrl,
                ManualEntryKey = setupInfo.ManualEntryKey,
                Secret = secret,
            };
        }

        public bool ValidateTwoFactorPIN(string secret, string code)
            => new TwoFactorAuthenticator().ValidateTwoFactorPIN(secret, code);

        public bool ValidateTwoFactorSetup(string secret, string token) 
            => ValidateTwoFactorPIN(secret, token);
    }
}
