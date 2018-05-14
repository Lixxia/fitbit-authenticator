import * as messaging from "messaging";
import { AuthUI } from "./interface.js";
import { display } from "display";
import { epoch } from "../common/util.js"
import document from "document";
import { inbox } from "file-transfer";
import { readFileSync } from "fs";
import { DEFAULT_SETTINGS } from "../common/globals.js"
import { vibration } from "haptics";
import { memory } from "system";
console.log("JS memory: " + memory.js.used + "/" + memory.js.total);

const ids = [];
const timeout = [];
let tokens = [];
let ui = new AuthUI();
let settings = DEFAULT_SETTINGS;
let groups;
let standalone;
let global_index = 0;

inbox.onnewfile = processInbox;

function loadTokens() {
  console.log("Received token file.");
  try {
    tokens = readFileSync('tokens.cbor', "cbor");
  } catch (e) {
    console.log('No tokens found.');
    return;
  }
  // Received codes
  if (!tokens.hasOwnProperty('totps') && standalone) {
    getTokens(0, global_index); 
    timeout = [];
  } else if (!tokens.hasOwnProperty('totps') && !standalone) {
    // Standalone was toggled in settings but never made it here. Sync back up
    standalone = true;
  }
  console.log("read tokens " + JSON.stringify(tokens));
}

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
  standalone = settings.standalone;
  if (standalone) {
    getFile();
  } else {
    getTokens(epoch());
  }
}

function processInbox() {
  let fileName;
  while (fileName = inbox.nextFile()) {
    console.log("File received: " + fileName);

    if (fileName === 'settings.cbor') {
      loadSettings();
    } else if (fileName === 'tokens.cbor') {
      loadTokens();
    }
  }
}

// STARTUP TASKS
loadSettings();
loadTokens();

if (standalone) { // we're not waiting for anything, data should be on the watch
  console.log("Just start");
  if (tokens.length !== 0 && !tokens.hasOwnProperty('totps')) {
    getTokens(0, global_index);
  } else {
    console.error("No tokens on file. onOpen should pick it up.")
  }
} else { // Initiate wait for connection
  timeout.push("Startup");
  checkTimer();
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
  if (!standalone) {
    ui.updateUI("loading");
    getTokens(Math.round(new Date().getTime() / 1000.0));
  } else if (tokens.length === 0 || tokens.hasOwnProperty('totps')) {
    getFile();
  }
  messaging.peerSocket.send("Open");
}

messaging.peerSocket.onerror = function(err) {
  console.error("Connection error: " + err.code + " - " + err.message);
  ui.updateUI("error");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  console.log("Received msg " + JSON.stringify(evt));
  if (evt.data.hasOwnProperty('totps')) { //receive codes
    timeout = [];
    tokens = evt.data.totps;
    ui.updateUI("loaded", tokens, groups);
    if (tokens.length !== 0) {
      manageTimer("start"); 
    }
  }
}

function wake() {
  console.log("what is standalone " + standalone);
  if (standalone) {
    manageTimer("start");
    getTokens(0,global_index);
  } else {
    getTokens(epoch());
    ui.updateUI("loading");
  }
}

function sleep() {
  // Stop animating and asking for tokens
  ui.stopAnimation();
  manageTimer("stop");
  timeout = []; // Don't want to flash error when resuming
}

function getFile(arg) {
  if (typeof arg === "undefined") {
    arg = 0;
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send({
        tokenRequest: arg
      });
  } else {
    ui.updateUI("error");
  }
}

function getTokens(epoch, index) {
  if (standalone) {
    console.log("Local update token at index " + index);
    ui.updateUI("loaded", tokens, groups, index);
    manageTimer("start");
  } else {
    console.log("Remote update token.");
    getFile(epoch);
    timeout.push(epoch);
  }
  
}

function checkTimer() {
  setTimeout(function() {
    console.log("timeout len " + timeout.length);
    if (timeout.length !== 0 && tokens.length !== 0) {
      //No msg received in 35s (token refresh + latency)
      ui.updateUI("error");
    } 
  }, 35000);   
}

function manageTimer(arg) {
  if (arg === "stop") {
    ui.stopAnimation();
    for (let i of ids) {
      clearInterval(i);
    } 
    checkTimer();   
    ids = []; //empty array
  } else if (arg === "start") {
    if (ids.length === 0) { //don't double start animation
      if (!standalone) { // animation is wonky due to interface blocking in standalone
        ui.resumeTimer();
      }
      let id = setInterval(timer, 1000);
      ids.push(id);  
    }
  } else {
    console.error("Invalid timer management argument.")
  }
}

function timer() {
  // Update tokens every 30s
  let time = epoch();
  let countDown = 30 - (time % 30);
  if (time % 30 == 0) {
    ui.updateTextTimer("...");
    manageTimer("stop");
    getTokens(time, global_index);
  } else {
    ui.updateTextTimer(countDown);
  }
}

let list = document.getElementById("tokenList");
let items = list.getElementsByClassName("tile-list-item");
items.forEach((element, index) => {
  let touch = element.getElementById("click-me");
  touch.onclick = (evt) => {
    if (standalone && index !== global_index) {
      vibration.start("bump");
      getTokens(0,index);
      global_index = index;
    }
  }
})

//Test Codes
//ZVZG5UZU4D7MY4DH
//test:ZVZG 5UZU 4D7M Y4DH ZVZG ZVZG AB
//JBSWY3DPEHPK3PXP