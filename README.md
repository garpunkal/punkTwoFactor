# punkTwoFactor

[![NuGet release](https://img.shields.io/nuget/v/punkTwoFactor.svg)](https://www.nuget.org/packages/punkTwoFactor/)

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

Add using statement:
```csharp
using punkTwoFactor.Extensions;
```

Add the following code block within your **ConfigureServices** section above the Umbraco setup:
```csharp
var twoFactorConfiguration = services.ConfigureTwoFactorConfig(_config);
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

- Umbraco 10+    
