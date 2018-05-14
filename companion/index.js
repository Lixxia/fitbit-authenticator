import * as messaging from "messaging";
import * as settings from "./settings.js";
import * as cbor from 'cbor';
import { settingsStorage } from "settings";
import { AuthToken } from "./tokens.js";
import { outbox } from "file-transfer";
import { epoch } from "../common/util.js"

let token = new AuthToken();
let settingsCache = { };
let lastRequest = 1;

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
  console.log("Received a msg " + JSON.stringify(evt));
  if (evt.data.hasOwnProperty('tokenRequest') && evt.data.tokenRequest != 0 && evt.data.tokenRequest !== lastRequest) { //avoid request spam
    console.log("Received totp request.");
    lastRequest = evt.data.tokenRequest;
    sendTokensToWatch(token.reloadTokens(evt.data.tokenRequest));
  } else if (evt.data.hasOwnProperty('tokenRequest') && evt.data.tokenRequest === 0) {
    console.log("Received file request.");
    sendTokensToWatch(token.reloadTokens());
  }
}

function sendSettingsToWatch() {
  console.log(JSON.stringify(settingsCache));
  outbox.enqueue('settings.cbor', cbor.encode(settingsCache))
        .then(ft => console.log('settings sent'))
        .catch(error => console.log("Error sending settings: " + error));
}

function sendTokensToWatch(tokens) {
  if (settingsCache['standalone'] || typeof settingsCache['standalone'] === "undefined") {
    outbox.enqueue('tokens.cbor', cbor.encode(tokens))
      .then(ft => console.log('tokens sent'))
      .catch(error => console.log("Error sending tokens: " + error));
  } else { //Messaging seems faster for the frequent requests, will use it for "live" mode.
    console.log("Sending via messaging")
    sendVal(tokens);
  }
}

settingsStorage.onchange = evt => {
  if (evt.key === "color" || evt.key === "text_toggle" || evt.key === "font" || evt.key === "display_always" || evt.key === "groups" || evt.key === "standalone") { //simple setting
    settingsCache[evt.key] = JSON.parse(evt.newValue);
    sendSettingsToWatch();
  } else if (evt.oldValue !== null && evt.oldValue.length === evt.newValue.length) { //reorder
    token.reorderTokens(settings.reorderItems(evt.newValue));
    sendTokensToWatch(token.reloadTokens());
  } else if (evt.oldValue !== null && evt.newValue.length < evt.oldValue.length) { //delete
    token.deleteToken(settings.deleteItem(JSON.parse(evt.oldValue),JSON.parse(evt.newValue)));
    sendTokensToWatch(token.reloadTokens());
  } else { // new token sent
    token.newToken(JSON.parse(evt.newValue));
    sendTokensToWatch(token.reloadTokens());
  }
};

// Restore any previously saved settings and send to the device
function restoreSettings() { 
  console.log("Restore settings.");
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    // Skip token_list is only names, token_secrets is secret
    if (key && key !== "token_list" && key !== "token_secrets") {
      var value = settingsStorage.getItem(key);
      try {
        settingsCache[key] = JSON.parse(value);
      }
      catch(ex) {
        settingsCache[key] = value;
      }
    }  
  }
  // Send calculated tokens at the end if we're not in standalone mode
  if (!settingsCache['standalone']) {
    sendVal(token.reloadTokens());
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
