// Convert a number to a special monospace number
export function monoDigits(num, pad = true) {
  let monoNum = '';
  if (typeof num === 'number') {
    num |= 0;
    if (pad && num < 10) {
      monoNum = c0 + monoDigit(num);
    } else {
      while (num > 0) {
        monoNum = monoDigit(num % 10) + monoNum;
        num = (num / 10) | 0;
      }
    }
  } else {
    let text = num.toString();
    let textLen = text.length;
    for (let i = 0; i < textLen; i++) {
      monoNum += monoDigit(text.charAt(i));
    }
  }
  return monoNum;
}

const c0 = String.fromCharCode(0x10);
const c1 = String.fromCharCode(0x11);
const c2 = String.fromCharCode(0x12);
const c3 = String.fromCharCode(0x13);
const c4 = String.fromCharCode(0x14);
const c5 = String.fromCharCode(0x15);
const c6 = String.fromCharCode(0x16);
const c7 = String.fromCharCode(0x17);
const c8 = String.fromCharCode(0x18);
const c9 = String.fromCharCode(0x19);

function monoDigit(digit) {
  switch (digit) {
    case 0: return c0;
    case 1: return c1;
    case 2: return c2;
    case 3: return c3;
    case 4: return c4;
    case 5: return c5;
    case 6: return c6;
    case 7: return c7;
    case 8: return c8;
    case 9: return c9;
    case '0': return c0;
    case '1': return c1;
    case '2': return c2;
    case '3': return c3;
    case '4': return c4;
    case '5': return c5;
    case '6': return c6;
    case '7': return c7;
    case '8': return c8;
    case '9': return c9;
    default: return digit;
  }
}

let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// Convert a base32-encoded string to a Uint8Array
export function base32ToUint8Array(base32) {
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
}
