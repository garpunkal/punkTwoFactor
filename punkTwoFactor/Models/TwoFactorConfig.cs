namespace punkTwoFactor.Models
{
    public class TwoFactorConfig
    {
        public string ProviderName { get; set; } = "Umbraco Two Factor Authentication";
        public string Issuer { get; set; } = "Umbraco Two Factor Authentication";

        public string View { get; set; } = "..\\App_Plugins\\punkTwoFactor\\twoFactorProviderGoogleAuthenticator.html";
    }
}
