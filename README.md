# fitbit-authenticator

Authenticator application to generate TOTP codes on FitbitOS.

![](Authenticator-screenshot.png)

This app currently supports storing up to 10 tokens. Each token is submitted in the form `name:key` and must have a unique name. Upon submission the data is sent to the device and the secret key will be stripped from the phone/settings. This leaves the only copy of the data stored on the watch *Please be aware of this and do not use this as your sole source of accessing these MFA tokens*. If the app is uninstalled all associated data is removed. 

Configuration is offered for changing the color, changing the font and displaying a text-based counter.
The settings also support removal and re-order of the tokens.

# References

- jsSHA library used from [jsSHA](http://caligatio.github.com/jsSHA/)
- TOTP generation code adapted from [this blogpost](http://blog.tinisles.com/2011/10/google-authenticator-one-time-password-algorithm-in-javascript/)
- Fitbit example project [sdk-bart](https://github.com/Fitbit/sdk-bart)

