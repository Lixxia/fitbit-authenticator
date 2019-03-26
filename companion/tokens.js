import {TOKEN_LIST} from "../common/globals.js";
import {TOTP} from "../common/totp.js";
import {settingsStorage} from "settings";
import * as settings from "./settings.js";


export function AuthToken() {
  this.totpObj = new TOTP();
  
  this.reloadSettings();
}

AuthToken.prototype.reloadSettings = function() {
  try {
    this.tokensList = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  } catch (e) {
    console.error("Settings not parseable, intializing");
    this.tokensList = [];
  }
  
  if (this.tokensList === null || typeof this.tokensList === "undefined") {
    console.error("Tokens list in settings is null, intializing");
    this.tokensList = [];
  }
  
  console.log("Reload settings " + JSON.stringify(this.tokensList));
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
  for (let i=0; i<this.tokensList.length;i++) {
    this.tokensList[i]["token"] = this.tokensList[i]["name"].split(":")[1];
    this.tokensList[i]["name"] = this.tokensList[i]["name"].split(":")[0];
  }
  settingsStorage.setItem(TOKEN_LIST, JSON.stringify(this.tokensList));
  return this.tokensList;
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
