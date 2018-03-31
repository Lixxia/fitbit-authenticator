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
  
  for (let i in tokens) {
    newOrder.push(tokens[i].name)
  }
  
  for (let t in this.file.data) {
    fileOrder.push(this.file.data[t].name);
  }
  for (let a in newOrder) {
    newTokens.data.push(this.file.data[fileOrder.indexOf(newOrder[a])]);
  }
  fs.writeFileSync(FILE_NAME, newTokens, "cbor");  
  return newTokens;
}  

AuthToken.prototype.writeToken = function(tokens) {
  tokens = JSON.parse(JSON.stringify(tokens)); //hasOwnProperty does not function correctly without this re-parse
  
  for (let j=0; j<tokens.length; j++) {
    if (tokens[j].hasOwnProperty('token')) {
      this.file.data.push({"name":tokens[j]["name"],"token":tokens[j]["token"]});
    }
  }
  fs.writeFileSync(FILE_NAME, this.file, "cbor");
  return this.file;
}

AuthToken.prototype.deleteToken = function(token) {
  for (let i=0; i<this.file.data.length; i++) {
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