import * as messaging from "messaging";
import {settingsStorage} from "settings";
import {TOKEN_LIST} from "../common/globals.js";
import {TOTP} from "../common/totp.js";

export function singleSetting(key, setting) {
  let arr = {};
  
  arr[key] = JSON.parse(setting);
  settingsStorage.setItem(key, setting);
  return arr;
}

export function reorderItems(setting) {
  let reorder = {"reorder": JSON.parse(setting)};

  settingsStorage.setItem(TOKEN_LIST, setting);
  return reorder;
}

export function deleteItem(oldVal,newVal) {
  let deleteArr = {}

  if (newVal.length === 0) {
    //Delete only item
    deleteArr["delete"] = oldVal[oldVal.length-1]["name"];
  } else {
    let newNames = [];
    let oldNames = [];
    
    for (let o of oldVal) { oldNames.push(o["name"]); }
    for (let n of newVal) { newNames.push(n["name"]); }

    let delItem = oldNames.filter(function(i) {
      return newNames.indexOf(i) < 0;
    });
    deleteArr["delete"] = delItem[0];
  }
  return deleteArr;
}

export function validateToken(token) {
  if (! token) return false;
  
  let totpTest = new TOTP();
  
  try {
    totpTest.getOTP(token);
  } catch (e) {
    console.error("Token was invalid, following error given: " + e);
    return false;
  }
  return true;
} 
  
export function checkUniqueNames(newArray) {
  var testArray = {};
  var duplicates = [];

  newArray.map(function(item) {
    var itemName = item["name"].split(":")[0];
    if (itemName in testArray) {
      testArray[itemName].duplicate = true;
      item.duplicate = true;
      duplicates.push(itemName);
    }
    else {
      testArray[itemName] = item;
      delete item.duplicate;
    }
  });

  return duplicates;
}

export function revokeLast(item, array) {
  array.pop();
  settingsStorage.setItem(item, JSON.stringify(array));
}

export function newToken(newVal) {
  let tokens = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  let rejectNames = checkUniqueNames(newVal);
  
  if ( ! newVal[newVal.length-1]["name"].split(":")[0]) { //token, validate
    console.error("Name cannot be empty.");
    revokeLast(TOKEN_LIST, tokens); 
  } else if (newVal[newVal.length-1]["name"].indexOf(':') === -1) {
    console.error("Delimeter not found, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
  } else if ( rejectNames.length > 0 ) {
    console.error("Item already exists, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
  } else if ( ! validateToken(newVal[newVal.length-1]["name"].split(":")[1])) {
    console.error("Invalid token, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
  }

  // Build tokens
  for (let i=0; i<tokens.length;i++) {
    tokens[i]["token"] = tokens[i]["name"].split(":")[1];
    tokens[i]["name"] = tokens[i]["name"].split(":")[0];
  }
  settingsStorage.setItem(TOKEN_LIST, JSON.stringify(tokens));
  return tokens;
}

export function stripTokens() {
  let tokens = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  for (let i=0; i<tokens.length;i++) {
    delete tokens[i]["token"];
  }
  settingsStorage.setItem(TOKEN_LIST, JSON.stringify(tokens));
}