import * as fs from "fs";
import {FILE_NAME} from "../common/globals.js";
import {base32ToUint8Array} from "../common/util.js";

export function AuthToken() {
  try {
    this.file = fs.readFileSync(FILE_NAME, "cbor");
  } catch (err) {
    console.error("File not found, initializing JSON.");
    this.file = {"data":[]};
  }
  if (this.convertTokensToUint8Array()) {
    fs.writeFileSync(FILE_NAME, this.file, "cbor");
  }
}

// Convert any existing string/base32-encoded tokens to a Uint8Array, and wrap raw ArrayBuffer tokens
AuthToken.prototype.convertTokensToUint8Array = function() {
  let changed = false;
  for (let i in this.file.data) {
    if (typeof this.file.data[i]["token"] == "string") {
      this.file.data[i]["token"] = base32ToUint8Array(this.file.data[i]["token"]);
      changed = true;
    } else if (this.file.data[i]["token"] instanceof ArrayBuffer) {
      // Data read from a CBOR file comes back as a base ArrayBuffer, which needs to be wrapped in a Uint8Array to use.
      // This is not a conversion that can be written to the filesystem, so we don't set `changed`.
      this.file.data[i]["token"] = new Uint8Array(this.file.data[i]["token"]);
    } else if (!(this.file.data[i]["token"] instanceof Uint8Array)) {
      console.error("Unknown object found in token field: " + this.file.data[i]["token"]);
    }
  }
  return changed;
}

AuthToken.prototype.reorderTokens = function(tokens) {
  let newOrder = [];
  let fileOrder = [];
  let newTokens = {"data":[]};
  
  for (let token of tokens) {
    newOrder.push(token.name)
  }
  
  for (let t in this.file.data) {
    fileOrder.push(this.file.data[t].name);
  }

  for (let name of newOrder) {
    newTokens.data.push(this.file.data[fileOrder.indexOf(name)]);
  }
  fs.writeFileSync(FILE_NAME, newTokens, "cbor");
  return newTokens;
}  

AuthToken.prototype.writeToken = function(tokens) {
  tokens = JSON.parse(JSON.stringify(tokens)); //hasOwnProperty does not function correctly without this re-parse
  
  for (let j in tokens) {
    if (tokens[j].hasOwnProperty('token')) {
      this.file.data.push({"name":tokens[j]["name"],"token":base32ToUint8Array(tokens[j]["token"])});
    }
  }
  fs.writeFileSync(FILE_NAME, this.file, "cbor");
  return this.file;
}

AuthToken.prototype.deleteToken = function(token) {
  for (let i in this.file.data) {
    if(this.file.data[i]["name"] === token) {
      this.file.data.splice(i, 1);
    }
  }
  fs.writeFileSync(FILE_NAME, this.file, "cbor");
  return this.file;
}

AuthToken.prototype.reloadTokens = function() {
  return this.file;
}