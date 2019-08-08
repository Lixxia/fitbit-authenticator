import {hmac_sha1} from "./hmac-sha1.js";

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
    let time = countertouint8array(Math.floor(epoch / 30));
    let hmac = hmac_sha1(secret, time);

    let offset = hmac[hmac.length - 1] & 0x0f;
    let otp = ((hmac[offset] << 24 | hmac[offset+1] << 16 | hmac[offset+2] << 8 | hmac[offset+3]) & 0x7fffffff) + "";
    return otp.substr(otp.length - 6, 6);
  };
}
