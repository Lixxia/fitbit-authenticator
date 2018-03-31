import * as messaging from "messaging";
import {settingsStorage} from "settings";
import {TOKEN_LIST} from "../common/globals.js";
import {TOTP} from "../common/totp.js";
import * as settings from "./settings.js";

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

settingsStorage.onchange = evt => {
  console.log("new " + evt.key + evt.newValue);
  console.log("old? " + evt.key + evt.oldValue);
  
  if (evt.key === "color" || evt.key === "progress_toggle" || evt.key === "text_toggle" || evt.key === "font") { //simple setting
    sendVal(settings.singleSetting(evt.key, evt.newValue));
  } else if (evt.oldValue !== null && evt.oldValue.length === evt.newValue.length) { //reorder
    sendVal(settings.reorderItems(evt.newValue));
  } else if (evt.oldValue !== null && evt.newValue.length < evt.oldValue.length) { //delete
    sendVal(settings.deleteItem(JSON.parse(evt.oldValue),JSON.parse(evt.newValue)));
    return;
  } else { // new token sent
    sendVal(settings.newToken(JSON.parse(evt.newValue)));
    settings.stripTokens();
  }
};

// Restore any previously saved settings and send to the device
function restoreSettings() { 
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    // Skip token_list as settings only stores a list of names
    if (key && key !== "token_list") {
      let data = {};
      data[key] = JSON.parse(settingsStorage.getItem(key));
      sendVal(data);
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}
