import {settingsStorage} from "settings";
import {TOKEN_LIST} from "../common/globals.js";

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
  let deleteArr = [];
  if (newVal.length === 0) {
    //Delete only item
    deleteArr.push(oldVal[oldVal.length-1]["name"]);
  } else {
    let newNames = [];
    let oldNames = [];
    
    for (let o of oldVal) { oldNames.push(o["name"]); }
    for (let n of newVal) { newNames.push(n["name"]); }

    deleteArr = oldNames.filter(function(i) {
      return newNames.indexOf(i) < 0;
    });
  }
  return deleteArr;
}

export function checkUniqueNames(newArray) {
  let testArray = {};
  let duplicates = [];

  newArray.map(function(item) {
    let itemName = item["name"].split(":")[0];
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

export function stripTokens() {
  // After storing the secrets, don't want any tokens visible in settings
  let tokens = JSON.parse(settingsStorage.getItem(TOKEN_LIST));
  
  for (let i=0; i<tokens.length;i++) {
    delete tokens[i]["token"];
  }
  
  settingsStorage.setItem(TOKEN_LIST, JSON.stringify(tokens));
  return;
}
