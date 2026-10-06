using System;

namespace punkTwoFactor.Models
{
    public class TwoFactorConfig
    {
        public const string ConfigName = "punkTwoFactor";

        public string ProviderName { get; set; } = "Two Factor Authentication";
        public string Issuer { get; set; } = "Umbraco Two Factor Authentication";

        [Obsolete("BackOfficeView is no longer used in Umbraco 14+ as the backoffice UI uses Umbraco's native MFA components.")]
        public string? BackOfficeView { get; set; }
    }
}
