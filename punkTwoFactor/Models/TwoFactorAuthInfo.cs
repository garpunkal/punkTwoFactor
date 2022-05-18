using System.Runtime.Serialization;
using Google.Authenticator;

namespace punkTwoFactor.Models
{
    [DataContract]
    public class TwoFactorAuthInfo
    {
        [DataMember(Name = "qrCodeSetupImageUrl")]
        public string QrCodeSetupImageUrl { get; set; }

        [DataMember(Name = "secret")]
        public string Secret { get; set; }
    }
}
