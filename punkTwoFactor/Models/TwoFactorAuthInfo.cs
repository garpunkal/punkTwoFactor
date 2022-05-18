using System.Runtime.Serialization;

namespace punkTwoFactor.Models
{
    [DataContract]
    public class TwoFactorAuthInfo
    {
        [DataMember(Name = "qrCodeSetupImageUrl")]
        public string QrCodeSetupImageUrl { get; set; }

        [DataMember(Name = "secret")]
        public string Secret { get; set; }

        [DataMember(Name = "manualEntryKey")]
        public string ManualEntryKey { get; set; }
    }
}
