# punkTwoFactor

[![.github/workflows/release.yml](https://github.com/garpunkal/punkTwoFactor/actions/workflows/release.yml/badge.svg)](https://github.com/garpunkal/punkTwoFactor/actions/workflows/release.yml)

A simple Umbraco package that uses the documented implementation from Umbraco https://our.umbraco.com/documentation/Reference/Security/two-factor-authentication/#two-factor-authentication-for-users and adds some additional tweaks.

## Nuget

```
Install-Package punkTwoFactor
```

https://www.nuget.org/packages/punkTwoFactor/


## Installation

Add the following section to your appsettings.json:
```json
"punkTwoFactor": {
    "ProviderName": "Two Factor Authentication",
    "Issuer": "Two Factor Authentication - Dev",
    "BackOfficeView": "..\\App_Plugins\\punkTwoFactor\\twoFactorProviderGoogleAuthenticator.html"
  }
```

Add the following code block within your **ConfigureServices** section above the Umbraco setup:
```csharp
services.Configure<TwoFactorConfig>(_config.GetSection("punkTwoFactor"));
TwoFactorConfig twoFactorConfiguration = new();
_config.GetSection("punkTwoFactor").Bind(twoFactorConfiguration);
```

Now add the "AddBackOfficeTwoFactorAuthentication" extension to the Umbraco setup. 

```csharp
services
    .AddUmbraco(_env, _config)
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .AddServices()
    .AddNotifications()               
    .AddBackOfficeTwoFactorAuthentication(twoFactorConfiguration)
    .Build();
```

## Compatibility

- Umbraco 9.5+
