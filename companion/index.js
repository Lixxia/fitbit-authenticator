import * as messaging from "messaging";
import * as settings from "./settings.js";
import {settingsStorage} from "settings";
import { AuthToken } from "./tokens.js";

let token = new AuthToken();

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.tokenRequest) {
    sendVal(token.reloadTokens(evt.data.tokenRequest));
  }
}

settingsStorage.onchange = evt => {
  if (evt.key === "color" || evt.key === "progress_toggle" || evt.key === "text_toggle" || evt.key === "font") { //simple setting
    sendVal(settings.singleSetting(evt.key, evt.newValue));
  } else if (evt.oldValue !== null && evt.oldValue.length === evt.newValue.length) { //reorder
    token.reorderTokens(settings.reorderItems(evt.newValue));
    sendVal(token.reloadTokens());
  } else if (evt.oldValue !== null && evt.newValue.length < evt.oldValue.length) { //delete
    token.deleteToken(settings.deleteItem(JSON.parse(evt.oldValue),JSON.parse(evt.newValue)));
    sendVal(token.reloadTokens());
  } else { // new token sent
    token.newToken(JSON.parse(evt.newValue));
    sendVal(token.reloadTokens());
  }
};

// Restore any previously saved settings and send to the device
function restoreSettings() { 
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    // Skip token_list is only names, token_secrets is secret
    if (key && key !== "token_list" && key !== "token_secrets") {
      let data = {};
      data[key] = JSON.parse(settingsStorage.getItem(key));
      sendVal(data);
    }  
  }
  // Send calculated tokens at the end
  sendVal(token.reloadTokens());
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Unable to send data");
  }
}