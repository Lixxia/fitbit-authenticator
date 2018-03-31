import {jsSHA} from "./sha.js";

export function TOTP() {
  
  var dec2hex = function(s) {
    return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
  };

  var hex2dec = function(s) {
    return parseInt(s, 16);
  };

  var leftpad = function(s, l, p) {
    if (l + 1 >= s.length) {
        s = Array(l + 1 - s.length).join(p) + s;
    }
    return s;
  };

  var base32tohex = function(base32) {
    let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";
    for (let i=0; i<base32.length; i++) {
        let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        if ( val >= 0 && val < 32 ) {
          bits += leftpad(val.toString(2), 5, '0');
        } else {
          throw Error("Character out of range: " + base32.charAt(i));
        }
    }
    for (let i=0; i+4<=bits.length; i+=4) {
      let chunk = bits.substr(i, 4);
      hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;
  };

  this.getOTP = function(secret) {
    try {
      let epoch = Math.round(new Date().getTime() / 1000.0);
      let time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");
      let hmacObj = new jsSHA("SHA-1", "HEX");
      
      hmacObj.setHMACKey(base32tohex(secret), "HEX");
      hmacObj.update(time);
      
      let hmac = hmacObj.getHMAC("HEX")
      let offset = hex2dec(hmac.substring(hmac.length - 1));
      let otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
      otp = (otp).substr(otp.length - 6, 6);
    } catch (error) {
      throw error;
    }
    return otp;
  };
}