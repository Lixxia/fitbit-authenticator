import {hmac_sha1} from "./hmac-sha1.js";

let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// TODO move this to `tokens.js` instead of spending 100ms computing it every time a token is generated
// Convert a base32-encoded string to a Uint8Array
var base32touint8array = function(base32) {
  base32 = base32.replace(/ +/g, ""); // Strip whitespace

  let array = new Uint8Array(Math.floor(base32.length * 5 / 8));
  let arrayIndex = 0;
  let bits = 0;
  let value = 0;

  for (let i=0; i<base32.length; i++) {
    let char = base32.charAt(i).toUpperCase();
    if (char === '0') {
        char = 'O';
    } else if (char === '8') {
        char = 'B';
    } else if (char === '1') {
        char = 'L';
    }
    let val = base32chars.indexOf(char);
    if ( val >= 0 && val < 32 ) {
      value = (value << 5) | val;
      bits += 5;

      // Transfer a byte into the Uint8Array if there is enough data
      if (bits >= 8) {
        array[arrayIndex++] = (value >>> (bits - 8)) & 0xFF;
        value = value & 0xFF;
        bits -= 8;
      }
    } else {
      throw Error("Character out of range: " + char);
    }
  }

  return array;
};

// Convert a TOTP counter to a Uint8Array
var countertouint8array = function(counter) {
  let array = new Uint8Array(8);
  array[0] = (counter & 0xff00000000000000) >>> 56;
  array[1] = (counter & 0x00ff000000000000) >>> 48;
  array[2] = (counter & 0x0000ff0000000000) >>> 40;
  array[3] = (counter & 0x000000ff00000000) >>> 32;
  array[4] = (counter & 0x00000000ff000000) >>> 24
  array[5] = (counter & 0x0000000000ff0000) >>> 16;
  array[6] = (counter & 0x000000000000ff00) >>> 8;
  array[7] = (counter & 0x00000000000000ff);
  return array;
};

export function TOTP() {
  this.getOTP = function(secret, epoch) {
    let secretarray = base32touint8array(secret);
    let time = countertouint8array(Math.floor(epoch / 30));
    let hmac = hmac_sha1(secretarray, time);

    let offset = hmac[hmac.length - 1] & 0x0f;
    let otp = ((hmac[offset] << 24 | hmac[offset+1] << 16 | hmac[offset+2] << 8 | hmac[offset+3]) & 0x7fffffff) + "";
    return otp.substr(otp.length - 6, 6);
  };
}
