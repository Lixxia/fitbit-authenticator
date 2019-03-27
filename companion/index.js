import * as messaging from "messaging";
import * as settings from "./settings.js";
import {settingsStorage} from "settings";
import { AuthToken } from "./tokens.js";
import * as cbor from 'cbor';
import { outbox } from "file-transfer";

let token = new AuthToken();
let settingsCache = { };

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

//messaging.peerSocket.onmessage = function(evt) {
//  if (evt.data && evt.data.tokenRequest) {
//    sendVal(token.reloadTokens(evt.data.tokenRequest));
//  }
//}

function sendSettings() {
  console.log("settings cache being sent " + JSON.stringify(settingsCache));
  outbox.enqueue('settings.cbor', cbor.encode(settingsCache))
    .then(ft => console.log('settings sent'))
    .catch(error => console.log("Error sending settings: " + error));
}

settingsStorage.onchange = evt => {
  if (evt.key === "color" || evt.key === "progress_toggle" || evt.key === "text_toggle" || evt.key === "font" || evt.key === "display_always" || evt.key === "groups") { //simple setting
    settingsCache[evt.key] = JSON.parse(evt.newValue);
    sendSettings();
    //sendVal(settings.singleSetting(evt.key, evt.newValue));
  } else if (evt.oldValue !== null && evt.oldValue.length === evt.newValue.length) { //reorder
    sendVal(settings.reorderItems(evt.newValue));
  } else if (evt.oldValue !== null && evt.newValue.length < evt.oldValue.length) { //delete
    sendVal(settings.deleteItem(JSON.parse(evt.oldValue),JSON.parse(evt.newValue)));
  } else { // new token sent
    console.log("settings newval " + JSON.stringify(evt.newValue));
    sendVal(token.newToken(JSON.parse(evt.newValue)));
    settings.stripTokens();
  }
};


// Restore any previously saved settings and send to the device
function restoreSettings() { 
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    // Skip token_list is only names
    if (key && key !== "token_list") {
      var value = settingsStorage.getItem(key);
      try {
        settingsCache[key] = JSON.parse(value);
      }
      catch(ex) {
        settingsCache[key] = value;
      //let data = {};
      //data[key] = JSON.parse(settingsStorage.getItem(key));
      //sendVal(data);
      }
    }  
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Unable to send data");
  }
}

