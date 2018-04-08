import * as messaging from "messaging";
import { AuthUI } from "./interface.js";
import { display } from "display";

let ui = new AuthUI();
const ids = [];
const timeout = [];

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
    let epoch = Math.round(new Date().getTime() / 1000.0);
    getTokens(epoch);
  } else if (evt.data.hasOwnProperty('text_toggle')) {
    ui.updateCounter(evt.data.text_toggle);
  } else if (evt.data.hasOwnProperty('totps')) { //receive codes
    timeout = [];
    ui.updateUI("loaded", evt.data.totps);
    if (ids.length === 0) { //don't double start animation
      manageTimer("start");
    }
  }
}

messaging.peerSocket.onerror = function(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
  ui.updateUI("error");
}

function wake() {
  ui.resumeTimer();
}

function sleep() {
  ui.stopAnimation();
}

function getTokens(epoch) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      tokenRequest: epoch
    });
  } else {
    ui.updateUI("error");
  }
  timeout.push(epoch);
}

function manageTimer(arg) {
  if (arg === "stop") {
    for (let i of ids) {
      ui.stopAnimation();
      clearInterval(i);
    }
    
    setTimeout(function() {
      if (timeout.length !== 0) {
        //No msg received in 30s
        ui.updateUI("error");
      } 
    }, 35000);   
    ids = []; //empty array
  } else if (arg === "start") {
    ui.resumeTimer();
    let id = setInterval(timer, 1000);
    ids.push(id);  
  } else {
    console.error("Invalid timer management argument.")
  }
}

function timer() {
  // Update tokens every 30s
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let countDown = 30 - (epoch % 30);
  if (epoch % 30 == 0) {
    getTokens(epoch);
    manageTimer("stop");
  }
  ui.updateTextTimer(countDown);
}

//Test Codes
//ZVZG5UZU4D7MY4DH
//JBSWY3DPEHPK3PXP