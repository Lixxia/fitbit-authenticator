import * as messaging from "messaging";
import { AuthUI } from "./interface.js";
import { display } from "display";
import { AuthToken } from "./tokens.js";
import { inbox } from "file-transfer"
import { readFileSync } from "fs";
import { DEFAULT_SETTINGS } from "../common/globals.js"

let ui = new AuthUI();
let token = new AuthToken();
let ids = [];
let groups = 1;
let file;
let settings = DEFAULT_SETTINGS;

inbox.onnewfile = processInbox;

function loadSettings()
{   
  try {
    settings = readFileSync('settings.cbor', "cbor");
    setDefaults();
  } catch (e) {    
    settings = DEFAULT_SETTINGS;
  }
  applySettings();
}

function setDefaults() {
  for (let key in DEFAULT_SETTINGS) {
    if (!settings.hasOwnProperty(key)) {
      settings[key] = DEFAULT_SETTINGS[key];
    }
  }
}

function applySettings() {
  ui.updateColors(settings.color);
  ui.updateFont(settings.font.selected);
  ui.updateCounter(settings.text_toggle);

  if (settings.display_always) {
    display.autoOff = false;
  } else {
    display.autoOff = true;
  }

  groups = settings.groups.selected;
  ui.updateUI("rerender", null, groups);
}

function processInbox() {
  let fileName;
  while (fileName = inbox.nextFile()) {
    if (fileName === 'settings.cbor') {
      loadSettings();
    } 
  } 
} 

// STARTUP TASKS
loadSettings();

try {
  file = token.reloadTokens();
  ui.updateUI("loaded", file, groups);
  manageTimer("start");
} catch (e) {
  ui.updateUI("none");
}

display.addEventListener("change", function() {
  if (display.on) {
    wake();
  } else {
    sleep();
  }
});

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  //ui.updateUI("loading");
  messaging.peerSocket.send("Open");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.hasOwnProperty('reorder')) {
    ui.updateUI("loaded", token.reorderTokens(evt.data.reorder), groups);
  } else if (evt.data.hasOwnProperty('delete')) {
    ui.updateUI("loaded", token.deleteToken(evt.data.delete), groups);
  } else {
    if (file.data.length === 0) {
      manageTimer("start");
      //ui.resumeTimer(); //First token, begin animation
    }
    ui.updateUI("loaded", token.writeToken(evt.data), groups);
  }
}

messaging.peerSocket.onerror = function(err) {
  console.error("Connection error: " + err.code + " - " + err.message);
  ui.updateUI("error");
}

function wake() {
  ui.updateUI("loading");
  ui.updateUI("loaded", token.reloadTokens(), groups);
  manageTimer("start");
}

function sleep() {
  // Stop progress
  ui.stopAnimation();
  manageTimer("stop");
}

function manageTimer(arg) {
  if (arg === "stop") {
    ui.stopAnimation();
    for (let i of ids) {
      clearInterval(i);
    } 
    ids = []; //empty array
  } else if (arg === "start") {
    if (ids.length === 0) { //don't double start animation
      ui.resumeTimer();
      let id = setInterval(timer, 1000);
      ids.push(id);  
    }
  } else {
    console.error("Invalid timer management argument.")
  }
}

function timer() {
  // Update tokens every 30s
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let countDown = 30 - (epoch % 30);
  if (epoch % 30 == 0) {
    ui.updateTextTimer("loading");
    manageTimer("stop");
    ui.updateUI("loaded", token.reloadTokens(), groups);
    manageTimer("start");
  } else {
    ui.updateTextTimer(countDown);
  }
}


//Test Codes
//ZVZG5UZU4D7MY4DH
//test:ZVZG 5UZU 4D7M Y4DH ZVZG ZVZG AB
//JBSWY3DPEHPK3PXP