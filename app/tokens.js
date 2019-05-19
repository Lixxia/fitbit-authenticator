import * as fs from "fs";
import {FILE_NAME} from "../common/globals.js";

export function AuthToken() {
  try {
    this.file = fs.readFileSync(FILE_NAME, "cbor");
  } catch (err) {
    console.error("File not found, initializing JSON.");
    this.file = {"data":[]};
  }
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
  this.file = newTokens;
  fs.writeFileSync(FILE_NAME, this.file, "cbor");
  return this.file;
}

AuthToken.prototype.writeToken = function(tokens) {
  tokens = JSON.parse(JSON.stringify(tokens)); //hasOwnProperty does not function correctly without this re-parse
  
  for (let j in tokens) {
    if (tokens[j].hasOwnProperty('token')) {
      this.file.data.push({"name":tokens[j]["name"],"token":tokens[j]["token"]});
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