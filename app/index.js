import * as messaging from "messaging";
import { AuthUI } from "./interface.js";
import { display } from "display";
import { AuthToken } from "./tokens.js";

let ui = new AuthUI();
let token = new AuthToken();

const ids = [];
var groups = 1;

try {
  const file = token.reloadTokens();
  console.log("file found - starting UI");
  ui.updateUI("loaded", file, groups);
  //ui.resumeTimer();
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
  ui.updateUI("loading");
  messaging.peerSocket.send("Open");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.hasOwnProperty('color')) {
    ui.updateColors(evt.data.color);
  } else if (evt.data.hasOwnProperty('font')) {
    ui.updateFont(evt.data.font.selected);
    //re-render for font centering
    console.log("UI update called for font render")
    //ui.updateUI("loaded", token.reloadTokens(), groups);
  } else if (evt.data.hasOwnProperty('text_toggle')) {
    ui.updateCounter(evt.data.text_toggle);
  } else if (evt.data.hasOwnProperty('groups')) {
    groups = parseInt(evt.data.groups.selected);
    console.log("UI update called for text grouping")
    //ui.updateUI("loaded", token.reloadTokens(), groups);
  } else if (evt.data.hasOwnProperty('display_always')) {
    if (evt.data.display_always === true) {
      display.autoOff = false;
    } else {
      display.autoOff = true;
    }
  } else if (evt.data.hasOwnProperty('reorder')) {
    console.log("UI update called for reorder")
    ui.updateUI("loaded", token.reorderTokens(evt.data.reorder), groups);
  } else if (evt.data.hasOwnProperty('delete')) {
    console.log("UI update called for delete")
    ui.updateUI("loaded", token.deleteToken(evt.data.delete), groups);
  } else {
    if (file.data.length === 0) {
      manageTimer("start");
      //ui.resumeTimer(); //First token, begin animation
    }
    console.log("first token: " + JSON.stringify(evt.data));
    ui.updateUI("loaded", token.writeToken(evt.data), groups);
  }
}

messaging.peerSocket.onerror = function(err) {
  console.error("Connection error: " + err.code + " - " + err.message);
  ui.updateUI("error");
}

function wake() {
  console.log("I'm awake...");
  ui.updateUI("loading");
  ui.updateUI("loaded", token.reloadTokens(), groups);
  manageTimer("start");
}

function sleep() {
  console.log("sleeping");
  // Stop animating and asking for tokens
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
    console.log("update ui called from timer")
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