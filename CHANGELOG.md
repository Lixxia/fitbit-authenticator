# Changelog

## 1.2.1 - 04/26/2018

- Added settings for choosing number groupings (none, one, or two)
- Added secret key minimum of 16 chars
- Fixed issue introduced by Amazon code fix, now checking against hex length not bit length before padding
- Fixed time being undefined on startup of app, causing erronous tokens to be displayed

## 1.1.1 - 04/22/2018

- Added monospace numbers for supported fonts
- Added display groupings for codes
- Added auto removal of whitespace from inputed codes
- Added display always on option to settings
- Fixed issue with codes (like amazon) that throw "String of HEX type must be in byte increments" error

## 1.0.1 - 04/13/2018

- Fixed bug with initializing after fresh app install

## 1.0.0 - 04/10/2018

- Initial release
- Moved all calculation from watch to phone

