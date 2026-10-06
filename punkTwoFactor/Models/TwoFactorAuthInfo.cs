using System.Runtime.Serialization;
using Umbraco.Cms.Core.Security;

namespace punkTwoFactor.Models
{
    [DataContract]
    public class TwoFactorAuthInfo : ISetupTwoFactorModel
    {
        [DataMember(Name = "qrCodeSetupImageUrl")]
        public string? QrCodeSetupImageUrl { get; set; }

        [DataMember(Name = "secret")]
        public string? Secret { get; set; }

        [DataMember(Name = "manualEntryKey")]
        public string? ManualEntryKey { get; set; }
    }
}
