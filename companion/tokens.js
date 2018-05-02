import {TOKEN_LIST,TOKEN_SECRETS} from "../common/globals.js";
import {TOTP} from "../common/totp.js";
import {settingsStorage} from "settings";
import * as settings from "./settings.js";


export function AuthToken() {
  this.totpObj = new TOTP();
  
  this.reloadSettings();
}

AuthToken.prototype.reloadSettings = function() {
  try {
    this.tokens = JSON.parse(settingsStorage.getItem(TOKEN_SECRETS));
    this.tokensList = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  } catch (e) {
    console.error("Settings not parseable, intializing");
    this.tokens = [];
    this.tokensList = [];
  }
  
  if (this.tokens === null || typeof this.tokens === "undefined") {
    console.error("Tokens secrets in settings is null, intializing");
    this.tokens = [];
  }
  
  if (this.tokensList === null || typeof this.tokensList === "undefined") {
    console.error("Tokens list in settings is null, intializing");
    this.tokensList = [];
  }
}

AuthToken.prototype.newToken = function(newVal) {
  this.reloadSettings();
  let rejectNames = settings.checkUniqueNames(newVal);
  
  if ( ! newVal[newVal.length-1]["name"].split(":")[0]) { 
    console.error("Name cannot be empty.");
    settings.revokeLast(TOKEN_LIST, this.tokensList); 
    return;
  } else if (newVal[newVal.length-1]["name"].indexOf(':') === -1) {
    console.error("Delimeter not found, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, this.tokensList);
    return;
  } else if ( rejectNames.length > 0 ) {
    console.error("Item already exists, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, this.tokensList);
    return;
  } else if ( ! this.validateToken(newVal[newVal.length-1]["name"].split(":")[1])) {
    console.error("Invalid token, removing latest user submission.");
    settings.revokeLast(TOKEN_LIST, this.tokensList);
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
  if (! token) return false; // Doesn't exist
  if (token.length < 16) return false; // Too short
  
  try {
    this.totpObj.getOTP(token);
  } catch (e) {
    console.error("Token was invalid, following error given: " + e);
    return false;
  }
  return true;
}

AuthToken.prototype.reorderTokens = function(tokens) {
  this.reloadSettings();
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
  // Sometiems we just need to reload, in this case calculate epoch
  if (typeof epoch === "undefined") {
    epoch = Math.round(new Date().getTime() / 1000.0);
  }
  
  this.reloadSettings();
  if (this.tokensList.length > this.tokens.length) {
    console.error("Missing token, re-parse token_list");
    this.newToken(this.tokensList); // Re-parse
    this.reloadSettings(); // Update list again so we don't send old data
  } else if (this.tokensList.length < this.tokens.length) {
    console.error("Tokens were deleted from the settings but not the backend. Deleting.");
    this.deleteToken(settings.deleteItem(this.tokens, this.tokensList));
    this.reloadSettings(); // Update list again so we don't send old data
  }
  
  
  let totps = {"totps":[]};
  for (let j in this.tokens) {
    if (this.tokens[j].hasOwnProperty('token')) {
      totps.totps.push({"name":this.tokens[j]["name"],"totp":this.totpObj.getOTP(this.tokens[j]["token"], epoch)});
    }
  }
  console.log(`totp sent.`);
  return totps;
}

AuthToken.prototype.deleteToken = function(toDelete) {
  this.reloadSettings();
  
  for (let d in toDelete) { // In case of multiple items to be deleted
    for (let i in this.tokens) {
      if(toDelete.includes(this.tokens[i]["name"])) {
        this.tokens.splice(i, 1);
      }
    }
  }

  settingsStorage.setItem(TOKEN_SECRETS, JSON.stringify(this.tokens));
  return;
}
