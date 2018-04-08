# fitbit-authenticator

Authenticator application to generate TOTP codes on FitbitOS.

![](Authenticator-screenshot.png)

This app currently supports storing up to 10 tokens. Each token is submitted in the form `name:key` and must have a unique name. Due to hardware constraints on the watch, the TOTP calculations must be done on the companion app which runs on the phone. Upon submission of the secret key the data is stored on the phone and stripped from the visible settings. Every 30 seconds the watch requests the new translated tokens from the phone, these are calculated on the companion and sent back to the watch via fitbit's [Messaging API](https://dev.fitbit.com/build/reference/companion-api/messaging/). 

If the app is uninstalled all associated data is removed. *Please do not use this as your sole source of accessing these MFA tokens*

Configuration is offered for changing the color, changing the font and displaying a text-based counter.
The settings also support removal and re-order of the tokens.

# References

- jsSHA library used from [jsSHA](http://caligatio.github.com/jsSHA/)
- TOTP generation code adapted from [this blogpost](http://blog.tinisles.com/2011/10/google-authenticator-one-time-password-algorithm-in-javascript/)
- Fitbit example project [sdk-bart](https://github.com/Fitbit/sdk-bart)

