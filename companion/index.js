import * as messaging from "messaging";
import {settingsStorage} from "settings";
import {TOKEN_LIST} from "../common/globals.js";
import {TOTP} from "../common/totp.js";

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  //restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

function validateToken(token) {
  if (! token) return false;
  
  let totpTest = new TOTP();
  
  try {
    totpTest.getOTP(token);
  } catch (e) {
    console.log("Token was invalid, following error given: " + e);
    return false;
  }
  return true;
} 
  
function checkUniqueNames(newArray) {
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

function revokeLast(item, array) {
  array.pop();
  settingsStorage.setItem(item, JSON.stringify(array));
}

// A user changes settings
settingsStorage.onchange = evt => {
  console.log("new " + evt.key + evt.newValue);
  console.log("old? " + evt.key + evt.oldValue);
  // console.log("Result of unique check " + checkUniqueNames(JSON.parse(evt.newValue)));
  
  let tokens = settingsStorage.getItem(TOKEN_LIST);
  console.log("before changes, before parse" + tokens);
  try {
    tokens = JSON.parse(tokens);
  }
  catch (e) {
    console.log("Settings value could not be decoded")
    // return;
  }
  let newVal = JSON.parse(evt.newValue);
  var rejectNames = checkUniqueNames(JSON.parse(evt.newValue));
  if (evt.oldValue !== null && evt.newValue.length < evt.oldValue.length) {
    let oldVal = JSON.parse(evt.oldValue);
    console.log("Value is to be deleted");
    let deleteArr = {}
    
    if (newVal.length === 0) {
      console.log("Deleting last item.")
      deleteArr["delete"] = oldVal[oldVal.length-1]["name"];
    }
    else {
      let new_names = [];
      let old_names = [];
      
      console.log("Deleting some other item.");
      
      for (var o in oldVal) {
        // console.log("oldvals " + JSON.stringify(oldVal[o]["name"]));
        old_names.push(oldVal[o]["name"]);
      }
      
      for (var n in newVal) {
        new_names.push(newVal[n]["name"]);
      }
      
      let delItem = old_names.filter(function(i) {
        return new_names.indexOf(i) < 0;
      });
      deleteArr["delete"] = delItem[0];
    }
    console.log("delteArr " + JSON.stringify(deleteArr));
    sendVal(deleteArr);
    return;
  } else if ( ! newVal[newVal.length-1]["name"].split(":")[0]) {
    console.log("Name cannot be empty.");
    revokeLast(TOKEN_LIST, tokens);
    return;
  } else if (newVal[newVal.length-1]["name"].indexOf(':') === -1) {
    console.log("Delimeter not found, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
    return;
  } else if ( rejectNames.length > 0 ) {
    console.log("Item already exists, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
    return;
  } else if ( ! validateToken(newVal[newVal.length-1]["name"].split(":")[1])) {
    console.log("Invalid token, removing latest user submission.");
    revokeLast(TOKEN_LIST, tokens);
    return;
  }

  // Build tokens
  for (let i=0; i<tokens.length;i++) {
    tokens[i]["token"] = tokens[i]["name"].split(":")[1];
    tokens[i]["name"] = tokens[i]["name"].split(":")[0];
  }
  //console.log("decode?" + base32_decode(tokens[0]["token"]))

  //console.log("tokens" + JSON.stringify(tokens))
  sendVal(tokens);
  console.log("Stripping tokens from settingsStorage.");
  for (let i=0; i<tokens.length;i++) {
    delete tokens[i]["token"];
  }
  console.log("after delete" + JSON.stringify(tokens));
  settingsStorage.setItem('token_list', JSON.stringify(tokens));
  let tokens2 = settingsStorage.getItem(TOKEN_LIST);
  console.log("after set" + tokens2)
};

/**
// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key)
      };
      sendVal(data);
    }
  }
}
**/

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}
