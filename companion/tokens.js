import {TOKEN_LIST,TOKEN_SECRETS} from "../common/globals.js";
import {TOTP} from "../common/totp.js";
import {settingsStorage} from "settings";
import * as settings from "./settings.js";


export function AuthToken() {
  this.totpObj = new TOTP();

  try {
    this.tokens = JSON.parse(settingsStorage.getItem(TOKEN_SECRETS));
  } catch (e) {
    console.error("Settings not found, intializing");
    this.tokens = [];
  }
  if (this.tokens === null || this.tokens === undefined) {
    console.error("Settings not found, intializing");
    this.tokens = [];
  }
}

AuthToken.prototype.newToken = function(newVal) {
  let tokens = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  let rejectNames = settings.checkUniqueNames(newVal);
  
 
  
  if ( ! newVal[newVal.length-1]["name"].split(":")[0]) { 
    console.error("Name cannot be empty.");
    settings.revokeLast(TOKEN_LIST, tokens); 
    return;
  } else if (newVal[newVal.length-1]["name"].indexOf(':') === -1) {
    console.error("Delimeter not found, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, tokens);
    return;
  } else if ( rejectNames.length > 0 ) {
    console.error("Item already exists, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, tokens);
    return;
  } else if ( ! this.validateToken(newVal[newVal.length-1]["name"].split(":")[1])) {
    console.error("Invalid token, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, tokens);
    return;
  }

  // Build token
  let newToken = newVal.pop();
  this.tokens.push({"name": newToken["name"].split(":")[0],"token": newToken["name"].split(":")[1]});
  settingsStorage.setItem(TOKEN_SECRETS, JSON.stringify(this.tokens));
  settings.stripTokens();
  return;
}

AuthToken.prototype.validateToken = function(token) {
  if (! token) return false;
  
  try {
    this.totpObj.getOTP(token);
  } catch (e) {
    console.error("Token was invalid, following error given: " + e);
    return false;
  }
  return true;
}

AuthToken.prototype.reorderTokens = function(tokens) {
  let newOrder = [];
  let fileOrder = [];
  let newTokens = [];
    
  for (let token of tokens.reorder) {
    newOrder.push(token.name)
  }
  
  for (let t in this.tokens) {
    fileOrder.push(this.tokens[t].name);
  }

  for (let name of newOrder) {
    newTokens.push(this.tokens[fileOrder.indexOf(name)]);
  }
  settingsStorage.setItem(TOKEN_SECRETS, JSON.stringify(newTokens));
  return;
}  

AuthToken.prototype.reloadTokens = function(epoch) {
  if (this.tokens.length !== 0) {
    this.tokens = JSON.parse(settingsStorage.getItem(TOKEN_SECRETS)); //Ensure data is up to date
  }
  let list = JSON.parse(settingsStorage.getItem(TOKEN_LIST)).length;
  
  if (list > this.tokens.length) {
    console.error("Missing token, re-parse token_list");
    this.newToken(JSON.parse(settingsStorage.getItem(TOKEN_LIST))); // Re-parse
    this.tokens = JSON.parse(settingsStorage.getItem(TOKEN_SECRETS)); // Update list again so we don't send old data
  }
  
  let totps = {"totps":[]};
  for (let j in this.tokens) {
    if (this.tokens[j].hasOwnProperty('token')) {
      totps.totps.push({"name":this.tokens[j]["name"],"totp":this.totpObj.getOTP(this.tokens[j]["token"], epoch)});
    }
  }
  console.log("totp sent.");
  return totps;
}

AuthToken.prototype.deleteToken = function(token) {
  for (let i in this.tokens) {
    if(this.tokens[i]["name"] === token.delete) {
      this.tokens.splice(i, 1);
    }
  }
  settingsStorage.setItem(TOKEN_SECRETS, JSON.stringify(this.tokens));
  return;
}