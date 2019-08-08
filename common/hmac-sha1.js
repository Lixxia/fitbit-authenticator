import {sha1} from "./js-sha1.js";

// Compute the HMAC-SHA1 of a message with a key. Key, message, and return value are all Uint8Arrays.
export function hmac_sha1(keyArray, messageArray) {
  if (keyArray.length > 64) {
    keyArray = sha1(keyArray);
  }
  if (keyArray.length < 64) {
    let oldkeyArray = keyArray;
    keyArray = new Uint8Array(64);
    keyArray.set(oldkeyArray); // Copies data from the old Uint8Array into the new one
  }
  let o_key_pad = keyArray.map(v => v ^ 0x5c);
  let i_key_pad = keyArray.map(v => v ^ 0x36);
  return sha1_uint8array(concat(o_key_pad, sha1_uint8array(concat(i_key_pad, messageArray))));
}

// Compute the SHA1 hash of a Uint8Array, returned as a Uint8Array
function sha1_uint8array(messageArray) {
  // sha1.arrayBuffer uses DataView, which doesn't exist in Fitbit's JS engine. sha1.array is still pretty fast, and compatible with Uint8Array.
  return new Uint8Array(sha1.array(messageArray));
}

// Concatenate two Uint8Arrays
function concat(arr1, arr2) {
  let out = new Uint8Array(arr1.length + arr2.length);
  out.set(arr1);
  out.set(arr2, arr1.length);
  return out;
}